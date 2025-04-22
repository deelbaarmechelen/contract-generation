import { progressBox, warningBox, warningBoxTable, main, buttons, progressBoxText, form, prompt, promptContent, promptButtons } from "./formelements.js";
import { showSwitch } from "./display.js";
import { allFieldsHadInput } from "./validation.js";
import { generateContract } from "./generate.js";

/** Generates an array with the labels and validation messages of invalid inputs. */
function genWarningBoxTableContent(form) {
	let output = [];
	for (let [, value] of Object.entries(form)) {
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
	fillWarningBoxTable(genWarningBoxTableContent(form));

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
		form.reportValidity(); // Focuses first invalid input in form.
	})
	
	buttons.progressGoBack.addEventListener('click', async () => {
		hideProgressBox();
	})
	
	buttons.submit.addEventListener('click', async (e) => {
		if (form.checkValidity()) {
			e.preventDefault();
			generateContract();
		} else {
			e.preventDefault();
			showWarning();
		}
	})

}

export class Prompt {
	#content;
	#buttons;
	#onShow;
	#onClose;

	static #currentPrompt; 

	constructor(promptObject) {
		this.content = promptObject.content;
		this.#buttons = promptObject.buttons;
		this.#onShow = promptObject.onShow ? promptObject.onShow.bind(this) : undefined;
		this.#onClose = promptObject.onClose ? promptObject.onClose.bind(this) : undefined;
	}

	set content(x) {
		if ( !(x instanceof HTMLElement) ) {
			let p = document.createElement("p");
			p.innerText = x;
			x = p;
		} 
		this.#content = x;
	}

	get content() {
		return this.#content;
	}

	#fillContent() {
		promptContent.innerHTML = "";
		promptContent.appendChild(this.#content);
	}

	#fillButtons() {
		promptButtons.innerHTML = "";
		for (const buttonInfo of this.#buttons) {
			let button = document.createElement("button");
			button.name = buttonInfo.name;
			button.innerText = buttonInfo.text;
			button.addEventListener("click", buttonInfo.onClick);
			promptButtons.appendChild(button);
		}
	}

	#fill() {
		this.#fillContent();
		this.#fillButtons();
	}

	show() {
		this.#fill();

		if ( this.#onShow ) {
			this.#onShow();
		}

		prompt.showModal();

		Prompt.#currentPrompt = this;
	}

	static close() {
		prompt.close();
	}

	static onClose() {
		if ( Prompt.#currentPrompt && Prompt.#currentPrompt.#onClose ) {
			Prompt.#currentPrompt.#onClose();
		}

		Prompt.#currentPrompt = undefined;

		promptContent.innerHTML = "";
		promptButtons.innerHTML = "";
	}

	close() {
		Prompt.close();
	}
}

(new Prompt({
	content: "abcdefghijklmnop abcdefghijklmnop abcdefghijklmnop",
	buttons: [
		{
			name: "test",
			text: "test",
			onClick: Prompt.close
		},
		{
			name: "test",
			text: "test",
			onClick: Prompt.close
		}
	],
	onShow: () => {
		console.log("Properly opened");
	},
	onClose: () => {
		console.log("Properly closed");
	}
})).show();

export function initPrompt() {
	prompt.addEventListener("close", Prompt.onClose);
}