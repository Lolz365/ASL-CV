# 🤟 ASL-CV

**Real-time American Sign Language recognition — 100% client-side.**

Built with Next.js, MediaPipe Hands, and TensorFlow.js. No server calls during inference. Works in any modern browser with a webcam.

---

## 🚀 Live Demo

Deploy to GitHub Pages using the included workflow. See [Deployment](#deployment) below.

---

## 🛠️ Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (static export) |
| Styling | Tailwind CSS |
| Hand Tracking | MediaPipe Hands |
| ML Inference | TensorFlow.js (WebGL backend) |
| Speech | Web Speech API |

---

## 📂 Project Structure

```
asl-cv/
├── hooks/
│   ├── useAslRecognizer.ts   # Full ML pipeline hook
│   └── useTTS.ts              # Web Speech API wrapper
├── components/
│   ├── CameraView.tsx         # Video + canvas overlay
│   ├── TranslationBanner.tsx  # Live + confirmed letter UI
│   ├── SettingsPanel.tsx      # TTS toggle + info
│   ├── LoadingScreen.tsx      # Staged loading UI
│   └── ErrorScreen.tsx        # Error + camera permission guide
├── pages/
│   ├── _app.tsx
│   └── index.tsx              # Main page (assembles everything)
├── public/
│   └── model/                 # ← Put your model weights here
│       ├── model.json
│       └── group1-shard1of1.bin
├── styles/
│   └── globals.css
└── types/
    └── asl.ts
```

---

## 🤖 Model Setup (`/public/model/`)

This app expects a **TensorFlow.js LayersModel** exported from a Keras model.

### Input shape
```
[1, 63]  →  21 landmarks × 3 (x, y, z)
```

### Output shape
```
[1, 29]  →  softmax probabilities for 29 classes
         (A–Z + del + nothing + space)
```

### Export from Python
```python
import tensorflowjs as tfjs

# keras_model is your trained tf.keras.Model
tfjs.converters.save_keras_model(keras_model, 'public/model')
```

This generates:
- `public/model/model.json`
- `public/model/group1-shard1of1.bin` (name may vary)

> **Label order:** The `ASL_LABELS` array in `hooks/useAslRecognizer.ts` must match the class order your model was trained on.

### Recommended training dataset
- [ASL Alphabet Dataset (Kaggle)](https://www.kaggle.com/datasets/grassknoted/asl-alphabet)
- Extract MediaPipe landmarks from training images, train a dense MLP or LSTM on the 63-float vectors.

---

## 💻 Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
# Allow camera access when prompted
```

> MediaPipe WASM files are loaded from jsDelivr CDN at runtime. Internet connection required on first load.

---

## 🏠 Deployment

### GitHub Pages (automatic)

The included `.github/workflows/deploy.yml` auto-deploys on every push to `main`.

1. Go to your repo **Settings → Pages**
2. Set Source to **GitHub Actions**
3. Push to `main` — the site builds and deploys automatically

### Manual static export
```bash
npm run build
# Output is in /out — deploy to any static host (Vercel, Netlify, Cloudflare Pages)
```

---

## ⚡ Recognition Logic

1. MediaPipe detects 21 hand landmarks at ~30 FPS
2. Landmarks are flattened to a `[1, 63]` tensor
3. TFJS model predicts probabilities for each ASL class
4. **Debouncing:** A letter is confirmed only after **10 consecutive frames** all predict the same letter with **>80% confidence**
5. Confirmed letters append to a word buffer; `space` gesture adds a space; `del` gesture backtracks
6. Web Speech API reads each confirmed letter aloud (toggleable)

---

## 📄 License

MIT
