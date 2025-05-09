//// Element constants

const main = document.getElementsByTagName("main")[0];
const digibankForm = document.getElementById("digibank-form");
const fieldsets = main.getElementsByTagName("fieldset");
const nonPayingOnlyElements = document.getElementsByClassName("non-paying-only");
const payingOnlyElements = document.getElementsByClassName("paying-only");
const instructionTextElements = main.getElementsByClassName("instruction-text");  // Really just the text that the _Digibankmedewerker_ will take it from here.
const warningBox = document.getElementById("warning-box");
const warningBoxTable = document.getElementById("warning-box-table");

const inputs = {  // Not necessarily all <input> tags.
	payingContract: document.getElementById('paying-contract'),
	nonPayingContract: document.getElementById('non-paying-contract'),

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
	structuredCommunication: document.getElementById('structured-communication')
}

const buttons = {
	submit: document.getElementById("submit"),

	warningGenerateAnyway: document.getElementById("warning-generate-anyway"),
	warningGoBack: document.getElementById("warning-go-back"),

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
}


//// Data constants

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

/** Helper function for manual testing. */ 
function testFill() {
	// I know just putting this in renderer.js is testing like a cave person.
	// I'm not figuring out node.js unit testing right now. 
	// Ooga booga me use developer console.

	// Works for both contract types.
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
	
	inputs.referrer.value = "Sinterklaas";
	
	inputs.contractNumber.value = "C-B-25-100000";
	inputs.clientNumber.value = "1000001";

	inputs.assetTag.value = "PC250200";
	inputs.deviceBrand.value = "LapInc.";
	inputs.deviceModel.value = "Thinkbook PP890";
	inputs.deviceType.value = "laptop-win-10";  // Miracle that this works like that.
	inputs.includesCharger.checked = true;

	buttons.autoSignatureDate.click();
	buttons.autoStartDate.click();
	buttons.autoEndDate.click();

	if (inputs.nonPayingContract.checked) {
		inputs.uitpasNumber.value = "1111111111111";
		inputs.workshopDate.valueAsDate = new Date();
	} else {
		buttons.autoStructuredCommunication.click();
		buttons.autoMonthlyPayment.click();
		buttons.autoYearlyPayment.click();
		buttons.autoCircleValue.click();
		inputs.advancePayment.value = "€ 50";
	}

	allFieldsHadInput();
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


/** Generates an address as a string. */
function addressStr(streetName, houseNumber, boxNumber, postalCode, 
					municipality, country) {
	let streetLine = '';
	streetLine += streetName;
	streetLine += (streetLine.length == 0 || houseNumber.length == 0) ? '' : ' ';
	streetLine += houseNumber;
	streetLine += (streetLine.length == 0 || boxNumber.length == 0) ? '' : ' ';
	streetLine += (boxNumber.length == 0) ? '' : 'bus '
	streetLine += boxNumber;
	
	let municipalityLine = '';
	municipalityLine += postalCode;
	municipalityLine += (municipalityLine.length == 0 || municipality.length == 0) ? '' : ' ';
	municipalityLine += municipality;

	let address = '';
	address += streetLine;
	address += (address.length == 0 || municipalityLine.length == 0) ? '' : ', ';
	address += municipalityLine;
	address += (address.length == 0 || country.length == 0) ? '' : ', ';
	address += country;
	
	return address;
}


/** Calculates a person's age according to their birth date. 
 * Shamelessly stolen from codeandcloud on StackExchange.
 * https://stackoverflow.com/a/7091965/15709119
 * CC BY-SA 3.0 applicable */
function getAge(birthDate) {
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


function isSameDay(a, b) {
	return a.getFullYear() == b.getFullYear()
		&& a.getMonth() == b.getMonth()
		&& a.getDate() == b.getDate();
}


//// Form display

// Shamelessly stolen from trincot on StackExchange. CC BY-SA is applicable. 
// https://stackoverflow.com/questions/12578507/implement-an-input-with-a-mask
// Keeps the structuredCommunication +'s and /'s in place by means of magic.
// It's very elegant and nice and good and I love trincot for inventing it.
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


/** Switched visible fields depending on contract type. */
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


/** Disable uitpasNumber field when the user is excepted from it. */
function toggleEnabledUitpasNumber(e) {
	inputs.uitpasNumber.disabled = inputs.uitpasException.checked;
}

inputs.uitpasException.addEventListener("input", toggleEnabledUitpasNumber);


/** Do not require workshop if excepted because of skill test or extension. */
function toggleEnabledWorkshopFields(e) {
	inputs.workshopException.disabled = inputs.isExtension.checked;
	inputs.workshopDate.disabled = inputs.workshopException.checked;
	inputs.workshopDate.required = !(inputs.workshopException.checked || inputs.isExtension.checked);
}

inputs.isExtension.addEventListener("input", toggleEnabledWorkshopFields);
inputs.workshopException.addEventListener("input", toggleEnabledWorkshopFields);

// Adds .changed class to input elements after they've been changed.
// The .changed class makes it so invalid inputs are marked in red.
// You don't want users to be scolded for invalid inputs they didn't even touch.
for (const [key, el] of Object.entries(inputs)) {
	el.addEventListener("input", (e) => el.classList.add("changed"))
}

/** Trigger/untrigger all validation and make it visible. */
function allFieldsHadInput() {
	for (const [key, el] of Object.entries(inputs)) {
		el.dispatchEvent(new Event("input"), { bubbles: true });
	}
}


//// Input validation

/** Validates that customer is at least 18 years of age. */
function validateBirthDate(e) {
	if (getAge(inputs.birthDate.valueAsDate) < 18) {
		inputs.birthDate.setCustomValidity("Je moet minstens 18 jaar zijn om een apparaat te lenen.");
	} else {
		inputs.birthDate.setCustomValidity("");
	}
}

inputs.birthDate.addEventListener("input", validateBirthDate)


/** Only Mechelaars can get a non-paying contract, unless they have an exception. */
function validatePostalCode(e) {
	if (inputs.nonPayingContract.checked 
		&& !inputs.uitpasException.checked 
		&& !postalCodesMechelen.includes(Number(inputs.postalCode.value))) {
		inputs.postalCode.setCustomValidity("Dit is geen postcode uit de gemeente Mechelen.");
	} else {
		inputs.postalCode.setCustomValidity("");
	}
}

// Important principle: If validation depends on a previous field, you need
// to redo validation once that field changes as well!
inputs.postalCode.addEventListener("input", validatePostalCode)
inputs.uitpasException.addEventListener("input", validatePostalCode)


inputs.phoneNumber.addEventListener("input", async (e) => {
	formattedNumber = await window.libphonenumber.formatPhoneNumber(String(inputs.phoneNumber.value));

	if (formattedNumber) {
		inputs.phoneNumber.setCustomValidity("");
	} else {
		inputs.phoneNumber.setCustomValidity("Geen geldig telefoonnummber.");
	}	
});

inputs.signatureDate.addEventListener("input", (e) => {
	if (isSameDay(inputs.signatureDate.valueAsDate, new Date())) {
		inputs.signatureDate.setCustomValidity("");
	} else {
		inputs.signatureDate.setCustomValidity("Handtekeningdatum hoort vandaag te zijn.");
	}
})

inputs.endDate.addEventListener("input", (e) => {
	if (inputs.startDate.valueAsDate < inputs.endDate.valueAsDate) {
		inputs.endDate.setCustomValidity("");
	} else {
		inputs.endDate.setCustomValidity("Startdatum hoort voor einddatum te komen.");
	}
})

inputs.assetTag.addEventListener("input", (e) => {
	if (inputs.assetTag.validity.patternMismatch) {
		inputs.assetTag.setCustomValidity("Een assettag hoort zes cijfers te hebben met eventueel een combinatie hoofdletters ervoor. (bv. 'PC250200')");
	} else {
		inputs.assetTag.setCustomValidity("");
	}	
});


/** Warns user if the monthly payment is different from expected for device type. */
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


/** Warns user if the yearly payment is different from expected for device type. */
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


/** Warns user if the circle value is different from expected for device type. */
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


// Makes sure structured communication is valid.
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

////// Autofill


function fieldsValid(...prerequisiteFields) {
	let fieldsValid = true;
	for (const field of prerequisiteFields) {
		if (!field.validity.valid) {
			if (fieldsValid) {
				fieldsValid = false;
				field.reportValidity();
			}

			field.dispatchEvent(new Event("input"), { bubbles: true });
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
	const checksum = ("00" + (parseInt(unfinishedMessage) % 97).toString()).slice(-2);

	return unfinishedMessage + checksum;
}


//// Autofill click events

buttons.autoSignatureDate.addEventListener("click", (e) => {
	inputs.signatureDate.valueAsDate = new Date();

	// Emulate a user changing the field, which is important for correct display
	// of invalid inputs.
	inputs.signatureDate.dispatchEvent(new Event("input"), { bubbles: true });
});


buttons.autoStartDate.addEventListener("click", (e) => {
	if (!fieldsValid(inputs.signatureDate)) {
		return
	}

	inputs.startDate.valueAsDate = inputs.signatureDate.valueAsDate;

	inputs.startDate.dispatchEvent(new Event("input"), { bubbles: true });
});


buttons.autoEndDate.addEventListener("click", (e) => {
	if (!fieldsValid(inputs.startDate)) {
		return
	}

	const date = inputs.startDate.valueAsDate;
	inputs.endDate.valueAsDate = new Date(date.getUTCFullYear() + 1, 
										  date.getMonth(), 
										  date.getDate());

	inputs.endDate.dispatchEvent(new Event("input"), { bubbles: true });
});


buttons.autoStructuredCommunication.addEventListener("click", (e) => {
	if (!fieldsValid(inputs.signatureDate, inputs.assetTag)) {
		return
	}

	inputs.structuredCommunication.value = calcStructuredCommunication();

	inputs.structuredCommunication.dispatchEvent(new Event("input"), { bubbles: true });
});


async function autoDeviceBrandAndModel(e) {
	if (!fieldsValid(inputs.assetTag)) {
		return
	}

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
	if (!fieldsValid(inputs.deviceType)) {
		return
	}

	inputs.monthlyPayment.value = euroPrettify(deviceTypes[inputs.deviceType.value].monthlyPayment);

	inputs.monthlyPayment.dispatchEvent(new Event("input"), { bubbles: true });
});


buttons.autoYearlyPayment.addEventListener("click", (e) => {
	if (!fieldsValid(inputs.deviceType)) {
		return
	}

	inputs.yearlyPayment.value = euroPrettify(deviceTypes[inputs.deviceType.value].yearlyPayment);

	inputs.yearlyPayment.dispatchEvent(new Event("input"), { bubbles: true });
});


buttons.autoCircleValue.addEventListener("click", (e) => {
	if (!fieldsValid(inputs.deviceType)) {
		return
	}

	inputs.circleValue.value = euroPrettify(deviceTypes[inputs.deviceType.value].circleValue);

	inputs.circleValue.dispatchEvent(new Event("input"), { bubbles: true });
});


////// Invalid fields prompt after submit

/** Generates an array with the labels and validation messages of invalid inputs. */
function genWarningBoxTableContent(inputs) {
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

/** Takes an array as outputted by genWarningBoxTableContent and puts contents in warningBoxTable. */
function fillWarningBoxTable(validationReport) {
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

/** Opens the invalid inputs warning prompt. */
function showWarning() {
	warningBox.classList.remove("hidden");
	main.inert = true; 
	fillWarningBoxTable(genWarningBoxTableContent(inputs)); 

	// Preferably, we want the user to go back and fix invalid inputs.
	buttons.warningGoBack.focus({focusVisible: true});
}

/** Closes the invalid inputs warning prompt. */
function hideWarning() {
	warningBox.classList.add("hidden");
	main.inert = false;

	digibankForm.reportValidity(); // Focuses first invalid input in form.

	allFieldsHadInput();
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

////// Contract generation (Kind of a mess.) 

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
			"birthDate" : inputs.birthDate.valueAsDate ? inputs.birthDate.valueAsDate.toLocaleDateString("nl-BE") : "",
			"address": addressStr(inputs.streetName.value, inputs.houseNumber.value, 
								  inputs.boxNumber.value, inputs.postalCode.value, 
							 	  inputs.municipality.value, inputs.country.value),
			"phone": await window.libphonenumber.formatPhoneNumber(String(inputs.phoneNumber.value)),
			"email": inputs.email.value,
		},
    "contract-type": inputs.payingContract.checked ? "paying" : "non-paying",
		"subscription" : {
			"structuredReference" : inputs.structuredCommunication.value,
			"monthlyPayment" : inputs.monthlyPayment.value ? euroPrettify(inputs.monthlyPayment.value) : "",
			"yearlyPayment" : inputs.yearlyPayment.value ? euroPrettify(inputs.yearlyPayment.value) : "",
			"amountPaid" : inputs.advancePayment.value ? euroPrettify(inputs.advancePayment.value) : "",
			"circleValue" : inputs.circleValue.value ? euroPrettify(inputs.circleValue.value) : ""
		},
		"uitpas" : {
			"applicable" : !inputs.uitpasException.checked,
			"number" : inputs.uitpasNumber.value,
			"aptitudeTest": inputs.workshopException.checked,
			"courseEnrolment": !inputs.workshopException.checked,
			"courseDate" : courseDate ? courseDate.toLocaleDateString("nl-BE") : "",
			"courseNotification" : courseNotification
		},
		"referer": inputs.referrer.value,
		"structuredReference": inputs.structuredCommunication.value,
		"item" : {
			"deviceType": inputs.deviceType.value ? deviceTypes[inputs.deviceType.value].fullName : "",
			"deviceBrand": inputs.deviceBrand.value,
			"deviceModel": inputs.deviceModel.value,
			"assetTag" : inputs.assetTag.value,
			"accessories" : {
				"charger" : inputs.includesCharger.checked,
				"mouse": inputs.includesMouse.checked,
				"eIdReader": inputs.includesSmartCardReader.checked
			}
		},
		"contractDate" : inputs.signatureDate.valueAsDate ? inputs.signatureDate.valueAsDate.toLocaleDateString("nl-BE") : "",
		"startDate" : inputs.startDate.valueAsDate ? inputs.startDate.valueAsDate.toLocaleDateString("nl-BE") : "",
		"endDate" : inputs.endDate.valueAsDate ? inputs.endDate.valueAsDate.toLocaleDateString("nl-BE") : ""
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