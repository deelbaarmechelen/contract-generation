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
