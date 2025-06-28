// script.js

function goHome() {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById("homePage").classList.remove("hidden");
}

function navigateTo(pageId) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById(pageId + "Page").classList.remove("hidden");
}

function createTextPdf() {
  const text = document.getElementById("pdfText").value;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(text, 10, 10);
  doc.save("text.pdf");
  saveFile("text.pdf", doc.output("blob"));
}

function createImagePdf() {
  const input = document.getElementById("imageInput");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const files = input.files;
  if (!files.length) return alert("Select image(s) first");
  const reader = new FileReader();
  let i = 0;

  function loadImageAndAdd() {
    if (i >= files.length) {
      doc.save("images.pdf");
      saveFile("images.pdf", doc.output("blob"));
      return;
    }
    const file = files[i++];
    reader.onload = function (e) {
      const img = new Image();
      img.onload = () => {
        doc.addImage(img, "JPEG", 10, 10, 180, 160);
        if (i < files.length) doc.addPage();
        loadImageAndAdd();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadImageAndAdd();
}

async function mergeFiles() {
  const input = document.getElementById("mergeInput");
  if (!input.files.length) return alert("Select PDF files first");
  const mergedPdf = await PDFLib.PDFDocument.create();

  for (let file of input.files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(p => mergedPdf.addPage(p));
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes], { type: "application/pdf" });
  const name = "merged.pdf";
  saveFile(name, blob);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

async function editPdf() {
  const fileInput = document.getElementById("editPdfInput");
  const text = document.getElementById("editText").value;
  if (!fileInput.files.length) return alert("Upload a PDF first");

  const bytes = await fileInput.files[0].arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(bytes);
  const page = pdfDoc.getPage(0);
  page.drawText(text, { x: 50, y: 500, size: 16 });
  const newPdf = await pdfDoc.save();
  const blob = new Blob([newPdf], { type: "application/pdf" });
  saveFile("edited.pdf", blob);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "edited.pdf";
  link.click();
}

function createReceiptPdf() {
  const name = document.getElementById("r_name").value;
  const item = document.getElementById("r_item").value;
  const qty = document.getElementById("r_qty").value;
  const price = document.getElementById("r_price").value;
  const date = document.getElementById("r_date").value;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Date: ${date}`, 10, 10);
  doc.text(`Name: ${name}`, 10, 20);
  doc.text(`Item: ${item}`, 10, 30);
  doc.text(`Qty: ${qty}`, 10, 40);
  doc.text(`Price: ₹${price}`, 10, 50);
  doc.text(`Total: ₹${qty * price}`, 10, 60);
  doc.save("receipt.pdf");
  saveFile("receipt.pdf", doc.output("blob"));
}

function saveFile(filename, blob) {
  const reader = new FileReader();
  reader.onload = function () {
    localStorage.setItem(filename, reader.result);
    loadMyFiles();
  };
  reader.readAsDataURL(blob);
}

function loadMyFiles() {
  const fileList = document.getElementById("fileList");
  if (!fileList) return;
  fileList.innerHTML = "";
  Object.keys(localStorage).forEach(key => {
    if (key.endsWith(".pdf")) {
      const li = document.createElement("li");
      li.textContent = key;
      const open = document.createElement("button");
      open.textContent = "Open";
      open.onclick = () => window.open(localStorage.getItem(key));
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.onclick = () => { localStorage.removeItem(key); loadMyFiles(); };
      const share = document.createElement("button");
      share.textContent = "Share";
      share.onclick = () => navigator.share?.({ title: key, url: localStorage.getItem(key) });
      li.append(open, share, del);
      fileList.appendChild(li);
    }
  });
}

function privacyPolicy() {
  alert("This app works offline and stores files only on your device.");
}

function leaveFeedback() {
  alert("Thanks for your feedback!");
}

window.onload = loadMyFiles;
