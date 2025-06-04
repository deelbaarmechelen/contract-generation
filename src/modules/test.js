import { form } from "./formelements.js";
import { buttons } from "./formelements.js";
import { allFieldsHadInput } from "./validation.js";
import { dateTimeLocalStr } from "./utility.js";

/** Helper function for manual testing. */
export function testFill() {
	// I know just putting this in renderer.js is testing like a cave person.
	// I'm not figuring out node.js unit testing right now. 
	// Ooga booga me use developer console.

	if (!form.contractType.value) {
		form.contractType.value = "non-paying";
	}

	form.firstName.value = "Pietje";
	form.lastName.value = "De Laptopwiller";
	form.birthDate.valueAsDate = new Date("1995-12-17T03:24:00");

	form.streetName.value = "Ergensstraat";
	form.houseNumber.value = "1337";
	form.boxNumber.value = "69";
	form.municipality.value = "Mechelen";
	form.postalCode.value = "2800";
	form.country.value = "België";

	form.email.value = "Pietje123@gmail.com";
	form.phoneNumber.value = "0469123123";

	form.referrer.value = "Sinterklaas";

	form.clientNumber.value = "1000001";

	form.assetTag.value = "PC990200";
	form.deviceBrand.value = "LapInc.";
	form.deviceModel.value = "Thinkbook PP890";
	form.deviceType.value = "laptop-win-10";  // Miracle that this works like that.
	form.includesCharger.checked = true;

	buttons.autoFill.signatureDate.click();
	buttons.autoFill.startDate.click();

	if (form.contractType.value == "non-paying") {
		form.contractNumber.value = "C-NB-25-100000";
		form.uitpasNumber.value = "1111111111111";
		buttons.autoFill.endDate.click();
		form.workshopDate.value = dateTimeLocalStr(new Date());
	} else if (form.contractType.value == "paying") {
		form.contractNumber.value = "C-B-25-100001";
		const startDate = form.startDate.valueAsDate;
		form.endDate.valueAsDate = new Date(startDate.getUTCFullYear() + 1, startDate.getMonth(), startDate.getDate());
		buttons.autoFill.structuredCommunication.click();
		buttons.autoFill.monthlyPayment.click();
		buttons.autoFill.yearlyPayment.click();
		buttons.autoFill.circleValue.click();
		form.advancePayment.value = "€ 50";
	} else if (form.contractType.value == "addendum") {
		form.contractNumber.value = "C-B-25-100002";
		form.replacement.checked = true;
		form.extension.checked = true;

		form.oldAssetTag.value = "PC990201";
		form.oldDeviceBrand.value = "SELL";
		form.oldDeviceModel.value = "Longitude 4469";
		form.oldDeviceType.value = "laptop-win-10";
	
		form.newAssetTag.value = "PC990202";
		form.newDeviceBrand.value = "SELL";
		form.newDeviceModel.value = "Altitude 4m";
		form.newDeviceType.value = "laptop-win-10";

		form.replacementReason.value = "Een kabouter heeft er soep en cola over gemorst.";

		const signatureDate = form.signatureDate.valueAsDate;

		form.oldEndDate.valueAsDate = signatureDate;
		form.newEndDate.valueAsDate = new Date(signatureDate.getUTCFullYear() + 1, signatureDate.getMonth(), signatureDate.getDate());
	}

	allFieldsHadInput();
}