// ═══════════════════════════════════
// QR CODE SCANNER
// ═══════════════════════════════════

let cameraStream     = null;
let cameraAnimFrame  = null;

// ── Helpers ──

function showQRError(msg) {
  const el = document.getElementById('qrError');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideQRError() {
  const el = document.getElementById('qrError');
  if (el) el.classList.add('hidden');
}

function resetQRDecoded() {
  const decoded  = document.getElementById('qrDecoded');
  const preview  = document.getElementById('qrPreview');
  if (decoded) decoded.classList.add('hidden');
  if (preview) { preview.src = ''; preview.classList.add('hidden'); }
}

// ── Core decode ──

function decodeQRFromImageData(imageData, width, height) {
  if (typeof jsQR === 'undefined') {
    showQRError('QR library not loaded. Check your internet connection and reload.');
    return null;
  }
  return jsQR(imageData, width, height);
}

function processQRResult(data) {
  hideQRError();
  const decoded  = document.getElementById('qrDecoded');
  const urlEl    = document.getElementById('qrDecodedUrl');
  const inputEl  = document.getElementById('urlInput');

  if (!data) {
    showQRError('No QR code detected. Try a clearer or higher-resolution image.');
    if (decoded) decoded.classList.add('hidden');
    return;
  }

  if (urlEl)   urlEl.textContent = data;
  if (decoded) decoded.classList.remove('hidden');

  // Auto-fill the URL input if it looks like a URL
  if (inputEl && (data.startsWith('http://') || data.startsWith('https://'))) {
    inputEl.value = data;
  }
}

function decodeQRFromImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = decodeQRFromImageData(imageData.data, canvas.width, canvas.height);
  processQRResult(code ? code.data : null);
}

// ── File upload ──

function handleQRFileInput(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showQRError('Please upload a valid image file (PNG, JPG, GIF, WebP).');
    return;
  }

  hideQRError();
  resetQRDecoded();

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById('qrPreview');
    if (preview) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    }

    const img   = new Image();
    img.onload  = () => decodeQRFromImage(img);
    img.onerror = () => showQRError('Could not load image. Please try a different file.');
    img.src     = e.target.result;
  };
  reader.readAsDataURL(file);

  // Reset so the same file can be re-selected
  event.target.value = '';
}

// ── Drag and drop ──

function handleQRDragOver(event) {
  event.preventDefault();
  const zone = document.getElementById('qrDropZone');
  if (zone) zone.classList.add('drag-over');
}

function handleQRDragLeave(event) {
  const zone = document.getElementById('qrDropZone');
  if (zone) zone.classList.remove('drag-over');
}

function handleQRDrop(event) {
  event.preventDefault();
  const zone = document.getElementById('qrDropZone');
  if (zone) zone.classList.remove('drag-over');

  const file = event.dataTransfer.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showQRError('Please drop a valid image file (PNG, JPG, GIF, WebP).');
    return;
  }

  // Reuse file handler via fake event object
  handleQRFileInput({ target: { files: [file], value: '' } });
}

// ── Scan extracted URL ──

function scanExtractedQRUrl() {
  const urlEl  = document.getElementById('qrDecodedUrl');
  const inputEl = document.getElementById('urlInput');
  if (!urlEl) return;

  const url = urlEl.textContent.trim();
  if (!url) return;

  if (inputEl) inputEl.value = url;
  checkSecurity();

  // Scroll result into view
  setTimeout(() => {
    const result = document.getElementById('result');
    if (result) result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// ── Camera ──

function toggleCamera() {
  if (cameraStream) {
    stopCamera();
  } else {
    startCamera();
  }
}

async function startCamera() {
  hideQRError();
  resetQRDecoded();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showQRError('Camera not supported in this browser. Please upload an image instead.');
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });

    const video   = document.getElementById('cameraFeed');
    const section = document.getElementById('cameraSection');
    const btn     = document.getElementById('cameraBtn');

    if (video)   { video.srcObject = cameraStream; }
    if (section) section.classList.remove('hidden');
    if (btn)     btn.textContent = 'Stop camera';

    scanCameraFrame();

  } catch (err) {
    cameraStream = null;
    if (err.name === 'NotAllowedError') {
      showQRError('Camera permission denied. Please allow camera access or upload an image instead.');
    } else {
      showQRError('Camera unavailable. Please upload a QR code image instead.');
    }
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  if (cameraAnimFrame) {
    cancelAnimationFrame(cameraAnimFrame);
    cameraAnimFrame = null;
  }

  const section = document.getElementById('cameraSection');
  const btn     = document.getElementById('cameraBtn');
  const video   = document.getElementById('cameraFeed');

  if (section) section.classList.add('hidden');
  if (video)   video.srcObject = null;
  if (btn) {
    btn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      Use camera`;
  }
}

function scanCameraFrame() {
  const video  = document.getElementById('cameraFeed');
  const canvas = document.getElementById('cameraCanvas');
  if (!video || !canvas || !cameraStream) return;

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = decodeQRFromImageData(imageData.data, canvas.width, canvas.height);

    if (code) {
      stopCamera();
      processQRResult(code.data);
      return; // QR found — stop scanning
    }
  }

  cameraAnimFrame = requestAnimationFrame(scanCameraFrame);
}