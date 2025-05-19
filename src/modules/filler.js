import { formatterRegister } from "./formatter.js";

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

  return values.join(' ').trim();
}

export async function fillFields(data) {
  const elementsWithFill = document.querySelectorAll("[data-fill]");

  for (const el of elementsWithFill) {
    el.innerText = await parseFillAttr(data, el.getAttribute("data-fill"));
  }
}