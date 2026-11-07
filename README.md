# GuestPass 📶

A WiFi QR Code generator that creates a printable "Guest Card" for visitors.

## Tech Stack
- **Backend:** TypeScript executed directly with Node.js 22 (`--experimental-strip-types`, zero build step / no `tsc`) and Express.
- **Frontend:** Single `index.html` served from `/public` with modern Glassmorphism UI.
- **Styling:** Tailwind CSS via CDN.
- **Deployment:** Docker (`node:22-alpine`).

## Features
- ✨ **Glassmorphism Design:** Beautiful frosted-glass UI with a blue and white aesthetic.
- 🔒 **In-Memory QR Generation:** Generated purely in memory (buffer) via `qrcode` and returned as Base64. No images are ever saved to disk.
- 🖨️ **Printable Guest Card:** Features dedicated `@media print` styling to isolate and print only the guest pass on standard paper or cards.
- 🛡️ **Validation:** If the network name (SSID) is empty, a prominent error message is displayed and QR code generation is halted.
- 📱 **Fast Connection:** Scan the QR code with any modern iOS or Android camera to join WiFi instantly.

## Running Locally

```bash
# Install dependencies
npm install

# Start the server (Node 22+ native type stripping)
npm start
# or directly:
node --experimental-strip-types server.ts
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Running with Docker

```bash
# Build the Docker image
docker build -t guestpass .

# Run the container (default port 8080)
docker run -p 8080:8080 guestpass
```
