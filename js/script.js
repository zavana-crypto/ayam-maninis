/**
 * Frontend script for public pages
 * Handles UI interactions and fetching data from Firebase
 */
import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Lightbox logic (Global so it can be called from HTML onclick)
window.openLightbox = function(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');
    
    if(lightbox && img) {
        img.src = src;
        if(captionText) captionText.textContent = caption || '';
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    if(lightbox) {
        lightbox.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close lightbox on escape key or clicking outside
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') window.closeLightbox();
});
document.addEventListener('click', (e) => {
    const lightbox = document.getElementById('lightbox');
    if(lightbox && lightbox.classList.contains('show') && e.target === lightbox) {
        window.closeLightbox();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Loading Screen
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }, 800);
    }

    // 2. Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenuBtn = document.querySelector('.close-menu');

    if (mobileToggle && mobileOverlay && closeMenuBtn) {
        mobileToggle.addEventListener('click', () => {
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeMenuBtn.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // 3. Sticky Navbar
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
        checkReveal();
    });

    // 4. Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');
    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) el.classList.add('active');
        });
    }
    checkReveal();

    // ==========================================
    // FIREBASE DATA FETCHING
    // ==========================================

    if (!db) {
        console.warn("Firebase DB not initialized. UI will display fallback content.");
        // We do not return here so that non-Firebase logic (like order modal binding) still works
    } else {
        // A. Fetch Profile Info (WA, Hours, Address)
        try {
            const profileRef = doc(db, 'profile', 'main');
            const profileSnap = await getDoc(profileRef);
            
            if (profileSnap.exists()) {
                const data = profileSnap.data();
                
                // Update WA
                if (data.whatsapp) {
                    document.querySelectorAll('.wa-number-display').forEach(el => el.textContent = "+" + data.whatsapp);
                    document.querySelectorAll('.nav-btn, .floating-wa, #contact-wa-btn').forEach(el => {
                        el.href = `https://wa.me/${data.whatsapp}`;
                    });
                    document.querySelectorAll('.hero-buttons .btn-outline').forEach(el => {
                        el.href = `https://wa.me/${data.whatsapp}`;
                    });
                }
                
                // Update Hours
                if (data.hours) {
                    document.querySelectorAll('.op-hours-display, #contact-hours').forEach(el => el.innerHTML = data.hours.replace(/\n/g, '<br>'));
                }

                // Update Address
                if (data.address && document.getElementById('contact-address')) {
                    document.getElementById('contact-address').innerHTML = data.address.replace(/\n/g, '<br>');
                }

                // Update Profile Desc
                if (data.description && document.getElementById('profile-desc')) {
                    document.getElementById('profile-desc').textContent = data.description;
                }
            }
        } catch (e) {
            console.error("Error fetching profile:", e);
        }

        // B. Fetch Menu for menu.html
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) {
            try {
                const querySnapshot = await getDocs(collection(db, "menu"));
                if (!querySnapshot.empty) {
                    menuContainer.innerHTML = ''; // clear loading
                    querySnapshot.forEach((docSnap) => {
                        const item = docSnap.data();
                        const tagHtml = item.bestseller ? `<span class="menu-tag">Best Seller</span>` : '';
                        
                        const card = document.createElement('div');
                        card.className = 'menu-card reveal fade-bottom active'; // active to bypass scroll
                        card.innerHTML = `
                            <div class="menu-img">
                                <img src="${item.image || 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500&auto=format&fit=crop'}" alt="${item.name}" loading="lazy">
                                ${tagHtml}
                            </div>
                            <div class="menu-info">
                                <h3>${item.name}</h3>
                                <p>${item.description}</p>
                                <div class="menu-footer">
                                    <span class="price">${item.price}</span>
                                    <button class="btn-sm order-btn" data-item="${item.name}" data-price="${item.price}"><i class="fa-solid fa-plus"></i> Pesan</button>
                                </div>
                            </div>
                        `;
                        menuContainer.appendChild(card);
                    });

                    // Re-bind order buttons
                    bindOrderModal();
                } else {
                    menuContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Belum ada menu yang ditambahkan.</p>';
                }
            } catch (e) {
                console.error("Error fetching menu:", e);
                menuContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--clr-primary);">Gagal memuat menu. Pastikan konfigurasi Firebase sudah benar.</p>';
            }
        }

        // C. Fetch Gallery for gallery.html
        const galleryContainer = document.getElementById('gallery-container');
        const galleryLoader = document.getElementById('gallery-loader');
        if (galleryContainer) {
            try {
                const querySnapshot = await getDocs(collection(db, "gallery"));
                if (galleryLoader) galleryLoader.style.display = 'none';
                if (!querySnapshot.empty) {
                    let delay = 0;
                    querySnapshot.forEach((docSnap) => {
                        const item = docSnap.data();
                        const el = document.createElement('div');
                        el.className = `gallery-item reveal fade-bottom active delay-${delay % 3}`;
                        el.onclick = () => window.openLightbox(item.image, item.title || 'Galeri');
                        el.innerHTML = `
                            <img src="${item.image}" alt="${item.title || 'Galeri'}" loading="lazy">
                            <div class="gallery-overlay">
                                <div class="overlay-content">
                                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                                    <h4>${item.title || 'Galeri'}</h4>
                                </div>
                            </div>
                        `;
                        galleryContainer.appendChild(el);
                        delay++;
                    });
                }
            } catch (e) {
                console.error("Error fetching gallery:", e);
                if (galleryLoader) galleryLoader.style.display = 'none';
            }
        }
    }

    // 5. Order Modal Logic
    function bindOrderModal() {
        const orderModal = document.getElementById('orderModal');
        if (!orderModal) return;

        const orderBtns = document.querySelectorAll('.order-btn');
        const closeModalBtn = document.getElementById('closeModal');
        const submitOrderBtn = document.getElementById('submitOrderBtn');
        let currentItemName = '';

        orderBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentItemName = btn.getAttribute('data-item');
                const price = btn.getAttribute('data-price');
                
                document.getElementById('modalItemName').textContent = currentItemName;
                document.getElementById('modalItemPrice').textContent = price;
                document.getElementById('orderQty').value = 1;
                document.getElementById('orderNotes').value = '';
                
                orderModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            orderModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        orderModal.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(); });

        if(submitOrderBtn) {
            submitOrderBtn.addEventListener('click', async () => {
                const qty = document.getElementById('orderQty').value;
                const notes = document.getElementById('orderNotes').value.trim();
                
                // Fetch dynamic WA number
                let waNumber = "6281338252908"; 
                try {
                    if (db) {
                        const snap = await getDoc(doc(db, 'profile', 'main'));
                        if (snap.exists() && snap.data().whatsapp) {
                            waNumber = snap.data().whatsapp;
                        }
                    }
                } catch(e){}
                
                let message = `Halo Ayam Ma'ninis! 🍗\n\nSaya ingin memesan:\n*${currentItemName}*\nJumlah: ${qty} porsi`;
                if (notes) message += `\nCatatan: ${notes}`;
                message += `\n\nMohon informasi total pembayarannya.`;
                
                window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
                closeModal();
            });
        }
    }

    // Call bind for statically defined buttons (if any)
    bindOrderModal();

});