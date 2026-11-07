import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware for parsing JSON and urlencoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public folder
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Escapes special characters for the standard Wi-Fi QR code syntax (ZXing format):
 * Characters '\', ';', ',', ':', and '"' must be escaped with a backslash.
 */
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'GuestPass' });
});

/**
 * POST /api/generate-qr
 * Generates a WiFi QR code entirely in memory and returns it as a Base64 string.
 * CRITICAL: Does NOT save any image to disk.
 */
app.post('/api/generate-qr', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ssid, password = '', encryption = 'WPA', hidden = false } = req.body;

    // Requirement: If network name is empty, show an error message instead of a QR code
    if (!ssid || typeof ssid !== 'string' || ssid.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Network name (SSID) cannot be empty. Please enter your WiFi network name.',
      });
      return;
    }

    const trimmedSsid = ssid.trim();
    const validEncryption = ['WPA', 'WEP', 'nopass'].includes(encryption)
      ? encryption
      : 'WPA';

    // Standard Wi-Fi QR Code string format:
    // WIFI:T:<WPA|WEP|nopass>;S:<SSID>;P:<Password>;H:<true|false>;;
    let wifiPayload = `WIFI:T:${validEncryption};S:${escapeWifiString(trimmedSsid)};`;

    if (validEncryption !== 'nopass' && password) {
      wifiPayload += `P:${escapeWifiString(password)};`;
    }

    if (Boolean(hidden)) {
      wifiPayload += 'H:true;';
    }

    wifiPayload += ';';

    // Generate QR code in memory as a PNG Buffer
    // Memory-only generation - nothing is written to the filesystem
    const qrBuffer: Buffer = await QRCode.toBuffer(wifiPayload, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: {
        dark: '#1e3a8a', // Deep royal blue (Tailwind blue-900)
        light: '#ffffff', // Crisp white background
      },
    });

    // Convert in-memory buffer to base64 string
    const base64Data = qrBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Data}`;

    res.json({
      success: true,
      qrCode: dataUrl,
      base64: base64Data,
      details: {
        ssid: trimmedSsid,
        password: password,
        encryption: validEncryption,
        hidden: Boolean(hidden),
      },
    });
  } catch (error) {
    console.error('Error generating QR code in memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate WiFi QR code in memory. Please try again.',
    });
  }
});

// Fallback to index.html for root path
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GuestPass server listening on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});
