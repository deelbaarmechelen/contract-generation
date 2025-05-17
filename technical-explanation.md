## Custom HTML attributes

In contract.html, I made two custom HTML attributes, to avoid having to hardcode what data goes in what field and when certain elements are visible. These are:

* `data-visible`: Determines whether an element should be visible depending on form data.
* `data-fill`: Automatically fills content of field with data from form.

Both have their own specific syntax.

### Syntax of the `data-visible` attribute

The `data-visible` attribute contains a boolean algebra to help handle complex visibility requirements. The syntax of this algebra is as follows:

* ` `
  * Logical conjugation operator (AND).
  * Whitespaces between operators and their operands are ignored, as are whitespaces immediately on the inside of parentheses.
* `|`
  * Logical disjunction operator (OR).
* `!`
  * Logical negation operator (NOT).
* `(` and `)`
  * Used to associate subexpressions.

All other symbols are concatenated into atomic expressions. Hence, atomic expressions cannot contain the above symbols anywhere. The syntax of atomic expressions is as follows:

* A key of the data object. (This is the same as the `name` attribute of a form element.)
  * TRUE if the corresponding value is truthy, else FALSE.
* A key of the data object, the token `=`, and a string of characters.
  * TRUE if the corresponding value equals this string of characters, else FALSE.

### Syntax of the `data-fill` attribute

The `data-fill` tag has following syntax:

* `|`
  * Pipe operator. Pipes output of the preceding expression into the expression after it.
  * The expression preceding the first pipe is a comma-separated list of keys of the data object. The values of these keys are retrieved and passed into the next expression.
  * The expression following a pipe operator begins with the name of a formatter. The formatter will be applied to the output of the preceding expression.
* `(` and `)`
  * Some formatters may accept additional parameters. These should be placed between parentheses after the name of the formatter.
  * Parameters are always read as strings. Note that these cannot contain any of these syntactic tokens. (Serious limitation of the language, but I can't be arsed to improve it.)
* `,`
  * Separates different keys of the data object in the first subexpression.
  * Separates parameters of a formatter.
* ` `
  * Trimmed away when found around operators. (Also potentially a limitation.) 

If the final result is a list, the contained elements will be joined with spaces.

Available formatters include:

* `datetime`
  * Properly formatted (long) date and time according to Belgian conventions.
* `date`
  * Properly formatted (short) date according to Belgian conventions.
* `checkbox`
  * Checks if value is truthy, if so, shows filled checkbox, if not, shows empty checkbox.
* `address`
  * Takes the values streetName, houseNumber, boxNumber, postalCode, municipality, and country.
  * Formats these into an address, according to Belgian conventions.
  * If both the streetname and municipality are empty, returns empty string.
* `telephone`
  * Formats a phone number according to Belgian conventions.
* `euro`
  * Formats a euro amount according to Belgian conventions.
* `fulldevicename`
  * Retrieves the full device name from src/modules/constants.js.
* `mask`
  * Returns list containing parameters in the same position as truthy values.
* `joincomma`
  * Joins values with a comma and a space.
* `capitalize`
  * Capitalizes first letter of value.

_Example:_ `phoneNumber|telephone`: Retrieves the `phoneNumber` property of the form data object, and formats it as a telephone number.

_Example:_ `firstName, lastName`: Retrieves the `firstName` and `lastName` properties of the form data object, and since there is no formatter specified, joins these with spaces.

_Example:_ `streetName,houseNumber,boxNumber,postalCode,municipality,country|address`: Retrieves various properties from the form data object, and parses these into an address.

_Example:_ `oldIncludesCharger, oldIncludesMouse, oldIncludesSmartCardReader|mask(lader, muis, eID-lezer)|joincomma|capitalize`: Retrieves properties from the form data object, masks the list ['lader', 'muis', 'eID-lezer'] according to their values, joins the remaining values from this list with `, `, and capitalizes the first character.