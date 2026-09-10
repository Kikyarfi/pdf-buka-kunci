if (new URLSearchParams(window.location.search).has('desktop')) {
  document.body.classList.add('desktop');
}

const $ = (id) => document.getElementById(id);
const fileInput = $('fileInput');
const drop = $('drop');
const fileBox = $('fileBox');
const fileName = $('fileName');
const fileMeta = $('fileMeta');
const clear = $('clear');
const password = $('password');
const authorized = $('authorized');
const status = $('status');
const action = $('action');
const eye = $('eye');
const wasmUrl = './qpdf.wasm';

let selectedFile = null;
let downloadUrl = null;

const format = (size) =>
  size < 1048576
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1048576).toFixed(1)} MB`;

const outputName = (name) =>
  `${name.replace(/\.pdf$/i, '') || 'document'}_origin.pdf`;

function message(text, type = '') {
  status.textContent = text;
  status.className = `status ${type}`;
}

function update() {
  action.disabled = !(selectedFile && password.value && authorized.checked);
  if (!downloadUrl) action.querySelector('span').textContent = 'Proses PDF';
}

function choose(file) {
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    message('Pilih file dengan format PDF.', 'error');
    return;
  }

  if (file.size > 104857600) {
    message('Ukuran file maksimal 100 MB.', 'error');
    return;
  }

  resetDownload();
  selectedFile = file;
  drop.style.display = 'none';
  fileBox.style.display = 'flex';
  fileName.textContent = file.name;
  fileMeta.textContent = `${format(file.size)} · PDF`;
  message('');
  update();
}

function resetDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
  action.onclick = processPdf;
  action.removeAttribute('data-download');
}

function reset() {
  resetDownload();
  selectedFile = null;
  fileInput.value = '';
  password.value = '';
  drop.style.display = 'flex';
  fileBox.style.display = 'none';
  message('');
  update();
}

drop.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => choose(event.target.files[0]));
clear.addEventListener('click', reset);
password.addEventListener('input', update);
authorized.addEventListener('change', update);
eye.addEventListener('click', () => {
  password.type = password.type === 'password' ? 'text' : 'password';
});

for (const name of ['dragenter', 'dragover']) {
  drop.addEventListener(name, (event) => {
    event.preventDefault();
    drop.classList.add('drag');
  });
}

for (const name of ['dragleave', 'drop']) {
  drop.addEventListener(name, (event) => {
    event.preventDefault();
    drop.classList.remove('drag');
  });
}

drop.addEventListener('drop', (event) => choose(event.dataTransfer.files[0]));

async function processPdf() {
  if (action.disabled || !selectedFile) return;

  action.disabled = true;
  let stage = 'FILE';
  message('Membaca file PDF di perangkat Anda…', 'working');

  try {
    const buffer = await selectedFile.arrayBuffer();
    stage = 'ENGINE';
    message('Menyiapkan mesin PDF di perangkat Anda…', 'working');
    const qpdf = await Module({ locateFile: () => wasmUrl });

    stage = 'INPUT';
    qpdf.FS.writeFile('/input.pdf', new Uint8Array(buffer));
    stage = 'DECRYPT';
    message('Membuka proteksi PDF…', 'working');
    const code = qpdf.callMain([
      `--password=${password.value}`,
      '--decrypt',
      '--',
      '/input.pdf',
      '/output.pdf',
    ]);

    if (code !== 0) throw new Error(`EXIT_${code}`);

    stage = 'OUTPUT';
    const result = qpdf.FS.readFile('/output.pdf');
    if (!result || result.length < 5 || String.fromCharCode(...result.slice(0, 5)) !== '%PDF-') {
      throw new Error('INVALID');
    }

    downloadUrl = URL.createObjectURL(
      new Blob([new Uint8Array(result)], { type: 'application/pdf' }),
    );
    const name = outputName(selectedFile.name);
    password.value = '';
    message('PDF berhasil diproses dan siap diunduh.', 'success');
    action.disabled = false;
    action.querySelector('span').textContent = 'Unduh PDF hasil';
    action.onclick = () => {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name;
      link.click();
    };
  } catch (error) {
    console.error('PDF processing failed:', stage, error);
    const detail = String(error?.message || error).slice(0, 90);
    const explanations = {
      FILE: 'File PDF tidak dapat dibaca oleh browser.',
      ENGINE: 'Mesin PDF tidak berhasil dimuat oleh browser.',
      INPUT: 'File PDF tidak dapat dibaca oleh mesin.',
      DECRYPT: 'Password ditolak atau proteksi PDF tidak didukung.',
      OUTPUT: 'Hasil PDF tidak berhasil dibuat.',
    };
    message(`${explanations[stage]} Kode: ${stage} · ${detail}`, 'error');
    action.disabled = false;
  }
}

action.onclick = processPdf;
