# Ayam Ma'ninis Fried Chicken

Website profesional premium untuk bisnis restoran cepat saji **Ayam Ma'ninis Fried Chicken** yang berlokasi di Mbay, Kabupaten Nagekeo.

## Fitur Website
- **Modern Dark Premium UI**: Antarmuka elegan dengan sentuhan glassmorphism, warna merah fried chicken, dan aksen emas.
- **Mobile Responsive**: Tampilan dioptimalkan penuh untuk perangkat *smartphone*.
- **Admin Dashboard**: Area login khusus untuk mengelola konten website.
- **Firebase Integration**: 
  - *Firebase Authentication* (Untuk Login Admin)
  - *Firestore Database* (Penyimpanan teks realtime profil, menu, galeri)
  - *Firebase Storage* (Penyimpanan gambar menu & galeri)
- **Multi-Halaman**: Home, Tentang Kami, Menu, Galeri, Kontak, dan Admin Dashboard terpisah untuk arsitektur SEO yang lebih baik.

## Persyaratan Sistem
Website ini 100% *Client-Side* HTML/CSS/JS murni (Vanilla). Dapat dijalankan di server statis mana pun termasuk:
- GitHub Pages
- Netlify
- Vercel
- XAMPP / Apache / Nginx
- VS Code Live Server

## Panduan Setup Firebase
Buka file `js/firebase-config.js` untuk melihat langkah-langkah lengkap menghubungkan website ini ke Project Firebase Anda sendiri. Tanpa mengisi kunci API, website tetap dapat ditampilkan (akan menampilkan pesan fallback/loading untuk konten dinamis).

## Deployment ke GitHub Pages
Sistem telah diatur agar kompatibel dengan GitHub pages.
1. Push file ke repositori GitHub Anda.
2. Ke menu **Settings > Pages**.
3. Pilih "Deploy from a branch" -> `main` branch -> `/(root)` folder.
4. Tunggu proses build dan website akan online.
