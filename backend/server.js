import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { buildContract } from './build-contract.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Compile contract endpoint
app.post('/api/compile', async (req, res) => {
  try {
    const { code, language } = req.body

    if (!code || !language) {
      return res.status(400).json({ error: 'Missing code or language' })
    }

    if (!['JavaScript', 'TypeScript', 'Rust'].includes(language)) {
      return res.status(400).json({ error: 'Unsupported language. Use JavaScript, TypeScript, or Rust' })
    }

    console.log(`Compiling ${language} contract...`)

    // For Rust, we'd need a different build process
    // For now, focusing on JS/TS with near-sdk-js
    if (language === 'Rust') {
      return res.status(501).json({
        error: 'Rust compilation not yet implemented. Please use JavaScript or TypeScript.',
      })
    }

    const wasmBuffer = await buildContract(code, language)

    // Convert buffer to base64 for sending over HTTP
    const wasmBase64 = wasmBuffer.toString('base64')

    res.json({
      success: true,
      wasm: wasmBase64,
      size: wasmBuffer.length,
    })
  } catch (error) {
    console.error('Compilation error:', error)
    res.status(500).json({
      error: 'Compilation failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📦 Compile endpoint: POST http://localhost:${PORT}/api/compile`)
})


