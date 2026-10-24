document.addEventListener('DOMContentLoaded', () => {

    // ===== PRODUCT FILTER & SHOW MORE TOGGLE =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const catalogMoreWrap = document.getElementById('catalogMoreWrap');
    const toggleMoreProducts = document.getElementById('toggleMoreProducts');
    const INITIAL_VISIBLE_COUNT = 4;
    let isShowingAllProducts = false;
    let activeFilter = 'semua';

    const renderCatalogVisibility = () => {
        let visibleInFilter = 0;

        productCards.forEach(card => {
            const category = card.dataset.category;
            const matches = (activeFilter === 'semua' || category === activeFilter);

            if (matches) {
                visibleInFilter++;
                if (activeFilter === 'semua' && !isShowingAllProducts && visibleInFilter > INITIAL_VISIBLE_COUNT) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeIn 0.3s ease';
                }
            } else {
                card.style.display = 'none';
            }
        });

        if (catalogMoreWrap && toggleMoreProducts) {
            const extraCount = productCards.length - INITIAL_VISIBLE_COUNT;
            if (activeFilter === 'semua' && extraCount > 0) {
                catalogMoreWrap.style.display = 'flex';
                const spanEl = toggleMoreProducts.querySelector('span');
                const iconEl = toggleMoreProducts.querySelector('i');
                if (isShowingAllProducts) {
                    if (spanEl) spanEl.textContent = 'Tampilkan Lebih Sedikit';
                    if (iconEl) iconEl.className = 'ph ph-caret-up';
                } else {
                    if (spanEl) spanEl.textContent = `Lihat Koleksi Lainnya (+${extraCount} Produk)`;
                    if (iconEl) iconEl.className = 'ph ph-caret-down';
                }
            } else {
                catalogMoreWrap.style.display = 'none';
            }
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderCatalogVisibility();
        });
    });

    if (toggleMoreProducts) {
        toggleMoreProducts.addEventListener('click', () => {
            isShowingAllProducts = !isShowingAllProducts;
            renderCatalogVisibility();
        });
    }

    renderCatalogVisibility();

    // ===== NAVIGATION & ACTIVE LINK HANDLING =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navItems = navLinks ? navLinks.querySelectorAll('a') : [];
    let isUserClickingNav = false;
    let navClickTimer = null;

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('open')) {
                icon.className = 'ph ph-x';
            } else {
                icon.className = 'ph ph-list';
            }
        });
    }

    // Update active class when a nav link is clicked
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            navItems.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            // Temporarily pause scrollspy so smooth-scroll does not override active link immediately
            isUserClickingNav = true;
            clearTimeout(navClickTimer);
            navClickTimer = setTimeout(() => {
                isUserClickingNav = false;
            }, 800);

            // Close mobile menu if opened
            if (navLinks && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                if (hamburger) {
                    const icon = hamburger.querySelector('i');
                    if (icon) icon.className = 'ph ph-list';
                }
            }
        });
    });

    // Also support any on-page anchor buttons that link to nav sections (e.g. hero buttons)
    document.querySelectorAll('a[href^="#"]').forEach(btn => {
        if (!btn.closest('#navLinks')) {
            btn.addEventListener('click', () => {
                const targetHash = btn.getAttribute('href');
                const matchingNav = Array.from(navItems).find(item => item.getAttribute('href') === targetHash);
                if (matchingNav) {
                    navItems.forEach(item => item.classList.remove('active'));
                    matchingNav.classList.add('active');
                }
            });
        }
    });

    // ===== SCROLLSPY (Sync active nav item on scroll) =====
    const navSections = Array.from(navItems)
        .map(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const target = document.querySelector(href);
                if (target) return { link, target };
            }
            return null;
        })
        .filter(Boolean);

    window.addEventListener('scroll', () => {
        if (isUserClickingNav || navSections.length === 0) return;

        const scrollY = window.scrollY;
        const offset = 140;
        const sortedSections = [...navSections].sort((a, b) => a.target.offsetTop - b.target.offsetTop);

        // If reached bottom of page, activate last item
        if ((window.innerHeight + scrollY) >= document.documentElement.scrollHeight - 50) {
            navItems.forEach(item => item.classList.remove('active'));
            sortedSections[sortedSections.length - 1].link.classList.add('active');
            return;
        }

        // Check which section is currently viewed
        for (let i = sortedSections.length - 1; i >= 0; i--) {
            const { link, target } = sortedSections[i];
            const top = target.offsetTop - offset;
            if (scrollY >= top) {
                navItems.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
                break;
            }
        }
    });

    // ===== NAVBAR SCROLL SHADOW =====
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // ===== SMOOTH FADE-IN ON SCROLL =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .product-card, .step-card, .testi-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // ===== PRODUCT DETAIL MODAL & SIZE GUIDE =====
    const productModal = document.getElementById('productModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalImg = document.getElementById('modalImg');
    const modalThumbs = document.getElementById('modalThumbs');
    const thumbFrontBtn = document.getElementById('thumbFrontBtn');
    const thumbBackBtn = document.getElementById('thumbBackBtn');
    const thumbFrontImg = document.getElementById('thumbFrontImg');
    const thumbBackImg = document.getElementById('thumbBackImg');
    const modalBadgeDark = document.getElementById('modalBadgeDark');
    const modalBadgeGold = document.getElementById('modalBadgeGold');
    const modalCategory = document.getElementById('modalCategory');
    const modalCode = document.getElementById('modalCode');
    const modalTitle = document.getElementById('modalTitle');
    const modalOldPrice = document.getElementById('modalOldPrice');
    const modalPrice = document.getElementById('modalPrice');
    const modalStatus = document.getElementById('modalStatus');
    const modalDesc = document.getElementById('modalDesc');
    const modalSpecs = document.getElementById('modalSpecs');
    const modalSizeSection = document.getElementById('modalSizeSection');
    const modalFabricSection = document.getElementById('modalFabricSection');
    const sizeSelector = document.getElementById('sizeSelector');
    const sizeGuideToggle = document.getElementById('sizeGuideToggle');
    const sizeChartBox = document.getElementById('sizeChartBox');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyInput = document.getElementById('qtyInput');
    const modalSubtotal = document.getElementById('modalSubtotal');
    const modalWaBtn = document.getElementById('modalWaBtn');

    let currentProduct = {
        title: '',
        code: '',
        categoryType: '',
        unitPrice: 0,
        priceText: '',
        selectedSize: 'L',
        qty: 1
    };

    const formatRupiah = (num) => {
        return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const updateModalOrderLink = () => {
        const total = currentProduct.unitPrice * currentProduct.qty;
        modalSubtotal.textContent = formatRupiah(total);

        const sizeInfo = currentProduct.categoryType === 'kain'
            ? 'Kain Utuh'
            : `Ukuran ${currentProduct.selectedSize}`;

        const waText = `Halo Anwar Cahaya Batik, saya ingin memesan:\n` +
            `• Produk: *${currentProduct.title}*\n` +
            (currentProduct.code ? `• Kode: ${currentProduct.code}\n` : '') +
            `• Pilihan: ${sizeInfo}\n` +
            `• Jumlah: ${currentProduct.qty} pcs\n` +
            `• Estimasi Total: *${formatRupiah(total)}*\n\n` +
            `Mohon info ketersediaan stok dan cara pembayarannya. Terima kasih! 🙏`;

        modalWaBtn.href = `https://wa.me/6287726984278?text=${encodeURIComponent(waText)}`;
    };

    // Handle Front / Back angle switch on product cards
    productCards.forEach(card => {
        const angleBtns = card.querySelectorAll('.view-angle-switch .angle-btn');
        const imgEl = card.querySelector('.product-image img');
        if (angleBtns.length > 0 && imgEl) {
            angleBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    angleBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const targetSrc = btn.dataset.angle === 'back' ? card.dataset.backImg : card.dataset.frontImg;
                    if (targetSrc) {
                        imgEl.src = targetSrc;
                    }
                });
            });
        }
    });

    // Open modal when clicking "Lihat Detail" button (or product image/title)
    productCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a.btn') || e.target.closest('.view-angle-switch')) return;

            const imgEl = card.querySelector('.product-image img');
            const badgeDarkEl = card.querySelector('.badge-tag.dark');
            const badgeGoldEl = card.querySelector('.badge-tag.gold');
            const catEl = card.querySelector('.category');
            const titleEl = card.querySelector('h3');
            const descEl = card.querySelector('.product-info > p');
            const specsEl = card.querySelector('.product-specs');
            const oldPriceEl = card.querySelector('.old-price');
            const priceEl = card.querySelector('.price');
            const statusEl = card.querySelector('.status');
            const waLinkEl = card.querySelector('a.btn');

            const rawPrice = priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
            let codeMatch = '';
            if (waLinkEl && waLinkEl.href) {
                const decoded = decodeURIComponent(waLinkEl.href);
                const m = decoded.match(/Kode:\s*([A-Z0-9-]+)/i);
                if (m) codeMatch = m[1];
            }
            if (!codeMatch) codeMatch = `ACB-00${index + 1}`;

            currentProduct = {
                title: titleEl ? titleEl.textContent.trim() : '',
                code: codeMatch,
                categoryType: card.dataset.category || '',
                unitPrice: rawPrice,
                priceText: priceEl ? priceEl.textContent.trim() : '',
                selectedSize: 'L',
                qty: 1
            };

            // Populate modal DOM
            if (imgEl) {
                modalImg.src = imgEl.src;
                modalImg.alt = imgEl.alt;
            }

            // Setup front/back thumbnails if product has both views
            const frontImgSrc = card.dataset.frontImg;
            const backImgSrc = card.dataset.backImg;
            if (modalThumbs && frontImgSrc && backImgSrc) {
                modalThumbs.style.display = 'flex';
                if (thumbFrontImg) thumbFrontImg.src = frontImgSrc;
                if (thumbBackImg) thumbBackImg.src = backImgSrc;
                const activeCardAngle = card.querySelector('.view-angle-switch .angle-btn.active');
                const isBackActive = activeCardAngle && activeCardAngle.dataset.angle === 'back';
                if (thumbFrontBtn) thumbFrontBtn.classList.toggle('active', !isBackActive);
                if (thumbBackBtn) thumbBackBtn.classList.toggle('active', !!isBackActive);
                modalThumbs.dataset.frontImg = frontImgSrc;
                modalThumbs.dataset.backImg = backImgSrc;
            } else if (modalThumbs) {
                modalThumbs.style.display = 'none';
            }
            modalBadgeDark.textContent = badgeDarkEl ? badgeDarkEl.textContent : '';
            modalBadgeDark.style.display = badgeDarkEl ? 'inline-block' : 'none';
            modalBadgeGold.textContent = badgeGoldEl ? badgeGoldEl.textContent : '';
            modalBadgeGold.style.display = badgeGoldEl ? 'inline-block' : 'none';

            modalCategory.textContent = catEl ? catEl.textContent : '';
            modalCode.textContent = `Kode: ${currentProduct.code}`;
            modalTitle.textContent = currentProduct.title;
            modalOldPrice.textContent = oldPriceEl ? oldPriceEl.textContent : '';
            modalPrice.textContent = currentProduct.priceText;

            if (statusEl) {
                modalStatus.textContent = statusEl.textContent;
                modalStatus.className = statusEl.className;
            }

            modalDesc.textContent = descEl ? descEl.textContent : '';
            modalSpecs.innerHTML = specsEl ? specsEl.innerHTML : '';

            // Show size selector for clothing or fabric note for kain
            if (currentProduct.categoryType === 'kain') {
                modalSizeSection.style.display = 'none';
                modalFabricSection.style.display = 'block';
            } else {
                modalSizeSection.style.display = 'block';
                modalFabricSection.style.display = 'none';
                sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.size === 'L');
                });
            }

            qtyInput.value = 1;
            updateModalOrderLink();

            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
                const floatingWa = document.getElementById('floating-wa-btn');
                if (floatingWa) floatingWa.style.marginRight = `${scrollbarWidth}px`;
            }
            productModal.classList.add('open');
            productModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    // Modal front/back thumbnail switchers
    if (thumbFrontBtn && thumbBackBtn && modalThumbs) {
        thumbFrontBtn.addEventListener('click', () => {
            if (modalThumbs.dataset.frontImg) {
                modalImg.src = modalThumbs.dataset.frontImg;
                thumbFrontBtn.classList.add('active');
                thumbBackBtn.classList.remove('active');
            }
        });
        thumbBackBtn.addEventListener('click', () => {
            if (modalThumbs.dataset.backImg) {
                modalImg.src = modalThumbs.dataset.backImg;
                thumbBackBtn.classList.add('active');
                thumbFrontBtn.classList.remove('active');
            }
        });
    }

    // Size selector buttons
    if (sizeSelector) {
        sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sizeSelector.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentProduct.selectedSize = btn.dataset.size;
                updateModalOrderLink();
            });
        });
    }

    // Size guide toggle
    if (sizeGuideToggle && sizeChartBox) {
        sizeGuideToggle.addEventListener('click', () => {
            sizeChartBox.classList.toggle('open');
        });
    }

    // Quantity buttons
    if (qtyMinus && qtyPlus && qtyInput) {
        qtyMinus.addEventListener('click', () => {
            if (currentProduct.qty > 1) {
                currentProduct.qty--;
                qtyInput.value = currentProduct.qty;
                updateModalOrderLink();
            }
        });
        qtyPlus.addEventListener('click', () => {
            if (currentProduct.qty < 50) {
                currentProduct.qty++;
                qtyInput.value = currentProduct.qty;
                updateModalOrderLink();
            }
        });
    }

    const closeProductModal = () => {
        if (!productModal) return;
        productModal.classList.remove('open');
        productModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        const floatingWa = document.getElementById('floating-wa-btn');
        if (floatingWa) floatingWa.style.marginRight = '';
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProductModal);
    }

    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) closeProductModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModal && productModal.classList.contains('open')) {
            closeProductModal();
        }
    });

});

// CSS animation keyframe injection
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}
`;
document.head.appendChild(style);

