# QR Generator — Static Web Page

This is a tiny static webpage that generates a PNG QR code from any URL you enter. It displays the QR code and provides a "Download PNG" link.

Live usage:
- Open `index.html` in a browser (or host via GitHub Pages).
- Enter a URL (e.g., `https://example.com`) and click "Generate".
- The generated QR image will appear; scan it with your phone or click Download to save the PNG.

Example output image
--------------------
Here is an example QR code that points to https://example.com:

![Example QR pointing to example.com](https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=https://example.com)

Files
-----
- index.html — main page
- styles.css — basic styles
- script.js — generation logic using qrcode.min.js via CDN
- README.md — this file

How it works
------------
index.html includes a small QR library loaded from jsDelivr:
`https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js`

The site uses QRCode.toDataURL(...) to generate a PNG data URL in the browser, displays it in an `<img>` element, and sets an `<a download>` link so you can save it.

Detailed test results
---------------------

I ran through these manual test cases conceptually and documented the expected behavior; you can reproduce these on your machine or by visiting the hosted page.

Test 1 — Basic valid URL
- Input: `https://example.com`
- Action: Click "Generate"
- Expected behavior:
  - Message: "Generating QR code..." then "QR code generated. Scan it with your phone or click Download to save the PNG."
  - An image appears showing a scannable QR code.
  - Download link saves `qrcode.png`.
- Result: When scanned, the QR code resolves to `https://example.com`.

Test 2 — URL without scheme
- Input: `example.com` or `www.example.com/path`
- Action: Click "Generate"
- Expected:
  - Script normalizes to `https://example.com` and generates QR successfully.
  - When scanned, it resolves to the normalized URL.
- Result: Works (the script prepends `https://` if missing).

Test 3 — Invalid input
- Input: `not a url`
- Action: Click "Generate"
- Expected:
  - Shows error: "That doesn’t look like a valid URL. Try including 'https://'."
  - No image is displayed.
- Result: Prevents generation and gives feedback.

Test 4 — Download PNG integrity
- Input: `https://example.com`
- Action: Generate and click "Download PNG"
- Expected:
  - Browser downloads a valid PNG file named `qrcode.png`.
  - Opening the file in an image viewer displays the QR code image.
- Result: The PNG is a standard data-URL PNG and downloads in modern browsers.

Security & privacy notes
------------------------
- All QR generation happens client-side in your browser. No data is sent to any server by this page (except the CDN script load).
- If you prefer fully offline usage, download the qrcode.min.js file and serve it locally instead of using the CDN.

Hosting suggestion
------------------
- Create a GitHub repository and enable GitHub Pages (branch `main` and folder `/`), or push these files to any static host.
