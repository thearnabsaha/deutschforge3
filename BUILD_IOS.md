# Build & Sideload on iPhone (Free, No Apple Developer Account)

## What you need on your Mac
- Xcode (from App Store, free)
- Node.js 18+ → https://nodejs.org
- Bun → `curl -fsSL https://bun.sh/install | bash`
- EAS CLI → `bun install -g eas-cli`
- Sideloadly → https://sideloadly.io (for installing IPA)

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/thearnabsaha/deutschforge3.git
cd deutschforge3/packages/mobile
bun install
```

---

## Step 2 — Login to Expo

```bash
eas login
# username: thearnabsaha
# password: your expo password
```

---

## Step 3 — Build IPA locally on your Mac

```bash
eas build --platform ios --profile preview --local
```

This runs entirely on your Mac using Xcode.  
It will ask for your Apple ID → use your free Apple ID to sign.  
When done, it outputs a `.ipa` file path.

---

## Step 4 — Install on iPhone via Sideloadly

1. Open **Sideloadly** on your Mac
2. Plug iPhone via USB, trust the Mac
3. Drag the `.ipa` file into Sideloadly
4. Enter your Apple ID in Sideloadly
5. Click **Start** → app installs

> **Note:** Free Apple ID apps expire every **7 days**.  
> Re-sign by repeating Step 4 (no rebuild needed, same IPA).

---

## Backend
Already live at: `https://deutschforge3.onrender.com`  
No extra setup needed — the app connects to it automatically.

---

## Troubleshooting

**"Untrusted Developer" on iPhone:**  
Settings → General → VPN & Device Management → tap your Apple ID → Trust

**Build fails with provisioning error:**  
Make sure Xcode is fully installed (not just Command Line Tools).  
Run: `sudo xcode-select -s /Applications/Xcode.app`
