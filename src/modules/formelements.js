//// Element constants

export const main = document.getElementsByTagName("main")[0];
export const form = document.getElementById("digibank-form");
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

export const prompt = document.getElementById("prompt");
export const promptContent = document.getElementById("prompt-content");
export const promptButtons = document.getElementById("prompt-buttons");

export const buttons = {
	submit: document.getElementById("submit"),

	autoFill: {
		contactRef: document.getElementById("auto-contact-ref"),

		signatureDate: document.getElementById("auto-signature-date"),
		startDate: document.getElementById("auto-start-date"),
		endDate: document.getElementById("auto-end-date"),

		// One button per lookup, next to the field it is keyed on: the assettag
		// fills merk, model, prijs and cirkelwaarde from a single Lend Engine call.
		assetTag: document.getElementById("auto-asset-tag"),

		structuredCommunication: document.getElementById("auto-structured-communication"),

		oldAssetTag: document.getElementById("auto-old-asset-tag"),
		newAssetTag: document.getElementById("auto-new-asset-tag")
	}
}