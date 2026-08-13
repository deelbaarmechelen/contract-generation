import { form, buttons } from "./formelements.js";
import { Prompt } from "./prompts.js";
import { formatEuro } from "./utility.js";
import { loadOrganisatie } from "./organisatie.js";
import { landen } from "./constants.js";
import { rememberLoanFee, forgetLoanFee, payableFor } from "./pricing.js";

// The form lives in src/, the contract templates in src/contract/, so each needs
// its own relative path to the settings file.
const ORGANISATIE_PAD = "../instellingen/organisatie.json";

function fieldsValid(...prerequisiteFields) {
	let fieldsValid = true;
	for (const field of prerequisiteFields) {
		if (!field.validity.valid) {
			if (fieldsValid) {
				fieldsValid = false;
				field.reportValidity();
			}

			field.dispatchEvent(new Event("input", { bubbles: true }));
		}
	}
	return fieldsValid
}

/** Fills the semester price and circle value from an already fetched Lend Engine
 * asset record. Lend Engine is the source of truth for pricing, so both fields
 * come from the device lookup rather than from a table in the app. */
async function fillPricing(asset) {
	const { loanFee } = asset;

	// The cirkelwaarde is a fixed amount that Digi-Mee publishes, so it comes
	// from instellingen/organisatie.json. Lend Engine's depositAmount is left
	// alone: most items have no value set and the CRUD screen shows a default
	// of 50, which would put an outdated amount on a signed contract.
	const { cirkelwaarde } = await loadOrganisatie(ORGANISATIE_PAD);
	if (cirkelwaarde !== undefined && cirkelwaarde !== null && cirkelwaarde !== "") {
		form.circleValue.value = formatEuro(cirkelwaarde);
		form.circleValue.dispatchEvent(new Event("input", { bubbles: true }));
	}

	if (loanFee === null) {
		// Nothing to compare a later tariff change against: the amount will be
		// typed by hand, so it is not this module's to warn about.
		forgetLoanFee();
		Prompt.createProgressPrompt(
			"Voor dit toestel staat geen prijs in Lend Engine. Gelieve de prijs per 6 maanden handmatig in te vullen.",
			true
		).show();
		return
	}

	// Sociaal tarief: one third of the normal price, per Digi-Mee's published
	// pricing. Rounded to whole euros to keep the contract amounts tidy.
	// The cirkelwaarde is not discounted.
	//
	// The checkbox is read here, when the user asks for the lookup -- toggling it
	// afterwards deliberately does not rewrite the price. Instead the field warns
	// that it no longer matches the tariff, the same way the rest of the form
	// reports fields that need attention.
	rememberLoanFee(loanFee);

	const payable = payableFor(loanFee, form.socialTariff.checked);
	form.semesterPayment.value = formatEuro(payable);
	form.semesterPayment.dispatchEvent(new Event("input", { bubbles: true }));

	Prompt.close();
}

/** Sets a field only when the lookup actually returned something, so an empty
 * value in Lend Engine never wipes out what the user already typed. */
function fillIfPresent(field, value) {
	if (value === undefined || value === null || String(value).trim().length === 0) {
		return
	}

	field.value = value;
	field.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Fills the customer's details from their Lend Engine contact record. The record
 * is fetched by id from the link the user pasted: Lend Engine's API cannot search
 * on the klantnummer, so the klantnummer comes back from the record instead.
 *
 * The details land in the form's own fields, where the name is in plain sight, so
 * a wrongly pasted link shows up as the wrong person on screen. */
async function autoClientDetails() {
	if (!form.contactRef.value.trim()) {
		Prompt.createProgressPrompt(
			"Plak eerst de link naar de klant in Lend Engine, of typ het nummer.",
			true
		).show();
		return
	}

	Prompt.createProgressPrompt("Klantgegevens aan het opzoeken.", false).show();

	try {
		const data = await window.inventoryAPI.getContactDetails({ contactRef: form.contactRef.value });

		if (!data.success) {
			Prompt.createProgressPrompt("Fout tijdens het opzoeken van de klant:\n\"" + data.error + "\"", true).show();
			return
		}

		fillContact(data.contact);

		Prompt.close();
	} catch (err) {
		Prompt.createProgressPrompt("Fout tijdens het opzoeken van de klant.", true).show();
		throw err;
	}
}

/** Copies a contact's details onto the form. */
function fillContact(contact) {
	// The klantnummer is not searchable in Lend Engine, so it is filled in from
	// the record rather than being what the lookup was keyed on.
	fillIfPresent(form.clientNumber, contact.membershipNumber);

	fillIfPresent(form.firstName, contact.firstName);
	fillIfPresent(form.lastName, contact.lastName);

	fillIfPresent(form.streetName, contact.streetName);
	fillIfPresent(form.houseNumber, contact.houseNumber);
	fillIfPresent(form.boxNumber, contact.boxNumber);
	fillIfPresent(form.municipality, contact.municipality);
	fillIfPresent(form.postalCode, contact.postalCode);
	// Lend Engine stores an ISO code ("BE"); the contract prints a country name.
	fillIfPresent(form.country, landen[contact.countryIsoCode]);

	fillIfPresent(form.email, contact.email);
	fillIfPresent(form.phoneNumber, contact.phoneNumber);

	// Lend Engine is authoritative for the structured communication when it has
	// one on file; otherwise the app's own calculation stands.
	fillIfPresent(form.structuredCommunication, contact.structuredCommunication);
}

//// Autofill calculations

function calcStructuredCommunication() {
	const signatureDate = form.signatureDate.valueAsDate;
	const assetTag = form.assetTag.value;

	const monthDigits = ('0' + (signatureDate.getMonth() + 1).toString()).slice(-2);
	const yearDigit = signatureDate.getFullYear().toString().slice(-2);
	const assetTagDigits = ((assetTag.replace(/\D/g, "")).slice(-6) + "000000").slice(0, 6);

	const unfinishedMessage = monthDigits + yearDigit + assetTagDigits

	const remainder = parseInt(unfinishedMessage) % 97;
	const checksum = remainder === 0 ? 97 : remainder;

	const checksumString = ("00" + checksum.toString()).slice(-2);

	return unfinishedMessage + checksumString;
}


//// Autofill function factories

/** Function factory to create function that fills in a device from its assettag,
 * using the Lend Engine inventory record.
 * @param { HTMLElement } assetTagEl - HTML element with value property representing the assettag.
 * @param { HTMLElement } brandEl - HTML element with value property representing the brand.
 * @param { HTMLElement } modelEl - HTML element with value property representing the model.
 * @param { Boolean } [withPricing=false] - Also fill the prijs and cirkelwaarde.
 *   Only the main device has those fields; the addendum's old and new devices do not.
 * @returns { Function } Async event listener function for the assettag's autofill button.
*/
function factoryAutoDeviceSpecs(assetTagEl, brandEl, modelEl, withPricing = false) {
	const autoDeviceSpecs = async () => {
		if (!assetTagEl.value) {
			fieldsValid(assetTagEl);
			return
		}

		Prompt.createProgressPrompt("Gegevens over asset aan het opzoeken.", false).show();

		try {
			const data = await window.inventoryAPI.getAssetDetails({ assetTag: assetTagEl.value });

			console.log(data);

			if (!data.success) {
				Prompt.createProgressPrompt("Fout tijdens het opzoeken van asset:\n\"" + data.error + "\"", true).show();
				return
			}

			brandEl.value = data.asset.brand;
			modelEl.value = data.asset.model;

			brandEl.dispatchEvent(new Event("input", { bubbles: true }));
			modelEl.dispatchEvent(new Event("input", { bubbles: true }));

			if (!withPricing) {
				Prompt.close();
				return
			}

			// Prijs and cirkelwaarde come from the same record, so they are filled
			// from the response already in hand rather than looked up again.
			await fillPricing(data.asset);
		} catch (err) {
			Prompt.createProgressPrompt("Fout tijdens het opzoeken van asset.", true).show();
			throw err;
		}
	};
	return autoDeviceSpecs
}

const autoDeviceSpecs = factoryAutoDeviceSpecs(
	form.assetTag, form.deviceBrand, form.deviceModel, true
);

const autoOldDeviceSpecs = factoryAutoDeviceSpecs(
	form.oldAssetTag, form.oldDeviceBrand, form.oldDeviceModel
);

const autoNewDeviceSpecs = factoryAutoDeviceSpecs(
	form.newAssetTag, form.newDeviceBrand, form.newDeviceModel
);

//// Autofill click events

const autoFill = {
	contactRef: autoClientDetails,
	signatureDate () {
		form.signatureDate.valueAsDate = new Date();
	
		// Emulate a user changing the field, which is important for correct display
		// of invalid inputs.
		form.signatureDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	startDate () {
		if (!fieldsValid(form.signatureDate)) {
			return
		}
	
		form.startDate.valueAsDate = form.signatureDate.valueAsDate;
	
		form.startDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	endDate () {
		if (!fieldsValid(form.startDate)) {
			return
		}
	
		const date = form.startDate.valueAsDate;
		form.endDate.valueAsDate = new Date(date.getUTCFullYear() + 1,
			date.getMonth(),
			date.getDate());
	
		form.endDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	structuredCommunication () {
		if (!fieldsValid(form.signatureDate, form.assetTag)) {
			return
		}
	
		form.structuredCommunication.value = calcStructuredCommunication();
	
		form.structuredCommunication.dispatchEvent(new Event("input", { bubbles: true }));
	},
	assetTag: autoDeviceSpecs,
	oldAssetTag: autoOldDeviceSpecs,
	newAssetTag: autoNewDeviceSpecs
}

export function initAutoFillButtons() {
    for (const [key, el] of Object.entries(buttons.autoFill)) {
		el.addEventListener("click", autoFill[key]);
    }
}