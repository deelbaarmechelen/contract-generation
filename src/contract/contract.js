import * as visibility from "../modules/visibility.js";
import * as filler from "../modules/filler.js";
import * as markdown from "../modules/markdown.js";

window.addEventListener("load", async () => {
  try {
    let data = await window.contractData.get();
    console.log("Filling document with data:", data);
    // The terms text comes from a markdown file, so insert it before the
    // visibility and fill passes run over the document.
    await markdown.fillMarkdownSections();
    visibility.checkVisibility(data);
    await filler.fillFields(data);
    await window.contractData.documentProcessed();
  } catch (error) {
    await window.contractData.documentError(error);
  }
})