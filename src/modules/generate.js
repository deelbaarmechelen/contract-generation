import { formatDate, formatDateLong, formatEuro, formatAddress } from "./utility.js";
import { inputs } from "./formelements.js";
import { deviceTypes } from "./constants.js";
import { showProgressBox } from "./prompts.js";

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
export async function generateContract() {
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