import { form } from "./formelements.js";
import { fillErrorDiv } from "./display.js";
import { getAge, formatPhoneNumber, extractIbanNumber, isSameDay, euroStrToNum } from "./utility.js";
import { postalCodesMechelen, deviceTypes } from "./constants.js";

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
	/** Validates that customer is at least 18 years of age. */
	birthDate () {
		const birthDate = form.birthDate.valueAsDate;
		const condition = birthDate === null || getAge(birthDate) >= 18; // If `birthDate === null` we want to let normal input validation handle it.

		customValidate(
			form.birthDate, condition,
			"Klant is onder 18."
		);
	},

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

	/** Warns user if the monthly payment is different from expected for device type. */
	monthlyPayment () {
		let condition = true;

		if (form.deviceType.value && form.monthlyPayment.value) {
			const value = form.monthlyPayment.value;
			const euroNum = euroStrToNum(value);
			const euroNumExpected = deviceTypes[form.deviceType.value].monthlyPayment;
			condition = euroNum == euroNumExpected;
		}

		customValidate(
			form.monthlyPayment, condition,
			"Onverwacht bedrag voor apparaattype."
		);
	},

	/** Warns user if the yearly payment is different from expected for device type. */
	yearlyPayment () {
		let condition = true;

		if (form.deviceType.value && form.circleValue.value) {
			const value = form.yearlyPayment.value;
			const euroNum = euroStrToNum(value);
			const euroNumExpected = deviceTypes[form.deviceType.value].yearlyPayment;
			condition = euroNum == euroNumExpected;
		}

		customValidate(
			form.yearlyPayment, condition,
			"Onverwacht bedrag voor apparaattype."
		);
	},

	/** Warns user if the circle value is different from expected for device type. */
	circleValue () {
		let condition = true;

		if (form.deviceType.value && form.circleValue.value) {
			const value = form.circleValue.value;
			const euroNum = euroStrToNum(value);
			const euroNumExpected = deviceTypes[form.deviceType.value].circleValue;
			condition = euroNum == euroNumExpected;
		}

		customValidate(
			form.circleValue, condition,
			"Onverwacht bedrag voor apparaattype."
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
	monthlyPayment: ["deviceType"],
	yearlyPayment: ["deviceType"],
	circleValue: ["deviceType"]
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