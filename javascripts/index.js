
import { PDFDocument, PageSizes, StandardFonts } from 'pdf-lib'

let returnAddress = localStorage.getItem('returnAddress')
let envelopeSize = localStorage.getItem('envelopeSize')

const make = async (address) => {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.embedFont(StandardFonts.Helvetica)
  let font = pdfDoc.fonts.find(f => f.name === 'Helvetica')
  let [h, w] = PageSizes[document.querySelector('select').value]
  const page = pdfDoc.addPage([w, h])
  page.drawText(address, { x: 200, y: 170, size: 12, lineHeight: 14, font })
  page.drawText(returnAddress, { x: 30, y: 330, size: 12, lineHeight: 14, font })
  const pdfBytes = await pdfDoc.save()
  let blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
  // window.open(url, '_blank');
}

const generateLink = async (text) => {
  let url = await make(text.split('\n').slice(0,3).join('\n'))
  let anchor = document.createElement('a')
  anchor.setAttribute('href', url)
  anchor.setAttribute('target', '_blank')
  anchor.classList.add('envelope')
  anchor.textContent = text
  document.querySelector('ul').appendChild(anchor)
}

window.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
})

window.addEventListener('drop', async (e) => {
  e.preventDefault()
  e.stopImmediatePropagation()
  e.stopPropagation()
  generate(text)
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
  document.querySelector('textarea#destination')?.addEventListener('paste', (e) => {
    let text = e.clipboardData.getData('text/plain')
    // replace value
    e.target.value = text
  })
  document.querySelector('button').addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    generateLink(e.target.form.querySelector('textarea').value)
  })
})
