import { form } from "./formelements.js";
import { fillErrorDiv } from "./display.js";
import { formatPhoneNumber, extractIbanNumber, isSameDay, euroStrToNum, formatEuro } from "./utility.js";
import { postalCodesMechelen } from "./constants.js";
import { expectedPayable } from "./pricing.js";

/** Applies custom validity message to field if condition fails. */
function customValidate(field, condition, invalidMessage) {
	if (condition) {
		field.setCustomValidity("");
		field.removeAttribute("title");
		fillErrorDiv(field);
	} else {
		field.setCustomValidity(invalidMessage);
		field.setAttribute("title", invalidMessage);
		fillErrorDiv(field);
	}
}

/** Contains all field validation functions. */
const validate = {
	/** Validates postal code. Only Mechelaars can get a non-paying contract, unless they have an exception. */
	postalCode () {
		const condition = !(form.contractType.value == "non-paying") 
			|| form.uitpasException.checked
			|| !form.postalCode.value
			|| postalCodesMechelen.includes(Number(form.postalCode.value));

		customValidate(
			form.postalCode, condition,
			"Niet in Mechelen."
		);
	},

	/** Validates that phone number could be real. */
	async phoneNumber () {
		// Easiest way to do this is to just try to format it, if it fails, it's a bad number.
		customValidate(
			form.phoneNumber, !form.phoneNumber.value || await formatPhoneNumber(form.phoneNumber.value),
			"Ongeldig telefoonnummer."
		);
	},

	/** Validates signature date. The signature date should normally be today. */
	signatureDate () {
		const signatureDate = form.signatureDate.valueAsDate;
		const condition = signatureDate === null || isSameDay(signatureDate, new Date());

		customValidate(
			form.signatureDate, condition,
			"Handtekeningdatum hoort vandaag te zijn."
		);
	},

	/** Validates end date. End date should always be after start date. */
	endDate () {
		const condition = form.startDate.valueAsDate === null
			|| form.endDate.valueAsDate === null
			|| form.startDate.valueAsDate < form.endDate.valueAsDate;

		customValidate(
			form.endDate, condition,
			"Einddatum hoort na startdatum te zijn."
		);
	},

	/** Validates assetTag. Assettags normally have six digits prepended with some combination of letters. */
	assetTag () {
		customValidate(
			form.assetTag, !form.assetTag.validity.patternMismatch,
			"Een assettag heeft gewoonlijk zes cijfers met eventueel een combinatie hoofdletters ervoor. (bv. 'PC250200')."
		);
	},

	/** Warns the user if the amount does not look like a euro amount, or if it
	 * differs from what Lend Engine's price comes to under the tariff that is
	 * ticked now.
	 *
	 * The price is filled in when the user presses the magnifier and never
	 * rewrites itself afterwards, so this is what reports that the field and the
	 * fetched price have drifted apart -- whether that is because the sociaal
	 * tarief was toggled or because the amount was edited by hand. When no price
	 * has been fetched there is nothing to compare against and the field is left
	 * alone. */
	semesterPayment () {
		const value = form.semesterPayment.value;

		if (value.trim().length > 0 && Number.isNaN(euroStrToNum(value))) {
			customValidate(form.semesterPayment, false, "Onleesbaar bedrag.");
			return
		}

		const expected = expectedPayable(form.socialTariff.checked);

		customValidate(
			form.semesterPayment,
			expected === null || euroStrToNum(value) === expected,
			`Volgens Lend Engine is dit ${formatEuro(expected)}${form.socialTariff.checked ? " met sociaal tarief" : ""}. Klik opnieuw op 🔎 of pas het bedrag aan.`
		);
	},

	/** Warns the user if the circle value does not look like a euro amount. */
	circleValue () {
		const value = form.circleValue.value;
		const condition = value.trim().length === 0 || !Number.isNaN(euroStrToNum(value));

		customValidate(
			form.circleValue, condition,
			"Onleesbaar bedrag."
		);
	},

	/** Validates structured communication. The last two digits are determined by the rest of the digits */
	structuredCommunication () {
		const digits = form.structuredCommunication.value.replace(/\D/g, "");
		const incompleteDigits = parseInt(digits.slice(0, 10));
		const checksumProvided = parseInt(digits.slice(10, 12));

		const remainder = incompleteDigits % 97;
		const validChecksum = remainder == 0 ? 97 : remainder;

		customValidate(
			form.structuredCommunication, digits.length < 12 || validChecksum === checksumProvided,
			"Deze gestructureerde mededeling is niet geldig."
		);
	},

	/** Validates structured communication. The last two digits are determined by the rest of the digits */
	async ibanNumber () {
		customValidate(
			form.ibanNumber, !form.ibanNumber.value || (await extractIbanNumber(form.ibanNumber.value)).valid,
			"Ongeldig IBAN-nummer."
		);
	}
}

/** Contains information about what validation functions depend on what prior field values. */
const validationDependencies = {
	postalCode: ["uitpasException"],
	// Toggling the tariff does not rewrite the price, so re-check whether the two
	// still agree and warn on the field if they do not.
	semesterPayment: ["socialTariff"]
}

export function initValidation() {
	for (const [key, func] of Object.entries(validate)) {
		form[key].addEventListener("input", func);
	}
	for (const [key, dependencies] of Object.entries(validationDependencies)) {
		for (const dependency of dependencies) {
			form[dependency].addEventListener("input", validate[key]);
		}
	}
}

/** Executes all validation functions. */
export function validateAll() {
	for (const [, validationFunc] of Object.entries(validate)) {
		validationFunc();
	}
}

/** Executes all validation functions and makes all validation warnings visible. */
export function allFieldsHadInput() {
	for (const [, el] of Object.entries(form)) {
		el.dispatchEvent(new Event("input", { bubbles: true }));
	}
}