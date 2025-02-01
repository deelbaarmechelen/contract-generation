const setButton = document.getElementById('btn')
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

setButton.addEventListener('click', async () => {
  messageElement.innerText = 'In verwerking...'
  const lastname = lastnameInput.value
  const firstname = firstnameInput.value
  var data = {
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
  const filePath = await window.carbone.generatePdf(data)
  console.log('path: ' + filePath)
  messageElement.innerText = 'Contract aangemaakt!'
  filePathElement.innerText = filePath
})
