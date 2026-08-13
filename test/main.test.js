const { expect } = require('chai');
const { shell } = require('electron');

// These tests run inside the Electron main process via electron-mocha, so they
// exercise the same modules main.cjs uses rather than driving the UI.

describe('phone number formatting', function () {
	const PNF = require('google-libphonenumber').PhoneNumberFormat;
	const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

	function formatPhoneNumber(rawPhoneNumber) {
		let phoneNumber;
		try {
			phoneNumber = phoneUtil.parse(rawPhoneNumber, 'BE');
		} catch {
			return '';
		}
		if (!phoneUtil.isValidNumber(phoneNumber)) {
			return '';
		}
		if (phoneUtil.isValidNumberForRegion(phoneNumber, 'BE')) {
			return phoneUtil.format(phoneNumber, PNF.NATIONAL);
		}
		return phoneUtil.format(phoneNumber, PNF.INTERNATIONAL);
	}

	it('formats a valid Belgian mobile number nationally', function () {
		expect(formatPhoneNumber('0470123456')).to.equal('0470 12 34 56');
	});

	it('returns an empty string for gibberish', function () {
		expect(formatPhoneNumber('not a phone number')).to.equal('');
	});

	it('returns an empty string for an invalid number', function () {
		expect(formatPhoneNumber('12')).to.equal('');
	});
});

describe('IBAN formatting', function () {
	const ibantools = require('ibantools');

	function formatIbanNumber(rawIbanNumber) {
		const extraction = ibantools.extractIBAN(rawIbanNumber);
		if (!extraction.valid) {
			return '';
		}
		return ibantools.friendlyFormatIBAN(extraction.iban);
	}

	it('formats a valid Belgian IBAN into readable groups', function () {
		expect(formatIbanNumber('BE71096123456769')).to.equal('BE71 0961 2345 6769');
	});

	it('returns an empty string for an IBAN with a bad checksum', function () {
		expect(formatIbanNumber('BE71096123456760')).to.equal('');
	});

	it('returns an empty string for gibberish', function () {
		expect(formatIbanNumber('hello')).to.equal('');
	});
});

describe('Lend Engine token handling', function () {
	// Mirrors readTokenExpiry in main.cjs. Access tokens live about an hour, so
	// the app reads their expiry to know when to refresh from the (month-long)
	// refresh token.
	function readTokenExpiry(token) {
		try {
			const payload = token.split('.')[1];
			const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
			return typeof decoded.exp === 'number' ? decoded.exp * 1000 : 0;
		} catch {
			return 0;
		}
	}

	function jwtWithExpiry(secondsFromNow) {
		const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
		return 'x.' + Buffer.from(JSON.stringify({ exp })).toString('base64') + '.y';
	}

	it('reads the expiry out of a token', function () {
		const expiry = readTokenExpiry(jwtWithExpiry(3600));
		expect(expiry).to.be.closeTo(Date.now() + 3600000, 5000);
	});

	it('treats an unreadable token as expired', function () {
		expect(readTokenExpiry('not-a-jwt')).to.equal(0);
		expect(readTokenExpiry('')).to.equal(0);
		expect(readTokenExpiry('x.' + Buffer.from('{}').toString('base64') + '.y')).to.equal(0);
	});

	it('refreshes a token that is inside the one minute safety margin', function () {
		// The app refreshes when Date.now() >= expiry - 60s, so a token with 30
		// seconds left must not be reused.
		const expiry = readTokenExpiry(jwtWithExpiry(30));
		expect(Date.now() < expiry - 60000).to.be.false;
	});

	it('reuses a token that is still comfortably valid', function () {
		const expiry = readTokenExpiry(jwtWithExpiry(3600));
		expect(Date.now() < expiry - 60000).to.be.true;
	});
});

describe('organisatie.json', function () {
	const fs = require('fs');
	const path = require('path');
	const configPath = path.join(__dirname, '..', 'instellingen', 'organisatie.json');

	it('is valid JSON', function () {
		expect(() => JSON.parse(fs.readFileSync(configPath, 'utf8'))).to.not.throw();
	});

	it('carries every field the contracts reference', function () {
		const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
		for (const field of ['dienstNaam', 'organisatieNaam', 'adresregels', 'email', 'rekeningnummer', 'ondertekenaar']) {
			expect(config[field], field).to.not.be.undefined;
			expect(config[field], field).to.not.equal('');
		}
	});

	it('keeps the address as a list of lines', function () {
		const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
		expect(config.adresregels).to.be.an('array').that.is.not.empty;
	});

	it('has a data-org placeholder in the contract for each field used', function () {
		const contract = fs.readFileSync(
			path.join(__dirname, '..', 'src', 'contract', 'contract.html'), 'utf8'
		);
		const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
		const used = [...contract.matchAll(/data-org="([^"]+)"/g)].map((m) => m[1]);
		expect(used).to.not.be.empty;
		// Every placeholder must correspond to a real field, or it renders blank.
		for (const key of used) {
			expect(config, `contract references "${key}"`).to.have.property(key);
		}
	});
});

describe('markdown rendering for the terms file', function () {
	// The renderer is an ES module and these tests run as CommonJS, so it is
	// loaded dynamically.
	let renderMarkdown;

	before(async function () {
		const url = require('url').pathToFileURL(
			require('path').join(__dirname, '..', 'src', 'modules', 'markdown.js')
		).href;
		({ renderMarkdown } = await import(url));
	});

	function balanced(html) {
		const count = (re) => (html.match(re) || []).length;
		return count(/<ul>/g) === count(/<\/ul>/g) && count(/<li>/g) === count(/<\/li>/g);
	}

	it('nests sublists inside their parent list item', function () {
		const html = renderMarkdown('- Parent\n  - Child\n- Sibling');
		expect(html).to.match(/<li>Parent\s*<ul>/);
		expect(balanced(html)).to.be.true;
	});

	it('produces balanced markup for the real terms file', function () {
		const fs = require('fs');
		const path = require('path');
		const source = fs.readFileSync(
			path.join(__dirname, '..', 'instellingen', 'voorwaarden.md'), 'utf8'
		);
		expect(balanced(renderMarkdown(source))).to.be.true;
	});

	it('strips the editing instructions in the HTML comment', function () {
		expect(renderMarkdown('<!-- instructies -->\n- Tekst')).to.not.include('instructies');
	});

	it('renders bold text', function () {
		expect(renderMarkdown('- Dit is **vet**')).to.include('<b>vet</b>');
	});

	it('escapes HTML so the terms file cannot inject markup', function () {
		const html = renderMarkdown('- <script>alert(1)</script>');
		expect(html).to.not.include('<script>');
		expect(html).to.include('&lt;script&gt;');
	});

	it('renders headings and paragraphs', function () {
		const html = renderMarkdown('## Titel\n\nEen zin.');
		expect(html).to.include('<h2>Titel</h2>');
		expect(html).to.include('<p>Een zin.</p>');
	});
});

describe('sociaal tarief discount', function () {
	// Mirrors the calculation in autofill.js: people with a verhoogde
	// tegemoetkoming pay one third of the normal price. The cirkelwaarde is a
	// fixed one-off and is never discounted.
	function payable(loanFee, socialTariff) {
		return socialTariff ? Math.round(loanFee / 3) : loanFee;
	}

	it('charges a third for each published price tier', function () {
		expect(payable(30, true)).to.equal(10);
		expect(payable(60, true)).to.equal(20);
		expect(payable(90, true)).to.equal(30);
		expect(payable(120, true)).to.equal(40);
	});

	it('leaves the price untouched without the social tariff', function () {
		expect(payable(60, false)).to.equal(60);
	});

	it('rounds to whole euros for prices that do not divide evenly', function () {
		expect(payable(50, true)).to.equal(17);
	});
});

describe('Lend Engine asset lookup', function () {
	// Mirrors the response handling in main.cjs. The sample below is a real
	// (trimmed) response from the Digi-Mee Lend Engine instance.
	function localisedString(value) {
		if (typeof value === 'string') {
			return value;
		}
		if (value && typeof value === 'object') {
			const candidates = [value.nl, ...Object.values(value)];
			const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
			return found || '';
		}
		return '';
	}

	function toAsset(parsed) {
		const members = parsed['hydra:member'] || [];
		if (members.length === 0) {
			return null;
		}
		const item = members[0];
		return {
			asset_tag: item.sku,
			brand: item.brand || '',
			model: localisedString(item.name),
			serial: item.serial || '',
		};
	}

	const sampleResponse = {
		'hydra:member': [{
			id: 532,
			sku: 'PC250213',
			name: { nl: 'DELL Latitude 5400 Win10' },
			brand: 'Dell',
			serial: '77TGP13',
		}],
		'hydra:totalItems': 1,
	};

	it('maps a real Lend Engine item onto the asset shape the form expects', function () {
		expect(toAsset(sampleResponse)).to.deep.equal({
			asset_tag: 'PC250213',
			brand: 'Dell',
			model: 'DELL Latitude 5400 Win10',
			serial: '77TGP13',
		});
	});

	it('treats an empty collection as "not found"', function () {
		expect(toAsset({ 'hydra:member': [] })).to.equal(null);
	});

	it('unwraps the localised name object rather than stringifying it', function () {
		expect(localisedString({ nl: 'Laptop' })).to.equal('Laptop');
	});

	it('falls back to another locale when Dutch is missing', function () {
		expect(localisedString({ nl: null, en: 'English only' })).to.equal('English only');
	});

	it('returns an empty string when no name is set', function () {
		expect(localisedString({ nl: null })).to.equal('');
		expect(localisedString(undefined)).to.equal('');
	});
});

describe('sociaal tarief warning', function () {
	// The price is filled in when the user presses the magnifier and does not
	// rewrite itself when the tariff is toggled afterwards; the field warns
	// instead. These mirror the state kept in src/modules/pricing.js.
	let lastLoanFee;

	function rememberLoanFee(loanFee) {
		lastLoanFee = loanFee;
	}

	function forgetLoanFee() {
		lastLoanFee = null;
	}

	function payableFor(loanFee, socialTariff) {
		return socialTariff ? Math.round(loanFee / 3) : loanFee;
	}

	function expectedPayable(currentSocialTariff) {
		if (lastLoanFee === null) {
			return null;
		}
		return payableFor(lastLoanFee, currentSocialTariff);
	}

	/** Mirrors the rule in validation.js: warn exactly when a fee has been
	 * fetched and the value in the field is not what it comes to. */
	function warns(value, socialTariff) {
		const expected = expectedPayable(socialTariff);
		return !(expected === null || value === expected);
	}

	beforeEach(function () {
		forgetLoanFee();
	});

	it('does not warn while the filled-in price matches', function () {
		rememberLoanFee(60);
		expect(warns(60, false)).to.be.false;
	});

	it('warns once the tariff is ticked after the lookup', function () {
		rememberLoanFee(60);
		expect(warns(60, true)).to.be.true;
		expect(expectedPayable(true)).to.equal(20);
	});

	it('warns once the tariff is unticked after the lookup', function () {
		rememberLoanFee(60);
		expect(warns(20, false)).to.be.true;
		expect(expectedPayable(false)).to.equal(60);
	});

	it('stops warning when the tariff is put back', function () {
		rememberLoanFee(60);
		expect(warns(60, true)).to.be.true;
		expect(warns(60, false)).to.be.false;
	});

	it('warns about a hand-edited amount that does not match', function () {
		// Not only tariff toggles: any divergence from the fetched price is
		// reported, because the fetched price is what Lend Engine says it costs.
		rememberLoanFee(60);
		expect(warns(45, false)).to.be.true;
	});

	it('stops warning when the amount is edited to the right value', function () {
		rememberLoanFee(60);
		expect(warns(20, true)).to.be.false;
	});

	it('does not warn when no price has been fetched', function () {
		// Nothing to compare against, so the amount is the user's own business.
		expect(warns(45, true)).to.be.false;
		expect(warns(45, false)).to.be.false;
		expect(expectedPayable(true)).to.equal(null);
	});

	it('does not warn when Lend Engine had no price for the device', function () {
		rememberLoanFee(60);
		forgetLoanFee();
		expect(warns(45, true)).to.be.false;
	});

	it('reports the amount the tariff now calls for', function () {
		rememberLoanFee(90);
		expect(expectedPayable(true)).to.equal(30);
		expect(expectedPayable(false)).to.equal(90);
	});

	it('agrees with the discount a fresh lookup would fill in', function () {
		for (const fee of [30, 60, 90, 120, 50]) {
			rememberLoanFee(fee);
			expect(expectedPayable(true), String(fee)).to.equal(payableFor(fee, true));
		}
	});
});

describe('Lend Engine contact lookup', function () {
	// Mirrors the contact handling in main.cjs. The samples below are trimmed
	// versions of real records from the Digi-Mee Lend Engine instance.
	function splitAddress(address) {
		const empty = { streetName: '', houseNumber: '', boxNumber: '' };
		if (typeof address !== 'string' || address.trim().length === 0) {
			return empty;
		}
		const trimmed = address.trim();
		const withBox = trimmed.match(
			/^(.*?)\s+(\d+\s*[A-Za-z]?)\s*(?:\/|-|\s(?:bus|bs|b\.?)\s*)\s*([\dA-Za-z]+)$/i
		);
		if (withBox) {
			return {
				streetName: withBox[1].trim(),
				houseNumber: withBox[2].replace(/\s+/g, '').trim(),
				boxNumber: withBox[3].trim(),
			};
		}
		const withoutBox = trimmed.match(/^(.*?)\s+(\d+\s*[A-Za-z]?)$/);
		if (withoutBox) {
			return {
				streetName: withoutBox[1].trim(),
				houseNumber: withoutBox[2].replace(/\s+/g, '').trim(),
				boxNumber: '',
			};
		}
		return { streetName: trimmed, houseNumber: '', boxNumber: '' };
	}

	function deobfuscateEmail(email) {
		if (typeof email !== 'string' || email.trim().length === 0) {
			return '';
		}
		const trimmed = email.trim();
		const valid = (s) => /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(s);
		const patterns = [
			/_+\s*@\s*_+/,
			/_+\s*at\s*_+/i,
			/\(\s*at\s*\)/i,
			/\[\s*at\s*\]/i,
			/\s+at\s+/i,
		];
		for (const pattern of patterns) {
			if (!pattern.test(trimmed)) {
				continue;
			}
			const candidate = trimmed.replace(pattern, '@');
			if (valid(candidate)) {
				return candidate;
			}
		}
		return trimmed;
	}

	function formatStructuredCommunication(value) {
		if (typeof value !== 'string') {
			return '';
		}
		const digits = value.replace(/\D/g, '');
		if (digits.length !== 12) {
			return '';
		}
		return '+++' + digits.slice(0, 3) + '/' + digits.slice(3, 7) + '/' + digits.slice(7, 12) + '+++';
	}

	function customFieldMap(customFields) {
		if (!customFields || Array.isArray(customFields)) {
			return {};
		}
		return typeof customFields === 'object' ? customFields : {};
	}

	function customField(customFields, label) {
		const fields = customFieldMap(customFields);
		const wanted = label.trim().toLowerCase();
		for (const [key, value] of Object.entries(fields)) {
			if (key.trim().toLowerCase() === wanted) {
				return typeof value === 'string' ? value : '';
			}
		}
		return '';
	}

	const CONTACT_PATH_WORDS = ['contact', 'contacts', 'member', 'members', 'customer'];

	function parseContactRef(input) {
		const trimmed = String(input ?? '').trim();
		if (trimmed === '') {
			return { error: 'leeg' };
		}
		const bare = trimmed.match(/^[A-Za-z]*[-\s]?(\d+)$/);
		if (bare) {
			return { id: bare[1] };
		}
		const looksLikeUrl = /^https?:\/\//i.test(trimmed) || trimmed.includes('/');
		if (!looksLikeUrl) {
			return { error: 'geen nummer' };
		}
		let pathname;
		try {
			pathname = new URL(trimmed, 'https://digi-mee.denideal.be').pathname;
		} catch {
			pathname = trimmed.split(/[?#]/)[0];
		}
		const segments = pathname.split('/').filter((s) => s.length > 0);
		const wordIndex = segments.findIndex((s) => CONTACT_PATH_WORDS.includes(s.toLowerCase()));
		if (wordIndex === -1) {
			const entity = segments.find((s) => /^[A-Za-z][A-Za-z-]*$/.test(s) && s.toLowerCase() !== 'admin');
			const what = entity ? `een "${entity}"-pagina` : 'geen klantenpagina';
			return { error: `Deze link wijst naar ${what}, niet naar een klant.` };
		}
		const after = segments.slice(wordIndex + 1).find((s) => /^\d+$/.test(s));
		if (after) {
			return { id: after };
		}
		return { error: 'geen id' };
	}

	describe('address splitting', function () {
		it('splits a Flemish street and house number', function () {
			expect(splitAddress('Battelsesteenweg 48')).to.deep.equal({
				streetName: 'Battelsesteenweg', houseNumber: '48', boxNumber: '',
			});
		});

		it('keeps multi-word street names intact', function () {
			expect(splitAddress('Onze Lieve Vrouwestraat 12')).to.deep.equal({
				streetName: 'Onze Lieve Vrouwestraat', houseNumber: '12', boxNumber: '',
			});
		});

		it('keeps a letter suffix with the house number', function () {
			// 48A is one house number, not house 48 bus A.
			expect(splitAddress('Kerkstraat 12A')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '12A', boxNumber: '',
			});
			expect(splitAddress('Kerkstraat 12 A')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '12A', boxNumber: '',
			});
		});

		it('reads the official "bus" spelling', function () {
			expect(splitAddress('Battelsesteenweg 48 bus 3')).to.deep.equal({
				streetName: 'Battelsesteenweg', houseNumber: '48', boxNumber: '3',
			});
		});

		it('reads bus written without a space', function () {
			expect(splitAddress('Battelsesteenweg 48 bus3')).to.deep.equal({
				streetName: 'Battelsesteenweg', houseNumber: '48', boxNumber: '3',
			});
		});

		it('reads the abbreviated bus forms', function () {
			for (const written of ['48 b 3', '48 b. 3', '48 bs 3']) {
				expect(splitAddress('Kerkstraat ' + written), written).to.deep.equal({
					streetName: 'Kerkstraat', houseNumber: '48', boxNumber: '3',
				});
			}
		});

		it('reads the slash form', function () {
			expect(splitAddress('Kerkstraat 48/3')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '48', boxNumber: '3',
			});
			expect(splitAddress('Kerkstraat 48 / 3')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '48', boxNumber: '3',
			});
		});

		it('reads the dash form', function () {
			expect(splitAddress('Kerkstraat 48 - 3')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '48', boxNumber: '3',
			});
		});

		it('reads a lettered bus', function () {
			expect(splitAddress('Kerkstraat 48 bus B')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '48', boxNumber: 'B',
			});
		});

		it('handles a house number with both a letter and a bus', function () {
			expect(splitAddress('Kerkstraat 48A bus 3')).to.deep.equal({
				streetName: 'Kerkstraat', houseNumber: '48A', boxNumber: '3',
			});
		});

		it('leaves the house number empty when there is none', function () {
			expect(splitAddress('Grote Markt')).to.deep.equal({
				streetName: 'Grote Markt', houseNumber: '', boxNumber: '',
			});
		});

		it('handles a missing address', function () {
			expect(splitAddress(null)).to.deep.equal({ streetName: '', houseNumber: '', boxNumber: '' });
			expect(splitAddress('')).to.deep.equal({ streetName: '', houseNumber: '', boxNumber: '' });
		});
	});

	describe('email de-obfuscation', function () {
		// Staff replace the @ in Lend Engine so it cannot mail the client; the
		// contract has to show the real address.
		it('restores the _@_ form', function () {
			expect(deobfuscateEmail('test_@_digibankmechelen.be')).to.equal('test@digibankmechelen.be');
		});

		it('restores the _at_ form', function () {
			expect(deobfuscateEmail('test_at_digibankmechelen.be')).to.equal('test@digibankmechelen.be');
		});

		it('restores the bracketed forms', function () {
			expect(deobfuscateEmail('test(at)gmail.com')).to.equal('test@gmail.com');
			expect(deobfuscateEmail('test[at]gmail.com')).to.equal('test@gmail.com');
		});

		it('restores a spaced "at"', function () {
			expect(deobfuscateEmail('test at gmail.com')).to.equal('test@gmail.com');
		});

		it('leaves a normal address untouched', function () {
			expect(deobfuscateEmail('pietje@gmail.com')).to.equal('pietje@gmail.com');
		});

		it('does not mangle a local part that genuinely contains "at"', function () {
			// "at" inside a word must not be treated as an obfuscated @.
			expect(deobfuscateEmail('nathalie@gmail.com')).to.equal('nathalie@gmail.com');
			expect(deobfuscateEmail('matthias@gmail.com')).to.equal('matthias@gmail.com');
		});

		it('leaves something that is not an address alone', function () {
			expect(deobfuscateEmail('geen adres')).to.equal('geen adres');
			expect(deobfuscateEmail('')).to.equal('');
			expect(deobfuscateEmail(null)).to.equal('');
		});

		it('does not produce an address with two @ signs', function () {
			expect(deobfuscateEmail('a_at_b_at_c.be')).to.not.match(/@.*@/);
		});
	});

	describe('structured communication normalisation', function () {
		// Typed by hand into a Lend Engine custom field, so it arrives in whatever
		// shape the person used. The form's input mask only accepts digits, so only
		// the digits are read and the layout is rebuilt.
		const expected = '+++123/4567/89012+++';

		it('accepts the fully written form', function () {
			expect(formatStructuredCommunication('+++123/4567/89012+++')).to.equal(expected);
		});

		it('accepts it without the plus signs', function () {
			expect(formatStructuredCommunication('123/4567/89012')).to.equal(expected);
		});

		it('accepts bare digits', function () {
			expect(formatStructuredCommunication('123456789012')).to.equal(expected);
		});

		it('accepts stars instead of pluses', function () {
			expect(formatStructuredCommunication('***123/4567/89012***')).to.equal(expected);
		});

		it('accepts spaces and other separators', function () {
			expect(formatStructuredCommunication('123 4567 89012')).to.equal(expected);
			expect(formatStructuredCommunication('  123-4567-89012  ')).to.equal(expected);
			expect(formatStructuredCommunication('123.4567.89012')).to.equal(expected);
		});

		it('refuses a value with the wrong number of digits', function () {
			// Better to leave the field for the user than to fill in something
			// that was never checked.
			expect(formatStructuredCommunication('123/4567/8901')).to.equal('');
			expect(formatStructuredCommunication('1234567890123')).to.equal('');
			expect(formatStructuredCommunication('123')).to.equal('');
		});

		it('handles an empty or missing value', function () {
			expect(formatStructuredCommunication('')).to.equal('');
			expect(formatStructuredCommunication(null)).to.equal('');
			expect(formatStructuredCommunication(undefined)).to.equal('');
			expect(formatStructuredCommunication('geen mededeling')).to.equal('');
		});

		it('produces a value the form\'s own pattern accepts', function () {
			// The field validates against this pattern in index.html.
			const formPattern = /^\+\+\+\d{3}\/\d{4}\/\d{5}\+\+\+$/;
			expect(formatStructuredCommunication('123456789012')).to.match(formPattern);
		});
	});

	describe('custom fields', function () {
		it('reads a value by its Dutch label', function () {
			const fields = { 'Contract nummer(s)': 'C-NB-25-0', 'Extra Info': null };
			expect(customField(fields, 'Contract nummer(s)')).to.equal('C-NB-25-0');
		});

		it('treats the empty PHP array as no custom fields', function () {
			// Lend Engine serialises an empty set as [] rather than {}.
			expect(customField([], 'Gestructureerde Mededeling')).to.equal('');
		});

		it('survives an admin renaming the label\'s case or spacing', function () {
			const fields = { '  gestructureerde mededeling ': '+++123/4567/89012+++' };
			expect(customField(fields, 'Gestructureerde Mededeling')).to.equal('+++123/4567/89012+++');
		});

		it('returns an empty string for a null or missing field', function () {
			expect(customField({ 'Extra Info': null }, 'Extra Info')).to.equal('');
			expect(customField({}, 'Onbekend')).to.equal('');
		});
	});

	describe('reading the contact id from what was pasted', function () {
		// The contacts collection only filters on email, firstName, lastName,
		// isActive and createdAt -- there is no membershipNumber filter, so the
		// client is fetched by id from the link to their page in Lend Engine.
		it('takes the id out of an admin URL', function () {
			expect(parseContactRef('https://digi-mee.denideal.be/admin/contact/67').id).to.equal('67');
		});

		it('ignores a trailing path segment', function () {
			expect(parseContactRef('https://digi-mee.denideal.be/admin/contact/67/edit').id).to.equal('67');
		});

		it('accepts the plural and member spellings', function () {
			expect(parseContactRef('https://digi-mee.denideal.be/admin/contacts/67').id).to.equal('67');
			expect(parseContactRef('https://digi-mee.denideal.be/admin/member/67').id).to.equal('67');
		});

		it('accepts a bare id', function () {
			expect(parseContactRef('67').id).to.equal('67');
			expect(parseContactRef('  67  ').id).to.equal('67');
		});

		it('accepts a prefixed number as used on the klantnummer', function () {
			expect(parseContactRef('DA-67').id).to.equal('67');
		});

		it('refuses an item page rather than loading that id as a contact', function () {
			// Every id is a valid contact id, so an item link would otherwise pull
			// up an unrelated client with a plausible-looking name.
			const result = parseContactRef('https://digi-mee.denideal.be/admin/item/532');
			expect(result.id).to.be.undefined;
			expect(result.error).to.include('item');
		});

		it('refuses loan and payment pages too', function () {
			expect(parseContactRef('https://digi-mee.denideal.be/admin/loan/88').id).to.be.undefined;
			expect(parseContactRef('https://digi-mee.denideal.be/admin/payment/12').id).to.be.undefined;
		});

		it('does not take a number from the query string of a non-contact page', function () {
			// ?id=532 on an item page is still not a contact id.
			expect(parseContactRef('https://digi-mee.denideal.be/admin/item?id=532').id).to.be.undefined;
		});

		it('reports an error when there is no number to read', function () {
			expect(parseContactRef('').error).to.not.be.undefined;
			expect(parseContactRef('   ').error).to.not.be.undefined;
			expect(parseContactRef('geen nummer').error).to.not.be.undefined;
			expect(parseContactRef(undefined).error).to.not.be.undefined;
		});

		it('reports an error for a contact page with no id in it', function () {
			expect(parseContactRef('https://digi-mee.denideal.be/admin/contact').error).to.not.be.undefined;
		});
	});
});

describe('openExternal protocol guard', function () {
	// Mirrors the guard in main.cjs: only http(s) may reach the OS handler.
	let opened;
	let originalOpenExternal;

	beforeEach(function () {
		opened = [];
		originalOpenExternal = shell.openExternal;
		shell.openExternal = (url) => {
			opened.push(url);
			return Promise.resolve();
		};
	});

	afterEach(function () {
		shell.openExternal = originalOpenExternal;
	});

	async function openExternal(url) {
		if (typeof url !== 'string') {
			return;
		}
		let parsed;
		try {
			parsed = new URL(url);
		} catch {
			return;
		}
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
			return;
		}
		shell.openExternal(parsed.href);
	}

	it('opens https URLs', async function () {
		await openExternal('https://shop.digibankmechelen.be/admin/');
		expect(opened).to.have.lengthOf(1);
	});

	it('refuses file: URLs', async function () {
		await openExternal('file:///C:/Windows/System32/calc.exe');
		expect(opened).to.be.empty;
	});

	it('refuses malformed input', async function () {
		await openExternal('://////');
		expect(opened).to.be.empty;
	});

	it('ignores non-string input', async function () {
		await openExternal(undefined);
		expect(opened).to.be.empty;
	});
});
