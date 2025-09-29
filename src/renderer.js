import * as prompts from "./modules/prompts.js";
import * as display from "./modules/display.js";
import * as test from "./modules/test.js";
import * as validation from "./modules/validation.js";
import * as autoFill from "./modules/autofill.js";
import * as settings from "./modules/settings.js";

display.initDisplay();
prompts.initPrompt();
autoFill.initAutoFillButtons();
validation.initValidation();
settings.initSettings();

window.testFill = test.testFill;