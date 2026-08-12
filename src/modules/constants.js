// De links naar het klantnummer- en contractnummeroverzicht wezen naar een
// SharePoint van Ecoso. Die omgeving bestaat niet meer, dus de knoppen ernaast
// zijn uit het formulier gehaald.
export const linkUrls = {
	beego: "https://platform.digi-portaal.be/login",
	lendengine: "https://digi-mee.denideal.be/admin/"
}

// Prices are no longer held here: Lend Engine is the source of truth, and the
// contract fills them from the item record for the asset tag (loanFee and
// depositAmount). Keeping a price table in the app meant it silently went stale.
export const deviceTypes = {
	"laptop-linux": {
		fullName: "Laptop (Linux)"
	},
	"laptop-win-11": {
		fullName: "Laptop (Windows 11)"
	},
	"laptop-win-10": {
		fullName: "Laptop (Windows 10)"
	}
}

export const postalCodesMechelen = [2800, 2801, 2811, 2812];