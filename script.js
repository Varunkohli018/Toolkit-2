function createImagePdf() {
  const input = document.getElementById("image-upload");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const files = input.files;

  if (!files.length) return alert("Please select image(s) first.");

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
        const imgWidth = 180;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, "JPEG", 10, 10, imgWidth, imgHeight);
        if (i < files.length) doc.addPage();
        loadImageAndAdd();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadImageAndAdd();
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
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");

  if (!preview || !status) return;

  const keys = Object.keys(localStorage).filter(key => key.endsWith(".pdf"));

  if (keys.length === 0) {
    status.innerText = "No saved PDF files yet.";
    return;
  }

  status.innerText = "Saved PDF Files:";
  const list = document.createElement("ul");

  keys.forEach(key => {
    const li = document.createElement("li");
    li.textContent = key;

    const open = document.createElement("button");
    open.textContent = "Open";
    open.onclick = () => window.open(localStorage.getItem(key));

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = () => {
      localStorage.removeItem(key);
      loadMyFiles();
    };

    const share = document.createElement("button");
    share.textContent = "Share";
    share.onclick = () => {
      if (navigator.share) {
        navigator.share({ title: key, url: localStorage.getItem(key) });
      } else {
        alert("Sharing not supported on this device.");
      }
    };

    li.append(" ", open, " ", share, " ", del);
    list.appendChild(li);
  });

  preview.appendChild(list);
}

window.onload = loadMyFiles;

// Dummy menu functions
function viewPDFFiles() {
  alert("This will show all your saved PDFs below.");
  loadMyFiles();
}
function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: "Image to PDF Converter",
      text: "Try this free tool to convert images to PDF!",
      url: window.location.href,
    });
  } else {
    alert("Sharing not supported on your device.");
  }
}
function leaveFeedback() {
  alert("Thanks for your feedback!");
}
function privacyPolicy() {
  alert("No data is collected. This app works entirely offline.");
}
