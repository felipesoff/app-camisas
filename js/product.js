/**
 * FUTCOMMERCE - CONTROLADOR DOS DETALHES DO PRODUTO
 * 
 * Lógica da página product.html. Gerencia galeria de fotos, seleção de tamanhos,
 * estoque dinâmico, adição ao carrinho, favoritar e submissão de avaliações.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // --- ESTADO DA PÁGINA ---
    let product = null;
    let selectedSize = null;
    let selectedRating = 0;

    // --- PARSE DA URL ---
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
        window.location.href = "index.html";
        return;
    }

    product = await FutDB.getProductById(productId);
    if (!product) {
        window.location.href = "index.html";
        return;
    }

    // --- ELEMENTOS DO DOM ---
    // Galeria
    const galleryMain = document.getElementById("gallery-main-view");
    const galleryThumbs = document.getElementById("gallery-thumbs-list");

    // Detalhes textuais
    const pBrandTeam = document.getElementById("p-brand-team");
    const pName = document.getElementById("p-name");
    const pSubtitle = document.getElementById("p-title-short");
    const pDescription = document.getElementById("p-description");
    const pPriceBox = document.getElementById("p-price-box");
    const pRatingBox = document.getElementById("p-rating-box");
    const pStockIndicator = document.getElementById("p-stock-indicator");
    const pSizesGrid = document.getElementById("p-sizes-grid");

    // Metadados
    const pGender = document.getElementById("p-meta-gender");
    const pType = document.getElementById("p-meta-type");
    const pSku = document.getElementById("p-meta-sku");
    const pCollection = document.getElementById("p-meta-collection");

    // Botões
    const btnAddToCart = document.getElementById("btn-add-to-cart");
    const btnToggleFav = document.getElementById("btn-toggle-favorite");

    // Avaliações
    const summaryAvgRating = document.getElementById("summary-avg-rating");
    const summaryAvgStars = document.getElementById("summary-avg-stars");
    const summaryReviewsCount = document.getElementById("summary-reviews-count");
    const reviewsListContainer = document.getElementById("reviews-list-container");
    const starsSelector = document.getElementById("form-rating-stars");
    const formAuthorInput = document.getElementById("form-author-name");
    const formReviewText = document.getElementById("form-review-text");
    const btnSubmitReview = document.getElementById("btn-submit-review");

    // Header Cart Badge
    const cartBadgeCount = document.getElementById("cart-badge-count");
    
    // Upload de fotos em reviews
    let uploadedReviewPhotos = [];
    const formReviewPhotos = document.getElementById("form-review-photos");
    const reviewPhotosPreview = document.getElementById("review-photos-preview");
    const photoZoomModal = document.getElementById("photo-zoom-modal");
    const zoomModalImg = document.getElementById("zoom-modal-img");
    const btnCloseZoomModal = document.getElementById("btn-close-zoom-modal");
    
    // --- ATUALIZAR BADGE DE CARRINHO ---
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
    updateCartBadge();

    // --- CONFIGURAR CABEÇALHO DA PÁGINA (SEO) ---
    document.title = `FutCommerce | ${product.name}`;

    // --- CARREGAR DADOS DO PRODUTO NO DOM ---
    pBrandTeam.textContent = `${product.brand} | ${product.team}`;
    pName.textContent = product.name;
    pSubtitle.textContent = product.title;
    pDescription.textContent = product.description;
    
    pGender.textContent = product.gender;
    pType.textContent = product.type;
    pSku.textContent = product.sku;
    pCollection.textContent = product.collection;

    // Favoritos estado inicial do botão
    function updateFavButtonState() {
        const currentUser = FutDB.getCurrentUser();
        const favs = (currentUser && currentUser.favorites) ? currentUser.favorites : [];
        const isFav = favs.includes(product.id);
        const icon = btnToggleFav.querySelector("i");
        
        if (isFav) {
            btnToggleFav.classList.add("active");
            btnToggleFav.style.backgroundColor = "var(--color-danger)";
            btnToggleFav.style.borderColor = "var(--color-danger)";
            icon.className = "fa-solid fa-heart";
            icon.style.color = "#ffffff";
        } else {
            btnToggleFav.classList.remove("active");
            btnToggleFav.style.backgroundColor = "var(--bg-element)";
            btnToggleFav.style.borderColor = "var(--glass-border)";
            icon.className = "fa-regular fa-heart";
            icon.style.color = "";
        }
    }
    updateFavButtonState();

    // --- PROCESSAR PREÇOS ---
    pPriceBox.innerHTML = "";
    if (product.promoPrice) {
        pPriceBox.innerHTML = `
            <span class="p-price-old">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
            <span class="p-price-new">R$ ${product.promoPrice.toFixed(2).replace('.', ',')}</span>
        `;
    } else {
        pPriceBox.innerHTML = `
            <span class="p-price-normal">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
        `;
    }

    // --- GERAR GALERIA DE IMAGENS E VÍDEOS ---
    function renderGallery() {
        const firstMedia = product.images[0];
        const isVideo = firstMedia && (firstMedia.startsWith("data:video/") || firstMedia.endsWith(".mp4") || firstMedia.endsWith(".webm") || firstMedia.endsWith(".ogg"));
        
        if (isVideo) {
            galleryMain.innerHTML = `<video src="${firstMedia}" controls style="max-height: 400px; width: 100%; object-fit: contain; border-radius: var(--border-radius-lg);"></video>`;
        } else {
            galleryMain.innerHTML = `<img src="${firstMedia}" alt="${product.name}" id="main-product-img">`;
        }
        
        galleryThumbs.innerHTML = "";

        if (product.images.length > 1) {
            galleryThumbs.style.display = "flex";
            product.images.forEach((imgSrc, idx) => {
                const thumb = document.createElement("div");
                thumb.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
                thumb.style.position = "relative";
                
                const isThumbVideo = imgSrc && (imgSrc.startsWith("data:video/") || imgSrc.endsWith(".mp4") || imgSrc.endsWith(".webm") || imgSrc.endsWith(".ogg"));
                if (isThumbVideo) {
                    thumb.innerHTML = `<video src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video><i class="fa-solid fa-play" style="position: absolute; color: white; font-size: 14px; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.8;"></i>`;
                } else {
                    thumb.innerHTML = `<img src="${imgSrc}" alt="Miniatura ${idx + 1}">`;
                }
                
                thumb.addEventListener("click", () => {
                    galleryThumbs.querySelector(".thumb-item.active").classList.remove("active");
                    thumb.classList.add("active");
                    
                    const isSelectVideo = imgSrc && (imgSrc.startsWith("data:video/") || imgSrc.endsWith(".mp4") || imgSrc.endsWith(".webm") || imgSrc.endsWith(".ogg"));
                    if (isSelectVideo) {
                        galleryMain.innerHTML = `<video src="${imgSrc}" controls autoplay style="max-height: 400px; width: 100%; object-fit: contain; border-radius: var(--border-radius-lg);"></video>`;
                    } else {
                        galleryMain.innerHTML = `<img src="${imgSrc}" alt="${product.name}" id="main-product-img">`;
                    }
                });
                
                galleryThumbs.appendChild(thumb);
            });
        } else {
            galleryThumbs.style.display = "none";
        }
    }
    renderGallery();

    // --- GERAR GRADE DE TAMANHOS ---
    function renderSizes() {
        pSizesGrid.innerHTML = "";
        product.sizes.forEach(size => {
            const btn = document.createElement("button");
            btn.className = "size-btn";
            btn.textContent = size.name;

            if (size.stock <= 0) {
                btn.classList.add("esgotado");
                btn.title = "Tamanho Esgotado";
            } else {
                btn.addEventListener("click", () => {
                    const activeBtn = pSizesGrid.querySelector(".size-btn.active");
                    if (activeBtn) activeBtn.classList.remove("active");
                    
                    btn.classList.add("active");
                    selectedSize = size.name;

                    // Atualizar indicador de estoque
                    if (size.stock <= 3) {
                        pStockIndicator.innerHTML = `<span style="color: var(--color-danger); font-weight: 700;">🔥 ÚLTIMAS UNIDADES! Apenas ${size.stock} em estoque</span>`;
                    } else {
                        pStockIndicator.innerHTML = `<span style="color: var(--color-success); font-weight: 600;">Estoque: ${size.stock} unidades disponíveis</span>`;
                    }
                });
            }
            pSizesGrid.appendChild(btn);
        });
    }
    renderSizes();

    // --- DETALHES DE ESTRELA EM AVALIAÇÕES ---
    function renderStarsHTML(rating) {
        let starsHTML = "";
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.4;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += `<i class="fa-solid fa-star"></i>`;
            } else if (i === fullStars + 1 && hasHalf) {
                starsHTML += `<i class="fa-solid fa-star-half-stroke"></i>`;
            } else {
                starsHTML += `<i class="fa-regular fa-star"></i>`;
            }
        }
        return starsHTML;
    }

    // Carregar estrelas do produto
    pRatingBox.innerHTML = `
        <div style="color: var(--color-gold); font-size: 15px;">
            ${renderStarsHTML(product.rating)}
        </div>
        <strong style="font-size: 15px;">${product.rating.toFixed(1)}</strong>
        <span style="color: var(--color-text-sub); font-size: 13px;">(${product.reviewsCount} opiniões)</span>
    `;

    // --- ADICIONAR AO CARRINHO ---
    btnAddToCart.addEventListener("click", async () => {
        if (!selectedSize) {
            alert("Selecione um tamanho disponível (P, M, G, GG ou XG) antes de adicionar ao carrinho!");
            return;
        }

        const success = await FutDB.addToCart(product.id, selectedSize, 1);
        if (success) {
            // Mostrar modal ou alert de sucesso premium
            const confirmationMsg = `✓ Manto "${product.name}" tamanho (${selectedSize}) adicionado ao seu carrinho com sucesso!`;
            
            // Injetar uma barra verde de feedback flutuante no topo do ecrã
            const alertBar = document.createElement("div");
            alertBar.style.position = "fixed";
            alertBar.style.top = "100px";
            alertBar.style.left = "50%";
            alertBar.style.transform = "translateX(-50%)";
            alertBar.style.backgroundColor = "var(--color-success)";
            alertBar.style.color = "var(--color-text-dark)";
            alertBar.style.fontWeight = "700";
            alertBar.style.padding = "14px 28px";
            alertBar.style.borderRadius = "var(--border-radius-md)";
            alertBar.style.boxShadow = "0 10px 30px rgba(0,230,118,0.3)";
            alertBar.style.zIndex = "999";
            alertBar.style.fontSize = "14px";
            alertBar.style.display = "flex";
            alertBar.style.alignItems = "center";
            alertBar.style.gap = "8px";
            alertBar.innerHTML = `<i class="fa-solid fa-circle-check" style="font-size: 18px;"></i> ${confirmationMsg}`;
            
            document.body.appendChild(alertBar);
            
            // Atualizar badge do header
            updateCartBadge();

            // Limpar tamanho selecionado e resetar indicador
            const activeBtn = pSizesGrid.querySelector(".size-btn.active");
            if (activeBtn) activeBtn.classList.remove("active");
            selectedSize = null;
            pStockIndicator.textContent = "Escolha um tamanho para ver o estoque";

            setTimeout(() => {
                alertBar.style.transition = "opacity 0.5s ease";
                alertBar.style.opacity = "0";
                setTimeout(() => alertBar.remove(), 500);
            }, 3000);
        } else {
            alert("Erro ao adicionar item. Limite de estoque atingido para este tamanho.");
        }
    });

    // --- FAVORITAR ---
    btnToggleFav.addEventListener("click", async () => {
        const currentUser = FutDB.getCurrentUser();
        if (!currentUser || currentUser.isAdmin) {
            alert("Acesse a Área do Cliente para favoritar mantos!");
            window.location.href = "profile.html";
            return;
        }

        let favs = currentUser.favorites || [];
        if (favs.includes(product.id)) {
            favs = favs.filter(id => id !== product.id);
        } else {
            favs.push(product.id);
        }
        
        currentUser.favorites = favs;
        await FutDB.updateClientProfile(currentUser);
        updateFavButtonState();
    });

    // --- RENDERIZAR AVALIAÇÕES ---
    function renderReviews() {
        summaryAvgRating.textContent = product.rating.toFixed(1);
        summaryAvgStars.innerHTML = renderStarsHTML(product.rating);
        summaryReviewsCount.textContent = `Baseado em ${product.reviewsCount} avaliações`;

        reviewsListContainer.innerHTML = "";
        
        if (!product.reviews || product.reviews.length === 0) {
            reviewsListContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-text-sub); border: var(--glass-border); border-radius: var(--border-radius-lg); background-color: var(--bg-card);">
                    <i class="fa-regular fa-comment-dots" style="font-size: 32px; color: var(--bg-element-light); margin-bottom: 12px;"></i>
                    <p style="font-size: 14px;">Este manto ainda não possui avaliações. Seja o primeiro a opinar!</p>
                </div>
            `;
            return;
        }

        product.reviews.forEach(review => {
            const card = document.createElement("div");
            card.className = "review-card";
            
            let photosHTML = "";
            if (review.photos && review.photos.length > 0) {
                photosHTML = `<div class="review-photos-list" style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">`;
                review.photos.forEach(photoSrc => {
                    photosHTML += `<img src="${photoSrc}" class="review-photo-thumb" style="width: 70px; height: 70px; object-fit: cover; border-radius: var(--border-radius-sm); border: var(--glass-border); cursor: pointer; transition: transform var(--transition-smooth);" alt="Foto do produto">`;
                });
                photosHTML += `</div>`;
            }

            card.innerHTML = `
                <div class="review-header">
                    <div>
                        <span class="review-author">${review.author}</span>
                        <div class="review-rating" style="margin-top: 4px;">
                            ${renderStarsHTML(review.rating)}
                        </div>
                    </div>
                    <span class="review-date">${review.date}</span>
                </div>
                <p class="review-text">${review.text}</p>
                ${photosHTML}
            `;

            // Adicionar evento de clique para zoom nas fotos
            if (review.photos && review.photos.length > 0) {
                card.querySelectorAll(".review-photo-thumb").forEach(thumb => {
                    thumb.addEventListener("click", () => {
                        if (photoZoomModal && zoomModalImg) {
                            zoomModalImg.src = thumb.src;
                            photoZoomModal.classList.add("active");
                        }
                    });
                });
            }

            reviewsListContainer.appendChild(card);
        });
    }
    renderReviews();

    // --- FORMULÁRIO DE SELETOR DE ESTRELAS ---
    starsSelector.querySelectorAll(".star-select-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            selectedRating = parseInt(e.currentTarget.dataset.value);
            
            // Iluminar as estrelas selecionadas
            starsSelector.querySelectorAll(".star-select-btn").forEach(star => {
                const starVal = parseInt(star.dataset.value);
                if (starVal <= selectedRating) {
                    star.classList.add("active");
                } else {
                    star.classList.remove("active");
                }
            });
        });
    });

    // Listeners do Upload de fotos e zoom modal
    if (formReviewPhotos) {
        formReviewPhotos.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`O arquivo ${file.name} excede o limite de 5MB!`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedReviewPhotos.push(event.target.result);
                    renderReviewPhotosPreviews();
                };
                reader.readAsDataURL(file);
            });
            formReviewPhotos.value = "";
        });
    }

    function renderReviewPhotosPreviews() {
        if (!reviewPhotosPreview) return;
        reviewPhotosPreview.innerHTML = "";
        uploadedReviewPhotos.forEach((src, idx) => {
            const thumb = document.createElement("div");
            thumb.className = "review-photo-preview-item";
            thumb.style.position = "relative";
            thumb.style.width = "60px";
            thumb.style.height = "60px";
            thumb.style.borderRadius = "var(--border-radius-sm)";
            thumb.style.overflow = "hidden";
            thumb.style.border = "var(--glass-border)";
            thumb.innerHTML = `
                <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="remove-btn" style="position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background-color: rgba(220,53,69,0.9); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer;">
                    <i class="fa-solid fa-xmark"></i>
                </div>
            `;
            thumb.querySelector(".remove-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                uploadedReviewPhotos.splice(idx, 1);
                renderReviewPhotosPreviews();
            });
            reviewPhotosPreview.appendChild(thumb);
        });
    }

    if (btnCloseZoomModal && photoZoomModal) {
        btnCloseZoomModal.addEventListener("click", () => {
            photoZoomModal.classList.remove("active");
        });
        photoZoomModal.addEventListener("click", (e) => {
            if (e.target === photoZoomModal) {
                photoZoomModal.classList.remove("active");
            }
        });
    }

    // Submissão do Formulário de Avaliação
    btnSubmitReview.addEventListener("click", () => {
        const author = formAuthorInput.value.trim();
        const text = formReviewText.value.trim();

        if (selectedRating === 0) {
            alert("Selecione uma nota de 1 a 5 estrelas clicando nelas!");
            return;
        }
        if (!author) {
            alert("Por favor, informe seu nome!");
            return;
        }
        if (!text || text.length < 5) {
            alert("Escreva uma avaliação com pelo menos 5 caracteres!");
            return;
        }

        // Criar objeto
        const newReview = {
            author: author,
            rating: selectedRating,
            date: new Date().toISOString().split('T')[0],
            text: text,
            photos: [...uploadedReviewPhotos]
        };

        // Adicionar ao array do produto
        if (!product.reviews) product.reviews = [];
        product.reviews.unshift(newReview);

        // Recalcular média e contagem de avaliações
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.reviewsCount = product.reviews.length;
        product.rating = totalRating / product.reviewsCount;

        // Salvar no estado
        await FutDB.updateProduct(product);

        // Limpar formulário
        formAuthorInput.value = "";
        formReviewText.value = "";
        selectedRating = 0;
        starsSelector.querySelectorAll(".star-select-btn").forEach(s => s.classList.remove("active"));
        uploadedReviewPhotos = [];
        if (reviewPhotosPreview) reviewPhotosPreview.innerHTML = "";

        // Re-renderizar elementos da tela
        renderReviews();
        
        // Atualizar estrelas e nota média no painel principal
        pRatingBox.innerHTML = `
            <div style="color: var(--color-gold); font-size: 15px;">
                ${renderStarsHTML(product.rating)}
            </div>
            <strong style="font-size: 15px;">${product.rating.toFixed(1)}</strong>
            <span style="color: var(--color-text-sub); font-size: 13px;">(${product.reviewsCount} opiniões)</span>
        `;

        alert("Muito obrigado! Sua avaliação foi enviada e integrada com sucesso ao manto.");
    });

    // --- MOTOR DE SOCIAL PROOF (TAMBÉM NA PÁGINA DE PRODUTO) ---
    (function startProductSocialProof() {
        const toast = document.getElementById("toast-social-proof");
        const toastImg = document.getElementById("toast-product-img");
        const toastBuyer = document.getElementById("toast-buyer-info");
        const toastDesc = document.getElementById("toast-purchase-desc");
        const toastProgress = document.getElementById("toast-progress-bar");
        const toastCloseBtn = document.getElementById("toast-close-btn");

        if (!toast) return;

        const BUYERS = ["Thiago","Amanda","Lucas","Carla","Felipe","Juliana","Rafael","Bruna","Matheus","Fernanda","Diego","Isabela","Victor","Larissa"];
        const LOCS   = ["São Paulo/SP","Rio de Janeiro/RJ","Belo Horizonte/MG","Porto Alegre/RS","Curitiba/PR","Recife/PE","Salvador/BA","Goiânia/GO"];
        const SIZES  = ["P","M","G","GG"];

        let hideTimeout = null;

        async function showToast() {
            const products = await FutDB.getProducts();
            if (!products || products.length === 0) return;
            const prod    = products[Math.floor(Math.random() * products.length)];
            const buyer   = BUYERS[Math.floor(Math.random() * BUYERS.length)];
            const loc     = LOCS[Math.floor(Math.random() * LOCS.length)];
            const size    = SIZES[Math.floor(Math.random() * SIZES.length)];
            const city    = loc.split("/")[0];

            toastImg.innerHTML = `<img src="${prod.images[0]}" alt="${prod.name}" style="max-height:44px;width:100%;object-fit:contain;">`;
            toastBuyer.innerHTML = `<span>${buyer}</span> de ${city}`;
            toastDesc.textContent = `acabou de adquirir: ${prod.name.length > 30 ? prod.name.substring(0, 30) + '…' : prod.name} (${size})`;

            toast.onclick = () => { window.location.href = `product.html?id=${prod.id}`; };
            toast.classList.add("show");

            toastProgress.style.animation = "none";
            toastProgress.offsetHeight;
            toastProgress.style.animation = "progressShrink 6s linear forwards";

            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => toast.classList.remove("show"), 6000);
        }

        if (toastCloseBtn) {
            toastCloseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toast.classList.remove("show");
                if (hideTimeout) clearTimeout(hideTimeout);
            });
        }

        setTimeout(() => { showToast(); setInterval(showToast, 22000); }, 15000);
    })();
});
