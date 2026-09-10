const { app, BrowserWindow, dialog, net, protocol, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_ORIGIN = 'app://bundle';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function getUiRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app-ui')
    : path.join(__dirname, '..');
}

function resolveUiPath(requestUrl) {
  const url = new URL(requestUrl);
  if (url.host !== 'bundle') return null;

  const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const root = path.resolve(getUiRoot());
  const filePath = path.resolve(root, relativePath);

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) return null;
  return filePath;
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 780,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f1f8fa',
    title: 'PDF Tanpa Kunci',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  window.once('ready-to-show', () => window.show());

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    try {
      if (new URL(url).origin !== APP_ORIGIN) event.preventDefault();
    } catch {
      event.preventDefault();
    }
  });

  window.webContents.session.on('will-download', async (_event, item) => {
    item.pause();
    const result = await dialog.showSaveDialog(window, {
      title: 'Simpan PDF hasil',
      defaultPath: item.getFilename(),
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) {
      item.cancel();
      return;
    }

    item.setSavePath(result.filePath);
    item.resume();
  });

  void window.loadURL(`${APP_ORIGIN}/index.html?desktop=1`);
}

app.whenReady().then(async () => {
  protocol.handle('app', (request) => {
    const filePath = resolveUiPath(request.url);
    if (!filePath) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
