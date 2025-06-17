# 🌱 Sustainability Companion Extension

A Chrome extension that evaluates the sustainability practices of websites using AI analysis.

## ✨ Features

- **AI-Powered Analysis**: Uses OpenAI's GPT-3.5 to evaluate website sustainability
- **Visual Scoring**: Color-coded score bar (1-100 scale)
- **Detailed Explanations**: Expandable AI reasoning for each evaluation
- **Secure API Key Storage**: Your OpenAI API key is stored securely in your browser

## 🚀 Installation

1. **Clone or download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right)
4. **Click "Load unpacked"** and select this project folder
5. **Pin the extension** to your toolbar for easy access

## ⚙️ Setup

1. **Get an OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-proj-...`)

2. **Configure the Extension**:
   - Click the extension icon in your browser
   - Click "⚙️ Settings"
   - Paste your API key
   - Click "Save"

## 🔒 Security

- **No hardcoded API keys** - Your key stays private
- **Local storage only** - API key is stored securely in your browser using Chrome's sync storage
- **Never transmitted** except directly to OpenAI's API
- **Open source** - Verify the code yourself

## 📱 Usage

1. **Navigate** to any company website
2. **Click** the Sustainability Companion icon
3. **Click "Check Sustainability"**
4. **View** the score and click "View Details" for explanation

## 🎯 Example Sites to Try

- Tesla.com (electric vehicles)
- Patagonia.com (sustainable clothing)
- Apple.com (environmental initiatives)
- Any company's "About" or "Sustainability" pages

## 🛠️ Development

The extension consists of:
- `manifest.json` - Extension configuration
- `background.js` - API communication handler
- `content.js` - Web page text extraction
- `popup.html/js` - User interface
- `styles.css` - Modern UI styling

## 📄 License

Open source - feel free to modify and distribute! 