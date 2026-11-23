import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import "./App.css";


function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractFile, setExtractFile] = useState(null);
  const [pages, setPages] = useState("");


  function handleFileChange(e) {
    setFiles(Array.from(e.target.files));
  }

  function moveFile(index, direction) {
    const newFiles = [...files];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= files.length) return;

    [newFiles[index], newFiles[targetIndex]] = [
      newFiles[targetIndex],
      newFiles[index],
    ];

    setFiles(newFiles);
  }

  function parsePages(input) {
  const pageSet = new Set();

  input.split(",").forEach((part) => {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        pageSet.add(i - 1);
      }
    } else {
      pageSet.add(Number(part) - 1);
    }
  });

  return Array.from(pageSet);
}

  async function mergePDFs() {
    if (files.length < 2) {
      alert("Please select at least two PDFs");
      return;
    }

    setLoading(true);
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url);

    setLoading(false);
  }
  async function extractPDF() {
  if (!extractFile || !pages) {
    alert("Select PDF and enter pages");
    return;
  }

  const bytes = await extractFile.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  const pageIndices = parsePages(pages);

  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(pdf, pageIndices);

  copiedPages.forEach((page) => newPdf.addPage(page));

  const newBytes = await newPdf.save();

  const blob = new Blob([newBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  window.open(url);
}

  return (
    <div className="app">
      <div className="card">
        <h1>📄 DPL's PDF Merger</h1>
        <p className="subtitle">Reorder files, then merge</p>

        <label className="file-input">
          Select PDFs
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
          />
        </label>

        {files.length > 0 && (
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>

                <div className="actions">
                  <button
                    onClick={() => moveFile(index, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          className="merge-btn"
          onClick={mergePDFs}
          disabled={loading || files.length < 2}
        >
          {loading ? "Merging..." : "Merge PDFs"}
        </button>
      </div>
      <div className="card">
  <h2>📑 PDF Extractor</h2>

  <input
    type="file"
    accept="application/pdf"
    onChange={(e) => setExtractFile(e.target.files[0])}
  />

  <input
    type="text"
    placeholder="Pages (example: 1,3,5-7)"
    value={pages}
    onChange={(e) => setPages(e.target.value)}
  />

  <button onClick={extractPDF}>
    Extract Pages
  </button>
</div>
    </div>

    
  );
}

export default App;
