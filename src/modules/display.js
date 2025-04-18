import { inputs, buttons, resetInstruction, fieldsets, instructionTextElements, payingElements, nonPayingElements, addendumElements, fsExtension, fsReplacementNew, fsReplacementOld, fsReplacementReason } from "./formelements.js";
import { validateAll } from "./validation.js";

// Shamelessly stolen from trincot on StackExchange. CC BY-SA is applicable. 
// https://stackoverflow.com/questions/12578507/implement-an-input-with-a-mask
// Keeps the structuredCommunication +'s and /'s in place by means of magic.
// It's very elegant and nice and good and I love trincot for inventing it.
document.addEventListener('DOMContentLoaded', () => {
	for (const el of document.querySelectorAll("[placeholder][data-slots]")) {
		const pattern = el.getAttribute("placeholder"),
			slots = new Set(el.dataset.slots || "_"),
			prev = (j => Array.from(pattern, (c, i) => slots.has(c) ? j = i + 1 : j))(0),
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
					return i < 0 ? prev.at(-1) : back ? prev[i - 1] || first : i;
				});
				el.value = clean(el.value).join("");
				el.setSelectionRange(i, j);
				back = false;
			};
		let back = false;
		el.addEventListener("keydown", (e) => back = e.key === "Backspace");
		el.addEventListener("input", format);
		el.addEventListener("focus", format);
		el.addEventListener("blur", () => el.value === pattern && (el.value = ""));
	}
});


/** Checks condition and disables elements only if false. 
 * If element has no valid disabled attribute, then it will disable/enable all children that do. */
function enableSwitch(condition, ...elements) {
	const shouldDisable = !condition;
	const disableQuery = "button, fieldset, optgroup, option, select, textarea, input";

	for (const el of elements) {
		if (el.matches(disableQuery)) {
			el.disabled = shouldDisable;
		} else {
			for (const child of el.querySelectorAll(disableQuery)) {
				child.disabled = shouldDisable;
			}
		}
	};
}


/** Checks condition and shows elements only if true. */
export function showSwitch(condition, ...elements) {
	elements.map((el) => el.classList.toggle("hidden", !condition));
	enableSwitch(condition, ...elements);
}


/** Switches visible fields depending on contract type. 
 * Form elements by default show for all contract types,
 * except if they have the class corresponding to a contract type,
 * then they will only show for contract types corresponding to the 
 * classes they have.
*/
function changeContractType() {
	const payingChecked = inputs.payingContract.checked;
	const nonPayingChecked = inputs.nonPayingContract.checked;
	const addendumChecked = inputs.addendum.checked;
	const anyChecked = payingChecked || nonPayingChecked || addendumChecked;

	showSwitch(anyChecked, buttons.submit, resetInstruction, ...fieldsets, ...instructionTextElements);
	showSwitch(false, ...payingElements, ...nonPayingElements, ...addendumElements);

	if (payingChecked) {
		showSwitch(true, ...payingElements);
	} else if (nonPayingChecked) {
		showSwitch(true, ...nonPayingElements);
	} else if (addendumChecked) {
		showSwitch(true, ...addendumElements);
	}

	inputs.contractNumber.required = addendumChecked;
	inputs.clientNumber.required = addendumChecked;

	toggleReplacement();
	toggleExtension();

	validateAll();
}

inputs.payingContract.addEventListener("input", changeContractType);
inputs.nonPayingContract.addEventListener("input", changeContractType);
inputs.addendum.addEventListener("input", changeContractType);


/** Disable uitpasNumber field when the user is excepted from it. */
function toggleEnabledUitpasNumber() {
	inputs.uitpasNumber.disabled = inputs.uitpasException.checked;
}

inputs.uitpasException.addEventListener("input", toggleEnabledUitpasNumber);


/** Do not require workshop if excepted because of skill test or extension. */
function toggleEnabledWorkshopFields() {
	inputs.workshopException.disabled = inputs.isExtension.checked;
	inputs.workshopDate.disabled = inputs.workshopException.checked;
	inputs.workshopDate.required = !(inputs.workshopException.checked || inputs.isExtension.checked);
}

inputs.isExtension.addEventListener("input", toggleEnabledWorkshopFields);
inputs.workshopException.addEventListener("input", toggleEnabledWorkshopFields);


function toggleExtension() {
	showSwitch(inputs.extension.checked, fsExtension);
}

inputs.extension.addEventListener("input", toggleExtension);


function toggleReplacement() {
	showSwitch(inputs.replacement.checked, fsReplacementOld, fsReplacementNew, fsReplacementReason);
}

inputs.replacement.addEventListener("input", toggleReplacement);

/** Enters validation message into error div. */
export function fillErrorDiv(el) {
	const errorDiv = document.querySelector(".error[data-for=" + el.id + "]");
	if (errorDiv) {
		errorDiv.innerText = el.validationMessage;
	}
}

// Adds .changed class to input elements after they've been changed.
// The .changed class makes it so invalid inputs are marked in red.
// You don't want users to be scolded for invalid inputs they didn't even touch.
for (const [, el] of Object.entries(inputs)) {
	el.addEventListener("input", () => {
		el.classList.add("changed");
		fillErrorDiv(el);
	});
}