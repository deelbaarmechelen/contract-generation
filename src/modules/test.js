import { inputs } from "./formelements.js";
import { buttons } from "./formelements.js";
import { allFieldsHadInput } from "./validation.js";

/** Helper function for manual testing. */
export function testFill() {
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

	buttons.autoFill.signatureDate.click();
	buttons.autoFill.startDate.click();

	if (inputs.nonPayingContract.checked) {
		inputs.uitpasNumber.value = "1111111111111";
		buttons.autoFill.endDate.click();
		inputs.workshopDate.valueAsDate = new Date();
	} else if (inputs.payingContract.checked) {
		const startDate = inputs.startDate.valueAsDate;
		inputs.endDate.valueAsDate = new Date(startDate.getUTCFullYear() + 1, startDate.getMonth(), startDate.getDate());
		buttons.autoFill.structuredCommunication.click();
		buttons.autoFill.monthlyPayment.click();
		buttons.autoFill.yearlyPayment.click();
		buttons.autoFill.circleValue.click();
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