(function () {
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const sizeRange = document.getElementById('sizeRange');
    const sizeLabel = document.getElementById('sizeLabel');
    const eccSelect = document.getElementById('eccSelect');
    const fgColor = document.getElementById('fgColor');
    const bgColor = document.getElementById('bgColor');
    const formatSelect = document.getElementById('formatSelect');
    const autoGen = document.getElementById('autoGen');
    const generateBtn = document.getElementById('generateBtn');
    const status = document.getElementById('status');

    const svgContainer = document.getElementById('svgContainer');
    const pngPreview = document.getElementById('pngPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyDataUrlBtn = document.getElementById('copyDataUrlBtn');

    function setStatus(msg, isError = false) {
      status.textContent = msg;
      status.style.color = isError ? '#a50' : '#2a6';
    }

    function isEmptyText(s) {
      return !s || s.trim().length === 0;
    }

    sizeRange.addEventListener('input', () => {
      sizeLabel.textContent = sizeRange.value;
      if (autoGen.checked) debouncedGenerate();
    });

    [eccSelect, fgColor, bgColor, formatSelect].forEach(el => {
      el.addEventListener('change', () => { if (autoGen.checked) debouncedGenerate(); });
    });

    const debouncedGenerate = debounce(generate, 500);

    textInput.addEventListener('input', () => {
      if (autoGen.checked) debouncedGenerate();
    });

    if (typeof QRCode === 'undefined') {
      setStatus('QR library not loaded. Check network or serve via HTTP. See DevTools console for details.', true);
      generateBtn.disabled = true;
      console.error('QRCode is undefined. qrcode.min.js may not have loaded.');
      return;
    }

    async function generate() {
      const text = textInput.value.trim();
      if (isEmptyText(text)) {
        setStatus('Enter some text or URL to generate a QR code.', true);
        svgContainer.innerHTML = '';
        pngPreview.src = '';
        downloadBtn.removeAttribute('href');
        return;
      }

      const size = parseInt(sizeRange.value, 10) || 512;
      const ecc = eccSelect.value || 'M';
      const dark = fgColor.value || '#111111';
      const light = bgColor.value || '#ffffff';
      const format = formatSelect.value || 'png';

      setStatus('Generating...');
      try {
        if (format === 'svg') {
          const svgString = await new Promise((resolve, reject) => {
            try {
              QRCode.toString(text, { type: 'svg', errorCorrectionLevel: ecc, color: { dark, light } }, (err, str) => {
                if (err) return reject(err);
                resolve(str);
              });
            } catch (err) { reject(err); }
          });

          svgContainer.innerHTML = svgString;
          svgContainer.style.display = '';
          pngPreview.style.display = 'none';
          const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
          downloadBtn.href = svgDataUrl;
          downloadBtn.download = 'qrcode.svg';
          copyBtn.onclick = async () => {
            try { await navigator.clipboard.writeText(svgString); setStatus('SVG markup copied to clipboard.'); }
            catch (err) { setStatus('Copy failed: ' + err, true); }
          };
          copyDataUrlBtn.onclick = async () => {
            try { await navigator.clipboard.writeText(svgDataUrl); setStatus('SVG data URL copied to clipboard.'); }
            catch (err) { setStatus('Copy failed: ' + err, true); }
          };
        } else {
          const dataUrl = await QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: ecc, color: { dark, light } });
          pngPreview.src = dataUrl;
          pngPreview.style.display = '';
          svgContainer.innerHTML = '';
          svgContainer.style.display = 'none';

          downloadBtn.href = dataUrl;
          downloadBtn.download = 'qrcode.png';

          copyBtn.onclick = async () => {
            try {
              const res = await fetch(dataUrl);
              const blob = await res.blob();
              try {
                await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                setStatus('PNG image copied to clipboard.');
              } catch (err) {
                await navigator.clipboard.writeText(dataUrl);
                setStatus('Image data URL copied to clipboard (fallback).');
              }
            } catch (err) { setStatus('Copy failed: ' + err, true); }
          };

          copyDataUrlBtn.onclick = async () => {
            try { await navigator.clipboard.writeText(dataUrl); setStatus('PNG data URL copied to clipboard.'); }
            catch (err) { setStatus('Copy failed: ' + err, true); }
          };
        }

        setStatus('QR code generated.');
        console.log('QR generated; format=', format);
      } catch (err) {
        console.error('Generation error:', err);
        setStatus('Failed to generate QR: ' + (err && err.message ? err.message : err), true);
      }
    }

    generateBtn.addEventListener('click', generate);
    textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { generate(); } });

    if (autoGen.checked && !isEmptyText(textInput.value)) { debouncedGenerate(); }
  });
})();
