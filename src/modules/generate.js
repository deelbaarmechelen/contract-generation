import { form } from "./formelements.js";
import { linkUrls } from "./constants.js";
import { Prompt } from "./prompts.js";

function showFinalPrompt() {
	(new Prompt({
		content: "Contract succesvol gegenereerd.",
		buttons: [
			{
				text: "\u{1F517}\uFE0E BEEGO",
				onClick() {
					window.openExternal.openExternal(linkUrls['beego']);
				}
			},
			{
				text: "\u{1F517}\uFE0E Digisnacks",
				onClick() {
					window.openExternal.openExternal(linkUrls['digisnacks']);
				}
			},
			{
				text: "Ga terug",
				onClick() {
					Prompt.close();
				},
				autofocus: true
			}
		]
	})).show();
}

/** Performs final steps of contract generation while showing feedback. */
export async function generateContract() {
	Prompt.createProgressPrompt("Gegevens uit contract aan het verzamelen.", false).show();

	let data = Object.fromEntries(new FormData(form));

	Prompt.createProgressPrompt("Contract aan het genereren.", false).show();

	try {
		console.log('Generating PDF with data:', data);
		await window.carbone.generatePdf(data);
		showFinalPrompt();
	} catch (error) {
		Prompt.createProgressPrompt("Er ging iets mis tijdens het genereren van de PDF. Probeer het opnieuw.", true).show();
		console.error('Error generating PDF:', error);
	}
}

