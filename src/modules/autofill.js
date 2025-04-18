import { inputs, buttons } from "./formelements.js";
import { deviceTypes } from "./constants.js";
import { showProgressBox, hideProgressBox } from "./prompts.js";
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

		showProgressBox("Gegevens over asset aan het opzoeken.", true);

		try {
			const data = await window.inventoryAPI.getAssetDetails({ assetTag: assetTagEl.value });

			console.log(data);

			if (!data.success) {
				showProgressBox("Fout tijdens het opzoeken van asset:\n\"" + data.error + "\"", true);
				return
			}

			brandEl.value = data.asset.brand;
			modelEl.value = data.asset.model;

			hideProgressBox();

			brandEl.dispatchEvent(new Event("input", { bubbles: true }));
			modelEl.deviceModel.dispatchEvent(new Event("input", { bubbles: true }));
		} catch (err) {
			showProgressBox("Fout tijdens het opzoeken van asset.", true);
			throw err;
		}
	};
	return autoDeviceSpecs
}

const autoDeviceSpecs = factoryAutoDeviceSpecs(
	inputs.assetTag, inputs.deviceBrand, inputs.deviceModel
);

const autoOldDeviceSpecs = factoryAutoDeviceSpecs(
	inputs.oldAssetTag, inputs.oldDeviceBrand, inputs.oldDeviceModel
);

const autoNewDeviceSpecs = factoryAutoDeviceSpecs(
	inputs.newAssetTag, inputs.newDeviceBrand, inputs.newDeviceModel
);

//// Autofill click events

const autoFill = {
	signatureDate: () => {
		inputs.signatureDate.valueAsDate = new Date();
	
		// Emulate a user changing the field, which is important for correct display
		// of invalid inputs.
		inputs.signatureDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	startDate: () => {
		if (!fieldsValid(inputs.signatureDate)) {
			return
		}
	
		inputs.startDate.valueAsDate = inputs.signatureDate.valueAsDate;
	
		inputs.startDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	endDate: () => {
		if (!fieldsValid(inputs.startDate)) {
			return
		}
	
		const date = inputs.startDate.valueAsDate;
		inputs.endDate.valueAsDate = new Date(date.getUTCFullYear() + 1,
			date.getMonth(),
			date.getDate());
	
		inputs.endDate.dispatchEvent(new Event("input", { bubbles: true }));
	},
	structuredCommunication: () => {
		if (!fieldsValid(inputs.signatureDate, inputs.assetTag)) {
			return
		}
	
		inputs.structuredCommunication.value = calcStructuredCommunication();
	
		inputs.structuredCommunication.dispatchEvent(new Event("input", { bubbles: true }));
	},
	deviceBrand: autoDeviceSpecs,
	deviceModel: autoDeviceSpecs,
	oldDeviceBrand: autoOldDeviceSpecs,
	oldDeviceModel: autoOldDeviceSpecs,
	newDeviceBrand: autoNewDeviceSpecs,
	newDeviceModel: autoNewDeviceSpecs,
	monthlyPayment: () => {
		if (!fieldsValid(inputs.deviceType)) {
			return
		}
	
		inputs.monthlyPayment.value = formatEuro(deviceTypes[inputs.deviceType.value].monthlyPayment);
	
		inputs.monthlyPayment.dispatchEvent(new Event("input", { bubbles: true }));
	},
	yearlyPayment: () => {
		if (!fieldsValid(inputs.deviceType)) {
			return
		}
	
		inputs.yearlyPayment.value = formatEuro(deviceTypes[inputs.deviceType.value].yearlyPayment);
	
		inputs.yearlyPayment.dispatchEvent(new Event("input", { bubbles: true }));
	},
	circleValue: () => {
		if (!fieldsValid(inputs.deviceType)) {
			return
		}
	
		inputs.circleValue.value = formatEuro(deviceTypes[inputs.deviceType.value].circleValue);
	
		inputs.circleValue.dispatchEvent(new Event("input", { bubbles: true }));
	}
}

export function initAutoFillButtons() {
    for (const [key, el] of Object.entries(buttons.autoFill)) {
		console.log(key, el);
		if (el.id.slice(0, 4) == "auto") {
        	el.addEventListener("click", autoFill[key]);
		}
    }
}