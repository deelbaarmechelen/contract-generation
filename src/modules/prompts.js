import { progressBox, warningBox, warningBoxTable, main, buttons, inputs, progressBoxText, digibankForm } from "./formelements.js";
import { showSwitch } from "./display.js";
import { allFieldsHadInput } from "./validation.js";
import { generateContract } from "./generate.js";

/** Generates an array with the labels and validation messages of invalid inputs. */
function genWarningBoxTableContent(inputs) {
	let output = [];
	for (let [, value] of Object.entries(inputs)) {
		if (value.validity.valid || (value.closest('[disabled]') != null)) {
			continue
		}

		const labelElement = document.querySelector("label[for=" + value.id + "]");
		output.push({ label: labelElement.innerHTML, validationMessage: value.validationMessage });
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
	showSwitch(true, warningBox);
	main.inert = true;
	fillWarningBoxTable(genWarningBoxTableContent(inputs));

	// Preferably, we want the user to go back and fix invalid inputs.
	buttons.warningGoBack.focus({ focusVisible: true });
}

/** Closes the invalid inputs warning prompt. */
function hideWarning() {
	showSwitch(false, warningBox);
	main.inert = false;

	allFieldsHadInput();
}

/** Opens the contract generation progress prompt with given text and activated/deactivated close button. */
export function showProgressBox(promptText = "", isCloseable = false) {
	progressBoxText.innerText = promptText;
	buttons.progressGoBack.disabled = !isCloseable;
	buttons.progressGoBack.focus({ focusVisible: true });

	showSwitch(true, progressBox);
	main.inert = true;
}

/** Closes the contract generation progress prompt. */
export function hideProgressBox() {
	showSwitch(false, progressBox);
	main.inert = false;
}


/** Initializes click events for the buttons in the prompts. */
export function initPromptButtons() {
	buttons.warningGenerateAnyway.addEventListener('click', async () => {
		hideWarning();
		generateContract();
	})
	
	buttons.warningGoBack.addEventListener('click', async () => {
		hideWarning();
		digibankForm.reportValidity(); // Focuses first invalid input in form.
	})
	
	buttons.progressGoBack.addEventListener('click', async () => {
		hideProgressBox();
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

}