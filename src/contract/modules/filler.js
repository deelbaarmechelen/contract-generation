import { deviceTypes } from "../../modules/constants.js";

class FormatterRegister {
  #formatters;

  constructor(formats = {}) {
    this.#formatters = formats;
  }

  async format(formatterKey, ...toFormat) {
    return await Promise.resolve(this.#formatters[formatterKey](...toFormat));
  }

  register(formatterKey, formatter) {
    this.#formatters[formatterKey] = formatter;
  }

  deregister(formatterKey) {
    delete this.#formatters[formatterKey];
  }
}

const formatterRegister = new FormatterRegister();


const datetimeOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };

formatterRegister.register("datetime", ([toFormat]) => {
  const date = new Date(toFormat);
  if (isNaN(date.valueOf())) {
    return '';
  }
  return date.toLocaleDateString("nl-BE", datetimeOptions);
});


const dateOptions = {};

formatterRegister.register("date", ([toFormat]) => {
  const date = new Date(toFormat);
  if (isNaN(date.valueOf())) {
    return '';
  }
  return date.toLocaleDateString("nl-BE", dateOptions);
});

formatterRegister.register("checkbox", ([toFormat]) => {
  if (toFormat) {
    return '☑';
  } else {
    return '☐';
  }
});

formatterRegister.register("address", ([streetName, houseNumber, boxNumber, postalCode, municipality, country]) => {
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
});


formatterRegister.register("telephone", async ([toFormat]) => {
  return await window.libphonenumber.formatPhoneNumber(String(toFormat));
});


const euroFormat = Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" });

/** Make euro amount numeric. */
function euroStrToNum(euroStr) {
	const cleanEuroStr = euroStr
		.replace(/[^\d,.]/g, "")
		.replace(",", ".");
	return Number(cleanEuroStr);
}

formatterRegister.register("euro", ([euroAmount]) => {
  if (euroAmount == null || euroAmount == "") {
    return "";
  }
  const regularized = euroStrToNum(String(euroAmount));
  return euroFormat.format(regularized);
});


formatterRegister.register("fulldevicename", ([deviceKey]) => {
  if ( !(deviceKey in deviceTypes) ) {
    return '';
  }
  return deviceTypes[deviceKey].fullName;
});


formatterRegister.register("mask", async (conditions, toMask) => {
  return toMask.filter((x, i) => (conditions[i] ? x : false));
});


formatterRegister.register("joincomma", async (toJoin) => {
  console.log(toJoin);
  return toJoin.join(', ');
});


formatterRegister.register("capitalize", async ([toFormat]) => {
  console.log(toFormat);
  return toFormat.charAt(0).toUpperCase() + toFormat.slice(1);
});


async function parseFillAttr(data, fillAttr) {
  console.log("Parsing data-fill attibute with value", fillAttr)

  const splitAttr = fillAttr.trim().split("|");
  const splitKeys = splitAttr[0].split(",").map(x => x.trim());

  let values = splitKeys.map((x) => data[x]);

  for (const formatterKeyRaw of splitAttr.slice(1)) {
    let parameters = []; 
    let formatterKey;

    if ( (formatterKeyRaw.includes('(')) && (formatterKeyRaw.includes(')')) ) {
      parameters = formatterKeyRaw
                    .slice(formatterKeyRaw.indexOf('(') + 1, formatterKeyRaw.indexOf(')'))
                    .split(',')
                    .map(x => x.trim());
      formatterKey = formatterKeyRaw.slice(0, formatterKeyRaw.indexOf('('));
    } else {
      formatterKey = formatterKeyRaw;
    }

    console.log("Formatting", values, "with formatter", formatterKey, "and parameters", parameters)

    const result = await formatterRegister.format(formatterKey, values, parameters);

    values = (typeof result === 'string' || result instanceof String) ? [result] : result;
  }

  return values.join(' ');
}

export async function fillFields(data) {
  const elementsWithFill = document.querySelectorAll("[data-fill]");

  for (const el of elementsWithFill) {
    el.innerText = await parseFillAttr(data, el.getAttribute("data-fill"));
  }
}