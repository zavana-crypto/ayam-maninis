/**
 * Admin Logic Script
 */
import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {

    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loader = document.getElementById('loader');

    if (!auth || !db) {
        alert("Konfigurasi Firebase belum diatur. Cek js/firebase-config.js");
        if(loader) loader.style.display = 'none';
        return;
    }

    // --- Authentication ---
    onAuthStateChanged(auth, (user) => {
        if (loader) loader.style.display = 'none';
        if (user) {
            // Logged in
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'flex';
            loadProfileData();
            loadMenuData();
            loadGalleryData();
        } else {
            // Not logged in
            loginSection.style.display = 'flex';
            dashboardSection.style.display = 'none';
        }
    });

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const errorDiv = document.getElementById('login-error');
            
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = "Login gagal: Email atau Password salah.";
            }
        });
    }

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            signOut(auth);
        });
    }

    // --- Dashboard Tabs Navigation ---
    const navItems = document.querySelectorAll('.admin-nav-item[data-target]');
    const panels = document.querySelectorAll('.admin-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(item.getAttribute('data-target')).classList.add('active');
        });
    });

    // --- Helper: Upload File to Storage ---
    async function uploadImageFile(fileInputId, pathPrefix) {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        if (!file) return null;

        const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    }

    // --- 1. PROFIL USAHA ---
    async function loadProfileData() {
        try {
            const docSnap = await getDoc(doc(db, "profile", "main"));
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('prof-wa').value = data.whatsapp || '';
                document.getElementById('prof-hours').value = data.hours || '';
                document.getElementById('prof-address').value = data.address || '';
                document.getElementById('prof-desc').value = data.description || '';
            } else {
                // Initialize default profile based on instruction
                document.getElementById('prof-wa').value = '6281338252908';
                document.getElementById('prof-hours').value = 'Senin – Minggu\n08.00 – 20.00 WITA';
                document.getElementById('prof-address').value = 'Mbay I, Kecamatan Aesesa,\nKabupaten Nagekeo,\nNusa Tenggara Timur';
                document.getElementById('prof-desc').value = 'Ayam Ma\'ninis Fried Chicken adalah destinasi kuliner di Mbay, Kabupaten Nagekeo, yang menyajikan sajian ayam goreng krispi berkualitas tinggi.';
            }
        } catch(e) { console.error(e); }
    }

    document.getElementById('btn-save-profil')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-save-profil');
        const oriText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
        btn.disabled = true;

        try {
            await setDoc(doc(db, "profile", "main"), {
                whatsapp: document.getElementById('prof-wa').value,
                hours: document.getElementById('prof-hours').value,
                address: document.getElementById('prof-address').value,
                description: document.getElementById('prof-desc').value
            });
            alert('Profil berhasil disimpan!');
        } catch(e) {
            console.error(e);
            alert('Gagal menyimpan profil.');
        } finally {
            btn.innerHTML = oriText;
            btn.disabled = false;
        }
    });

    // --- 2. KELOLA MENU ---
    const menuFormContainer = document.getElementById('menu-form-container');
    const btnAddMenu = document.getElementById('btn-add-menu');
    const btnCancelMenu = document.getElementById('btn-cancel-menu');
    const menuForm = document.getElementById('menu-form');

    btnAddMenu?.addEventListener('click', () => {
        menuForm.reset();
        document.getElementById('menu-id').value = '';
        document.getElementById('menu-form-title').textContent = 'Tambah Menu Baru';
        menuFormContainer.style.display = 'block';
    });

    btnCancelMenu?.addEventListener('click', () => {
        menuFormContainer.style.display = 'none';
    });

    async function loadMenuData() {
        const tbody = document.getElementById('admin-menu-list');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Memuat...</td></tr>';
        
        try {
            const querySnapshot = await getDocs(collection(db, "menu"));
            tbody.innerHTML = '';
            
            if(querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada data menu.</td></tr>';
                return;
            }

            querySnapshot.forEach((docSnap) => {
                const item = docSnap.data();
                const id = docSnap.id;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${item.image || 'https://via.placeholder.com/60'}" alt="Img"></td>
                    <td><strong>${item.name}</strong><br><small style="color:var(--clr-text-muted)">${item.description}</small></td>
                    <td>${item.price}</td>
                    <td>${item.bestseller ? '<span style="color:var(--clr-accent)">Best Seller</span>' : '-'}</td>
                    <td>
                        <button class="btn-sm btn-delete-menu" data-id="${id}" style="background:var(--clr-primary)">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Bind Delete events
            document.querySelectorAll('.btn-delete-menu').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if(confirm('Yakin ingin menghapus menu ini?')) {
                        const docId = e.target.getAttribute('data-id');
                        await deleteDoc(doc(db, "menu", docId));
                        loadMenuData();
                    }
                });
            });

        } catch(e) { console.error(e); }
    }

    menuForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-menu');
        const oriText = btn.innerHTML;
        btn.innerHTML = 'Menyimpan...';
        btn.disabled = true;

        try {
            // Upload image logic
            let finalImageUrl = document.getElementById('menu-image-url').value;
            if(document.getElementById('menu-image').files.length > 0) {
                try {
                    const uploadedUrl = await uploadImageFile('menu-image', 'menus');
                    if(uploadedUrl) finalImageUrl = uploadedUrl;
                } catch(err) {
                    alert('Gagal mengupload gambar. Pastikan Storage Firebase aktif dan Rules diizinkan.');
                    throw err;
                }
            }

            const menuData = {
                name: document.getElementById('menu-name').value,
                description: document.getElementById('menu-desc').value,
                price: document.getElementById('menu-price').value,
                image: finalImageUrl || 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500&auto=format&fit=crop',
                bestseller: document.getElementById('menu-bestseller').checked
            };

            await addDoc(collection(db, "menu"), menuData);
            
            menuFormContainer.style.display = 'none';
            menuForm.reset();
            loadMenuData();
            alert("Menu berhasil ditambahkan!");
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan menu.");
        } finally {
            btn.innerHTML = oriText;
            btn.disabled = false;
        }
    });


    // --- 3. KELOLA GALERI ---
    const galleryFormContainer = document.getElementById('gallery-form-container');
    const btnAddGallery = document.getElementById('btn-add-gallery');
    const btnCancelGallery = document.getElementById('btn-cancel-gallery');
    const galleryForm = document.getElementById('gallery-form');

    btnAddGallery?.addEventListener('click', () => {
        galleryForm.reset();
        galleryFormContainer.style.display = 'block';
    });

    btnCancelGallery?.addEventListener('click', () => {
        galleryFormContainer.style.display = 'none';
    });

    async function loadGalleryData() {
        const tbody = document.getElementById('admin-gallery-list');
        if(!tbody) return;
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Memuat...</td></tr>';
        
        try {
            const querySnapshot = await getDocs(collection(db, "gallery"));
            tbody.innerHTML = '';
            
            if(querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center">Tidak ada foto.</td></tr>';
                return;
            }

            querySnapshot.forEach((docSnap) => {
                const item = docSnap.data();
                const id = docSnap.id;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${item.image}" alt="Img"></td>
                    <td>${item.title}</td>
                    <td>
                        <button class="btn-sm btn-delete-gallery" data-id="${id}" style="background:var(--clr-primary)">Hapus</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.querySelectorAll('.btn-delete-gallery').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if(confirm('Yakin menghapus foto ini?')) {
                        await deleteDoc(doc(db, "gallery", e.target.getAttribute('data-id')));
                        loadGalleryData();
                    }
                });
            });
        } catch(e) { console.error(e); }
    }

    galleryForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = galleryForm.querySelector('button[type="submit"]');
        const oriText = btn.innerHTML;
        btn.innerHTML = 'Menyimpan...';
        btn.disabled = true;

        try {
            let finalImageUrl = document.getElementById('gal-image-url').value;
            if(document.getElementById('gal-image').files.length > 0) {
                 try {
                    const uploadedUrl = await uploadImageFile('gal-image', 'gallery');
                    if(uploadedUrl) finalImageUrl = uploadedUrl;
                } catch(err) {
                    alert('Gagal mengupload gambar. Pastikan Storage Firebase aktif.');
                    throw err;
                }
            }

            if (!finalImageUrl) {
                alert("Mohon pilih file atau isi URL gambar.");
                throw new Error("Empty image");
            }

            const galleryData = {
                title: document.getElementById('gal-title').value,
                image: finalImageUrl
            };

            await addDoc(collection(db, "gallery"), galleryData);
            
            galleryFormContainer.style.display = 'none';
            galleryForm.reset();
            loadGalleryData();
        } catch (error) {
            console.error(error);
        } finally {
            btn.innerHTML = oriText;
            btn.disabled = false;
        }
    });

});