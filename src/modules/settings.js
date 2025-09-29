import { Prompt } from "./prompts.js";

let apiKeyPrompt = new Prompt({
    content: (() => {
		let p1 = document.createElement("p");
		p1.innerText = "U heeft het API-key beheer venster geopend.";
		let p2 = document.createElement("p");
		p2.innerText = "Gelieve de API key voor Snipe-IT in te geven:";
		let apiKeyInput = document.createElement("input");
        apiKeyInput.id = "api-key-input";
        return [p1, p2, apiKeyInput]
    })(),
    buttons: [
        {
            text: "Annuleren",
            onClick: () => {
                Prompt.close();
            },
        },
        {
            text: "Accepteren",
            onClick: () => {
                Prompt.close();
                let key = document.getElementById("api-key-input").value;
                document.getElementById("api-key-input").value = "";
                if ( key ) {
                    window.inventoryAPI.setSnipeApiKey(key);
                }
            },
        }
    ]
})

function document_keyUp(e) {
    if (e.ctrlKey && e.code === 'Comma') {
        apiKeyPrompt.show();
    }
}

export function initSettings() {
    document.addEventListener('keyup', document_keyUp, false);
}