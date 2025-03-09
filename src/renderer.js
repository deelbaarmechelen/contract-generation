//// Element constants

const nonPayingOnlyElements = document.getElementsByClassName("non-paying-only");
const payingOnlyElements = document.getElementsByClassName("paying-only");
const fieldsets = document.getElementsByTagName("main")[0].getElementsByTagName("fieldset");
const instructionTextElements = document.getElementsByTagName("main")[0].getElementsByClassName("instruction-text");
const digibankForm = document.getElementById("digibank-form")

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

	signatureDate: document.getElementById('signature-date'),
	startDate: document.getElementById('start-date'),
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
	structuredCommunication: document.getElementById('structured-communication'),
}

const buttons = {
	submit: document.getElementById("submit"),

	autoSignatureDate: document.getElementById("auto-signature-date"),
	autoStartDate: document.getElementById("auto-start-date"),

	autoContractNumber: document.getElementById("auto-contract-number"),
	autoDeviceBrand: document.getElementById("auto-device-brand"),
	autoDeviceModel: document.getElementById("auto-device-model"),
	autoDeviceType: document.getElementById("auto-device-tyoe"),

	autoDeviceOutDate: document.getElementById("auto-device-out-date"),
	autoDeviceCheckupDate: document.getElementById("auto-device-checkup-date"),
	autoDeviceInDate: document.getElementById("auto-device-in-date"),
	autoStructuredCommunication: document.getElementById("auto-structured-communication"),
}


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
	inputs.country.value = "Belgium";
	
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
		inputs.monthlyPayment.checked = true;
		buttons.autoStructuredCommunication.click();
	}
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

/** Verbergt of toont relevante velden na kiezen contracttype. */
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

function changeUitpasException(e) {
	inputs.uitpasNumber.disabled = (e.target.checked === true);
}

inputs.uitpasException.addEventListener("input", changeUitpasException);

// Workshop date field activation toggle

function changeWorkshopException(e) {
	inputs.workshopDate.disabled = (e.target.checked === true);
}

inputs.workshopException.addEventListener("input", changeWorkshopException);

//// Input validation

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
});

buttons.autoStartDate.addEventListener("click", (e) => {
	inputs.startDate.valueAsDate = calcStartDate();
});

buttons.autoDeviceOutDate.addEventListener("click", (e) => {
	inputs.deviceOutDate.valueAsDate = calcDeviceOutDate();
});

buttons.autoDeviceCheckupDate.addEventListener("click", (e) => {
	inputs.deviceCheckupDate.valueAsDate = calcDeviceCheckupDate();
});

buttons.autoDeviceInDate.addEventListener("click", (e) => {
	inputs.deviceInDate.valueAsDate = calcDeviceInDate();
});

buttons.autoStructuredCommunication.addEventListener("click", (e) => {
	inputs.structuredCommunication.value = calcStructuredCommunication();
	inputs.structuredCommunication.dispatchEvent(new Event("input"));
});

buttons.autoDeviceModel.addEventListener("click", async (e) => {
	const response = await fetch("https://inventaris.digibankmechelen.be/api/v1/hardware/bytag/{asset_tag}", {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': 'Raf ' + SNIPEKEY,
		}
	});
	console.log(response);
});

buttons.submit.addEventListener('click', async (e) => {
	if (digibankForm.checkValidity()) {
		e.preventDefault();
	} else {
		return;
	}
	

	const fullName = inputs.firstName.value + ' ' + inputs.lastName.value;
	const boxNumberText = inputs.boxNumber.value.length == 0 ? '' : ' bus ' + inputs.boxNumber.value;

	var data = {
		"generationInfo": {
			"path": await window.electronAPI.openFile(),
			"print": true
		},
		"contractId": inputs.contractNumber.value,
		"client": {
			"name" : inputs.firstName.value + ' ' + inputs.lastName.value,
			"address": inputs.streetName.value + '' + inputs.houseNumber.value + boxNumberText + ', ' + inputs.postalCode.value + ' ' + inputs.municipality.value + ', ' + inputs.country.value, 
			"phone": inputs.phoneNumber.value,
			"email": inputs.email.value,
		},
		"subscription" : {
			"paymentPeriod" : inputs.monthlyPayment.checked ? "monthly" : "yearly",
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
			"courseDate" : inputs.workshopDate.valueAsDate.toLocaleDateString("NL-be")
		},
		"referer": {
			"organisation" : false,
			"orgName" : "",
			"other" : true,
			"otherName" : inputs.referrer.value
		},
		"structuredReference": inputs.structuredCommunication.value,
		"item" : {
			"laptop": true,
			"laptop-brand": inputs.deviceBrand.value,
			"laptop-model": inputs.deviceModel.value,
			"assetTag" : inputs.assetTag.value,
			"accessories" : {
				"charger" : inputs.includesCharger.checked,
				"mouse": inputs.includesMouse.checked,
				"eIdReader": inputs.includesSmartCardReader.checked
			}
		},
		"contractDate" : inputs.signatureDate.valueAsDate.toLocaleDateString("NL-be"),
		"startDate" : inputs.deviceOutDate.valueAsDate.toLocaleDateString("NL-be"),
		"maintenanceDate" : inputs.deviceCheckupDate.valueAsDate.toLocaleDateString("NL-be"),
		"endDate" : inputs.deviceInDate.valueAsDate.toLocaleDateString("NL-be")
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
})

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
//  renderPDF('//cdn.mozilla.net/pdfjs/helloworld.pdf', document.getElementById('holder'));
  //renderPDF('file://C:\\Users\\Bernard\\Downloads\\helloworld.pdf', document.getElementById('holder'));
// })