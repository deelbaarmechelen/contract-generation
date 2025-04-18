import { inputs } from "./formelements.js";
import { fillErrorDiv } from "./display.js";
import { getAge, formatPhoneNumber, isSameDay, euroStrToNum } from "./utility.js";
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
	birthDate: () => {
		const birthDate = inputs.birthDate.valueAsDate;
		const condition = birthDate === null || getAge(birthDate) >= 18; // If `birthDate === null` we want to let normal input validation handle it.

		customValidate(
			inputs.birthDate, condition,
			"Klant is onder 18."
		);
	},

	/** Validates postal code. Only Mechelaars can get a non-paying contract, unless they have an exception. */
	postalCode: () => {
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
	phoneNumber: async () => {
		// Easiest way to do this is to just try to format it, if it fails, it's a bad number.
		customValidate(
			inputs.phoneNumber, !inputs.phoneNumber.value || await formatPhoneNumber(inputs.phoneNumber.value),
			"Ongeldig telefoonnummer."
		);
	},

	/** Validates signature date. The signature date should normally be today. */
	signatureDate: () => {
		const signatureDate = inputs.signatureDate.valueAsDate;
		const condition = signatureDate === null || isSameDay(signatureDate, new Date());

		customValidate(
			inputs.signatureDate, condition,
			"Handtekeningdatum hoort vandaag te zijn."
		);
	},

	/** Validates end date. End date should always be after start date. */
	endDate: () => {
		const condition = inputs.startDate.valueAsDate === null
			|| inputs.endDate.valueAsDate === null
			|| inputs.startDate.valueAsDate < inputs.endDate.valueAsDate;

		customValidate(
			inputs.endDate, condition,
			"Einddatum hoort na startdatum te zijn."
		);
	},

	/** Validates assetTag. Assettags normally have six digits prepended with some combination of letters. */
	assetTag: () => {
		customValidate(
			inputs.assetTag, !inputs.assetTag.validity.patternMismatch,
			"Een assettag heeft gewoonlijk zes cijfers met eventueel een combinatie hoofdletters ervoor. (bv. 'PC250200')."
		);
	},

	/** Warns user if the monthly payment is different from expected for device type. */
	monthlyPayment: () => {
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
	yearlyPayment: () => {
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
	circleValue: () => {
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
	structuredCommunication: () => {
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
export function validateAll() {
	for (const [, validationFunc] of Object.entries(validate)) {
		validationFunc();
	}
}

/** Executes all validation functions and makes all validation warnings visible. */
export function allFieldsHadInput() {
	for (const [, el] of Object.entries(inputs)) {
		el.dispatchEvent(new Event("input", { bubbles: true }));
	}
}