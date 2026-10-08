const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

function createWindow() {
  win = new BrowserWindow({
    width: 3840,
    height: 2160,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.webContents.setUserAgent(USER_AGENT);
  win.loadFile('index.html');
}

ipcMain.on('load-url', (event, { url, username, password }) => {
  win.webContents.setUserAgent(USER_AGENT);

  win.webContents.on('did-start-navigation', () => {
    win.webContents.executeJavaScript(`
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      delete window.electron;
    `).catch(() => {});
  });

  win.webContents.on('did-finish-load', () => {
    if (!username || !password) return;

    win.webContents.executeJavaScript(`
      (function() {
        let attempts = 0;
        const maxAttempts = 30;

        function tryInject() {
          const userSelectors = ['#username', '#user', '#login', 'input[type="text"]', 'input[name="username"]', 'input[name="login"]', '#id_user'];
          const passSelectors = ['#password', '#password_id', '#pass', 'input[type="password"]', 'input[name="password"]', '#id_pwd'];
          const btnSelectors = ['#bouton_valider', '#submit', 'button[type="submit"]', '.btn-submit', '#validation', '#connexion', '.bouton-connexion', 'input[type="submit"]'];

          let uField, pField, btn;

          function findElements(doc) {
            for (let s of userSelectors) {
              let el = doc.querySelector(s);
              if (el && el.offsetWidth > 0) { uField = el; break; }
            }
            for (let s of passSelectors) {
              let el = doc.querySelector(s);
              if (el && el.offsetWidth > 0) { pField = el; break; }
            }
            if (uField && pField) return true;

            let iframes = doc.querySelectorAll('iframe');
            for (let i = 0; i < iframes.length; i++) {
              try {
                let innerDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                if (findElements(innerDoc)) return true;
              } catch(e) {}
            }
            return false;
          }

          findElements(document);

          if (uField && pField) {
            uField.focus();
            uField.value = "${username.replace(/"/g, '\\"')}";
            uField.dispatchEvent(new Event('input', { bubbles: true }));
            uField.dispatchEvent(new Event('change', { bubbles: true }));

            pField.focus();
            pField.value = "${password.replace(/"/g, '\\"')}";
            pField.dispatchEvent(new Event('input', { bubbles: true }));
            pField.dispatchEvent(new Event('change', { bubbles: true }));
            pField.blur();

            setTimeout(() => {
              let contextDoc = uField.ownerDocument || document;
              for (let s of btnSelectors) {
                let el = contextDoc.querySelector(s);
                if (el && el.offsetWidth > 0) { btn = el; break; }
              }

              if (btn) {
                btn.click();
              } else {
                let form = uField.closest('form');
                if (form) form.submit();
              }
            }, 500);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryInject, 500);
          }
        }

        tryInject();
      })();
    `).catch(() => {});
  });

  win.loadURL(url).catch(() => {
    win.loadFile('index.html');
  });
});

ipcMain.on('reset-app', () => {
  win.loadFile('index.html');
});

app.whenReady().then(() => {
  app.userAgentFallback = USER_AGENT;
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
