
import { PDFDocument, PageSizes, StandardFonts } from 'pdf-lib'

let returnAddress = localStorage.getItem('returnAddress')
let envelopeSize = localStorage.getItem('envelopeSize')

const make = async (address) => {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.embedFont(StandardFonts.Helvetica)
  let font = pdfDoc.fonts.find(f => f.name === 'Helvetica')
  let [h, w] = PageSizes[document.querySelector('select').value]
  const page = pdfDoc.addPage([w, h])
  let fontSize = Math.ceil(h * .033)
  page.drawText(address, { x: 0.408 * w, y: 0.479 * h, size: fontSize, lineHeight: fontSize + 2, font })
  if (returnAddress?.length > '') {
    page.drawText(returnAddress, { x: 0.06 * w, y: 0.931 * h, size: fontSize, lineHeight: fontSize + 2, font })
  }
  const pdfBytes = await pdfDoc.save()
  let blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

const generateLink = async (text) => {
  let url = await make(text.split('\n').slice(0,3).join('\n'))
  let li = document.createElement('li')
  let anchor = document.createElement('a')
  anchor.setAttribute('href', url)
  anchor.setAttribute('target', '_blank')
  anchor.classList.add('envelope')
  anchor.textContent = text
  li.appendChild(anchor)
  document.querySelector('ul').appendChild(li)
}

window.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
})

window.addEventListener('drop', async (e) => {
  e.preventDefault()
  e.stopImmediatePropagation()
  e.stopPropagation()
  let text = e.dataTransfer.getData('text/plain')
  generateLink(text)
})

document.addEventListener('DOMContentLoaded', (e) => {
  if (returnAddress) {
    document.querySelector('textarea#home').value = returnAddress
  }
  document.querySelector('textarea#home')?.addEventListener('change', (e) => {
    returnAddress = e.target.value.split('\n').slice(0,3).join('\n')
    localStorage.setItem('returnAddress', returnAddress)
  })
  document.querySelector('select')?.addEventListener('change', (e) => {
    envelopeSize = e.target.value
    localStorage.setItem('envelopeSize', envelopeSize)
  })
  let select = document.querySelector('select')
  for (let key in PageSizes) {
    let opt = document.createElement('option')
    opt.value = key
    opt.textContent = `${key} (${PageSizes[key][0]}x${PageSizes[key][1]})`
    select.appendChild(opt)
  }
  if (envelopeSize) {
    document.querySelector('select').value = envelopeSize
  }
  document.querySelector('button').addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    let text = e.target.form.querySelector('textarea').value
    if (text?.length > 0) {
      generateLink(text)
    }
  })
})
