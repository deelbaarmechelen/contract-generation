/** Manages visibility of elements in printed contracts.
 * Implements a custom HTML attribute data-visible
 */

function defaultAtomParser(atom) {
  if (atom == "true") {
    return true;
  }
  return false;
}


class BoolAlg {
  #atomParser;
  static #validTokens = ["!", "(", ")", "|"];

  constructor(atomParser = defaultAtomParser) {
    this.atomParser = atomParser;
  }

  get atomParser() {
    return this.#atomParser;
  }

  set atomParser(x) {
    this.#atomParser = x
  }

  tokenize(exprString) {
    const trimmedExpr = exprString.trim();

    let tokens = [];
    let i = 0;

    while (i < trimmedExpr.length) {
      const char = trimmedExpr[i];

      if (BoolAlg.#validTokens.includes(char)) {
        tokens.push(char);
        i++;
      } else if (char == " ") {
        i++;
      } else {
        let atom = "";

        while (i < trimmedExpr.length && !([...BoolAlg.#validTokens, " "].includes(trimmedExpr[i]))) {
          atom += trimmedExpr[i];
          i++;
        }

        tokens.push(atom);
      }
    }

    return tokens;
  }

  parse(exprString) {
    const tokens = this.tokenize(exprString);
    const result = this.parseExpression(tokens);
    return result;
  }

  parseExpression(tokens) {
    if (tokens.length == 0) {
      throw new Error("Empty expression.");
    }

    let result = this.parseTerm(tokens);

    while (tokens.length && tokens[0] == "|") {
      tokens.shift();
      const rightOperand = this.parseTerm(tokens);
      result = result || rightOperand;
    }

    return result;
  }

  parseTerm(tokens) {
    if (tokens.length == 0) {
      throw new Error("Empty term.");
    }

    let result = this.parseFactor(tokens);

    while (tokens.length && !["|", ")"].includes(tokens[0])) {
      const rightOperand = this.parseFactor(tokens);
      result = result && rightOperand;
    }

    return result;
  }

  parseFactor(tokens) {
    if (tokens.length == 0) {
      throw new Error("Empty factor.");
    }

    if (tokens[0] == "!") {
      tokens.shift();
      return !this.parseFactor(tokens);
    }

    if (tokens[0] == "(") {
      tokens.shift();
      return this.parseExpression(tokens);
    }

    const atom = tokens.shift();

    return this.#atomParser(atom);
  }
}


function dataParserFactory(data) {
  function dataParser(atom) {
    const splitAtom = atom.split("=");  // ☢️

    if (splitAtom.length == 1) {

      if (splitAtom[0] in data) {
        return !!data[splitAtom[0]];
      }
      
      return false;

    } else if (splitAtom.length == 2) {

      if (splitAtom[0] in data) {
        return data[splitAtom[0]] == splitAtom[1];
      }

    } else {
      throw new Error("Invalid atom.")
    }
  }
  return dataParser;
}

/** Checks condition and shows elements only if true. */
function showSwitch(condition, ...elements) {
  elements.map((el) => el.classList.toggle("hidden", !condition));
}

export function checkVisibility(data) {
  const elementsWithVisibility = document.querySelectorAll("[data-visible]");

  const visibilityParser = new BoolAlg(dataParserFactory(data));

  for (const el of elementsWithVisibility) {
      const visibility = visibilityParser.parse(el.getAttribute("data-visible"));
      showSwitch(visibility, el);
  }
}