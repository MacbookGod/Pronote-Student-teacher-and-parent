## 🛡️ macOS Security & Gatekeeper Note (For Mac Users)

Because this application is open-source and built locally without a paid Apple Developer Certificate (\$99/year), macOS Sequoia/Sonoma will block it on first launch, displaying a "Malware" or "Unidentified Developer" warning. 

**This is 100% safe**—the app is completely open-source and you can look into the clean JavaScript code in `main.js` yourself.

### 🛠️ How to open the app on your Mac in 2 steps:

1. **Move it to Applications:** Drag the downloaded `PRONOTE-Desktop.app` into your main **Applications** folder.
2. **Run the Unblock Command:** Open your Mac's **Terminal** app, paste this exact command, and press **Enter**:
   ```bash
   xattr -cr /Applications/PRONOTE-Desktop.app && codesign --force --deep --sign - /Applications/PRONOTE-Desktop.app
   ```
3. Enter your Mac user password when prompted (no text will show while typing) and press **Enter**.

Now, **Right-click** (or Ctrl+Click) the app in your Applications folder and select **Open**. The warning will disappear permanently!


You can also go into finder /Applications/PRONOTE-Desktop.app right click and select Get Info and remove Malware
