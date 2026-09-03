# PDF Tanpa Kunci

Aplikasi web sederhana untuk membuat salinan PDF tanpa permintaan password. Seluruh proses dilakukan langsung di browser menggunakan WebAssembly, sehingga file PDF dan password tidak dikirim atau disimpan di server.

🔗 **Demo:** [https://kikyarfi.github.io/pdf-buka-kunci/](https://kikyarfi.github.io/pdf-buka-kunci/)

## Fitur

- Membuka PDF terenkripsi menggunakan password yang sah.
- Memproses dokumen sepenuhnya di perangkat pengguna.
- Tidak memerlukan akun, server backend, atau biaya penggunaan.
- Mendukung pemilihan file dan drag-and-drop.
- Membatasi ukuran file hingga 100 MB.
- Mengunduh hasil dengan akhiran nama file `_origin.pdf`.
- Tampilan responsif untuk desktop dan perangkat seluler.
- Pesan status dan diagnosis jika pemrosesan gagal.

## Cara Menggunakan

1. Buka halaman [PDF Tanpa Kunci](https://kikyarfi.github.io/pdf-buka-kunci/).
2. Klik area unggah atau tarik file PDF ke halaman.
3. Masukkan password PDF yang benar.
4. Centang pernyataan bahwa Anda memiliki dokumen atau memperoleh izin dari pemiliknya.
5. Klik **Proses PDF**.
6. Setelah selesai, klik **Unduh PDF hasil**.

## Privasi

Aplikasi ini tidak memiliki backend untuk menerima dokumen. PDF dan password diproses di dalam browser pengguna menggunakan qpdf yang dikompilasi ke WebAssembly.

Meski demikian, gunakan perangkat dan jaringan yang tepercaya saat menangani dokumen sensitif.

## Teknologi

- HTML5
- CSS3
- JavaScript
- [qpdf](https://github.com/qpdf/qpdf)
- WebAssembly
- GitHub Pages
- Build browser qpdf dari [qpdf-wasm](https://github.com/neslinesli93/qpdf-wasm), menggunakan versi tetap `0.3.0`

## Menjalankan Secara Lokal

Karena aplikasi memuat WebAssembly, jalankan melalui web server lokal. Jangan membuka `index.html` langsung menggunakan protokol `file://`.

### Menggunakan Python

```bash
git clone https://github.com/Kikyarfi/pdf-buka-kunci.git
cd pdf-buka-kunci
python3 -m http.server 8000
```

Kemudian buka:

```text
http://localhost:8000
```

### Menggunakan VS Code Live Server

1. Buka folder repository di VS Code.
2. Pasang ekstensi **Live Server**.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.

## Struktur Repository

```text
pdf-buka-kunci/
├── .nojekyll
├── favicon.svg
├── index.html
├── og.png
├── qpdf.js
└── qpdf.wasm
```

Keterangan:

- `index.html` — tampilan dan logika utama aplikasi.
- `favicon.svg` — ikon website.
- `og.png` — gambar pratinjau ketika tautan dibagikan.
- `.nojekyll` — memastikan aset dapat disajikan langsung oleh GitHub Pages.
- `qpdf.js` dan `qpdf.wasm` — aset mesin PDF lokal yang disimpan dalam repository; versi aplikasi saat ini memuat build qpdf-wasm `0.3.0` dari CDN.

## Publikasi dengan GitHub Pages

1. Buka **Settings** pada repository.
2. Pilih menu **Pages**.
3. Pada bagian **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`.
5. Klik **Save**.

Situs akan diterbitkan melalui alamat:

```text
https://kikyarfi.github.io/pdf-buka-kunci/
```

## Batasan

- Password yang dimasukkan harus benar.
- Beberapa PDF yang rusak atau menggunakan metode proteksi yang tidak didukung mungkin gagal diproses.
- Kecepatan pemrosesan bergantung pada ukuran PDF dan kemampuan perangkat.
- Browser harus mendukung WebAssembly dan JavaScript harus diaktifkan.

## Penggunaan yang Bertanggung Jawab

Gunakan aplikasi hanya untuk dokumen milik sendiri atau dokumen yang telah diizinkan oleh pemiliknya. Pengguna bertanggung jawab atas dokumen yang diproses dan kepatuhan terhadap hukum serta kebijakan yang berlaku.

## Kontribusi

Saran dan perbaikan dapat diajukan melalui issue atau pull request pada repository ini.
