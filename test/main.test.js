const { expect } = require('chai');
const { Application } = require('spectron');
const path = require('path');
const electron = require('electron');

describe('Application launch', function () {
	this.timeout(10000);

	beforeEach(function () {
		console.log('Starting application...' + electron);
		this.app = new Application({
			path: path.join(__dirname, '../node_modules/.bin/electron'),
			args: [path.join(__dirname, '../')],
		});
		return this.app.start();
	});

	afterEach(function () {
		if (this.app && this.app.isRunning()) {
			return this.app.stop();
		}
	});

	it('should check if uitpasApplicable checkbox is checked', async function () {
		const checkbox = await this.app.client.$('#uitpasApplicable');
		const isChecked = await checkbox.isSelected();
		expect(isChecked).to.be.false; // Assuming the checkbox is not checked by default
	});
});