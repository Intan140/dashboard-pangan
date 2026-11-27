# Dashboard BI Keterjangkauan Harga Pangan Antarprovinsi

Struktur:
- index.html       halaman utama
- css/style.css    tampilan
- js/app.js        logika dashboard (filter, peta, grafik, tabel)
- js/data.js       data hasil olahan (dibuat oleh build_data.py)
- build_data.py    mengubah CSV star schema menjadi js/data.js
- data/            taruh 9 file CSV star schema di sini

Menjalankan di VS Code: pasang ekstensi Live Server, klik kanan index.html > Open with Live Server.
Perlu internet untuk memuat Chart.js dan font dari CDN.
Jika CSV berubah: python build_data.py (butuh pandas dan numpy).
