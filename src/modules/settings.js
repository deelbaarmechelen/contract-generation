import { Prompt } from "./prompts.js";

let apiKeyPrompt = new Prompt({
    content: (() => {
		let p1 = document.createElement("p");
		p1.innerText = "U heeft het API-sleutel beheer venster geopend.";
		let p2 = document.createElement("p");
		p2.innerText = "Geef hier de refresh token van Lend Engine in. Deze blijft ongeveer een maand geldig; de app vernieuwt zelf de tijdelijke sleutels.";
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
    // `e.key` is het getypte teken, `e.code` de fysieke toets. Op AZERTY zit op
    // de fysieke Comma-positie een puntkomma, waardoor de sneltoets daar op
    // Ctrl + ; uitkwam. Met `e.key` werkt Ctrl + , op elke toetsenbordindeling.
    if (e.ctrlKey && e.key === ',') {
        apiKeyPrompt.show();
    }
}

export function initSettings() {
    document.addEventListener('keyup', document_keyUp, false);
}