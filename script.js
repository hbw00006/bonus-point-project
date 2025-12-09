// script.js — handles generating and downloading QR codes
const input = document.getElementById('urlInput');
const generateBtn = document.getElementById('generateBtn');
const msg = document.getElementById('msg');
const output = document.getElementById('output');
const qrImage = document.getElementById('qrImage');
const downloadBtn = document.getElementById('downloadBtn');
const copyDataBtn = document.getElementById('copyDataBtn');

function setMessage(text, isError = false) {
  msg.textContent = text;
  msg.style.color = isError ? '#a50' : '#2a6';
}

function isProbablyUrl(s) {
  if (!s) return false;
  try {
    // If no scheme, the URL constructor treats it as invalid — attempt to normalize
    const withScheme = s.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) ? s : 'https://' + s;
    new URL(withScheme);
    return true;
  } catch (e) {
    return false;
  }
}

async function generate() {
  const raw = input.value.trim();
  if (!raw) {
    setMessage('Please enter a URL to encode.', true);
    output.hidden = true;
    return;
  }
  if (!isProbablyUrl(raw)) {
    setMessage('That doesn’t look like a valid URL. Try including "https://".', true);
    output.hidden = true;
    return;
  }

  // Ensure a scheme; prefer https if missing
  const fixed = raw.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) ? raw : 'https://' + raw;

  setMessage('Generating QR code...');
  output.hidden = false;
  try {
    // Use the QRCode library included in index.html (qrcode.min.js)
    // toDataURL returns a PNG data URL by default.
    const dataUrl = await QRCode.toDataURL(fixed, { width: 512, margin: 2 });
    qrImage.src = dataUrl;
    downloadBtn.href = dataUrl;
    downloadBtn.download = 'qrcode.png';
    setMessage('QR code generated. Scan it with your phone or click Download to save the PNG.');
  } catch (err) {
    console.error(err);
    setMessage('Failed to generate QR code: ' + (err && err.message ? err.message : err), true);
    output.hidden = true;
  }
}

generateBtn.addEventListener('click', generate);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate();
});

copyDataBtn.addEventListener('click', async () => {
  if (!qrImage.src) return;
  try {
    await navigator.clipboard.writeText(qrImage.src);
    setMessage('Data URL copied to clipboard.');
  } catch (err) {
    setMessage('Could not copy data URL: ' + err, true);
  }
});
