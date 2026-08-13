/** The fee the last Lend Engine price lookup returned.
 *
 * The prijs per 6 maanden is filled in when the user presses the magnifier, and
 * deliberately does not change on its own afterwards -- a checkbox silently
 * rewriting an amount on a contract is the kind of thing nobody notices. Keeping
 * the fee here lets the field warn instead, whenever what is in it differs from
 * what that fee comes to under the tariff that is ticked now.
 */

let lastLoanFee = null;

/** Records the fee a lookup returned. */
export function rememberLoanFee(loanFee) {
	lastLoanFee = loanFee;
}

/** Forgets the remembered fee, so the field stops being checked once there is no
 * fetched price to check it against. */
export function forgetLoanFee() {
	lastLoanFee = null;
}

/** The amount payable for a fee under a tariff. Sociaal tarief is one third of
 * the normal price, rounded to whole euros; the cirkelwaarde is not discounted. */
export function payableFor(loanFee, socialTariff) {
	return socialTariff ? Math.round(loanFee / 3) : loanFee;
}

/** What the fetched price comes to under the tariff that is ticked now, or null
 * when no price has been fetched. */
export function expectedPayable(currentSocialTariff) {
	if (lastLoanFee === null) {
		return null;
	}
	return payableFor(lastLoanFee, currentSocialTariff);
}
