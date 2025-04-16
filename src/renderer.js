//// Element constants

const main = document.getElementsByTagName("main")[0];
const digibankForm = document.getElementById("digibank-form");
const fieldsets = main.getElementsByTagName("fieldset");

const nonPayingElements = document.getElementsByClassName("non-paying");
const payingElements = document.getElementsByClassName("paying");
const addendumElements = document.getElementsByClassName("addendum");

const fsReplacementOld = document.getElementById("fs-replacement-old");
const fsReplacementNew = document.getElementById("fs-replacement-new");
const fsReplacementReason = document.getElementById("fs-replacement-reason");
const fsExtension = document.getElementById("fs-extension");

const instructionTextElements = main.getElementsByClassName("instruction-text");  // Really just the text that the _Digibankmedewerker_ will take it from here.
const resetInstruction = document.getElementById("reset-instruction");

const warningBox = document.getElementById("warning-box");
const warningBoxTable = document.getElementById("warning-box-table");
const progressBox = document.getElementById("progress-box");
const progressBoxText = document.getElementById("progress-box-text")

const inputs = {  // Not necessarily all <input> tags.
	payingContract: document.getElementById('paying-contract'),
	nonPayingContract: document.getElementById('non-paying-contract'),
	addendum: document.getElementById('addendum'),

	uitpasNumber: document.getElementById('uitpas-number'),
	uitpasException: document.getElementById('uitpas-exception'),

	firstName: document.getElementById('first-name'),
	lastName: document.getElementById('last-name'),
	birthDate: document.getElementById('birth-date'),

	streetName: document.getElementById('street-name'),
	houseNumber: document.getElementById('house-number'),
	boxNumber: document.getElementById('box-number'),
	municipality: document.getElementById('municipality'),
	postalCode: document.getElementById('postal-code'),
	country: document.getElementById('country'),

	email: document.getElementById('email'),
	phoneNumber: document.getElementById('phone-number'),

	referrer: document.getElementById('referrer'),

	workshopDate: document.getElementById('workshop-date'),
	workshopException: document.getElementById('workshop-exception'),

	isExtension: document.getElementById('is-extension'),

	signatureDate: document.getElementById('signature-date'),
	startDate: document.getElementById('start-date'),
	endDate: document.getElementById('end-date'),

	clientNumber: document.getElementById('client-number'),
	contractNumber: document.getElementById('contract-number'),

	assetTag: document.getElementById('asset-tag'),
	deviceBrand: document.getElementById('device-brand'),
	deviceModel: document.getElementById('device-model'),
	deviceType: document.getElementById('device-type'),
	includesCharger: document.getElementById('includes-charger'),
	includesMouse: document.getElementById('includes-mouse'),
	includesSmartCardReader: document.getElementById('includes-smart-card-reader'),

	monthlyPayment: document.getElementById('monthly-payment'),
	yearlyPayment: document.getElementById('yearly-payment'),
	circleValue: document.getElementById('circle-value'),
	advancePayment: document.getElementById('advance-payment'),
	structuredCommunication: document.getElementById('structured-communication'),

	replacement: document.getElementById('replacement'),
	extension: document.getElementById('extension'),

	oldAssetTag: document.getElementById('old-asset-tag'),
	oldDeviceBrand: document.getElementById('old-device-brand'),
	oldDeviceModel: document.getElementById('old-device-model'),
	oldDeviceType: document.getElementById('old-device-type'),

	oldIncludesCharger: document.getElementById('old-includes-charger'),
	oldIncludesMouse: document.getElementById('old-includes-mouse'),
	oldIncludesSmartCardReader: document.getElementById('old-includes-smart-card-reader'),

	newAssetTag: document.getElementById('new-asset-tag'),
	newDeviceBrand: document.getElementById('new-device-brand'),
	newDeviceModel: document.getElementById('new-device-model'),
	newDeviceType: document.getElementById('new-device-type'),

	newIncludesCharger: document.getElementById('new-includes-charger'),
	newIncludesMouse: document.getElementById('new-includes-mouse'),
	newIncludesSmartCardReader: document.getElementById('new-includes-smart-card-reader'),

	replacementReason: document.getElementById('replacement-reason'),

	oldEndDate: document.getElementById('old-end-date'),
	newEndDate: document.getElementById('new-end-date')
}

const buttons = {
	submit: document.getElementById("submit"),

	warningGenerateAnyway: document.getElementById("warning-generate-anyway"),
	warningGoBack: document.getElementById("warning-go-back"),

	progressGoBack: document.getElementById("progress-go-back"),

	autoSignatureDate: document.getElementById("auto-signature-date"),
	autoStartDate: document.getElementById("auto-start-date"),
	autoEndDate: document.getElementById("auto-end-date"),

	autoContractNumber: document.getElementById("auto-contract-number"),
	autoDeviceBrand: document.getElementById("auto-device-brand"),
	autoDeviceModel: document.getElementById("auto-device-model"),

	autoMonthlyPayment: document.getElementById("auto-monthly-payment"),
	autoYearlyPayment: document.getElementById("auto-yearly-payment"),
	autoCircleValue: document.getElementById("auto-circle-value"),
	autoStructuredCommunication: document.getElementById("auto-structured-communication"),

	autoOldDeviceBrand: document.getElementById("auto-old-device-brand"),
	autoOldDeviceModel: document.getElementById("auto-old-device-model"),

	autoNewDeviceBrand: document.getElementById("auto-new-device-brand"),
	autoNewDeviceModel: document.getElementById("auto-new-device-model")
}


//// Data constants

const deviceTypes = {
	"laptop-win-10": {
		fullName: "Laptop (Windows 10)",
		monthlyPayment: 10,
		yearlyPayment: 100,
		circleValue: 50
	},
	"laptop-win-11": {
		fullName: "Laptop (Windows 11)",
		monthlyPayment: 15,
		yearlyPayment: 150,
		circleValue: 75
	}
}

const postalCodesMechelen = [2800, 2801, 2811, 2812];

//// Testing

/** Helper function for manual testing. */
function testFill() {
	// I know just putting this in renderer.js is testing like a cave person.
	// I'm not figuring out node.js unit testing right now. 
	// Ooga booga me use developer console.

	inputs.firstName.value = "Pietje";
	inputs.lastName.value = "De Laptopwiller";
	inputs.birthDate.valueAsDate = new Date("1995-12-17T03:24:00");

	inputs.streetName.value = "Ergensstraat";
	inputs.houseNumber.value = "1337";
	inputs.boxNumber.value = "69";
	inputs.municipality.value = "Mechelen";
	inputs.postalCode.value = "2800";
	inputs.country.value = "België";

	inputs.email.value = "Pietje123@gmail.com";
	inputs.phoneNumber.value = "0469123123";

	inputs.referrer.value = "Sinterklaas";

	inputs.contractNumber.value = "C-B-25-100000";
	inputs.clientNumber.value = "1000001";

	inputs.assetTag.value = "PC990200";
	inputs.deviceBrand.value = "LapInc.";
	inputs.deviceModel.value = "Thinkbook PP890";
	inputs.deviceType.value = "laptop-win-10";  // Miracle that this works like that.
	inputs.includesCharger.checked = true;

	buttons.autoSignatureDate.click();
	buttons.autoStartDate.click();

	if (inputs.nonPayingContract.checked) {
		inputs.uitpasNumber.value = "1111111111111";
		buttons.autoEndDate.click();
		inputs.workshopDate.valueAsDate = new Date();
	} else if (inputs.payingContract.checked) {
		const startDate = inputs.startDate.valueAsDate;
		inputs.endDate.valueAsDate = new Date(startDate.getUTCFullYear() + 1, startDate.getMonth(), startDate.getDate());
		buttons.autoStructuredCommunication.click();
		buttons.autoMonthlyPayment.click();
		buttons.autoYearlyPayment.click();
		buttons.autoCircleValue.click();
		inputs.advancePayment.value = "€ 50";
	} else {
		inputs.replacement.checked = true;
		inputs.extension.checked = true;

		inputs.oldAssetTag.value = "PC990201";
		inputs.oldDeviceBrand.value = "SELL";
		inputs.oldDeviceModel.value = "Longitude 4469";
		inputs.oldDeviceType.value = "laptop-win-10";
	
		inputs.newAssetTag.value = "PC990202";
		inputs.newDeviceBrand.value = "SELL";
		inputs.newDeviceModel.value = "Altitude 4m";
		inputs.newDeviceType.value = "laptop-win-10";

		inputs.replacementReason.value = "Een kabouter heeft er soep en cola over gemorst.";

		const signatureDate = inputs.signatureDate.valueAsDate;

		inputs.oldEndDate.valueAsDate = signatureDate;
		inputs.newEndDate.valueAsDate = new Date(signatureDate.getUTCFullYear() + 1, signatureDate.getMonth(), signatureDate.getDate());
	}

	allFieldsHadInput();
}

window.testFill = testFill;

//// General utility

const euroFormat = Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" })

/** Make euro amount numeric. */
function euroStrToNum(euroStr) {
	const cleanEuroStr = euroStr
		.replace(/[^\d,.]/g, "")
		.replace(",", ".");
	return Number(cleanEuroStr);
}


/** Prettify euro amount. */
function formatEuro(euroAmount) {
	if (euroAmount == null || euroAmount == "") {
		return ""
	}
	const regularized = euroStrToNum(String(euroAmount));
	return euroFormat.format(regularized);
}


/** Generates an address as a string. */
function formatAddress(streetName, houseNumber, boxNumber, postalCode,
	municipality, country) {
	let streetLine = '';
	streetLine += streetName;
	streetLine += (streetLine.length == 0 || houseNumber.length == 0) ? '' : ' ';
	streetLine += houseNumber;
	streetLine += (streetLine.length == 0 || boxNumber.length == 0) ? '' : ' ';
	streetLine += (boxNumber.length == 0) ? '' : 'bus '
	streetLine += boxNumber;

	let municipalityLine = '';
	municipalityLine += postalCode;
	municipalityLine += (municipalityLine.length == 0 || municipality.length == 0) ? '' : ' ';
	municipalityLine += municipality;

	let address = '';
	address += streetLine;
	address += (address.length == 0 || municipalityLine.length == 0) ? '' : ', ';
	address += municipalityLine;
	address += (address.length == 0 || country.length == 0) ? '' : ', ';
	address += country;

	return address;
}

/** Formats a phone number. */
async function formatPhoneNumber(phoneNumber) {
	return await window.libphonenumber.formatPhoneNumber(String(phoneNumber));
}

/** Checks if a date is passed, if so, formats it according to Flemish conventions, else, returns empty string.
 *  Short numeric date. */
function formatDate(date) {
	return date ? date.toLocaleDateString("nl-BE") : "";
}

/** Checks if a date is passed, if so, formats it according to Flemish conventions, else, returns empty string.
 * 	Includes weekday and full name of month. */
function formatDateLong(date) {
	return date ? date.toLocaleDateString("nl-BE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
}

/** Calculates a person's age according to their birth date. 
 * Shamelessly stolen from codeandcloud on StackExchange.
 * https://stackoverflow.com/a/7091965/15709119
 * CC BY-SA 3.0 applicable */
function getAge(birthDate) {
	var today = new Date();
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}


function isSameDay(a, b) {
	return a.getFullYear() == b.getFullYear()
		&& a.getMonth() == b.getMonth()
		&& a.getDate() == b.getDate();
}


//// Form display

// Shamelessly stolen from trincot on StackExchange. CC BY-SA is applicable. 
// https://stackoverflow.com/questions/12578507/implement-an-input-with-a-mask
// Keeps the structuredCommunication +'s and /'s in place by means of magic.
// It's very elegant and nice and good and I love trincot for inventing it.
document.addEventListener('DOMContentLoaded', () => {
	for (const el of document.querySelectorAll("[placeholder][data-slots]")) {
		const pattern = el.getAttribute("placeholder"),
			slots = new Set(el.dataset.slots || "_"),
			prev = (j => Array.from(pattern, (c, i) => slots.has(c) ? j = i + 1 : j))(0),
			first = [...pattern].findIndex(c => slots.has(c)),
			accept = new RegExp(el.dataset.accept || "\\d", "g"),
			clean = input => {
				input = input.match(accept) || [];
				return Array.from(pattern, c =>
					input[0] === c || slots.has(c) ? input.shift() || c : c
				);
			},
			format = () => {
				const [i, j] = [el.selectionStart, el.selectionEnd].map(i => {
					i = clean(el.value.slice(0, i)).findIndex(c => slots.has(c));
					return i < 0 ? prev.at(-1) : back ? prev[i - 1] || first : i;
				});
				el.value = clean(el.value).join("");
				el.setSelectionRange(i, j);
				back = false;
			};
		let back = false;
		el.addEventListener("keydown", (e) => back = e.key === "Backspace");
		el.addEventListener("input", format);
		el.addEventListener("focus", format);
		el.addEventListener("blur", () => el.value === pattern && (el.value = ""));
	}
});


/** Checks condition and disables elements only if false. 
 * If element has no valid disabled attribute, then it will disable/enable all children that do. */
function enableSwitch(condition, ...elements) {
	const shouldDisable = !condition;
	const disableQuery = "button, fieldset, optgroup, option, select, textarea, input";

	for (const el of elements) {
		if (el.matches(disableQuery)) {
			el.disabled = shouldDisable;
		} else {
			for (const child of el.querySelectorAll(disableQuery)) {
				child.disabled = shouldDisable;
			}
		}
	};
}


/** Checks condition and shows elements only if true. */
function showSwitch(condition, ...elements) {
	elements.map((el) => el.classList.toggle("hidden", !condition));
	enableSwitch(condition, ...elements);
}


/** Switches visible fields depending on contract type. 
 * Form elements by default show for all contract types,
 * except if they have the class corresponding to a contract type,
 * then they will only show for contract types corresponding to the 
 * classes they have.
*/
function changeContractType(e) {
	const payingChecked = inputs.payingContract.checked;
	const nonPayingChecked = inputs.nonPayingContract.checked;
	const addendumChecked = inputs.addendum.checked;
	const anyChecked = payingChecked || nonPayingChecked || addendumChecked;

	showSwitch(anyChecked, buttons.submit, resetInstruction, ...fieldsets, ...instructionTextElements);
	showSwitch(false, ...payingElements, ...nonPayingElements, ...addendumElements);

	if (payingChecked) {
		showSwitch(true, ...payingElements);
	} else if (nonPayingChecked) {
		showSwitch(true, ...nonPayingElements);
	} else if (addendumChecked) {
		showSwitch(true, ...addendumElements);
	}

	inputs.contractNumber.required = addendumChecked;
	inputs.clientNumber.required = addendumChecked;

	toggleReplacement();
	toggleExtension();

	validateAll();
}

inputs.payingContract.addEventListener("input", changeContractType);
inputs.nonPayingContract.addEventListener("input", changeContractType);
inputs.addendum.addEventListener("input", changeContractType);


/** Disable uitpasNumber field when the user is excepted from it. */
function toggleEnabledUitpasNumber(e) {
	inputs.uitpasNumber.disabled = inputs.uitpasException.checked;
}

inputs.uitpasException.addEventListener("input", toggleEnabledUitpasNumber);


/** Do not require workshop if excepted because of skill test or extension. */
function toggleEnabledWorkshopFields(e) {
	inputs.workshopException.disabled = inputs.isExtension.checked;
	inputs.workshopDate.disabled = inputs.workshopException.checked;
	inputs.workshopDate.required = !(inputs.workshopException.checked || inputs.isExtension.checked);
}

inputs.isExtension.addEventListener("input", toggleEnabledWorkshopFields);
inputs.workshopException.addEventListener("input", toggleEnabledWorkshopFields);


function toggleExtension(e) {
	showSwitch(inputs.extension.checked, fsExtension);
}

inputs.extension.addEventListener("input", toggleExtension);


function toggleReplacement(e) {
	showSwitch(inputs.replacement.checked, fsReplacementOld, fsReplacementNew, fsReplacementReason);
}

inputs.replacement.addEventListener("input", toggleReplacement);

// Adds .changed class to input elements after they've been changed.
// The .changed class makes it so invalid inputs are marked in red.
// You don't want users to be scolded for invalid inputs they didn't even touch.
for (const [key, el] of Object.entries(inputs)) {
	el.addEventListener("input", (e) => {
		el.classList.add("changed");
		fillErrorDiv(el);
	});
}


//// Input validation

/** Enters validation message into error div. */
function fillErrorDiv(el) {
	const errorDiv = document.querySelector(".error[data-for=" + el.id + "]");
	if (errorDiv) {
		errorDiv.innerText = el.validationMessage;
	}
}

/** Applies custom validity message to field if condition fails. */
function customValidate(field, condition, invalidMessage) {
	const errorDiv = document.querySelector(".error[data-for=" + field.id + "]");
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
	/** Validates that customer is at least 18 years of age. */
	birthDate: (e) => {
		const birthDate = inputs.birthDate.valueAsDate;
		const condition = birthDate === null || getAge(birthDate) >= 18; // If `birthDate === null` we want to let normal input validation handle it.

		customValidate(
			inputs.birthDate, condition,
			"Klant is onder 18."
		);
	},

	/** Validates postal code. Only Mechelaars can get a non-paying contract, unless they have an exception. */
	postalCode: (e) => {
		const condition = !inputs.nonPayingContract.checked
			|| inputs.uitpasException.checked
			|| !inputs.postalCode.value
			|| postalCodesMechelen.includes(Number(inputs.postalCode.value));

		customValidate(
			inputs.postalCode, condition,
			"Niet in Mechelen."
		);
	},

	/** Validates that phone number could be real. */
	phoneNumber: async (e) => {
		// Easiest way to do this is to just try to format it, if it fails, it's a bad number.
		customValidate(
			inputs.phoneNumber, !inputs.phoneNumber.value || await formatPhoneNumber(inputs.phoneNumber.value),
			"Ongeldig telefoonnummer."
		);
	},

	/** Validates signature date. The signature date should normally be today. */
	signatureDate: (e) => {
		const signatureDate = inputs.signatureDate.valueAsDate;
		const condition = signatureDate === null || isSameDay(signatureDate, new Date());

		customValidate(
			inputs.signatureDate, condition,
			"Handtekeningdatum hoort vandaag te zijn."
		);
	},

	/** Validates end date. End date should always be after start date. */
	endDate: (e) => {
		const condition = inputs.startDate.valueAsDate === null
			|| inputs.endDate.valueAsDate === null
			|| inputs.startDate.valueAsDate < inputs.endDate.valueAsDate;

		customValidate(
			inputs.endDate, condition,
			"Einddatum hoort na startdatum te zijn."
		);
	},

	/** Validates assetTag. Assettags normally have six digits prepended with some combination of letters. */
	assetTag: (e) => {
		customValidate(
			inputs.assetTag, !inputs.assetTag.validity.patternMismatch,
			"Een assettag heeft gewoonlijk zes cijfers met eventueel een combinatie hoofdletters ervoor. (bv. 'PC250200')."
		);
	},

	/** Warns user if the monthly payment is different from expected for device type. */
	monthlyPayment: (e) => {
		let condition = true;

		if (inputs.deviceType.value && inputs.monthlyPayment.value) {
			const value = inputs.monthlyPayment.value;
			const euroNum = euroStrToNum(value);
			const euroNumExpected = deviceTypes[inputs.deviceType.value].monthlyPayment;
			condition = euroNum == euroNumExpected;
		}

		customValidate(
			inputs.monthlyPayment, condition,
			"Onverwacht bedrag voor apparaattype."
		);
	},

	/** Warns user if the yearly payment is different from expected for device type. */
	yearlyPayment: (e) => {
		let condition = true;

		if (inputs.deviceType.value && inputs.circleValue.value) {
			const value = inputs.yearlyPayment.value;
			const euroNum = euroStrToNum(value);
			const euroNumExpected = deviceTypes[inputs.deviceType.value].yearlyPayment;
			condition = euroNum == euroNumExpected;
		}

		customValidate(
			inputs.yearlyPayment, condition,
			"Onverwacht bedrag voor apparaattype."
		);
	},

	/** Warns user if the circle value is different from expected for device type. */
	circleValue: (e) => {
		let condition = true;

		if (inputs.deviceType.value && inputs.circleValue.value) {
			const value = inputs.circleValue.value;
			const euroNum = euroStrToNum(value);
			const euroNumExpected = deviceTypes[inputs.deviceType.value].circleValue;
			condition = euroNum == euroNumExpected;
		}

		customValidate(
			inputs.circleValue, condition,
			"Onverwacht bedrag voor apparaattype."
		);
	},

	/** Validates structured communication. The last two digits are determined by the rest of the digits */
	structuredCommunication: (e) => {
		const digits = inputs.structuredCommunication.value.replace(/\D/g, "");
		const incompleteDigits = parseInt(digits.slice(0, 10));
		const checksumProvided = parseInt(digits.slice(10, 12));

		const remainder = incompleteDigits % 97;
		const validChecksum = remainder == 0 ? 97 : remainder;

		customValidate(
			inputs.structuredCommunication, digits.length < 12 || validChecksum === checksumProvided,
			"Deze gestructureerde mededeling is niet geldig."
		);
	}
}

inputs.birthDate.addEventListener("input", validate.birthDate)

// Important principle: If validation depends on a previous field, you need
// to redo validation once that field changes as well!
inputs.postalCode.addEventListener("input", validate.postalCode)
inputs.uitpasException.addEventListener("input", validate.postalCode)

inputs.phoneNumber.addEventListener("input", validate.phoneNumber);

inputs.signatureDate.addEventListener("input", validate.signatureDate)

inputs.endDate.addEventListener("input", validate.endDate)

inputs.assetTag.addEventListener("input", validate.assetTag);

inputs.monthlyPayment.addEventListener("input", validate.monthlyPayment);
inputs.deviceType.addEventListener("input", validate.monthlyPayment);

inputs.yearlyPayment.addEventListener("input", validate.yearlyPayment);
inputs.deviceType.addEventListener("input", validate.yearlyPayment);

inputs.circleValue.addEventListener("input", validate.circleValue);
inputs.deviceType.addEventListener("input", validate.circleValue);

inputs.structuredCommunication.addEventListener("input", validate.structuredCommunication)

/** Executes all validation functions. */
function validateAll() {
	for (const [key, validationFunc] of Object.entries(validate)) {
		validationFunc();
	}
}

/** Executes all validation functions and makes all validation warnings visible. */
function allFieldsHadInput() {
	for (const [key, el] of Object.entries(inputs)) {
		el.dispatchEvent(new Event("input", { bubbles: true }));
	}
}

////// Autofill

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

//// Autofill calculations

function calcStructuredCommunication() {
	const signatureDate = inputs.signatureDate.valueAsDate;
	const assetTag = inputs.assetTag.value;

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

/** Function factory to create function that gets device brand and model based on assettag from Snipe-IT inventory. 
 * @param { HTMLElement } assetTag - HTML element with value property representing the assettag.
 * @param { HTMLElement } brand - HTML element with value property representing the brand.
 * @param { HTMLElement } model - HTML element with value property representing the model.
 * @returns { Function } Async event listener function to be associated with autoFill buttons for the brand and model.
*/
function factoryAutoDeviceBrandAndModel(assetTag, brand, model) {
	const autoDeviceBrandAndModel = async (e) => {
		if (!fieldsValid(assetTag)) {
			return
		}

		showProgressBox("Gegevens over asset aan het opzoeken.", true);

		try {
			const data = await window.inventoryAPI.getAssetDetails({ assetTag: assetTag.value });

			console.log(data);

			if (!data.success) {
				showProgressBox("Fout tijdens het opzoeken van asset:\n\"" + data.error + "\"", true);
				return
			}

			brand.value = data.asset.brand;
			model.value = data.asset.model;

			hideProgressBox();

			brand.dispatchEvent(new Event("input", { bubbles: true }));
			model.deviceModel.dispatchEvent(new Event("input", { bubbles: true }));
		} catch (err) {
			showProgressBox("Fout tijdens het opzoeken van asset.", true);
			throw err;
		}
	};
	return autoDeviceBrandAndModel
}

const autoDeviceBrandAndModel = factoryAutoDeviceBrandAndModel(
	inputs.assetTag, inputs.deviceBrand, inputs.deviceModel
);

const autoOldDeviceBrandAndModel = factoryAutoDeviceBrandAndModel(
	inputs.oldAssetTag, inputs.oldDeviceBrand, inputs.oldDeviceModel
);

const autoNewDeviceBrandAndModel = factoryAutoDeviceBrandAndModel(
	inputs.newAssetTag, inputs.newDeviceBrand, inputs.newDeviceModel
);

//// Autofill click events

const autoFill = {
	signatureDate: (e) => {
		inputs.signatureDate.valueAsDate = new Date();
	
		// Emulate a user changing the field, which is important for correct display
		// of invalid inputs.
		inputs.signatureDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	startDate: (e) => {
		if (!fieldsValid(inputs.signatureDate)) {
			return
		}
	
		inputs.startDate.valueAsDate = inputs.signatureDate.valueAsDate;
	
		inputs.startDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	endDate: (e) => {
		if (!fieldsValid(inputs.startDate)) {
			return
		}
	
		const date = inputs.startDate.valueAsDate;
		inputs.endDate.valueAsDate = new Date(date.getUTCFullYear() + 1,
			date.getMonth(),
			date.getDate());
	
		inputs.endDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	structuredCommunication: (e) => {
		if (!fieldsValid(inputs.signatureDate, inputs.assetTag)) {
			return
		}
	
		inputs.structuredCommunication.value = calcStructuredCommunication();
	
		inputs.structuredCommunication.dispatchEvent(new Event("input", { bubbles: true }));
	},
	deviceBrand: autoDeviceBrandAndModel,
	deviceModel: autoDeviceBrandAndModel,
	oldDeviceBrand: autoOldDeviceBrandAndModel,
	oldDeviceModel: autoOldDeviceBrandAndModel,
	newDeviceBrand: autoNewDeviceBrandAndModel,
	newDeviceModel: autoNewDeviceBrandAndModel,
	monthlyPayment: (e) => {
		if (!fieldsValid(inputs.deviceType)) {
			return
		}
	
		inputs.monthlyPayment.value = formatEuro(deviceTypes[inputs.deviceType.value].monthlyPayment);
	
		inputs.monthlyPayment.dispatchEvent(new Event("input", { bubbles: true }));
	},
	yearlyPayment: (e) => {
		if (!fieldsValid(inputs.deviceType)) {
			return
		}
	
		inputs.yearlyPayment.value = formatEuro(deviceTypes[inputs.deviceType.value].yearlyPayment);
	
		inputs.yearlyPayment.dispatchEvent(new Event("input", { bubbles: true }));
	},
	circleValue: (e) => {
		if (!fieldsValid(inputs.deviceType)) {
			return
		}
	
		inputs.circleValue.value = formatEuro(deviceTypes[inputs.deviceType.value].circleValue);
	
		inputs.circleValue.dispatchEvent(new Event("input", { bubbles: true }));
	},
}

buttons.autoSignatureDate.addEventListener("click", autoFill.signatureDate);
buttons.autoStartDate.addEventListener("click", autoFill.startDate);
buttons.autoEndDate.addEventListener("click", autoFill.endDate);
buttons.autoStructuredCommunication.addEventListener("click", autoFill.structuredCommunication);
buttons.autoDeviceBrand.addEventListener("click", autoFill.deviceBrand);
buttons.autoDeviceModel.addEventListener("click", autoFill.deviceModel);
buttons.autoOldDeviceBrand.addEventListener("click", autoFill.oldDeviceBrand);
buttons.autoOldDeviceModel.addEventListener("click", autoFill.oldDeviceModel);
buttons.autoNewDeviceBrand.addEventListener("click", autoFill.newDeviceBrand);
buttons.autoNewDeviceModel.addEventListener("click", autoFill.newDeviceModel);
buttons.autoMonthlyPayment.addEventListener("click", autoFill.monthlyPayment);
buttons.autoYearlyPayment.addEventListener("click", autoFill.yearlyPayment);
buttons.autoCircleValue.addEventListener("click", autoFill.circleValue);

////// Invalid fields prompt after submit

/** Generates an array with the labels and validation messages of invalid inputs. */
function genWarningBoxTableContent(inputs) {
	let output = [];
	for (let [key, value] of Object.entries(inputs)) {
		if (value.validity.valid || (value.closest('[disabled]') != null)) {
			continue
		}

		const labelElement = document.querySelector("label[for=" + value.id + "]");
		output.push({ label: labelElement.innerHTML, validationMessage: value.validationMessage });
	}
	return output
}

/** Takes an array as outputted by genWarningBoxTableContent and puts contents in warningBoxTable. */
function fillWarningBoxTable(validationReport) {
	const tableBody = warningBoxTable.getElementsByTagName("TBODY")[0];
	tableBody.innerHTML = "";

	for (let message of validationReport) {
		const fullMessageTr = document.createElement("tr");

		const labelTd = document.createElement("td");
		const labelContent = document.createTextNode(message.label);
		labelTd.appendChild(labelContent);

		const validationMessageTd = document.createElement("td");
		const validationContent = document.createTextNode(message.validationMessage);
		validationMessageTd.appendChild(validationContent);

		fullMessageTr.appendChild(labelTd);
		fullMessageTr.appendChild(validationMessageTd);
		tableBody.appendChild(fullMessageTr);
	}
}

/** Opens the invalid inputs warning prompt. */
function showWarning() {
	showSwitch(true, warningBox);
	main.inert = true;
	fillWarningBoxTable(genWarningBoxTableContent(inputs));

	// Preferably, we want the user to go back and fix invalid inputs.
	buttons.warningGoBack.focus({ focusVisible: true });
}

/** Closes the invalid inputs warning prompt. */
function hideWarning() {
	showSwitch(false, warningBox);
	main.inert = false;

	allFieldsHadInput();
}

/** Opens the contract generation progress prompt with given text and activated/deactivated close button. */
function showProgressBox(promptText = "", isCloseable = false) {
	progressBoxText.innerText = promptText;
	buttons.progressGoBack.disabled = !isCloseable;
	buttons.progressGoBack.focus({ focusVisible: true });

	showSwitch(true, progressBox);
	main.inert = true;
}

/** Closes the contract generation progress prompt. */
function hideProgressBox() {
	showSwitch(false, progressBox);
	main.inert = false;
}

buttons.warningGenerateAnyway.addEventListener('click', async (e) => {
	hideWarning();
	generateContract();
})

buttons.warningGoBack.addEventListener('click', async (e) => {
	hideWarning();
	digibankForm.reportValidity(); // Focuses first invalid input in form.
})

buttons.progressGoBack.addEventListener('click', async (e) => {
	hideProgressBox();
})

buttons.submit.addEventListener('click', async (e) => {
	if (digibankForm.checkValidity()) {
		e.preventDefault();
		generateContract();
	} else {
		e.preventDefault();
		showWarning();
	}
})

////// Contract generation (Kind of a mess.) 

/** Does final pre-processing of form data, and collects it into object. */
async function collectFormData(pdfPath) {
	let courseNotification = "";

	if (inputs.workshopException.checked) {
		courseNotification = "De Ontlener is vrijgesteld van de verplichting een gratis opleidingssessie te volgen door het afleggen van een bekwaamheidstest.";
	} else if (inputs.isExtension.checked) {
		courseNotification = "De Ontlener is vrijgesteld van de verplichting een gratis opleidingssessie te volgen omdat deze een eerdere klant is.";
	} else {
		courseNotification = "De Ontlener is verplicht een gratis opleidingssessie bij te wonen om te verzekeren dat deze met het toestel kan werken."
	}

	return {
		"generationInfo": {
			"path": pdfPath,
			"print": true
		},
		"contractNumber": inputs.contractNumber.value,
		"clientNumber": inputs.clientNumber.value,
		"isExtension": inputs.isExtension.checked,
		"client": {
			"name": inputs.firstName.value + ' ' + inputs.lastName.value,
			"birthDate": formatDate(inputs.birthDate.valueAsDate),
			"address": formatAddress(inputs.streetName.value, inputs.houseNumber.value,
				inputs.boxNumber.value, inputs.postalCode.value,
				inputs.municipality.value, inputs.country.value),
			"phone": await window.libphonenumber.formatPhoneNumber(String(inputs.phoneNumber.value)),
			"email": inputs.email.value,
		},
		"contractType": document.querySelector('input[name="contract-type"]:checked').value,
		"subscription": {
			"structuredReference": inputs.structuredCommunication.value,
			"monthlyPayment": formatEuro(inputs.monthlyPayment.value),
			"yearlyPayment": formatEuro(inputs.yearlyPayment.value),
			"amountPaid": formatEuro(inputs.advancePayment.value),
			"circleValue": formatEuro(inputs.circleValue.value)
		},
		"uitpas": {
			"applicable": !inputs.uitpasException.checked,
			"number": inputs.uitpasNumber.value,
			"aptitudeTest": inputs.workshopException.checked,
			"courseEnrolment": !inputs.workshopException.checked,
			"courseDate": formatDateLong(inputs.workshopDate.valueAsDate),
			"courseNotification": courseNotification
		},
		"referer": inputs.referrer.value,
		"structuredReference": inputs.structuredCommunication.value,
		"item": {
			"deviceType": inputs.deviceType.value ? deviceTypes[inputs.deviceType.value].fullName : "",
			"deviceBrand": inputs.deviceBrand.value,
			"deviceModel": inputs.deviceModel.value,
			"assetTag": inputs.assetTag.value,
			"accessories": {
				"charger": inputs.includesCharger.checked,
				"mouse": inputs.includesMouse.checked,
				"eIdReader": inputs.includesSmartCardReader.checked
			}
		},
		"contractDate": formatDate(inputs.signatureDate.valueAsDate),
		"startDate": formatDate(inputs.startDate.valueAsDate),
		"endDate": formatDate(inputs.endDate.valueAsDate),
		"extension": inputs.extension.checked,
		"replacement": inputs.replacement.checked,
		"oldDevice": {
			"deviceType": inputs.oldDeviceType.value ? deviceTypes[inputs.oldDeviceType.value].fullName : "",
			"deviceBrand": inputs.oldDeviceBrand.value,
			"deviceModel": inputs.oldDeviceModel.value,
			"assetTag": inputs.oldAssetTag.value,
			"accessories": {
				"charger": inputs.oldIncludesCharger.checked,
				"mouse": inputs.oldIncludesMouse.checked,
				"eIdReader": inputs.oldIncludesSmartCardReader.checked
			}

		},
		"newDevice": {
			"deviceType": inputs.newDeviceType.value ? deviceTypes[inputs.newDeviceType.value].fullName : "",
			"deviceBrand": inputs.newDeviceBrand.value,
			"deviceModel": inputs.newDeviceModel.value,
			"assetTag": inputs.newAssetTag.value,
			"accessories": {
				"charger": inputs.newIncludesCharger.checked,
				"mouse": inputs.newIncludesMouse.checked,
				"eIdReader": inputs.newIncludesSmartCardReader.checked
			}

		},
		"replacementReason": inputs.replacementReason.value,
		"oldEndDate": formatDate(inputs.oldEndDate.valueAsDate),
		"newEndDate": formatDate(inputs.newEndDate.valueAsDate),
	};
}

/** Performs final steps of contract generation while showing feedback. */
async function generateContract() {
	showProgressBox("Kies een locatie voor het PDF bestand.", false);

	let pdfPath = "";

	try {
		pdfPath = await window.electronAPI.openFile();
		if (!pdfPath) {
			throw new Error("No PDF path received from user.");
		}
	} catch (error) {
		showProgressBox("Er is iets mis gegaan in het bepalen van de PDF locatie. Probeer het opnieuw.", true);
		throw error;
		return
	}

	showProgressBox("Gegevens uit contract aan het ophalen.", false);

	let data = await collectFormData(pdfPath);

	showProgressBox("PDF aan het genereren.", false);

	try {
		console.log('Generating PDF with data:', data);
		const fileUrl = await window.carbone.generatePdf(data);

		if (!fileUrl) {
			throw new Error('File path is undefined');
		}

		console.log('url: ' + fileUrl);

		showProgressBox("PDF aan het openen.", false);

		window.open(fileUrl, '_blank', 'top=0,left=0,frame=true,toolbar=true,menubar=true,scrollbars=true,resizable=true');

		showProgressBox("Klaar met genereren van PDF.", true);
	} catch (error) {
		showProgressBox("Er ging iets mis tijdens het genereren van de PDF. Probeer het opnieuw.", true);
		console.error('Error generating PDF:', error);
	}
}