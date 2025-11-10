const euroFormat = Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" })

/** Make euro amount numeric. */
export function euroStrToNum(euroStr) {
	const cleanEuroStr = euroStr
		.replace(/[^\d,.]/g, "")
		.replace(",", ".");
	return Number(cleanEuroStr);
}


/** Prettify euro amount. */
export function formatEuro(euroAmount) {
	if (euroAmount == null || euroAmount == "") {
		return ""
	}
	const regularized = euroStrToNum(String(euroAmount));
	return euroFormat.format(regularized);
}


/** Generates an address as a string. */
export function formatAddress(streetName, houseNumber, boxNumber, postalCode,
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

/** Formats a phone number. */
export async function formatPhoneNumber(phoneNumber) {
	return await window.libphonenumber.formatPhoneNumber(String(phoneNumber));
}

/** Formats a phone number. */
export async function extractIbanNumber(ibanNumber) {
	return await window.ibantools.extractIbanNumber(String(ibanNumber));
}

/** Checks if a date is passed, if so, formats it according to Flemish conventions, else, returns empty string.
 *  Short numeric date. */
export function formatDate(date) {
	return date ? date.toLocaleDateString("nl-BE") : "";
}

/** Checks if a date is passed, if so, formats it according to Flemish conventions, else, returns empty string.
 * 	Includes weekday and full name of month. */
export function formatDateLong(date) {
	return date ? date.toLocaleDateString("nl-BE", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
}

/** Calculates a person's age according to their birth date. 
 * Shamelessly stolen from codeandcloud on StackExchange.
 * https://stackoverflow.com/a/7091965/15709119
 * CC BY-SA 3.0 applicable */
export function getAge(birthDate) {
	var today = new Date();
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}


export function isSameDay(a, b) {
	return a.getFullYear() == b.getFullYear()
		&& a.getMonth() == b.getMonth()
		&& a.getDate() == b.getDate();
}


export function dateTimeLocalStr(inDate) {
	var date = new Date(inDate);
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0,16);
}