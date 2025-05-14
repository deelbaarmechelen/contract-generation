import * as visibility from "./modules/visibility.js";
import * as filler from "./modules/filler.js";

window.addEventListener("load", async () => {
  try {
    let data = await window.contractData.get();
    console.log("Filling document with data:", data);
    visibility.checkVisibility(data);
    await filler.fillFields(data);
    await window.contractData.documentProcessed();
  } catch (error) {
    await window.contractData.documentError(error);
  }
})