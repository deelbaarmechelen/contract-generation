Done:

- Pass data to document correctly
- Write test helper function
- Add referral
- Add aptitude test fields
- Remove necessity of valid inputs
- Add postcode validation for UiTpas
- Add distinction between Windows 10 and Windows 11 contracts
- Fix document
	- Make correspond to manual contract version
- Add required previous field validation to autocomplete buttons
- Add declaration that client is 18 years of age
- Add date validation
- Add a reset button to clear all contract information before entering a new one
- Separate input verification logic from input events

Necessary:
- Validate API key is available in distributable
- Show birthDate on contract
- Detect if structured communication is empty, give different message
- End date of paid contract is not necessarily after a year, should not autofill to be after a year.
- Better validity message display. (Display some kind of element at 'blur' event?)
- Find better way to deal with repeat customers. (may involve light company policy change)

Luxuries:

- Add addendums for extension and replacement.
- Add retrieval of contractnumber from SharePoint