/**
 * ConvertAnyFile - Upload & Conversion Controller
 * Handles drag-and-drop, API file upload, execution, progress tracking, and result delivery
 */

const UploadController = {
  selectedFile: null,
  uploadedFileRecord: null,
  targetFormat: 'pdf',

  init() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const formatSelect = document.getElementById('target-format-select');
    const convertBtn = document.getElementById('convert-btn');

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
        document.getElementById('dropzone-prompt').innerText = "Release to Transform";
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        document.getElementById('dropzone-prompt').innerText = "Drop your file to transform";
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFileSelected(e.target.files[0]);
      }
    });

    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        this.targetFormat = e.target.value;
      });
    }

    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        this.executeConversion();
      });
    }
  },

  handleFileSelected(file) {
    this.selectedFile = file;
    const nameEl = document.getElementById('selected-file-name');
    const sizeEl = document.getElementById('selected-file-size');
    const panelEl = document.getElementById('file-selected-panel');
    const convertBtn = document.getElementById('convert-btn');

    if (nameEl) nameEl.innerText = file.name;
    if (sizeEl) sizeEl.innerText = (file.size / 1024).toFixed(1) + ' KB';
    if (panelEl) panelEl.style.display = 'block';
    if (convertBtn) convertBtn.disabled = false;

    // Auto-select smart target format
    const ext = file.name.split('.').pop().toLowerCase();
    const selectEl = document.getElementById('target-format-select');
    if (selectEl) {
      if (ext === 'docx' || ext === 'doc') selectEl.value = 'pdf';
      else if (ext === 'pdf') selectEl.value = 'docx';
      else if (ext === 'jpg' || ext === 'jpeg') selectEl.value = 'png';
      else if (ext === 'png') selectEl.value = 'jpg';
      else if (ext === 'csv') selectEl.value = 'json';
      else if (ext === 'json') selectEl.value = 'csv';
      this.targetFormat = selectEl.value;
    }
  },

  async executeConversion() {
    if (!this.selectedFile) return;

    const progressBox = document.getElementById('conversion-progress-box');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressStatus = document.getElementById('progress-status-text');
    const resultBox = document.getElementById('conversion-result-box');
    const convertBtn = document.getElementById('convert-btn');

    if (progressBox) progressBox.style.display = 'block';
    if (resultBox) resultBox.style.display = 'none';
    if (convertBtn) convertBtn.disabled = true;

    try {
      // 1. Upload File
      if (progressStatus) progressStatus.innerText = "Ingesting file into pipeline...";
      if (progressBar) progressBar.style.width = "30%";

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const uploadRes = await fetch('api/files/upload.php', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      this.uploadedFileRecord = uploadData.file;

      // 2. Execute Conversion
      if (progressStatus) progressStatus.innerText = `Transforming into ${this.targetFormat.toUpperCase()}...`;
      if (progressBar) progressBar.style.width = "75%";

      const convertRes = await fetch('api/files/convert.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: this.uploadedFileRecord.id,
          target_format: this.targetFormat
        })
      });
      const convertData = await convertRes.json();

      if (!convertRes.ok || !convertData.success) {
        throw new Error(convertData.error || 'Conversion failed');
      }

      if (progressBar) progressBar.style.width = "100%";
      if (progressStatus) progressStatus.innerText = "Complete!";

      setTimeout(() => {
        if (progressBox) progressBox.style.display = 'none';
        this.displayResult(convertData.conversion);
        if (typeof HistoryController !== 'undefined') {
          HistoryController.loadHistory();
        }
      }, 400);

    } catch (err) {
      if (progressBox) progressBox.style.display = 'none';
      if (convertBtn) convertBtn.disabled = false;
      alert("Error: " + err.message);
    }
  },

  displayResult(conv) {
    const resultBox = document.getElementById('conversion-result-box');
    const downloadBtn = document.getElementById('result-download-btn');
    const previewBtn = document.getElementById('result-preview-btn');
    const outputNameEl = document.getElementById('result-filename');
    const shaEl = document.getElementById('result-sha256');
    const timeEl = document.getElementById('result-time');

    if (outputNameEl) outputNameEl.innerText = conv.output_filename;
    if (shaEl) shaEl.innerText = 'SHA-256: ' + conv.sha256;
    if (timeEl) timeEl.innerText = conv.processing_seconds + 's';
    if (downloadBtn) downloadBtn.href = conv.download_url;
    if (previewBtn) {
      previewBtn.onclick = () => {
        window.open('api/files/preview.php?job=' + conv.job_id, '_blank');
      };
    }

    if (resultBox) resultBox.style.display = 'block';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UploadController.init();
});
