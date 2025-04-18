//// Element constants

export const main = document.getElementsByTagName("main")[0];
export const digibankForm = document.getElementById("digibank-form");
export const fieldsets = main.getElementsByTagName("fieldset");

export const nonPayingElements = document.getElementsByClassName("non-paying");
export const payingElements = document.getElementsByClassName("paying");
export const addendumElements = document.getElementsByClassName("addendum");

export const fsReplacementOld = document.getElementById("fs-replacement-old");
export const fsReplacementNew = document.getElementById("fs-replacement-new");
export const fsReplacementReason = document.getElementById("fs-replacement-reason");
export const fsExtension = document.getElementById("fs-extension");

export const instructionTextElements = main.getElementsByClassName("instruction-text");  // Really just the text that the _Digibankmedewerker_ will take it from here.
export const resetInstruction = document.getElementById("reset-instruction");

export const warningBox = document.getElementById("warning-box");
export const warningBoxTable = document.getElementById("warning-box-table");
export const progressBox = document.getElementById("progress-box");
export const progressBoxText = document.getElementById("progress-box-text")

export const inputs = {  // Not necessarily all <input> tags.
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

export const buttons = {
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