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
- End date of paid contract is not necessarily after a year, should not autofill to be after a year.
- Better validity message display. (Display some kind of element at 'blur' event?) -> At input events.
- Add addendums for extension and replacement.
- Find better way to deal with repeat customers. (may involve light company policy change)
- Validate API key is available in distributable -> not the case

Necessary:
- Show birthDate on contract
- Detect if structured communication is empty, give different message
- Find better way to deal with repeat customers. (may involve light company policy change)
- Clarify meaning of advance payment to user
- Add final screen with reminders and links to Beego + Digisnacks
- Field 'organisation'
- Fix text on exceptions
- Make signaturedate more explicit on addendum
- Fix weird font in addendum on Windows 
- Clarify meaning of advance payment to user (exclusief cirkelwaarde)
- Free comment field

Luxuries:

- Add retrieval of contractnumber from SharePoint