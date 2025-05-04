import { form, buttons } from "./formelements.js";
import { deviceTypes } from "./constants.js";
import { Prompt } from "./prompts.js";
import { formatEuro } from "./utility.js";

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

/** Function factory to create function that gets device brand and model based on assettag from Snipe-IT inventory. 
 * @param { HTMLElement } assetTagEl - HTML element with value property representing the assettag.
 * @param { HTMLElement } brandEl - HTML element with value property representing the brand.
 * @param { HTMLElement } modelEl - HTML element with value property representing the model.
 * @returns { Function } Async event listener function to be associated with autoFill buttons for the brand and model.
*/
function factoryAutoDeviceSpecs(assetTagEl, brandEl, modelEl) {
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

			Prompt.close();

			brandEl.dispatchEvent(new Event("input", { bubbles: true }));
			modelEl.deviceModel.dispatchEvent(new Event("input", { bubbles: true }));
		} catch (err) {
			Prompt.createProgressPrompt("Fout tijdens het opzoeken van asset.", true).show();
			throw err;
		}
	};
	return autoDeviceSpecs
}

const autoDeviceSpecs = factoryAutoDeviceSpecs(
	form.assetTag, form.deviceBrand, form.deviceModel
);

const autoOldDeviceSpecs = factoryAutoDeviceSpecs(
	form.oldAssetTag, form.oldDeviceBrand, form.oldDeviceModel
);

const autoNewDeviceSpecs = factoryAutoDeviceSpecs(
	form.newAssetTag, form.newDeviceBrand, form.newDeviceModel
);

//// Autofill click events

const autoFill = {
	signatureDate: () => {
		form.signatureDate.valueAsDate = new Date();
	
		// Emulate a user changing the field, which is important for correct display
		// of invalid inputs.
		form.signatureDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	startDate: () => {
		if (!fieldsValid(form.signatureDate)) {
			return
		}
	
		form.startDate.valueAsDate = form.signatureDate.valueAsDate;
	
		form.startDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	endDate: () => {
		if (!fieldsValid(form.startDate)) {
			return
		}
	
		const date = form.startDate.valueAsDate;
		form.endDate.valueAsDate = new Date(date.getUTCFullYear() + 1,
			date.getMonth(),
			date.getDate());
	
		form.endDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	structuredCommunication: () => {
		if (!fieldsValid(form.signatureDate, form.assetTag)) {
			return
		}
	
		form.structuredCommunication.value = calcStructuredCommunication();
	
		form.structuredCommunication.dispatchEvent(new Event("input", { bubbles: true }));
	},
	deviceBrand: autoDeviceSpecs,
	deviceModel: autoDeviceSpecs,
	oldDeviceBrand: autoOldDeviceSpecs,
	oldDeviceModel: autoOldDeviceSpecs,
	newDeviceBrand: autoNewDeviceSpecs,
	newDeviceModel: autoNewDeviceSpecs,
	monthlyPayment: () => {
		if (!fieldsValid(form.deviceType)) {
			return
		}
	
		form.monthlyPayment.value = formatEuro(deviceTypes[form.deviceType.value].monthlyPayment);
	
		form.monthlyPayment.dispatchEvent(new Event("input", { bubbles: true }));
	},
	yearlyPayment: () => {
		if (!fieldsValid(form.deviceType)) {
			return
		}
	
		form.yearlyPayment.value = formatEuro(deviceTypes[form.deviceType.value].yearlyPayment);
	
		form.yearlyPayment.dispatchEvent(new Event("input", { bubbles: true }));
	},
	circleValue: () => {
		if (!fieldsValid(form.deviceType)) {
			return
		}
	
		form.circleValue.value = formatEuro(deviceTypes[form.deviceType.value].circleValue);
	
		form.circleValue.dispatchEvent(new Event("input", { bubbles: true }));
	}
}

export function initAutoFillButtons() {
    for (const [key, el] of Object.entries(buttons.autoFill)) {
		el.addEventListener("click", autoFill[key]);
    }
}