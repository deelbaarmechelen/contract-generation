//// Element constants

const nonPayingOnlyElements = document.getElementsByClassName("non-paying-only");
const payingOnlyElements = document.getElementsByClassName("paying-only");
const main = document.getElementsByTagName("main")[0];
const fieldsets = main.getElementsByTagName("fieldset");
const instructionTextElements = main.getElementsByClassName("instruction-text");
const digibankForm = document.getElementById("digibank-form");
const warningBox = document.getElementById("warning-box");
const warningBoxTable = document.getElementById("warning-box-table");

const inputs = {
	payingContract: document.getElementById('paying-contract'),
	nonPayingContract: document.getElementById('non-paying-contract'),

	uitpasNumber: document.getElementById('uitpas-number'),
	uitpasException: document.getElementById('uitpas-exception'),

	firstName: document.getElementById('first-name'),
	lastName: document.getElementById('last-name'),

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
	clientNumber: document.getElementById('client-number'),
	contractNumber: document.getElementById('contract-number'),

	assetTag: document.getElementById('asset-tag'),
	deviceBrand: document.getElementById('device-brand'),
	deviceModel: document.getElementById('device-model'),
	deviceType: document.getElementById('device-type'),
	includesCharger: document.getElementById('includes-charger'),
	includesMouse: document.getElementById('includes-mouse'),
	includesSmartCardReader: document.getElementById('includes-smart-card-reader'),
	deviceOutDate: document.getElementById('device-out-date'),
	deviceCheckupDate: document.getElementById('device-checkup-date'),
	deviceInDate: document.getElementById('device-in-date'),

	monthlyPayment: document.getElementById('monthly-payment'),
	yearlyPayment: document.getElementById('yearly-payment'),
	circleValue: document.getElementById('circle-value'),
	advancePayment: document.getElementById('advance-payment'),
	structuredCommunication: document.getElementById('structured-communication')
}

const buttons = {
	submit: document.getElementById("submit"),

	warningGenerateAnyway: document.getElementById("warning-generate-anyway"),
	warningGoBack: document.getElementById("warning-go-back"),

	autoSignatureDate: document.getElementById("auto-signature-date"),
	autoStartDate: document.getElementById("auto-start-date"),

	autoContractNumber: document.getElementById("auto-contract-number"),
	autoDeviceBrand: document.getElementById("auto-device-brand"),
	autoDeviceModel: document.getElementById("auto-device-model"),

	autoDeviceOutDate: document.getElementById("auto-device-out-date"),
	autoDeviceCheckupDate: document.getElementById("auto-device-checkup-date"),
	autoDeviceInDate: document.getElementById("auto-device-in-date"),

	autoMonthlyPayment: document.getElementById("auto-monthly-payment"),
	autoYearlyPayment: document.getElementById("auto-yearly-payment"),
	autoCircleValue: document.getElementById("auto-circle-value"),
	autoStructuredCommunication: document.getElementById("auto-structured-communication"),
}

// Data constants

const deviceTypes = {
	"laptop-win-10": {
		fullName: "Laptop (Windows 10)",
		monthlyPayment: 10,
		yearlyPayment: 100,
		circleValue: 50
	},
	"laptop-win-11": {
		fullName: "Laptop (Windows 11)",
		monthlyPayment: 15,
		yearlyPayment: 150,
		circleValue: 75
	}
}

const postalCodesMechelen = [2800, 2801, 2811, 2812];

//// Testing

// Helper function for manual testing
function testFill() {
	if (!inputs.nonPayingContract.checked) {
		inputs.payingContract.checked = true;
		changeContractType();
	}
	
	inputs.firstName.value = "Pietje";
	inputs.lastName.value = "De Laptopwiller";
	
	inputs.streetName.value = "Ergensstraat";
	inputs.houseNumber.value = "1337";
	inputs.boxNumber.value = "69";
	inputs.municipality.value = "Mechelen";
	inputs.postalCode.value = "2800";
	inputs.country.value = "België";
	
	inputs.email.value = "Pietje123@gmail.com";
	inputs.phoneNumber.value = "0469123123";
	
	inputs.referrer.value = "Zijn mama";
	
	inputs.contractNumber.value = "C-B-25-100000";
	inputs.assetTag.value = "PC250200";
	inputs.deviceBrand.value = "LapInc.";
	inputs.deviceModel.value = "Thinkbook PP890";
	inputs.deviceType.value = "Laptop";
	inputs.includesCharger.checked = true;

	buttons.autoSignatureDate.click();
	buttons.autoStartDate.click();

	buttons.autoDeviceOutDate.click();
	buttons.autoDeviceCheckupDate.click();
	buttons.autoDeviceInDate.click();

	if (inputs.nonPayingContract.checked) {
		inputs.uitpasNumber.value = "1111111111111";
		inputs.workshopDate.valueAsDate = new Date();
	} else {
		buttons.autoStructuredCommunication.click();
	}
}

//// General utility

const euroFormat = Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" })

/** Make euro amount numeric. */
function euroStrToNum(euroStr) {
	const cleanEuroStr = euroStr
	 .replace(/[^\d,.]/g, "")
	 .replace(",", ".");
	return Number(cleanEuroStr);
}

/** Prettify euro amount. */
function euroPrettify(euroAmount) {
	const regularized = euroStrToNum(String(euroAmount));
	return euroFormat.format(regularized);
}

//// Form display

// Schaamteloos gestolen van trincot op StackExchange. CC BY-SA is toepasselijk. 
// https://stackoverflow.com/questions/12578507/implement-an-input-with-a-mask
// This code empowers all input tags having a placeholder and data-slots attribute
document.addEventListener('DOMContentLoaded', () => {
	for (const el of document.querySelectorAll("[placeholder][data-slots]")) {
		const pattern = el.getAttribute("placeholder"),
			slots = new Set(el.dataset.slots || "_"),
			prev = (j => Array.from(pattern, (c,i) => slots.has(c)? j=i+1: j))(0),
			first = [...pattern].findIndex(c => slots.has(c)),
			accept = new RegExp(el.dataset.accept || "\\d", "g"),
			clean = input => {
				input = input.match(accept) || [];
				return Array.from(pattern, c =>
					input[0] === c || slots.has(c) ? input.shift() || c : c
				);
			},
			format = () => {
				const [i, j] = [el.selectionStart, el.selectionEnd].map(i => {
					i = clean(el.value.slice(0, i)).findIndex(c => slots.has(c));
					return i<0? prev.at(-1) : back ? prev[i-1] || first : i;
				});
				el.value = clean(el.value).join("");
				el.setSelectionRange(i, j);
				back = false;
			};
		let back = false;
		el.addEventListener("keydown", (e) => back = e.key === "Backspace");
		el.addEventListener("input", format);
		el.addEventListener("focus", format);
		el.addEventListener("blur", () => el.value === pattern && (el.value=""));
	}
});

/** Hides or shows fields depending on contract type. */
function changeContractType(e) {
	payingChecked = inputs.payingContract.checked;
	nonPayingChecked = inputs.nonPayingContract.checked;
	
	if (payingChecked || nonPayingChecked) {
		buttons.submit.classList.remove("hidden");
	} else {
		buttons.submit.classList.add("hidden");
	}
	
	for (const el of fieldsets) {
		if (payingChecked || nonPayingChecked) {
			el.classList.remove("hidden");
			el.disabled = false;
		} else {
			el.classList.add("hidden");
			el.disabled = true;
		}
	}
	
	for (const el of instructionTextElements) {
		if (payingChecked || nonPayingChecked) {
			el.classList.remove("hidden");
			el.disabled = false;
		} else {
			el.classList.add("hidden");
			el.disabled = true;
		}
	}
	
	for (const el of nonPayingOnlyElements) {
		if (nonPayingChecked) {
			el.classList.remove("hidden");
			el.disabled = false;
		} else {
			el.classList.add("hidden");
			el.disabled = true;
		}
	}

	for (const el of payingOnlyElements) {
		if (payingChecked) {
			el.classList.remove("hidden");
			el.disabled = false;
		} else {
			el.classList.add("hidden");
			el.disabled = true;
		}
	}
} 

inputs.payingContract.addEventListener("input", changeContractType);
inputs.nonPayingContract.addEventListener("input", changeContractType);

// UiTpas code field activation toggle

let uitpasNummer = "";

function toggleEnabledUitpasNumber(e) {
	inputs.uitpasNumber.disabled = inputs.uitpasException.checked;
}

inputs.uitpasException.addEventListener("input", toggleEnabledUitpasNumber);

// Workshop fields activation and requirement toggle

function toggleEnabledWorkshopFields(e) {
	inputs.workshopException.disabled = inputs.isExtension.checked;
	inputs.workshopDate.disabled = inputs.workshopException.checked;
	inputs.workshopDate.required = !(inputs.workshopException.checked || inputs.isExtension.checked);
}

inputs.isExtension.addEventListener("input", toggleEnabledWorkshopFields);
inputs.workshopException.addEventListener("input", toggleEnabledWorkshopFields);

// Adds changed class to input elements after they've been changed.

for (const [key, el] of Object.entries(inputs)) {
	console.log(el);
	el.addEventListener("input", (e) => el.classList.add("changed"))
}

//// Input validation

function validatePostalCode(e) {
	if (inputs.nonPayingContract.checked 
		&& !inputs.uitpasException.checked 
		&& !postalCodesMechelen.includes(Number(inputs.postalCode.value))) {
		inputs.postalCode.setCustomValidity("Dit is geen postcode uit de gemeente Mechelen.");
	} else {
		inputs.postalCode.setCustomValidity("");
	}
}

inputs.postalCode.addEventListener("input", validatePostalCode)
inputs.uitpasException.addEventListener("input", validatePostalCode)

inputs.assetTag.addEventListener("input", (e) => {
	if (inputs.assetTag.validity.patternMismatch) {
		inputs.assetTag.setCustomValidity("Een assettag hoort zes cijfers te hebben met eventueel een combinatie hoofdletters ervoor. (bv. 'PC250200')");
	} else {
		inputs.assetTag.setCustomValidity("");
	}	
})

inputs.structuredCommunication.addEventListener("input", (e) => {
	digits = inputs.structuredCommunication.value.replace(/\D/g, "");
	incompleteDigits = parseInt(digits.slice(0, 10));
	checksumProvided = parseInt(digits.slice(10, 12));
	
	if (!(incompleteDigits % 97 === checksumProvided)) {
		inputs.structuredCommunication.setCustomValidity("Deze gestructureerde mededeling is niet geldig.");
	} else {
		inputs.structuredCommunication.setCustomValidity("");
	}	
})

function validateMonthlyPayment(e) {
	if (!inputs.deviceType.value) {
		inputs.monthlyPayment.setCustomValidity("");
		return
	}

	const value = inputs.monthlyPayment.value;
	const euroNum = euroStrToNum(value);
	const euroNumExpected = deviceTypes[inputs.deviceType.value].monthlyPayment;
	
	if (!(euroNum == euroNumExpected)) {
		inputs.monthlyPayment.setCustomValidity("Onverwacht bedrag voor dit apparaattype.");
	} else {
		inputs.monthlyPayment.setCustomValidity("");
	}
}

inputs.monthlyPayment.addEventListener("input", validateMonthlyPayment);
inputs.deviceType.addEventListener("input", validateMonthlyPayment);

function validateYearlyPayment(e) {
	if (!inputs.deviceType.value) {
		inputs.yearlyPayment.setCustomValidity("");
		return
	}

	const value = inputs.yearlyPayment.value;
	const euroNum = euroStrToNum(value);
	const euroNumExpected = deviceTypes[inputs.deviceType.value].yearlyPayment;
	
	if (!(euroNum == euroNumExpected)) {
		inputs.yearlyPayment.setCustomValidity("Onverwacht bedrag voor dit apparaattype.");
	} else {
		inputs.yearlyPayment.setCustomValidity("");
	}
}

inputs.yearlyPayment.addEventListener("input", validateYearlyPayment);
inputs.deviceType.addEventListener("input", validateYearlyPayment);

function validateCircleValue(e) {
	if (!inputs.deviceType.value) {
		inputs.circleValue.setCustomValidity("");
		return
	}

	const value = inputs.circleValue.value;
	const euroNum = euroStrToNum(value);
	const euroNumExpected = deviceTypes[inputs.deviceType.value].circleValue;

	if (!(euroNum == euroNumExpected)) {
		inputs.circleValue.setCustomValidity("Onverwacht bedrag voor dit apparaattype.");
	} else {
		inputs.circleValue.setCustomValidity("");
	}
}

inputs.circleValue.addEventListener("input", validateCircleValue);
inputs.deviceType.addEventListener("input", validateCircleValue);

//// Autofill buttons

// Autofill calculations

function calcSignatureDate() {
	return new Date();
}

function calcStartDate() {
	return inputs.signatureDate.valueAsDate || calcSignatureDate();
}

function calcDeviceOutDate() {
	return inputs.startDate.valueAsDate || calcStartDate();
}

function calcDeviceCheckupDate() {
	const date = inputs.deviceOutDate.valueAsDate || calcDeviceOutDate();
	return new Date(date.getUTCFullYear(), date.getMonth() + 6, date.getDate());
}

function calcDeviceInDate() {
	const date = inputs.deviceOutDate.valueAsDate || calcDeviceOutDate();
	return new Date(date.getUTCFullYear() + 1, date.getMonth(), date.getDate());
}

function calcStructuredCommunication() {
	const signatureDate = inputs.signatureDate.valueAsDate || new Date();
	const assetTag = inputs.assetTag.value;

	const monthDigits = ('0' + (signatureDate.getMonth() + 1).toString()).slice(-2);
	const yearDigit = signatureDate.getFullYear().toString().slice(-1);
	const assetTagDigits = ((assetTag.replace(/\D/g, "")).slice(-6) + "0000000").slice(0, 7);
	
	const unfinishedMessage = monthDigits + yearDigit + assetTagDigits
	const checksum = ("00" + (parseInt(unfinishedMessage) % 97).toString()).slice(-2);

	return unfinishedMessage + checksum;
}

// Autofill click events

buttons.autoSignatureDate.addEventListener("click", (e) => {
	inputs.signatureDate.valueAsDate = calcSignatureDate();

	inputs.signatureDate.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoStartDate.addEventListener("click", (e) => {
	inputs.startDate.valueAsDate = calcStartDate();

	inputs.startDate.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoDeviceOutDate.addEventListener("click", (e) => {
	inputs.deviceOutDate.valueAsDate = calcDeviceOutDate();

	inputs.deviceOutDate.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoDeviceCheckupDate.addEventListener("click", (e) => {
	inputs.deviceCheckupDate.valueAsDate = calcDeviceCheckupDate();

	inputs.deviceCheckupDate.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoDeviceInDate.addEventListener("click", (e) => {
	inputs.deviceInDate.valueAsDate = calcDeviceInDate();

	inputs.deviceInDate.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoStructuredCommunication.addEventListener("click", (e) => {
	inputs.structuredCommunication.value = calcStructuredCommunication();
	inputs.structuredCommunication.dispatchEvent(new Event("input"), { bubbles: true });
});

async function autoDeviceBrandAndModel(e) {
	window.inventoryAPI.getAssetDetails({ assetTag: inputs.assetTag.value })
		.then((data) => {
			console.log(data);
			inputs.deviceBrand.value = data.asset.brand;
			inputs.deviceModel.value = data.asset.model;
		});

	inputs.deviceBrand.dispatchEvent(new Event("input"), { bubbles: true });
	inputs.deviceModel.dispatchEvent(new Event("input"), { bubbles: true });
}

buttons.autoDeviceBrand.addEventListener("click", autoDeviceBrandAndModel);
buttons.autoDeviceModel.addEventListener("click", autoDeviceBrandAndModel);

buttons.autoMonthlyPayment.addEventListener("click", (e) => {
	if (!inputs.deviceType.value) {
		return
	}

	inputs.monthlyPayment.value = euroPrettify(deviceTypes[inputs.deviceType.value].monthlyPayment);

	inputs.monthlyPayment.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoYearlyPayment.addEventListener("click", (e) => {
	if (!inputs.deviceType.value) {
		return
	}

	inputs.yearlyPayment.value = euroPrettify(deviceTypes[inputs.deviceType.value].yearlyPayment);

	inputs.yearlyPayment.dispatchEvent(new Event("input"), { bubbles: true });
});

buttons.autoCircleValue.addEventListener("click", (e) => {
	if (!inputs.deviceType.value) {
		return
	}

	inputs.circleValue.value = euroPrettify(deviceTypes[inputs.deviceType.value].circleValue);

	inputs.circleValue.dispatchEvent(new Event("input"), { bubbles: true });
});

//// Warning prompt

function genValidationReport(inputs) {
	let output = [];
	for (let [key, value] of Object.entries(inputs)) {
		if (value.validity.valid || (value.closest('[disabled]')!=null)) {
			continue
		}

		const labelElement = document.querySelector("label[for=" + value.id + "]");
		labelText = labelElement.innerHTML;
		output.push({label: labelElement.innerHTML, validationMessage: value.validationMessage});
	}
	return output
}

function fillWarningMessages(validationReport) {
	const tableBody = warningBoxTable.getElementsByTagName("TBODY")[0];
	tableBody.innerHTML = "";

	for (let message of validationReport) {
		const fullMessageTr = document.createElement("tr");

		const labelTd = document.createElement("td");
		const labelContent = document.createTextNode(message.label);
		labelTd.appendChild(labelContent);

		const validationMessageTd = document.createElement("td");
		const validationContent = document.createTextNode(message.validationMessage);
		validationMessageTd.appendChild(validationContent);
		
		fullMessageTr.appendChild(labelTd);
		fullMessageTr.appendChild(validationMessageTd);
		tableBody.appendChild(fullMessageTr);
	}
}

async function showWarning() {
	warningBox.classList.remove("hidden");
	main.inert = true;
	fillWarningMessages(genValidationReport(inputs));
	buttons.warningGoBack.focus({focusVisible: true});
}

async function hideWarning() {
	warningBox.classList.add("hidden");
	main.inert = false;

	digibankForm.reportValidity();

	// At this point just show all invalid fields.
	for (const [key, el] of Object.entries(inputs)) {
		el.classList.add("changed");
	}
}

buttons.warningGenerateAnyway.addEventListener('click', async (e) => {
	generateContract();
	hideWarning();
})

buttons.warningGoBack.addEventListener('click', async (e) => {
	hideWarning();
})

buttons.submit.addEventListener('click', async (e) => {
	if (digibankForm.checkValidity()) {
		e.preventDefault();
		generateContract();
	} else {
		e.preventDefault();
		showWarning();
	}
})

async function generateContract() {
	const fullName = inputs.firstName.value + ' ' + inputs.lastName.value;
	const boxNumberText = inputs.boxNumber.value.length == 0 ? '' : ' bus ' + inputs.boxNumber.value;
	const courseDate = inputs.workshopDate.valueAsDate;
	
	var courseNotification = "";
	
	if (inputs.workshopException.checked) {
		courseNotification = "De Ontlener is vrijgesteld van de verplichting een gratis opleidingssessie te volgen door het afleggen van een bekwaamheidstest.";
	} else if (inputs.isExtension.checked) {
		courseNotification = "De Ontlener is vrijgesteld van de verplichting een gratis opleidingssessie te volgen omdat dit contract een verlenging is.";
	} else {
		courseNotification = "De Ontlener is verplicht een gratis opleidingssessie bij te wonen om te verzekeren dat hij/zij met het toestel kan werken."
	}

	var data = {
		"generationInfo": {
			"path": await window.electronAPI.openFile(),
			"print": true
		},
		"contractNumber": inputs.contractNumber.value,
		"clientNumber": inputs.clientNumber.value,
		"isExtension": inputs.isExtension.checked,
		"client": {
			"name" : inputs.firstName.value + ' ' + inputs.lastName.value,
			"address": inputs.streetName.value + ' ' + inputs.houseNumber.value + boxNumberText + ', ' + inputs.postalCode.value + ' ' + inputs.municipality.value + ', ' + inputs.country.value, 
			"phone": inputs.phoneNumber.value,
			"email": inputs.email.value,
		},
    "contract-type": inputs.payingContract.checked ? "paying" : "non-paying",
		"subscription" : {
			"structuredReference" : inputs.structuredCommunication.value,
			"amount" : "10",
			"amountPaid" : "10",
			"circleValue" : "50"
		},
		"uitpas" : {
			"applicable" : !inputs.uitpasException.checked,
			"number" : inputs.uitpasNumber.value,
			"aptitudeTest": inputs.workshopException.checked,
			"courseEnrolment": !inputs.workshopException.checked,
			"courseDate" : courseDate ? courseDate.toLocaleDateString("nl-BE") : null,
			"courseNotification" : courseNotification
		},
		"referer": {
			"organisation" : false,
			"orgName" : "",
			"other" : true,
			"otherName" : inputs.referrer.value
		},
		"structuredReference": inputs.structuredCommunication.value,
		"item" : {
			"deviceType": inputs.deviceType.value,
			"deviceBrand": inputs.deviceBrand.value,
			"deviceModel": inputs.deviceModel.value,
			"assetTag" : inputs.assetTag.value,
			"accessories" : {
				"charger" : inputs.includesCharger.checked,
				"mouse": inputs.includesMouse.checked,
				"eIdReader": inputs.includesSmartCardReader.checked
			}
		},
		"contractDate" : inputs.signatureDate.valueAsDate.toLocaleDateString("nl-BE"),
		"startDate" : inputs.deviceOutDate.valueAsDate.toLocaleDateString("nl-BE"),
		"maintenanceDate" : inputs.deviceCheckupDate.valueAsDate.toLocaleDateString("nl-BE"),
		"endDate" : inputs.deviceInDate.valueAsDate.toLocaleDateString("nl-BE")
	};
	try {
		console.log('Generating PDF with data:', data);
		const fileUrl = await window.carbone.generatePdf(data);
		if (!fileUrl) {
			throw new Error('File path is undefined');
		}
		console.log('url: ' + fileUrl);
		window.open(fileUrl, '_blank', 'top=0,left=0,frame=true,toolbar=true,menubar=true,scrollbars=true,resizable=true');
	} catch (error) {
		console.error('Error generating PDF:', error);
	}
}

function renderPDF(url, canvasContainer, options) {
  var options = options || { scale: 1 };
	  
  function renderPage(page) {
	  var viewport = page.getViewport(options.scale);
	  var canvas = document.createElement('canvas');
	  var ctx = canvas.getContext('2d');
	  var renderContext = {
		canvasContext: ctx,
		viewport: viewport
	  };
	  
	  canvas.height = viewport.height;
	  canvas.width = viewport.width;
	  canvasContainer.appendChild(canvas);
	  
	  page.render(renderContext);
  }
  
  function renderPages(pdfDoc) {
	  for(var num = 1; num <= pdfDoc.numPages; num++)
		  pdfDoc.getPage(num).then(renderPage);
  }
  PDFJS.disableWorker = true;
  PDFJS.getDocument(url).then(renderPages);
}

// generateButton.addEventListener('click', async () => {
//	renderPDF('//cdn.mozilla.net/pdfjs/helloworld.pdf', document.getElementById('holder'));
  //renderPDF('file://C:\\Users\\Bernard\\Downloads\\helloworld.pdf', document.getElementById('holder'));
// })