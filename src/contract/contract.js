import * as visibility from "../modules/visibility.js";
import * as filler from "../modules/filler.js";
import * as markdown from "../modules/markdown.js";
import * as organisatie from "../modules/organisatie.js";

window.addEventListener("load", async () => {
  try {
    let data = await window.contractData.get();
    console.log("Filling document with data:", data);
    // The terms text and the organisation details live in their own files, so
    // insert them before the visibility and fill passes run over the document.
    await markdown.fillMarkdownSections();
    await organisatie.applyOrganisatie();
    visibility.checkVisibility(data);
    await filler.fillFields(data);
    await window.contractData.documentProcessed();
  } catch (error) {
    await window.contractData.documentError(error);
  }
})