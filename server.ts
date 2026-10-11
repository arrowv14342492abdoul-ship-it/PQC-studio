import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Default cryptographic system instruction matching NIST & FIPS requirements
const DEFAULT_SYSTEM_INSTRUCTION =
  "You are a cleared Senior Cryptography Engineer specializing in Post-Quantum " +
  "Cryptography (PQC). Your objective is to build infrastructure resilient to quantum " +
  "computers. " +
  "Strict rules: NEVER invent or roll your own cryptographic mathematics. " +
  "Only implement NIST-standardized algorithms (e.g., FIPS 203 ML-KEM, FIPS 204 ML-DSA) " +
  "by integrating established, peer-reviewed libraries like liboqs or hybrid TLS wrappers. " +
  "Prioritize hybrid cryptography (combining classical algorithms like X25519 with PQC) " +
  "to ensure safety against both classical and quantum threats.";

// API: Generate PQC cryptographic module or analysis (SSE streaming)
app.post('/api/pqc/generate-stream', async (req, res) => {
  const {
    prompt,
    systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    temperature = 0.0,
    model = 'gemini-3.8-flash',
  } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check your environment variables.',
    });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model || 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.0,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error during Gemini generation stream:', error);
    res.write(
      `data: ${JSON.stringify({ error: error?.message || 'Failed to generate cryptographic module' })}\n\n`
    );
    res.end();
  }
});

// API: Unary generate
app.post('/api/pqc/generate', async (req, res) => {
  const {
    prompt,
    systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    temperature = 0.0,
    model = 'gemini-3.8-flash',
  } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: model || 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: typeof temperature === 'number' ? temperature : 0.0,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error during Gemini generation:', error);
    res.status(500).json({
      error: error?.message || 'Cryptographic agent generation failed',
    });
  }
});

// API: Real Cryptographic Hybrid KEM Simulation Engine
// Performs real ECDH X25519 + simulated FIPS 203 ML-KEM-768 encapsulation & HKDF combiner
app.post('/api/pqc/simulate-handshake', (req, res) => {
  try {
    const {
      kemAlgorithm = 'X25519+ML-KEM-768',
      context = 'PQC-Hybrid-KEM-v1',
    } = req.body;

    const startTime = process.hrtime.bigint();

    // 1. Classical Key Pair (X25519)
    const aliceClassical = crypto.generateKeyPairSync('x25519');
    const aliceClassicalPub = aliceClassical.publicKey.export({ type: 'spki', format: 'der' });
    const aliceClassicalRawPub = aliceClassicalPub.subarray(aliceClassicalPub.length - 32);

    // 2. Quantum PQC Key Pair (ML-KEM-768 / Kyber768 standard sizes: PK=1184 bytes, SK=2400 bytes)
    // We generate cryptographically secure random bytes following FIPS 203 parameters for simulation
    const mlkem768PkBytes = crypto.randomBytes(1184);
    const mlkem768SkBytes = crypto.randomBytes(2400);

    // Combined Alice Public Key: pk_classic (32 bytes) || pk_pqc (1184 bytes) = 1216 bytes
    const aliceCombinedPk = Buffer.concat([aliceClassicalRawPub, mlkem768PkBytes]);

    // 3. Bob Encapsulation:
    // Bob generates ephemeral X25519
    const bobClassical = crypto.generateKeyPairSync('x25519');
    const bobClassicalPub = bobClassical.publicKey.export({ type: 'spki', format: 'der' });
    const bobClassicalRawPub = bobClassicalPub.subarray(bobClassicalPub.length - 32);

    // Bob computes classical ECDH shared secret with Alice's classical public key
    const bobClassicalShared = crypto.diffieHellman({
      privateKey: bobClassical.privateKey,
      publicKey: aliceClassical.publicKey,
    });

    // Bob encapsulates ML-KEM-768: Ciphertext is 1088 bytes, Shared Secret is 32 bytes
    const mlkem768Ciphertext = crypto.randomBytes(1088);
    const mlkem768SharedSecret = crypto.randomBytes(32);

    // Combined Ciphertext: ct_classic (32 bytes) || ct_pqc (1088 bytes) = 1120 bytes
    const bobCombinedCiphertext = Buffer.concat([bobClassicalRawPub, mlkem768Ciphertext]);

    // Bob derives final hybrid master key via HKDF (RFC 5869)
    // IKM = ss_classical (32B) || ss_pqc (32B) = 64 bytes
    const ikm = Buffer.concat([bobClassicalShared, mlkem768SharedSecret]);
    const salt = Buffer.alloc(32, 0); // Standard salt or zero-salt
    const info = Buffer.from(context, 'utf8');

    const bobMasterKey = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, info, 32));

    // 4. Alice Decapsulation:
    // Alice reconstructs Bob's public key from ciphertext
    // Re-creates Bob public key object
    const bobSpkiHeader = aliceClassicalPub.subarray(0, aliceClassicalPub.length - 32);
    const bobSpkiDer = Buffer.concat([bobSpkiHeader, bobClassicalRawPub]);
    const bobPubKeyObj = crypto.createPublicKey({
      key: bobSpkiDer,
      format: 'der',
      type: 'spki',
    });

    const aliceClassicalShared = crypto.diffieHellman({
      privateKey: aliceClassical.privateKey,
      publicKey: bobPubKeyObj,
    });

    // Alice decapsulates ML-KEM-768 (in simulation, Alice recovers mlkem768SharedSecret)
    const aliceRecoveredPqcShared = Buffer.from(mlkem768SharedSecret);

    // Alice computes HKDF
    const aliceIkm = Buffer.concat([aliceClassicalShared, aliceRecoveredPqcShared]);
    const aliceMasterKey = Buffer.from(crypto.hkdfSync('sha256', aliceIkm, salt, info, 32));

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    const matched = bobMasterKey.equals(aliceMasterKey);

    res.json({
      success: true,
      matched,
      algorithm: kemAlgorithm,
      durationMs: Number(durationMs.toFixed(3)),
      artifacts: {
        alice: {
          classicalPubHex: aliceClassicalRawPub.toString('hex'),
          classicalPubLen: aliceClassicalRawPub.length,
          pqcPubPreviewHex: mlkem768PkBytes.subarray(0, 32).toString('hex') + '...',
          pqcPubLen: mlkem768PkBytes.length,
          combinedPubLen: aliceCombinedPk.length,
        },
        bob: {
          ephemeralPubHex: bobClassicalRawPub.toString('hex'),
          ephemeralPubLen: bobClassicalRawPub.length,
          pqcCiphertextPreviewHex: mlkem768Ciphertext.subarray(0, 32).toString('hex') + '...',
          pqcCiphertextLen: mlkem768Ciphertext.length,
          combinedCiphertextLen: bobCombinedCiphertext.length,
          classicalSharedHex: bobClassicalShared.toString('hex'),
          pqcSharedHex: mlkem768SharedSecret.toString('hex'),
          derivedMasterKeyHex: Buffer.from(bobMasterKey).toString('hex'),
        },
        decapsulation: {
          aliceClassicalSharedHex: aliceClassicalShared.toString('hex'),
          alicePqcSharedHex: aliceRecoveredPqcShared.toString('hex'),
          aliceDerivedMasterKeyHex: Buffer.from(aliceMasterKey).toString('hex'),
          keyMatches: matched,
        },
        metrics: {
          classicalSecurityBits: 128,
          postQuantumCategory: 'NIST Level 3 (AES-192 equivalent)',
          pqcStandard: 'FIPS 203 (ML-KEM-768)',
          classicalStandard: 'RFC 7748 (X25519)',
          kdf: 'HKDF-SHA256 (RFC 5869)',
          totalPublicTransmissionBytes: aliceCombinedPk.length + bobCombinedCiphertext.length,
        },
      },
    });
  } catch (err: any) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message || 'Simulation execution failed' });
  }
});

// Vite server in dev, static files in prod
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PQC Workbench server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
