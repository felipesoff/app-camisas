/**
 * FUTCOMMERCE - CONTROLADOR DA HOMEPAGE
 * 
 * Lógica principal da vitrine, incluindo busca inteligente, carrosséis de banners,
 * carregamento de categorias, filtragem de produtos e controle do pop-up promocional.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- ESTADO LOCAL ---
    let currentSlide = 0;
    let bannerInterval = null;
    let selectedCategory = "all";
    let selectedBrand = "all";
    let promoOnly = false;

    // --- DADOS DO SOCIAL PROOF ---
    const SOCIAL_BUYERS = [
        "Thiago", "Amanda", "Lucas", "Carla", "Felipe", "Juliana",
        "Rafael", "Bruna", "Matheus", "Fernanda", "Diego", "Isabela",
        "Victor", "Larissa", "Gabriel", "Camila", "Rodrigo", "Beatriz",
        "Anderson", "Patricia", "Leonardo", "Vanessa"
    ];
    const SOCIAL_LOCATIONS = [
        "São Paulo/SP", "Rio de Janeiro/RJ", "Belo Horizonte/MG",
        "Porto Alegre/RS", "Curitiba/PR", "Recife/PE",
        "Salvador/BA", "Brasília/DF", "Fortaleza/CE",
        "Manaus/AM", "Goiânia/GO", "Campinas/SP"
    ];
    const SOCIAL_SIZES = ["P", "M", "G", "GG"];


    // --- ELEMENTOS DO DOM ---
    const header = document.getElementById("main-header");
    const carouselContainer = document.getElementById("hero-carousel");
    const dotsContainer = document.getElementById("carousel-dots");
    const categoryPillsContainer = document.getElementById("quick-categories-pills");
    const productsGrid = document.getElementById("products-catalog-grid");
    const catalogTitle = document.getElementById("catalog-title");
    const filterPromoCheckbox = document.getElementById("filter-promo-only");
    
    // Busca
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    
    // Pop-up Promocional
    const promoPopup = document.getElementById("promo-popup");
    const popupCloseBtn = document.getElementById("popup-close-btn");
    const popupTitle = document.getElementById("popup-title");
    const popupMessage = document.getElementById("popup-message");
    const popupEmailInput = document.getElementById("popup-email");
    const popupSubmitBtn = document.getElementById("popup-submit-btn");
    const popupFormArea = document.getElementById("popup-form-area");
    const popupCouponReveal = document.getElementById("popup-coupon-reveal");
    const popupCouponCode = document.getElementById("popup-coupon-code");

    // Badge do Carrinho
    const cartBadgeCount = document.getElementById("cart-badge-count");

    // --- ANIMAÇÃO DE SCROLL DO HEADER ---
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
            header.style.backgroundColor = "var(--bg-card)";
        } else {
            header.classList.remove("scrolled");
            header.style.backgroundColor = "var(--glass-bg)";
        }
    });

    // --- CARREGAR CARROINHO (BADGE) ---
    function updateCartBadge() {
        const cart = FutDB.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadgeCount.textContent = totalItems;
        cartBadgeCount.style.display = totalItems > 0 ? "flex" : "none";

        const cartBadgeMobile = document.getElementById("cart-badge-mobile");
        if (cartBadgeMobile) {
            cartBadgeMobile.textContent = totalItems;
            cartBadgeMobile.style.display = totalItems > 0 ? "flex" : "none";
        }
    }

    // Ouvir atualizações de carrinho do DB centralizado
    window.addEventListener("fc_cart_updated", updateCartBadge);
    updateCartBadge(); // Chamada inicial

    // --- SISTEMA DE BUSCA INTELIGENTE ---
    searchInput.addEventListener("input", async (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = "none";
            return;
        }

        const products = await FutDB.getProducts();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.brand || "").toLowerCase().includes(query) || 
            p.team.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );

        searchResults.innerHTML = "";
        if (filtered.length === 0) {
            searchResults.innerHTML = `<div style="padding: 16px; font-size: 13px; color: var(--color-text-sub); text-align: center;">Nenhum manto encontrado</div>`;
        } else {
            filtered.slice(0, 5).forEach(prod => {
                const item = document.createElement("div");
                item.className = "search-item";
                const displayPrice = prod.promoPrice ? prod.promoPrice : prod.price;
                
                item.innerHTML = `
                    <img src="${prod.images[0]}" alt="${prod.name}">
                    <div class="info">
                        <h4>${prod.name}</h4>
                        <p>${prod.brand ? prod.brand + " | " : ""}R$ ${displayPrice.toFixed(2).replace('.', ',')}</p>
                    </div>
                `;
                item.addEventListener("click", () => {
                    window.location.href = `product.html?id=${prod.id}`;
                });
                searchResults.appendChild(item);
            });
        }
        searchResults.style.display = "block";
    });

    // Fechar busca ao clicar fora
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = "none";
        }
    });

    // --- CARROSSEL DE BANNERS ---
    async function initBanners() {
        const banners = (await FutDB.getBanners()).filter(b => b.active);
        // Limpar carrossel antigo preservando o contêiner de dots
        carouselContainer.querySelectorAll(".banner-slide").forEach(s => s.remove());
        dotsContainer.innerHTML = "";

        if (banners.length === 0) {
            carouselContainer.style.display = "none";
            return;
        }

        banners.forEach((banner, idx) => {
            // Slide
            const slide = document.createElement("div");
            slide.className = `banner-slide ${idx === 0 ? 'active' : ''}`;
            slide.style.background = banner.bgColor;
            
            // Adicionar um gradiente sutil com imagem de fundo estilizada se configurado
            slide.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.75)), url(${banner.image})`;
            slide.style.backgroundSize = "cover";
            slide.style.backgroundPosition = "center";

            slide.innerHTML = `
                <div class="banner-content">
                    <span class="badge badge-new" style="margin-bottom: 12px; display: inline-block;">Destaque</span>
                    <h2 class="banner-title text-gradient-volt">${banner.title}</h2>
                    <p class="banner-subtitle">${banner.subtitle}</p>
                    <a href="${banner.link}" class="btn-primary">${banner.btnText} <i class="fa-solid fa-arrow-right-long"></i></a>
                </div>
            `;
            // Inserir antes dos dots
            carouselContainer.insertBefore(slide, dotsContainer);

            // Dot
            const dot = document.createElement("div");
            dot.className = `banner-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener("click", () => showSlide(idx));
            dotsContainer.appendChild(dot);
        });

        // Configurar loop automático
        if (bannerInterval) clearInterval(bannerInterval);
        bannerInterval = setInterval(() => {
            let next = (currentSlide + 1) % banners.length;
            showSlide(next);
        }, 6000);
    }

    function showSlide(idx) {
        const slides = carouselContainer.querySelectorAll(".banner-slide");
        const dots = dotsContainer.querySelectorAll(".banner-dot");
        if (slides.length === 0) return;

        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");

        currentSlide = idx;

        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");
    }

    // --- RENDERIZAR PILLS DE CATEGORIAS ---
    async function renderCategoryPills() {
        const categories = await FutDB.getCategories();
        categoryPillsContainer.innerHTML = `<button class="category-btn active" data-category="all" id="pill-all">⚡ Todos os Mantos</button>`;
        
        categories.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "category-btn";
            btn.dataset.category = cat.name;
            btn.textContent = cat.name;
            categoryPillsContainer.appendChild(btn);
        });

        // Event listener para as pills
        categoryPillsContainer.querySelectorAll(".category-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                categoryPillsContainer.querySelector(".category-btn.active").classList.remove("active");
                e.currentTarget.classList.add("active");
                selectedCategory = e.currentTarget.dataset.category;
                
                // Atualizar parâmetro da URL sem recarregar a página
                const newUrl = selectedCategory === "all" ? "index.html" : `index.html?cat=${encodeURIComponent(selectedCategory)}`;
                window.history.pushState({ path: newUrl }, "", newUrl);

                syncHeaderNav(selectedCategory);
                renderProducts();
            });
        });
    }

    // --- RENDERIZAR CAMISAS (CATÁLOGO) ---
    async function renderProducts() {
        const products = await FutDB.getProducts();
        
        // Filtrar por categoria
        let filtered = selectedCategory === "all" ? products : products.filter(p => p.category === selectedCategory);

        // Filtrar por marca esportiva
        if (selectedBrand !== "all") {
            filtered = filtered.filter(p => (p.brand || "").toLowerCase() === selectedBrand.toLowerCase());
        }

        // Filtrar apenas promoções se a checkbox estiver marcada
        if (promoOnly) {
            filtered = filtered.filter(p => p.promoPrice !== null);
        }

        // Título dinâmico da seção
        if (selectedCategory === "all" && selectedBrand === "all") {
            catalogTitle.textContent = promoOnly ? "Ofertas Imperdíveis" : "Todos os Mantos";
        } else if (selectedBrand !== "all") {
            catalogTitle.textContent = `Mantos ${selectedBrand}`;
        } else {
            catalogTitle.textContent = selectedCategory;
        }

        productsGrid.innerHTML = "";

        if (filtered.length === 0) {
            productsGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 60px 0; text-align: center; color: var(--color-text-sub);">Nenhuma camisa disponível com esses filtros.</div>`;
            return;
        }

        // Recuperar favoritos do cliente para preencher o coração
        const currentUser = FutDB.getCurrentUser();
        const favs = (currentUser && currentUser.favorites) ? currentUser.favorites : [];

        filtered.forEach(prod => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.id = `card-${prod.id}`;

            const isFav = favs.includes(prod.id);
            const favIconClass = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
            const favActive = isFav ? "active" : "";

            // Badges
            let badgeHTML = "";
            if (prod.promoPrice) {
                const discPercent = Math.round(((prod.price - prod.promoPrice) / prod.price) * 100);
                badgeHTML += `<span class="badge badge-promo">-${discPercent}% OFF</span>`;
            }
            if (prod.type === "Jogador") {
                badgeHTML += `<span class="badge badge-new" style="background-color: var(--color-gold); color: #000;">Elite</span>`;
            } else if (prod.type === "Retrô") {
                badgeHTML += `<span class="badge badge-new" style="background-color: #3b82f6; color: #fff;">Retrô</span>`;
            }

            // Preço
            let priceHTML = "";
            if (prod.promoPrice) {
                priceHTML = `
                    <span class="price-old">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
                    <span class="price-current">R$ ${prod.promoPrice.toFixed(2).replace('.', ',')}</span>
                `;
            } else {
                priceHTML = `<span class="price-original">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>`;
            }

            card.innerHTML = `
                <div class="card-badges">${badgeHTML}</div>
                <button class="btn-fav ${favActive}" data-id="${prod.id}" title="Favoritar"><i class="${favIconClass}"></i></button>
                <div class="card-img-wrapper">
                    <img src="${prod.images[0]}" alt="${prod.name}" loading="lazy">
                </div>
                <div class="card-info">
                    <span class="card-category">${prod.brand ? prod.brand + " | " : ""}${prod.team}</span>
                    <h3 class="card-title">${prod.name}</h3>
                    <div class="card-rating">
                        <i class="fa-solid fa-star"></i>
                        <strong>${prod.rating.toFixed(1)}</strong>
                        <span>(${prod.reviewsCount})</span>
                    </div>
                    <div class="card-footer">
                        <div class="price-container">
                            ${priceHTML}
                        </div>
                        <div class="btn-quick-buy" title="Ver Detalhes / Comprar">
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            `;

            // Eventos de clique para abrir página de detalhes
            card.querySelector(".card-img-wrapper").addEventListener("click", () => {
                window.location.href = `product.html?id=${prod.id}`;
            });
            card.querySelector(".card-title").addEventListener("click", () => {
                window.location.href = `product.html?id=${prod.id}`;
            });
            card.querySelector(".btn-quick-buy").addEventListener("click", () => {
                window.location.href = `product.html?id=${prod.id}`;
            });

            // Favoritar
            card.querySelector(".btn-fav").addEventListener("click", (e) => {
                e.stopPropagation();
                toggleFavorite(prod.id, e.currentTarget);
            });

            productsGrid.appendChild(card);
        });
    }

    // --- CONTROLE DE FAVORITOS ---
    async function toggleFavorite(prodId, btnElement) {
        const currentUser = FutDB.getCurrentUser();
        if (!currentUser || currentUser.isAdmin) {
            alert("Faça login na Área do Cliente para favoritar mantos!");
            window.location.href = "profile.html";
            return;
        }

        let favs = currentUser.favorites || [];
        const heartIcon = btnElement.querySelector("i");

        if (favs.includes(prodId)) {
            // Remover
            favs = favs.filter(id => id !== prodId);
            btnElement.classList.remove("active");
            heartIcon.className = "fa-regular fa-heart";
        } else {
            // Adicionar
            favs.push(prodId);
            btnElement.classList.add("active");
            heartIcon.className = "fa-solid fa-heart";
        }

        currentUser.favorites = favs;
        await FutDB.updateClientProfile(currentUser);
    }

    // --- SINCRONIZAR ESTADO ATIVO DO MENU SUPERIOR ---
    function syncHeaderNav(catName) {
        document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
            item.classList.remove("active");
        });

        const linkHome = document.getElementById("nav-link-home");
        const linkNacional = document.getElementById("nav-link-nacional");
        const linkEuropeu = document.getElementById("nav-link-europeu");
        const linkSelecoes = document.getElementById("nav-link-selecoes");
        const linkRetro = document.getElementById("nav-link-retro");

        if (catName === "all" || !catName) {
            linkHome?.parentElement.classList.add("active");
        } else {
            let matched = false;
            if (catName === "Futebol Nacional" && linkNacional) {
                linkNacional.parentElement.classList.add("active");
                matched = true;
            } else if (catName === "Futebol Europeu" && linkEuropeu) {
                linkEuropeu.parentElement.classList.add("active");
                matched = true;
            } else if (catName === "Seleções" && linkSelecoes) {
                linkSelecoes.parentElement.classList.add("active");
                matched = true;
            } else if (catName === "Retrô" && linkRetro) {
                linkRetro.parentElement.classList.add("active");
                matched = true;
            }

            // Fallback match looking at href parameters
            if (!matched) {
                document.querySelectorAll(".nav-menu .nav-item a").forEach(link => {
                    const href = link.getAttribute("href");
                    if (href && href.includes("cat=")) {
                        const url = new URL(href, window.location.href);
                        const linkCat = url.searchParams.get("cat");
                        if (linkCat === catName) {
                            link.parentElement.classList.add("active");
                            matched = true;
                        }
                    }
                });
            }

            // Default fallback
            if (!matched && linkHome) {
                linkHome.parentElement.classList.add("active");
            }
        }
    }

    // --- CHECAGEM DA URL SE HOUVER CATEGORIA FILTRADA ---
    function checkUrlCategory() {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get("cat");
        if (catParam) {
            selectedCategory = catParam;
            // Ativar a pill correta no DOM
            document.querySelectorAll(".category-btn").forEach(btn => {
                if (btn.dataset.category === catParam) {
                    categoryPillsContainer.querySelector(".category-btn.active").classList.remove("active");
                    btn.classList.add("active");
                }
            });
            syncHeaderNav(catParam);
        } else {
            syncHeaderNav("all");
        }
    }

    // Ouvir checkbox de Promoção
    filterPromoCheckbox.addEventListener("change", (e) => {
        promoOnly = e.target.checked;
        renderProducts();
    });

    // --- FILTRO POR MARCAS ---
    async function initBrandFilter() {
        const brandFilterBar = document.getElementById("brand-filter-bar");
        if (!brandFilterBar) return;

        const brands = (await FutDB.getBrands()) || [];
        
        let html = `<button class="brand-btn active" data-brand="all" id="brand-btn-all"><i class="fa-solid fa-tags"></i> Todas</button>`;
        
        const defaultIcons = {
            "nike": "fa-solid fa-bolt",
            "adidas": "fa-solid fa-circle-nodes",
            "puma": "fa-solid fa-cat",
            "retrô": "fa-solid fa-clock-rotate-left",
            "retro": "fa-solid fa-clock-rotate-left"
        };
        
        brands.forEach(b => {
            const nameLower = b.name.toLowerCase();
            let logoHTML = "";
            if (b.logo) {
                logoHTML = `<img src="${b.logo}" style="height: 18px; width: auto; object-fit: contain; margin-right: 8px; vertical-align: middle; border-radius: 2px;">`;
            } else {
                const iconClass = b.icon || defaultIcons[nameLower] || "fa-solid fa-tag";
                logoHTML = `<i class="${iconClass}"></i> `;
            }
            html += `<button class="brand-btn" data-brand="${b.name}">${logoHTML}${b.name}</button>`;
        });
        
        brandFilterBar.innerHTML = html;

        // Ensure active class matches selectedBrand
        const activeBtn = brandFilterBar.querySelector(`.brand-btn[data-brand="${selectedBrand}"]`);
        if (activeBtn) {
            brandFilterBar.querySelector(".brand-btn.active").classList.remove("active");
            activeBtn.classList.add("active");
        } else {
            selectedBrand = "all";
        }

        brandFilterBar.querySelectorAll(".brand-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                brandFilterBar.querySelector(".brand-btn.active").classList.remove("active");
                e.currentTarget.classList.add("active");
                selectedBrand = e.currentTarget.dataset.brand;
                renderProducts();
            });
        });
    }

    // --- MOTOR DE SOCIAL PROOF (NOTIFICAÇÕES DE COMPRA) ---
    function startSocialProofEngine() {
        const toast = document.getElementById("toast-social-proof");
        const toastImg = document.getElementById("toast-product-img");
        const toastBuyer = document.getElementById("toast-buyer-info");
        const toastDesc = document.getElementById("toast-purchase-desc");
        const toastProgress = document.getElementById("toast-progress-bar");
        const toastCloseBtn = document.getElementById("toast-close-btn");

        if (!toast) return;

        let toastTimeout = null;
        let toastHideTimeout = null;

        async function showToast() {
            const products = await FutDB.getProducts();
            if (!products || products.length === 0) return;

            // Escolher produto, comprador e localização aleatoriamente
            const prod = products[Math.floor(Math.random() * products.length)];
            const buyer = SOCIAL_BUYERS[Math.floor(Math.random() * SOCIAL_BUYERS.length)];
            const location = SOCIAL_LOCATIONS[Math.floor(Math.random() * SOCIAL_LOCATIONS.length)];
            const size = SOCIAL_SIZES[Math.floor(Math.random() * SOCIAL_SIZES.length)];

            // Extrair apenas o primeiro nome do comprador
            const buyerFirstName = buyer.split(" ")[0];
            const city = location.split("/")[0];

            // Injetar conteúdo
            toastImg.innerHTML = `<img src="${prod.images[0]}" alt="${prod.name}" style="max-height:44px;width:100%;object-fit:contain;">`;
            toastBuyer.innerHTML = `<span>${buyerFirstName}</span> de ${city}`;
            toastDesc.textContent = `acabou de adquirir: ${prod.name.length > 30 ? prod.name.substring(0, 30) + '…' : prod.name} (${size})`;

            // Tornar o toast clicável (vai para a página do produto)
            toast.onclick = () => {
                window.location.href = `product.html?id=${prod.id}`;
            };

            // Mostrar o toast
            toast.classList.add("show");

            // Animar barra de progresso
            toastProgress.style.animation = "none";
            toastProgress.offsetHeight; // reflow forçado para reiniciar a animação
            toastProgress.style.animation = "progressShrink 6s linear forwards";

            // Esconder após 6 segundos
            if (toastHideTimeout) clearTimeout(toastHideTimeout);
            toastHideTimeout = setTimeout(() => {
                toast.classList.remove("show");
            }, 6000);
        }

        // Fechar ao clicar no X
        if (toastCloseBtn) {
            toastCloseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toast.classList.remove("show");
                if (toastHideTimeout) clearTimeout(toastHideTimeout);
            });
        }

        // Disparar a primeira notificação após 12 segundos e depois a cada 22 segundos
        setTimeout(() => {
            showToast();
            toastTimeout = setInterval(showToast, 22000);
        }, 12000);
    }

    // --- POP-UP PROMOCIONAL MARKETING ---
    async function checkMarketingPopup() {
        const popData = await FutDB.getPopups();
        if (!popData || !popData.active) return;

        // Evitar exibir em todas as recargas da mesma aba (guardar na sessionStorage)
        if (sessionStorage.getItem("fc_popup_dismissed") === "true") return;

        popupTitle.textContent = popData.title;
        popupMessage.textContent = popData.message;
        popupCouponCode.textContent = popData.couponCode;

        // Disparar o popup após 3 segundos
        setTimeout(() => {
            promoPopup.classList.add("active");
        }, 3000);
    }

    // Fechar popup
    popupCloseBtn.addEventListener("click", () => {
        promoPopup.classList.remove("active");
        sessionStorage.setItem("fc_popup_dismissed", "true");
    });

    // Captura de e-mail e revelação de cupom
    popupSubmitBtn.addEventListener("click", () => {
        const email = popupEmailInput.value.trim();
        if (!email || !email.includes("@")) {
            alert("Por favor, digite um e-mail válido para liberar o cupom!");
            return;
        }

        // Salvar lead simulada
        console.log(`Lead capturada: ${email}`);

        // Ocultar formulário e exibir o cupom
        popupFormArea.style.display = "none";
        popupCouponReveal.style.display = "block";
    });

    // Copiar cupom ao clicar na caixa tracejada
    popupCouponReveal.addEventListener("click", () => {
        const code = popupCouponCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const extraText = popupCouponReveal.querySelector("div");
            extraText.textContent = "✓ COPIADO COM SUCESSO!";
            extraText.style.color = "var(--color-volt)";
            
            setTimeout(() => {
                promoPopup.classList.remove("active");
                sessionStorage.setItem("fc_popup_dismissed", "true");
            }, 1200);
        });
    });

    // --- OUVINTE PARA ATUALIZAÇÕES ADMIN EM OUTRAS ABAS ---
    window.addEventListener("fc_products_updated", () => renderProducts());
    window.addEventListener("fc_banners_updated", () => initBanners());
    window.addEventListener("fc_popups_updated", () => checkMarketingPopup());
    window.addEventListener("fc_brands_updated", async () => {
        await initBrandFilter();
        await renderProducts();
    });

    // --- INICIALIZAÇÃO GERAL DA HOME ---
    async function initHome() {
        await initBanners();
        await renderCategoryPills();
        await initBrandFilter();
        checkUrlCategory(); // Validar se veio parametro pela URL
        await renderProducts();
        await checkMarketingPopup();
        startSocialProofEngine();
    }
    initHome();
});
