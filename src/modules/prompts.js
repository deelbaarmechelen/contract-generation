import { main, form, prompt, promptContent, promptButtons, buttons } from "./formelements.js";
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
	const tableBody = document.querySelector("#prompt tbody");
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


/**
 * @typedef {Object} PromptConfig
 * @property {Node[] | Node | String} content - 
 * @property {PromptButtonConfig[]} [buttons=[]] - 
 * @property {Function} [onShow] - Function called immediately after the prompt has been filled and before it is shown.
 *   If the Prompt.show(...args) method is used, the args arguments of this method are passed into this function.  
 * @property {Function} [onClose] - Function called immediately after the prompt has been hidden.
 *   If the Prompt.close(...args) or Prompt.requestClose(...args) method is used, the args arguments of this method are passed into this function.  
 * @property {Boolean} [canCancel=true] - Determines if it is possible to cancel through regular means, e.g. by pressing esc.
 */

/**
 * @typedef {Object} PromptButtonConfig
 * @property {String} name - Name attribute of button.
 * @property {String} text - Determines the text displayed on the button.
 * @property {Boolean} autofocus - Determines if the function is focused upon opening the prompt.
 * @property {Function} onClick - Function called when button is clicked.
 */

export class Prompt {
	#content;
	buttons;
	#onShow;
	#onClose;
	canCancel;

	static #currentPrompt; 
	static #nextPrompt; 

	/**
     * Create a prompt.
     * @param {PromptConfig} promptConfig - Configuration object for prompt.
     */
	constructor(promptConfig) {
		this.content = promptConfig.content;
		this.buttons = promptConfig.buttons ? promptConfig.buttons : [];
		this.onShow = promptConfig.onShow;
		this.onClose = promptConfig.onClose;
		this.canCancel = promptConfig.canCancel != undefined ? promptConfig.canCancel : true 
	}

	set onShow(x) {
		this.#onShow = x ? x.bind(this) : undefined;
	}

	get onShow() {
		return this.#onShow;
	}

	set onClose(x) {
		this.#onClose = x ? x.bind(this) : undefined;
	}

	get onClose() {
		return this.#onClose;
	}

	set content(x) {
		if ( Array.isArray(x) ) {
			this.#content = x;
			return
		} else if ( !(x instanceof Node) ) {
			let p = document.createElement("p");
			p.innerText = x;
			x = p;
		}
		this.#content = [x];
	}

	get content() {
		return this.#content;
	}

	#fillContent() {
		promptContent.replaceChildren();
		for (const child of this.content) {
			promptContent.appendChild(child);
		}
	}

	#addButton(buttonInfo) {
		let button = document.createElement("button");
		button.name = buttonInfo.name;
		button.innerText = buttonInfo.text;
		if (buttonInfo.autofocus) {
			button.classList.add('autofocus');
		}
		button.disabled = buttonInfo.disabled;
		button.addEventListener("click", buttonInfo.onClick);
		promptButtons.appendChild(button);
	}

	#fillButtons() {
		promptButtons.replaceChildren();
		for (const buttonInfo of this.buttons) {
			this.#addButton(buttonInfo)
		}
	}

	#fill() {
		this.#fillContent();
		this.#fillButtons();
	}

	show(...args) {
		if (Prompt.#currentPrompt) {
			Prompt.#nextPrompt = this; 
			Prompt.close();
			return
		}

		this.#fill();

		if ( this.onShow ) {
			this.onShow(...args);
		}

		prompt.classList.remove('hidden');
		main.inert = true;

		prompt.querySelector(".autofocus")?.focus();

		Prompt.#currentPrompt = this;
	}

	static close(...args) {
		if (!Prompt.#currentPrompt) {
			return
		}
		prompt.classList.add('hidden');
		main.inert = false;
	
		if ( Prompt.#currentPrompt.onClose ) {
			Prompt.#currentPrompt.onClose(...args);
		}

		Prompt.#currentPrompt = undefined;
		
		if (Prompt.#nextPrompt) {
			Prompt.#nextPrompt.show();
			Prompt.#nextPrompt = undefined;
		}
	}

	static requestClose(...args) {
		if (Prompt.#currentPrompt?.canCancel) {
			Prompt.close(...args);
		}
	}

	static createProgressPrompt(text, canCancel) {
		return new Prompt({
			content: text,
			canCancel: canCancel,
			buttons: [
				{
					text: "Ga terug",
					onClick() {
						Prompt.close();
					},
					disabled: !canCancel,
					autofocus: true
				}
			]
		})
	}

	close() {
		Prompt.close();
	}
}

export const validationBox = new Prompt({
	content: (() => {
		let p = document.createElement("p");
		p.innerText = "Er zijn mogelijk fout ingevulde velden:";

		let container = document.createElement("div");
		container.classList.add("warning-box-table-container");

		let table = document.createElement("table");
		table.id = "warning-box-table";
		container.appendChild(table);

		let thead = document.createElement("thead");
		table.appendChild(thead);

		let tr = document.createElement("tr");
		thead.appendChild(tr);

		for (const thText of ["Veldlabel", "Validatiebericht"]) {
			const th = document.createElement("th");
			th.innerText = thText;
			th.scope = "col";
			tr.appendChild(th);
		}

		let tbody = document.createElement("tbody");
		table.append(tbody)

		return [p, container];
	})(),
	buttons: [
		{
			text: "Genereer toch",
			onClick() {
				Prompt.close();
				allFieldsHadInput();
				generateContract();
			}
		},
		{
			text: "Ga terug",
			onClick() {
				Prompt.close();
				form.reportValidity();
			},
			autofocus: true
		}
	],
	onShow() {
		fillWarningBoxTable(genWarningBoxTableContent(form));
	},
	onClose() {
		allFieldsHadInput();
		form.reportValidity();
	}
})

export function initPrompt() {
	document.addEventListener('keyup', (event) => {
		if (event.code == 'Escape') {
			Prompt.requestClose();
		}
	});
	
	buttons.submit.addEventListener('click', async (e) => {
		if (form.checkValidity()) {
			e.preventDefault();
			generateContract();
		} else {
			e.preventDefault();
			validationBox.show();
		}
	})
}