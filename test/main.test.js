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
			path.join(__dirname, '..', 'src', 'contract', 'voorwaarden.md'), 'utf8'
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
