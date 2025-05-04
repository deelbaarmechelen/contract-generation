import { formatDate, formatDateLong, formatEuro, formatAddress } from "./utility.js";
import { form } from "./formelements.js";
import { deviceTypes } from "./constants.js";
import { Prompt } from "./prompts.js";

/** Does final pre-processing of form data, and collects it into object. */
async function collectFormData(pdfPath) {
	let courseNotification = "";

	if (form.workshopException.checked) {
		courseNotification = "De Ontlener is vrijgesteld van de verplichting een gratis opleidingssessie te volgen door het afleggen van een bekwaamheidstest.";
	} else if (form.workshopExceptionPriorCustomer.checked) {
		courseNotification = "De Ontlener is vrijgesteld van de verplichting een gratis opleidingssessie te volgen omdat deze een eerdere klant is.";
	} else {
		courseNotification = "De Ontlener is verplicht een gratis opleidingssessie bij te wonen om te verzekeren dat deze met het toestel kan werken."
	}

	return {
		"generationInfo": {
			"path": pdfPath,
			"print": true
		},
		"contractNumber": form.contractNumber.value,
		"clientNumber": form.clientNumber.value,
		"client": {
			"name": form.firstName.value + ' ' + form.lastName.value,
			"birthDate": formatDate(form.birthDate.valueAsDate),
			"address": formatAddress(form.streetName.value, form.houseNumber.value,
				form.boxNumber.value, form.postalCode.value,
				form.municipality.value, form.country.value),
			"phone": await window.libphonenumber.formatPhoneNumber(String(form.phoneNumber.value)),
			"email": form.email.value,
		},
		"contractType": form.contractType.value,
		"subscription": {
			"structuredReference": form.structuredCommunication.value,
			"monthlyPayment": formatEuro(form.monthlyPayment.value),
			"yearlyPayment": formatEuro(form.yearlyPayment.value),
			"amountPaid": formatEuro(form.advancePayment.value),
			"circleValue": formatEuro(form.circleValue.value)
		},
		"uitpas": {
			"applicable": !form.uitpasException.checked,
			"number": form.uitpasNumber.value,
			"aptitudeTest": form.workshopException.checked,
			"courseEnrolment": !form.workshopException.checked,
			"courseDate": formatDateLong(new Date(form.workshopDate.value)),
			"courseNotification": courseNotification
		},
		"referrer": form.referrer.value,
		"structuredReference": form.structuredCommunication.value,
		"item": {
			"deviceType": form.deviceType.value ? deviceTypes[form.deviceType.value].fullName : "",
			"deviceBrand": form.deviceBrand.value,
			"deviceModel": form.deviceModel.value,
			"assetTag": form.assetTag.value,
			"accessories": {
				"charger": form.includesCharger.checked,
				"mouse": form.includesMouse.checked,
				"eIdReader": form.includesSmartCardReader.checked
			}
		},
		"contractDate": formatDate(form.signatureDate.valueAsDate),
		"startDate": formatDate(form.startDate.valueAsDate),
		"endDate": formatDate(form.endDate.valueAsDate),
		"extension": form.extension.checked,
		"replacement": form.replacement.checked,
		"oldDevice": {
			"deviceType": form.oldDeviceType.value ? deviceTypes[form.oldDeviceType.value].fullName : "",
			"deviceBrand": form.oldDeviceBrand.value,
			"deviceModel": form.oldDeviceModel.value,
			"assetTag": form.oldAssetTag.value,
			"accessories": {
				"charger": form.oldIncludesCharger.checked,
				"mouse": form.oldIncludesMouse.checked,
				"eIdReader": form.oldIncludesSmartCardReader.checked
			}

		},
		"newDevice": {
			"deviceType": form.newDeviceType.value ? deviceTypes[form.newDeviceType.value].fullName : "",
			"deviceBrand": form.newDeviceBrand.value,
			"deviceModel": form.newDeviceModel.value,
			"assetTag": form.newAssetTag.value,
			"accessories": {
				"charger": form.newIncludesCharger.checked,
				"mouse": form.newIncludesMouse.checked,
				"eIdReader": form.newIncludesSmartCardReader.checked
			}

		},
		"replacementReason": form.replacementReason.value,
		"oldEndDate": formatDate(form.oldEndDate.valueAsDate),
		"newEndDate": formatDate(form.newEndDate.valueAsDate),
	};
}

/** Performs final steps of contract generation while showing feedback. */
export async function generateContract() {
	Prompt.createProgressPrompt("Kies een locatie voor het PDF bestand.", false).show();

	let pdfPath = "";

	try {
		pdfPath = await window.electronAPI.openFile();
		if (!pdfPath) {
			throw new Error("No PDF path received from user.");
		}
	} catch (error) {
		Prompt.createProgressPrompt("Er is iets mis gegaan in het bepalen van de PDF locatie. Probeer het opnieuw.", true).show();
		throw error;
	}

	Prompt.createProgressPrompt("Gegevens uit contract aan het ophalen.", false).show();

	let data = await collectFormData(pdfPath);

	Prompt.createProgressPrompt("PDF aan het genereren.", false).show();

	try {
		console.log('Generating PDF with data:', data);
		const fileUrl = await window.carbone.generatePdf(data);

		if (!fileUrl) {
			throw new Error('File path is undefined');
		}

		console.log('url: ' + fileUrl);

		Prompt.createProgressPrompt("PDF aan het openen.", false);

		window.open(fileUrl, '_blank', 'top=0,left=0,frame=true,toolbar=true,menubar=true,scrollbars=true,resizable=true');

		Prompt.createProgressPrompt("Klaar met genereren van PDF.", true).show();
	} catch (error) {
		Prompt.createProgressPrompt("Er ging iets mis tijdens het genereren van de PDF. Probeer het opnieuw.", true).show();
		console.error('Error generating PDF:', error);
	}
}