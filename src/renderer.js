const setPathButton = document.getElementById('btnSetPath')
const generateButton = document.getElementById('btnGenerate')
const firstnameInput = document.getElementById('firstname')
const lastnameInput = document.getElementById('lastname')
const addressInput = document.getElementById('address')
const zipCodeInput = document.getElementById('zipCode')
const cityInput = document.getElementById('city')
const phoneInput = document.getElementById('phone')
const emailInput = document.getElementById('email')
const clientIdInput = document.getElementById('clientId')
const contractIdInput = document.getElementById('contractId')
const UITPasInput = document.getElementById('UITPas')
const structuredReferenceInput = document.getElementById('structuredReference')
const messageElement = document.getElementById('message')
const filePathElement = document.getElementById('filePath')

setPathButton.addEventListener('click', async () => {
  const filePath = await window.electronAPI.openFile()
  filePathElement.innerText = filePath
})

generateButton.addEventListener('click', async () => {
  messageElement.innerText = 'In verwerking...'
  const lastname = lastnameInput.value
  const firstname = firstnameInput.value
  var data = {
    generationInfo: {
      path: filePathElement.innerText,
      print: true
    },
    firstname : firstname,
    lastname: lastname,
    address: addressInput.value,
    zipCode: zipCodeInput.value,
    city: cityInput.value,
    phone: phoneInput.value,
    email: emailInput.value,
    clientId: clientIdInput.value,
    contractId: contractIdInput.value,
    UITPas: UITPasInput.value,
    structuredReference: structuredReferenceInput.value,
    items: [
      {
        assetTag : 'PC25000',
        brand : 'Dell',
        model : 'Latitude 1234',
      }
    ]
  };
  try {
    console.log('Generating PDF with data:', data);
    const fileUrl = await window.carbone.generatePdf(data);
    if (!fileUrl) {
      throw new Error('File path is undefined');
    }
    console.log('url: ' + fileUrl);
    messageElement.innerText = 'Contract aangemaakt! (' + fileUrl + ')';
    window.open(fileUrl, '_blank', 'top=0,left=0,frame=true,toolbar=true,menubar=true,scrollbars=true,resizable=true');
  } catch (error) {
    console.error('Error generating PDF:', error);
    messageElement.innerText = 'Er is een fout opgetreden bij het aanmaken van het contract.';
  }
})

function renderPDF(url, canvasContainer, options) {
  var options = options || { scale: 1 };
      
  function renderPage(page) {
      var viewport = page.getViewport(options.scale);
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvasContainer.appendChild(canvas);
      
      page.render(renderContext);
  }
  
  function renderPages(pdfDoc) {
      for(var num = 1; num <= pdfDoc.numPages; num++)
          pdfDoc.getPage(num).then(renderPage);
  }
  PDFJS.disableWorker = true;
  PDFJS.getDocument(url).then(renderPages);
}

// generateButton.addEventListener('click', async () => {
//  renderPDF('//cdn.mozilla.net/pdfjs/helloworld.pdf', document.getElementById('holder'));
  //renderPDF('file://C:\\Users\\Bernard\\Downloads\\helloworld.pdf', document.getElementById('holder'));
// })