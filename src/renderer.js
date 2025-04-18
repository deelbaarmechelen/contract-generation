import * as prompts from "./modules/prompts.js";
import * as display from "./modules/display.js";
import * as test from "./modules/test.js";
import * as validation from "./modules/validation.js";
import * as autoFill from "./modules/autofill.js";

display.initDisplay();
prompts.initPromptButtons();
autoFill.initAutoFillButtons();
validation.initValidation();

window.testFill = test.testFill;