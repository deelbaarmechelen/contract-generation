/**
 * Loads the organisation details (name, address, bank account) that appear on
 * the contracts from organisatie.json, so they can be changed without editing
 * the contract templates.
 *
 * Values are placed in the document with data-org attributes:
 *
 *   <p data-org="email"></p>          -> the email address
 *   <div data-org="adresregels"></div> -> one <p> per address line
 */

/** Fields the contracts rely on. Missing ones are reported together rather than
 * failing on whichever happens to be read first. */
const REQUIRED_FIELDS = [
	"dienstNaam",
	"organisatieNaam",
	"adresregels",
	"email",
	"rekeningnummer",
	"ondertekenaar",
];

/** Reads and validates organisatie.json. Throws a message meant to be readable
 * by whoever edited the file, not only by a developer. */
export async function loadOrganisatie(source = "organisatie.json") {
	let response;
	try {
		response = await fetch(source);
	} catch (error) {
		console.error(`Could not fetch "${source}":`, error);
		throw new Error(`Kon het bestand "${source}" niet openen.`, { cause: error });
	}

	if (!response.ok) {
		throw new Error(`Kon het bestand "${source}" niet openen (${response.status}).`);
	}

	let organisatie;
	try {
		organisatie = JSON.parse(await response.text());
	} catch (error) {
		console.error(`Could not parse "${source}":`, error);
		throw new Error(
			`Er staat een fout in "${source}". Controleer of elke regel tussen ` +
			`aanhalingstekens staat en of er geen komma te veel of te weinig is.`,
			{ cause: error }
		);
	}

	const missing = REQUIRED_FIELDS.filter((field) => {
		const value = organisatie[field];
		return value === undefined || value === null || value === "";
	});

	if (missing.length > 0) {
		throw new Error(`In "${source}" ontbreken de volgende gegevens: ${missing.join(", ")}.`);
	}

	if (!Array.isArray(organisatie.adresregels)) {
		throw new Error(`In "${source}" moet "adresregels" een lijst van regels zijn.`);
	}

	return organisatie;
}

/** Fills every element carrying a data-org attribute. */
export function fillOrganisatie(organisatie) {
	for (const el of document.querySelectorAll("[data-org]")) {
		const key = el.getAttribute("data-org");
		const value = organisatie[key];

		if (value === undefined) {
			console.warn(`No organisation field named "${key}"`);
			continue;
		}

		if (Array.isArray(value)) {
			// Address lines become separate paragraphs so they stack vertically.
			el.replaceChildren(...value.map((line) => {
				const p = document.createElement("p");
				p.textContent = line;
				return p;
			}));
		} else {
			el.textContent = value;
		}
	}
}

/** Loads the organisation details and applies them to the document. */
export async function applyOrganisatie(source) {
	const organisatie = await loadOrganisatie(source);
	fillOrganisatie(organisatie);
	return organisatie;
}
