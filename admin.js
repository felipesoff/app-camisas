/**
 * FUTCOMMERCE - CONTROLADOR DO PAINEL ADMIN
 * 
 * Lógica de admin.html. Gerencia login administrativo, cálculo dinâmico de estatísticas,
 * CRUD completo de produtos (incluindo o gerador visual de camisas SVG customizadas),
 * fluxo de atualização de status de pedidos e controle de banners/pop-ups de marketing.
 */

document.addEventListener("DOMContentLoaded", async () => {
    console.log("[DEBUG] admin.js loaded");
    // --- ESTADO GERAL ---
    let currentAdminSession = null;
    let activeProductCrestMapping = {
        'realmadrid': 'CRESTS.realmadrid',
        'barcelona': 'CRESTS.barcelona',
        'flamengo': 'CRESTS.flamengo',
        'corinthians': 'CRESTS.corinthians',
        'corinthians_blackout': 'CRESTS.corinthians_blackout',
        'brasil': 'CRESTS.brasil',
        'argentina': 'CRESTS.argentina',
        'milan': 'CRESTS.milan',
        'boca': 'CRESTS.boca'
    };

    // --- ELEMENTOS DO DOM ---
    const loginContainer = document.getElementById("admin-login-container");
    const dashboardContainer = document.getElementById("admin-dashboard-container");

    // Login
    const inputEmail = document.getElementById("admin-email");
    const inputPassword = document.getElementById("admin-password");
    const btnLogin = document.getElementById("btn-admin-login");

    // Abas Laterais
    const tabHome = document.getElementById("admin-tab-home");
    const tabProducts = document.getElementById("admin-tab-products");
    const tabCategories = document.getElementById("admin-tab-categories");
    const tabOrders = document.getElementById("admin-tab-orders");
    const tabMarketing = document.getElementById("admin-tab-marketing");
    const tabCoupons = document.getElementById("admin-tab-coupons");
    const tabSettings = document.getElementById("admin-tab-settings");
    const tabLogout = document.getElementById("admin-tab-logout");

    // Panéis
    const paneHome = document.getElementById("pane-admin-home");
    const paneProducts = document.getElementById("pane-admin-products");
    const paneCategories = document.getElementById("pane-admin-categories");
    const paneOrders = document.getElementById("pane-admin-orders");
    const paneMarketing = document.getElementById("pane-admin-marketing");
    const paneCoupons = document.getElementById("pane-admin-coupons");
    const paneSettings = document.getElementById("pane-admin-settings");

    // Estatísticas
    const statRevenue = document.getElementById("stat-revenue");
    const statOrders = document.getElementById("stat-orders");
    const statProducts = document.getElementById("stat-products");
    const tableRecentSales = document.getElementById("admin-table-recent-sales").querySelector("tbody");

    // CRUD Produtos
    const tableProducts = document.getElementById("admin-table-products").querySelector("tbody");
    const btnOpenProductModal = document.getElementById("btn-open-product-modal");
    const btnCloseProductModal = document.getElementById("btn-close-product-modal");
    const productModal = document.getElementById("product-modal");
    const modalProductTitle = document.getElementById("modal-product-title");
    const btnSaveProduct = document.getElementById("btn-save-product");

    // Inputs CRUD Form
    const fId = document.getElementById("form-prod-id");
    const fName = document.getElementById("form-prod-name");
    const fSku = document.getElementById("form-prod-sku");
    const fTitle = document.getElementById("form-prod-title");
    const fTeam = document.getElementById("form-prod-team");
    const fDescription = document.getElementById("form-prod-description");
    const fPrice = document.getElementById("form-prod-price");
    const fPromoPrice = document.getElementById("form-prod-promoprice");
    const fBrand = document.getElementById("form-prod-brand");
    const fCategory = document.getElementById("form-prod-category");
    const fGender = document.getElementById("form-prod-gender");
    const fType = document.getElementById("form-prod-type");
    const fCollection = document.getElementById("form-prod-collection");

    // Estoques individuais
    const fSizeP = document.getElementById("form-size-p");
    const fSizeM = document.getElementById("form-size-m");
    const fSizeG = document.getElementById("form-size-g");
    const fSizeGG = document.getElementById("form-size-gg");
    const fSizeXG = document.getElementById("form-size-xg");

    // CRUD Marcas
    const tabBrands = document.getElementById("admin-tab-brands");
    const paneBrands = document.getElementById("pane-admin-brands");
    const tableBrands = document.getElementById("admin-table-brands") ? document.getElementById("admin-table-brands").querySelector("tbody") : null;
    const btnOpenBrandModal = document.getElementById("btn-open-brand-modal");
    const btnCloseBrandModal = document.getElementById("btn-close-brand-modal");
    const brandModal = document.getElementById("brand-modal");
    const modalBrandTitle = document.getElementById("modal-brand-title");
    const btnSaveBrand = document.getElementById("btn-save-brand");

    const formBrandOldName = document.getElementById("form-brand-old-name");
    const formBrandName = document.getElementById("form-brand-name");
    const formBrandIcon = document.getElementById("form-brand-icon");
    const formBrandLogoUpload = document.getElementById("form-brand-logo-upload");
    const brandLogoPreview = document.getElementById("brand-logo-preview");
    let uploadedBrandLogo = "";

    // CRUD Pedidos
    const tableOrders = document.getElementById("admin-table-orders").querySelector("tbody");

    // Marketing Visual
    const mktPopupStatus = document.getElementById("mkt-popup-status");
    const mktPopupTitle = document.getElementById("mkt-popup-title");
    const mktPopupCoupon = document.getElementById("mkt-popup-coupon");
    const mktPopupMessage = document.getElementById("mkt-popup-message");
    const btnSaveMktPopup = document.getElementById("btn-save-mkt-popup");
    const mktBannersWrapper = document.getElementById("mkt-banners-list-wrapper");

    // CRUD Cupons
    const tableCoupons = document.getElementById("admin-table-coupons") ? document.getElementById("admin-table-coupons").querySelector("tbody") : null;
    const btnOpenCouponModal = document.getElementById("btn-open-coupon-modal");
    const btnCloseCouponModal = document.getElementById("btn-close-coupon-modal");
    const couponModal = document.getElementById("coupon-modal");
    const modalCouponTitle = document.getElementById("modal-coupon-title");
    const btnSaveCoupon = document.getElementById("btn-save-coupon");

    const formCouponId = document.getElementById("form-coupon-id");
    const formCouponCode = document.getElementById("form-coupon-code");
    const formCouponType = document.getElementById("form-coupon-type");
    const formCouponValue = document.getElementById("form-coupon-value");
    const formCouponStatus = document.getElementById("form-coupon-status");

    // Media & Custom Sizes
    const formProdMedia = document.getElementById("form-prod-media");
    const mediaPreview = document.getElementById("media-preview");
    const btnAddCustomSizeRow = document.getElementById("btn-add-custom-size-row");
    const customSizesList = document.getElementById("custom-sizes-list");

    // CRUD Categorias
    const tableCategories = document.getElementById("admin-table-categories") ? document.getElementById("admin-table-categories").querySelector("tbody") : null;
    const btnOpenCategoryModal = document.getElementById("btn-open-category-modal");
    const btnCloseCategoryModal = document.getElementById("btn-close-category-modal");
    const categoryModal = document.getElementById("category-modal");
    const modalCategoryTitle = document.getElementById("modal-category-title");
    const btnSaveCategory = document.getElementById("btn-save-category");

    const formCategoryOldName = document.getElementById("form-category-old-name");
    const formCategoryName = document.getElementById("form-category-name");
    const formCategorySubcategories = document.getElementById("form-category-subcategories");
    const categoryProductAssociationList = document.getElementById("category-product-association-list");

    let uploadedMedia = []; // Array temporário para fotos/vídeos em Base64

    // --- CHECAR AUTENTICAÇÃO ---
    async function checkAuth() {
        currentAdminSession = FutDB.getCurrentUser();

        // Se estiver logado e for Administrador
        console.log('[DEBUG] checkAuth currentAdminSession', currentAdminSession);
        if (currentAdminSession && currentAdminSession.isAdmin) {
            loginContainer.style.display = "none";
            dashboardContainer.style.display = "grid";
            await setupDashboard();
        } else {
            loginContainer.style.display = "flex";
            dashboardContainer.style.display = "none";
        }
    }

    // Processo de Login Admin
        btnLogin.addEventListener("click", async (e) => {
            e.preventDefault();
            const email = inputEmail.value.trim();
            const password = inputPassword.value.trim();
            console.log("[DEBUG] Attempt login with", email, password);
            if (!email || !password) {
                alert("Preencha o e-mail e senha administrativo!");
                return;
            }

            try {
                const session = await FutDB.login(email, password, true);
                console.log("[DEBUG] Login result", session);
                if (session) {
                    await checkAuth();
                } else {
                    alert("Acesso Negado! Credenciais incorretas.");
                }
            } catch (err) {
                alert("Erro durante o login: " + err.message + "\nStack: " + err.stack);
            }
        });

    // Processo de Logout
    tabLogout.addEventListener("click", async () => {
        if (confirm("Deseja realmente sair do painel administrativo?")) {
            await FutDB.logout();
            await checkAuth();
        }
    });

    // --- CONTROLE DE ABAS DO DASHBOARD ---
    const adminPanes = {
        home: { tab: tabHome, pane: paneHome, load: loadStats },
        products: { tab: tabProducts, pane: paneProducts, load: loadProductsTable },
        categories: { tab: tabCategories, pane: paneCategories, load: loadCategoriesTable },
        brands: { tab: tabBrands, pane: paneBrands, load: loadBrandsTable },
        orders: { tab: tabOrders, pane: paneOrders, load: loadOrdersTable },
        marketing: { tab: tabMarketing, pane: paneMarketing, load: loadMarketingPanel },
        coupons: { tab: tabCoupons, pane: paneCoupons, load: loadCouponsTable },
        settings: { tab: tabSettings, pane: paneSettings, load: loadAdminSettings }
    };

    async function switchAdminTab(paneName) {
        if (!adminPanes[paneName]) return;

        // Desativar
        Object.keys(adminPanes).forEach(k => {
            if (adminPanes[k].tab) adminPanes[k].tab.classList.remove("active");
            if (adminPanes[k].pane) {
                adminPanes[k].pane.classList.remove("active");
                adminPanes[k].pane.style.display = "none";
            }
        });

        // Ativar
        if (adminPanes[paneName].tab) adminPanes[paneName].tab.classList.add("active");
        if (adminPanes[paneName].pane) {
            adminPanes[paneName].pane.classList.add("active");
            adminPanes[paneName].pane.style.display = "block";
        }

        // Carregar
        await adminPanes[paneName].load();
    }

    tabHome.addEventListener("click", () => switchAdminTab("home"));
    tabProducts.addEventListener("click", () => switchAdminTab("products"));
    tabCategories.addEventListener("click", () => switchAdminTab("categories"));
    if (tabBrands) tabBrands.addEventListener("click", () => switchAdminTab("brands"));
    tabOrders.addEventListener("click", () => switchAdminTab("orders"));
    tabMarketing.addEventListener("click", () => switchAdminTab("marketing"));
    tabCoupons.addEventListener("click", () => switchAdminTab("coupons"));
    tabSettings.addEventListener("click", () => switchAdminTab("settings"));

    // --- INICIALIZAR DASHBOARD ---
    async function setupDashboard() {
        await populateProductCategoryOptions();
        await populateProductBrandOptions();
        await switchAdminTab("home"); // Inicia na home por padrão
    }

    // --- PAINEL 1: CARREGAR ESTATÍSTICAS E FATURAMENTO ---
    async function loadStats() {
        const orders = await FutDB.getOrders();
        const products = await FutDB.getProducts();

        // Calcular faturamento (apenas pedidos "Pago", "Enviado" e "Entregue")
        const revenue = orders
            .filter(o => o.status === "Pago" || o.status === "Enviado" || o.status === "Entregue")
            .reduce((sum, o) => sum + o.total, 0);

        statRevenue.textContent = `R$ ${revenue.toFixed(2).replace('.', ',')}`;
        statOrders.textContent = orders.length;
        statProducts.textContent = products.length;

        // Renderizar vendas recentes (últimas 5)
        tableRecentSales.innerHTML = "";
        if (orders.length === 0) {
            tableRecentSales.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-sub);">Nenhum pedido efetuado ainda.</td></tr>`;
            return;
        }

        orders.slice(0, 5).forEach(order => {
            const tr = document.createElement("tr");
            let statusClass = `status-${order.status.toLowerCase()}`;

            tr.innerHTML = `
                <td><strong style="color: var(--color-gold);">#${order.id}</strong></td>
                <td>${order.date}</td>
                <td>${order.userName || order.userEmail}</td>
                <td>R$ ${order.total.toFixed(2).replace('.', ',')}</td>
                <td>${order.paymentMethod}</td>
                <td><span class="order-status-badge ${statusClass}">${order.status}</span></td>
            `;
            tableRecentSales.appendChild(tr);
        });
    }

    // --- PAINEL 2: CRUD DE PRODUTOS ---
    async function loadProductsTable() {
        const products = await FutDB.getProducts();
        tableProducts.innerHTML = "";

        if (products.length === 0) {
            tableProducts.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-sub);">Nenhuma camisa cadastrada.</td></tr>`;
            return;
        }

        products.forEach(prod => {
            const tr = document.createElement("tr");
            
            // Totalizar estoque
            const totalStock = prod.sizes.reduce((sum, s) => sum + s.stock, 0);

            // Preços formatados
            const priceOldStr = `R$ ${prod.price.toFixed(2).replace('.', ',')}`;
            const priceNewStr = prod.promoPrice ? `R$ ${prod.promoPrice.toFixed(2).replace('.', ',')}` : "-";

            tr.innerHTML = `
                <td>
                    <img src="${prod.images[0]}" style="width: 44px; height: 44px; object-fit: contain; background-color: var(--bg-element); border-radius: 4px; padding: 4px;">
                </td>
                <td>
                    <strong>${prod.name}</strong><br>
                    <span style="font-size: 11px; color: var(--color-text-sub); font-family: monospace;">SKU: ${prod.sku}</span>
                </td>
                <td>
                    ${prod.team}<br>
                    <span style="font-size: 11px; color: var(--color-text-sub);">${prod.category}</span>
                </td>
                <td>${priceOldStr}</td>
                <td style="color: var(--color-volt); font-weight: 700;">${priceNewStr}</td>
                <td style="font-weight: 600;">${totalStock} un</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="admin-action-btn edit" data-id="${prod.id}" title="Editar Manto"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-action-btn delete" data-id="${prod.id}" title="Deletar Manto"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            // Evento editar
            tr.querySelector(".admin-action-btn.edit").addEventListener("click", () => {
                openEditProductModal(prod.id);
            });

            // Evento excluir
            tr.querySelector(".admin-action-btn.delete").addEventListener("click", async () => {
                if (confirm(`Tem certeza de que deseja deletar permanentemente a camisa "${prod.name}" do sistema?`)) {
                    await FutDB.deleteProduct(prod.id);
                    await loadProductsTable();
                }
            });

            tableProducts.appendChild(tr);
        });
    }

    // --- MODAL DE PRODUTO (CONTROLES) ---
    btnOpenProductModal.addEventListener("click", () => {
        resetProductForm();
        modalProductTitle.textContent = "Cadastrar Novo Manto";
        productModal.classList.add("active");
    });

    btnCloseProductModal.addEventListener("click", () => {
        productModal.classList.remove("active");
    });

    // --- CONTROLES DE MÍDIA E TAMANHOS ADICIONAIS ---
    function renderMediaPreviews() {
        if (!mediaPreview) return;
        mediaPreview.innerHTML = "";
        uploadedMedia.forEach((src, idx) => {
            const previewCard = document.createElement("div");
            previewCard.style.position = "relative";
            previewCard.style.width = "80px";
            previewCard.style.height = "80px";
            previewCard.style.border = "1px solid rgba(255,255,255,0.1)";
            previewCard.style.borderRadius = "4px";
            previewCard.style.overflow = "hidden";
            previewCard.style.backgroundColor = "var(--bg-element)";

            const isVideo = src && (src.startsWith("data:video/") || src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".ogg"));
            if (isVideo) {
                previewCard.innerHTML = `
                    <video src="${src}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                    <i class="fa-solid fa-play" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; opacity: 0.8; pointer-events: none;"></i>
                `;
            } else {
                previewCard.innerHTML = `
                    <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;">
                `;
            }

            // Botão remover
            const removeBtn = document.createElement("div");
            removeBtn.style.position = "absolute";
            removeBtn.style.top = "2px";
            removeBtn.style.right = "2px";
            removeBtn.style.width = "18px";
            removeBtn.style.height = "18px";
            removeBtn.style.borderRadius = "50%";
            removeBtn.style.backgroundColor = "rgba(224, 80, 80, 0.9)";
            removeBtn.style.color = "white";
            removeBtn.style.display = "flex";
            removeBtn.style.alignItems = "center";
            removeBtn.style.justifyContent = "center";
            removeBtn.style.cursor = "pointer";
            removeBtn.style.fontSize = "10px";
            removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            removeBtn.title = "Excluir Mídia";
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                uploadedMedia.splice(idx, 1);
                renderMediaPreviews();
            });

            previewCard.appendChild(removeBtn);
            mediaPreview.appendChild(previewCard);
        });
    }

    if (formProdMedia) {
        formProdMedia.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`O arquivo ${file.name} excede o limite máximo de 10MB!`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedMedia.push(event.target.result);
                    renderMediaPreviews();
                };
                reader.readAsDataURL(file);
            });
            formProdMedia.value = "";
        });
    }

    function addCustomSizeRow(name = "", stock = "", price = "") {
        if (!customSizesList) return;
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.className = "custom-size-row";

        row.innerHTML = `
            <input type="text" placeholder="Ex: XXL ou 42" class="pay-input" value="${name}" style="flex: 2; text-align: center; margin: 0;" required>
            <input type="number" placeholder="Estoque" class="pay-input" value="${stock}" style="flex: 1.5; text-align: center; margin: 0;" required>
            <input type="number" step="0.01" placeholder="Preço (R$)" class="pay-input" value="${price}" style="flex: 2; text-align: center; margin: 0;" required>
            <button type="button" class="admin-action-btn delete btn-remove-size-row" style="background-color: var(--color-danger); width: 42px; height: 42px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius-sm); margin: 0;" title="Remover"><i class="fa-solid fa-trash-can" style="color: #fff; font-size: 14px;"></i></button>
        `;

        row.querySelector(".btn-remove-size-row").addEventListener("click", () => {
            row.remove();
        });

        customSizesList.appendChild(row);
    }

    if (btnAddCustomSizeRow) {
        btnAddCustomSizeRow.addEventListener("click", () => {
            addCustomSizeRow();
        });
    }

    function resetProductForm() {
        fId.value = "";
        fName.value = "";
        fSku.value = "";
        fTitle.value = "";
        fTeam.value = "";
        fDescription.value = "";
        fPrice.value = "";
        fPromoPrice.value = "";
        fBrand.value = fBrand.options.length > 0 ? fBrand.options[0].value : "";
        fCategory.value = fCategory.options.length > 0 ? fCategory.options[0].value : "";
        fGender.value = "Masculino";
        fType.value = "Torcedor";
        fCollection.value = "Temporada 2026";

        // Estoque
        fSizeP.value = "10";
        fSizeM.value = "15";
        fSizeG.value = "15";
        fSizeGG.value = "10";
        fSizeXG.value = "5";

        // Resets de mídia e tamanhos customizados
        uploadedMedia = [];
        if (mediaPreview) mediaPreview.innerHTML = "";
        if (formProdMedia) formProdMedia.value = "";
        if (customSizesList) customSizesList.innerHTML = "";
    }

    // EDITAR PRODUTO (Popular modal com dados do produto)
    async function openEditProductModal(id) {
        const prod = await FutDB.getProductById(id);
        if (!prod) return;

        resetProductForm();

        fId.value = prod.id;
        fName.value = prod.name;
        fSku.value = prod.sku;
        fTitle.value = prod.title || "";
        fTeam.value = prod.team;
        fDescription.value = prod.description;
        fPrice.value = prod.price;
        fPromoPrice.value = prod.promoPrice || "";
        fBrand.value = prod.brand;
        fCategory.value = prod.category;
        fGender.value = prod.gender;
        fType.value = prod.type;
        fCollection.value = prod.collection || "";

        // Carregar estoques individuais
        const sP = prod.sizes.find(s => s.name === "P");
        const sM = prod.sizes.find(s => s.name === "M");
        const sG = prod.sizes.find(s => s.name === "G");
        const sGG = prod.sizes.find(s => s.name === "GG");
        const sXG = prod.sizes.find(s => s.name === "XG");

        if (sP) fSizeP.value = sP.stock;
        if (sM) fSizeM.value = sM.stock;
        if (sG) fSizeG.value = sG.stock;
        if (sGG) fSizeGG.value = sGG.stock;
        if (sXG) fSizeXG.value = sXG.stock;

        // Carregar tamanhos customizados
        const standardNames = ["P", "M", "G", "GG", "XG"];
        prod.sizes.forEach(s => {
            if (!standardNames.includes(s.name)) {
                addCustomSizeRow(s.name, s.stock, s.price);
            }
        });

        // Carregar fotos/vídeos existentes
        uploadedMedia = [...(prod.images || [])];
        renderMediaPreviews();

        // Configurações de design não são mais editáveis

        modalProductTitle.textContent = `Editar Manto #${prod.sku}`;
        productModal.classList.add("active");
    }

    // SALVAR PRODUTO (CADASTRAR OU ATUALIZAR)
    btnSaveProduct.addEventListener("click", async () => {
        const name = fName.value.trim();
        const sku = fSku.value.trim();
        const price = parseFloat(fPrice.value);
        const promoPrice = fPromoPrice.value ? parseFloat(fPromoPrice.value) : null;
        const brand = fBrand.value.trim();
        const team = fTeam.value.trim();
        const category = fCategory.value;
        const description = fDescription.value.trim();

        if (!name || !sku || isNaN(price) || !team || !description) {
            alert("Por favor, preencha todos os campos obrigatórios (*)");
            return;
        }

        // Criar arr de tamanhos com os tamanhos padrão
        const sizesArr = [
            { name: "P", stock: parseInt(fSizeP.value) || 0, price: promoPrice || price },
            { name: "M", stock: parseInt(fSizeM.value) || 0, price: promoPrice || price },
            { name: "G", stock: parseInt(fSizeG.value) || 0, price: promoPrice || price },
            { name: "GG", stock: parseInt(fSizeGG.value) || 0, price: (promoPrice || price) + (category === "Retrô" ? 0 : 10) }, // Acréscimo fictício em tamanhos GG
            { name: "XG", stock: parseInt(fSizeXG.value) || 0, price: (promoPrice || price) + (category === "Retrô" ? 0 : 20) }
        ];

        // Ler tamanhos adicionais
        let customSizesValid = true;
        if (customSizesList) {
            const customRows = customSizesList.querySelectorAll(".custom-size-row");
            customRows.forEach(row => {
                const inputs = row.querySelectorAll("input");
                const szName = inputs[0].value.trim();
                const szStock = parseInt(inputs[1].value);
                const szPrice = parseFloat(inputs[2].value);

                if (!szName || isNaN(szStock) || isNaN(szPrice)) {
                    customSizesValid = false;
                    return;
                }

                sizesArr.push({
                    name: szName,
                    stock: szStock,
                    price: szPrice
                });
            });
        }

        if (!customSizesValid) {
            alert("Por favor, preencha todos os campos dos tamanhos adicionais!");
            return;
        }

        // MOCK JERSEY VECTOR GENERATOR (INCLUIR SVG DINÂMICO DO STATE.JS)
        // Gerar camisa mock genérica baseada na marca selecionada
        const newJerseySVG = FutDB.generateCustomJersey({
            primaryColor: "#222222",
            secondaryColor: "#111111",
            accentColor: "#444444",
            stripePattern: "none",
            collarColor: "#111111",
            crestSVG: "",
            brand: brand.toLowerCase(),
            sponsorText: "FUTCOMMERCE"
        });

        // Usar mídias enviadas pelo usuário ou a gerada dinamicamente
        const imagesList = uploadedMedia.length > 0 ? uploadedMedia : [newJerseySVG];

        const productData = {
            name,
            sku,
            title: fTitle.value.trim() || `Camisa ${team} ${fType.value}`,
            team,
            description,
            price,
            promoPrice,
            brand,
            category,
            gender: fGender.value,
            type: fType.value,
            collection: fCollection.value.trim() || "Temporada 2026",
            sizes: sizesArr,
            images: imagesList
        };

        const prodId = fId.value;

        if (prodId) {
            // Edição
            productData.id = prodId;
            const success = await FutDB.updateProduct(productData);
            if (success) {
                alert(`Manto "${name}" atualizado no catálogo com sucesso!`);
            }
        } else {
            // Novo cadastro
            const created = await FutDB.addProduct(productData);
            if (created) {
                alert(`Manto "${name}" cadastrado e desenhado com sucesso! Já está visível na vitrine.`);
            }
        }

        productModal.classList.remove("active");
        loadProductsTable();
    });

    // --- PAINEL 3: GESTÃO DE PEDIDOS ---
    async function loadOrdersTable() {
        const orders = await FutDB.getOrders();
        tableOrders.innerHTML = "";

        if (orders.length === 0) {
            tableOrders.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-sub);">Nenhum pedido efetuado até o momento.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement("tr");

            // Resumo de mantos
            let itemsSummary = order.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join("<br>");

            // Badge do status
            let statusClass = `status-${order.status.toLowerCase()}`;

            tr.innerHTML = `
                <td><strong style="color: var(--color-gold);">#${order.id}</strong></td>
                <td style="font-size: 13px;">${order.date}</td>
                <td style="font-size: 13px; line-height: 1.4;">${itemsSummary}</td>
                <td style="font-weight: 700; color: var(--color-volt);">R$ ${order.total.toFixed(2).replace('.', ',')}</td>
                <td style="font-size: 11px; line-height: 1.3; color: var(--color-text-sub);">
                    Metodo: <strong>${order.paymentMethod}</strong><br>
                    Destino: ${order.address}
                </td>
                <td>
                    <span class="order-status-badge ${statusClass}">${order.status}</span>
                </td>
                <td>
                    <select class="pay-input order-status-select" data-id="${order.id}" style="padding: 6px 12px; font-size: 12px; background-color: var(--bg-element); width: 130px; border-color: rgba(255,255,255,0.1);">
                        <option value="Pendente" ${order.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Pago" ${order.status === 'Pago' ? 'selected' : ''}>Pago (Aprovado)</option>
                        <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>Pedido Enviado</option>
                        <option value="Entregue" ${order.status === 'Entregue' ? 'selected' : ''}>Entregue ✓</option>
                        <option value="Cancelado" ${order.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
            `;

            // Evento ao mudar o status direto na select box
            tr.querySelector(".order-status-select").addEventListener("change", async (e) => {
                const newStatus = e.target.value;
                const success = await FutDB.updateOrderStatus(order.id, newStatus);
                if (success) {
                    alert(`Status do Pedido #${order.id} alterado para "${newStatus}" com sucesso!`);
                    await loadOrdersTable();
                }
            });

            tableOrders.appendChild(tr);
        });
    }

    // --- PAINEL 5: CONFIGURAÇÕES GERAIS ---
    function loadAdminSettings() {
        const settings = JSON.parse(localStorage.getItem("adminSettings")) || {};
        document.getElementById("admin-setting-instagram").value = settings.instagram || "";
        document.getElementById("admin-setting-facebook").value = settings.facebook || "";
        document.getElementById("admin-setting-twitter").value = settings.twitter || "";
        document.getElementById("admin-shipping-fixed").value = settings.shippingFixed ?? "";
        document.getElementById("admin-shipping-free-above").value = settings.shippingFreeAbove ?? "";
        document.getElementById("admin-shipping-by-weight").checked = !!settings.shippingByWeight;
        const pricePerKgInput = document.getElementById("admin-shipping-price-per-kg");
        pricePerKgInput.value = settings.pricePerKg ?? "";
        pricePerKgInput.style.display = settings.shippingByWeight ? "block" : "none";
    }

    document.getElementById("admin-shipping-by-weight").addEventListener("change", (e) => {
        const priceInput = document.getElementById("admin-shipping-price-per-kg");
        priceInput.style.display = e.target.checked ? "block" : "none";
    });

    document.getElementById("btn-save-admin-settings").addEventListener("click", () => {
        const newSettings = {
            instagram: document.getElementById("admin-setting-instagram").value.trim(),
            facebook: document.getElementById("admin-setting-facebook").value.trim(),
            twitter: document.getElementById("admin-setting-twitter").value.trim(),
            shippingFixed: parseFloat(document.getElementById("admin-shipping-fixed").value) || 0,
            shippingFreeAbove: parseFloat(document.getElementById("admin-shipping-free-above").value) || 0,
            shippingByWeight: document.getElementById("admin-shipping-by-weight").checked,
            pricePerKg: parseFloat(document.getElementById("admin-shipping-price-per-kg").value) || 0
        };
        localStorage.setItem("adminSettings", JSON.stringify(newSettings));
        alert("✅ Configurações gerais salvas com sucesso!");
    });

    async function loadMarketingPanel() {
        const popup = await FutDB.getPopups();

        // Popular inputs do Popup
        mktPopupStatus.checked = popup.active;
        mktPopupTitle.value = popup.title;
        mktPopupCoupon.value = popup.couponCode;
        mktPopupMessage.value = popup.message;

        // Renderizar banners na tabela compacta de visualização
        const banners = await FutDB.getBanners();
        mktBannersWrapper.innerHTML = "";

        banners.forEach((banner, idx) => {
            const card = document.createElement("div");
            card.className = "review-card";
            card.style.display = "flex";
            card.style.alignItems = "center";
            card.style.justifyContent = "space-between";
            card.style.marginBottom = "14px";
            card.style.borderLeft = `4px solid ${idx === 0 ? 'var(--color-volt)' : '#3b82f6'}`;

            card.innerHTML = `
                <div style="flex-grow: 1; margin-right: 20px;">
                    <h4 style="font-weight: 700; font-size: 15px; color: #ffffff;">${banner.title}</h4>
                    <p style="font-size: 12px; color: var(--color-text-sub); margin-top: 4px;">${banner.subtitle}</p>
                </div>
                <div class="toggle-container">
                    <span>Ativo</span>
                    <label class="toggle-switch">
                        <input type="checkbox" class="banner-active-toggle" data-idx="${idx}" ${banner.active ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            `;

            // Escutar toggle do banner
            card.querySelector(".banner-active-toggle").addEventListener("change", async (e) => {
                const checked = e.target.checked;
                banners[idx].active = checked;
                await FutDB.saveBanners(banners);
                alert(`✓ Status de visibilidade do Banner #${idx + 1} atualizado!`);
            });

            mktBannersWrapper.appendChild(card);
        });
    }

    // Salvar configurações do Pop-up Promocional
    btnSaveMktPopup.addEventListener("click", async () => {
        const title = mktPopupTitle.value.trim();
        const code = mktPopupCoupon.value.trim().toUpperCase();
        const msg = mktPopupMessage.value.trim();

        if (!title || !code || !msg) {
            alert("Preencha todos os campos do Pop-up!");
            return;
        }

        const newPopup = {
            active: mktPopupStatus.checked,
            title: title,
            message: msg,
            couponCode: code,
            discount: 10,
            btnText: "Copiar Cupom e Explorar",
            placeholder: "Digite seu e-mail..."
        };

        await FutDB.savePopups(newPopup);
        alert("✓ Configurações da Campanha de Pop-up salvas com sucesso!");
    });

    // --- PAINEL 6: GESTÃO DE CUPONS ---
    async function loadCouponsTable() {
        if (!tableCoupons) return;
        const coupons = await FutDB.getCoupons();
        tableCoupons.innerHTML = "";

        if (coupons.length === 0) {
            tableCoupons.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-sub);">Nenhum cupom cadastrado.</td></tr>`;
            return;
        }

        coupons.forEach(coup => {
            const tr = document.createElement("tr");
            const typeStr = coup.discountType === "percent" ? "Porcentagem (%)" : "Valor Fixo (R$)";
            const valStr = coup.discountType === "percent" ? `${coup.discountValue}%` : `R$ ${coup.discountValue.toFixed(2).replace('.', ',')}`;
            const statusStr = coup.active ? `<span class="order-status-badge status-pago">Ativo</span>` : `<span class="order-status-badge status-cancelado">Inativo</span>`;

            tr.innerHTML = `
                <td><strong style="color: var(--color-gold); text-transform: uppercase;">${coup.code}</strong></td>
                <td>${typeStr}</td>
                <td style="font-weight: 700; color: var(--color-volt);">${valStr}</td>
                <td>${statusStr}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="admin-action-btn edit btn-edit-coupon" data-id="${coup.id}" title="Editar Cupom"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-action-btn delete btn-delete-coupon" data-id="${coup.id}" title="Deletar Cupom"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            tr.querySelector(".btn-edit-coupon").addEventListener("click", () => {
                openEditCouponModal(coup.id);
            });

            tr.querySelector(".btn-delete-coupon").addEventListener("click", async () => {
                if (confirm(`Excluir permanentemente o cupom "${coup.code}"?`)) {
                    await FutDB.deleteCoupon(coup.id);
                    await loadCouponsTable();
                }
            });

            tableCoupons.appendChild(tr);
        });
    }

    if (btnOpenCouponModal) {
        btnOpenCouponModal.addEventListener("click", () => {
            resetCouponForm();
            modalCouponTitle.textContent = "Criar Novo Cupom";
            couponModal.classList.add("active");
        });
    }

    if (btnCloseCouponModal) {
        btnCloseCouponModal.addEventListener("click", () => {
            couponModal.classList.remove("active");
        });
    }

    function resetCouponForm() {
        if (formCouponId) formCouponId.value = "";
        if (formCouponCode) formCouponCode.value = "";
        if (formCouponType) formCouponType.value = "percent";
        if (formCouponValue) formCouponValue.value = "";
        if (formCouponStatus) formCouponStatus.checked = true;
    }

    async function openEditCouponModal(id) {
        const coup = await FutDB.getCouponById(id);
        if (!coup) return;

        resetCouponForm();

        formCouponId.value = coup.id;
        formCouponCode.value = coup.code;
        formCouponType.value = coup.discountType;
        formCouponValue.value = coup.discountValue;
        formCouponStatus.checked = !!coup.active;

        modalCouponTitle.textContent = `Editar Cupom ${coup.code}`;
        couponModal.classList.add("active");
    }

    if (btnSaveCoupon) {
        btnSaveCoupon.addEventListener("click", async () => {
            const code = formCouponCode.value.trim().toUpperCase();
            const type = formCouponType.value;
            const val = parseFloat(formCouponValue.value);
            const active = formCouponStatus.checked;

            if (!code || isNaN(val) || val <= 0) {
                alert("Por favor, preencha o código do cupom e o valor do desconto!");
                return;
            }

            const couponData = {
                code,
                discountType: type,
                discountValue: val,
                active
            };

            const coupId = formCouponId.value;

            if (coupId) {
                couponData.id = coupId;
                const success = await FutDB.updateCoupon(couponData);
                if (success) {
                    alert(`Cupom "${code}" atualizado com sucesso!`);
                }
            } else {
                await FutDB.addCoupon(couponData);
                alert(`Cupom "${code}" criado com sucesso!`);
            }

            couponModal.classList.remove("active");
            await loadCouponsTable();
        });
    }

    // --- POPULAR OPÇÕES DE CATEGORIAS NO FORM DE PRODUTOS ---
    async function populateProductCategoryOptions() {
        if (!fCategory) return;
        const categories = await FutDB.getCategories() || [];
        fCategory.innerHTML = "";
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.name;
            opt.textContent = cat.name;
            fCategory.appendChild(opt);
        });
    }

    // --- PAINEL 7: GESTÃO DE CATEGORIAS ---
    async function loadCategoriesTable() {
        if (!tableCategories) return;
        const categories = await FutDB.getCategories() || [];
        const products = await FutDB.getProducts() || [];
        tableCategories.innerHTML = "";

        if (categories.length === 0) {
            tableCategories.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-sub);">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        categories.forEach(cat => {
            const tr = document.createElement("tr");
            
            // Contar produtos na categoria
            const catProductCount = products.filter(p => p.category === cat.name).length;
            const subcatsStr = cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories.join(", ") : "-";

            tr.innerHTML = `
                <td><strong style="color: var(--color-gold); font-size: 14px;">${cat.name}</strong></td>
                <td>${subcatsStr}</td>
                <td style="font-weight: 600;">${catProductCount} un</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="admin-action-btn edit btn-edit-category" data-name="${cat.name}" title="Editar Categoria"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-action-btn delete btn-delete-category" data-name="${cat.name}" title="Deletar Categoria"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            tr.querySelector(".btn-edit-category").addEventListener("click", () => {
                openEditCategoryModal(cat.name);
            });

            tr.querySelector(".btn-delete-category").addEventListener("click", async () => {
                if (confirm(`Tem certeza de que deseja excluir permanentemente a categoria "${cat.name}"? Todos os produtos associados terão seu campo de categoria limpo.`)) {
                    await FutDB.deleteCategory(cat.name);
                    await populateProductCategoryOptions();
                    await loadCategoriesTable();
                }
            });

            tableCategories.appendChild(tr);
        });
    }

    async function loadCategoryProductsAssociationList(associatedProductIds = []) {
        if (!categoryProductAssociationList) return;
        const products = await FutDB.getProducts() || [];
        categoryProductAssociationList.innerHTML = "";

        if (products.length === 0) {
            categoryProductAssociationList.innerHTML = `<span style="font-size: 12px; color: var(--color-text-sub); text-align: center;">Nenhum produto cadastrado no catálogo para associar.</span>`;
            return;
        }

        products.forEach(p => {
            const label = document.createElement("label");
            label.style.display = "flex";
            label.style.alignItems = "center";
            label.style.gap = "10px";
            label.style.cursor = "pointer";
            label.style.fontSize = "13px";
            label.style.padding = "6px 8px";
            label.style.borderRadius = "var(--border-radius-sm)";
            label.style.backgroundColor = "var(--bg-card)";
            label.style.border = "1px solid rgba(255, 255, 255, 0.03)";
            label.style.margin = "0";

            const isChecked = associatedProductIds.includes(p.id);
            
            // Show if it's already in another category to help user
            let otherCatLabel = "";
            if (p.category && p.category !== formCategoryOldName.value) {
                otherCatLabel = ` <span style="font-size: 10px; color: var(--color-text-sub);">(${p.category})</span>`;
            }

            label.innerHTML = `
                <input type="checkbox" value="${p.id}" class="category-product-checkbox" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; margin: 0; cursor: pointer;">
                <span style="flex-grow: 1; color: #fff;">${p.name} <span style="font-size: 11px; color: var(--color-text-sub);">(${p.brand})</span>${otherCatLabel}</span>
            `;
            categoryProductAssociationList.appendChild(label);
        });
    }

    function resetCategoryForm() {
        if (formCategoryOldName) formCategoryOldName.value = "";
        if (formCategoryName) formCategoryName.value = "";
        if (formCategorySubcategories) formCategorySubcategories.value = "";
        if (categoryProductAssociationList) categoryProductAssociationList.innerHTML = "";
    }

    async function openEditCategoryModal(name) {
        const categories = await FutDB.getCategories() || [];
        const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (!cat) return;

        resetCategoryForm();

        formCategoryOldName.value = cat.name;
        formCategoryName.value = cat.name;
        formCategorySubcategories.value = cat.subcategories ? cat.subcategories.join(", ") : "";
        
        modalCategoryTitle.textContent = `Editar Categoria: ${cat.name}`;

        // Get currently associated products
        const products = await FutDB.getProducts() || [];
        const associatedIds = products.filter(p => p.category === cat.name).map(p => p.id);
        
        await loadCategoryProductsAssociationList(associatedIds);

        categoryModal.classList.add("active");
    }

    if (btnOpenCategoryModal) {
        btnOpenCategoryModal.addEventListener("click", async () => {
            resetCategoryForm();
            modalCategoryTitle.textContent = "Criar Nova Categoria";
            await loadCategoryProductsAssociationList([]);
            categoryModal.classList.add("active");
        });
    }

    if (btnCloseCategoryModal) {
        btnCloseCategoryModal.addEventListener("click", () => {
            categoryModal.classList.remove("active");
        });
    }

    if (btnSaveCategory) {
        btnSaveCategory.addEventListener("click", async () => {
            const oldName = formCategoryOldName.value;
            const name = formCategoryName.value.trim();
            const subcatsStr = formCategorySubcategories.value.trim();

            if (!name) {
                alert("Por favor, preencha o nome da categoria!");
                return;
            }

            const subcategories = subcatsStr ? subcatsStr.split(",").map(s => s.trim()).filter(s => s.length > 0) : [];

            const categoryData = {
                name,
                subcategories
            };

            if (oldName) {
                // Editar categoria existente
                const success = await FutDB.updateCategory(oldName, categoryData);
                if (!success) {
                    alert("Erro ao atualizar categoria ou nome duplicado!");
                    return;
                }
            } else {
                // Nova categoria
                const success = await FutDB.addCategory(categoryData);
                if (!success) {
                    alert("Já existe uma categoria cadastrada com este nome!");
                    return;
                }
            }

            // Salvar associações de produtos
            const selectedProductIds = [];
            if (categoryProductAssociationList) {
                categoryProductAssociationList.querySelectorAll(".category-product-checkbox:checked").forEach(cb => {
                    selectedProductIds.push(cb.value);
                });
            }

            await FutDB.associateProductsWithCategory(name, selectedProductIds);
            alert("✓ Categoria salva e produtos associados com sucesso!");

            await populateProductCategoryOptions();
            categoryModal.classList.remove("active");
            await loadCategoriesTable();
        });
    }

    // --- POPULAR OPÇÕES DE MARCAS NO FORM DE PRODUTOS ---
    async function populateProductBrandOptions() {
        if (!fBrand) return;
        const brands = await FutDB.getBrands() || [];
        fBrand.innerHTML = "";
        brands.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.name;
            opt.textContent = b.name;
            fBrand.appendChild(opt);
        });
    }

    // --- PAINEL 8: GESTÃO DE MARCAS ---
    async function loadBrandsTable() {
        if (!tableBrands) return;
        const brands = await FutDB.getBrands() || [];
        const products = await FutDB.getProducts() || [];
        tableBrands.innerHTML = "";

        if (brands.length === 0) {
            tableBrands.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-sub);">Nenhuma marca cadastrada.</td></tr>`;
            return;
        }

        brands.forEach(b => {
            const tr = document.createElement("tr");
            
            // Contar produtos associados a esta marca
            const brandProductCount = products.filter(p => p.brand.toLowerCase() === b.name.toLowerCase()).length;
            const iconStr = b.icon || "fa-solid fa-tag";

            // Logotipo preview
            let logoHTML = "";
            if (b.logo) {
                logoHTML = `<img src="${b.logo}" style="width: 32px; height: 32px; object-fit: contain; background-color: var(--bg-element); border-radius: 4px; padding: 2px;">`;
            } else {
                logoHTML = `<span style="font-size: 16px; color: var(--color-text-sub);"><i class="${iconStr}"></i></span>`;
            }

            tr.innerHTML = `
                <td style="text-align: center; vertical-align: middle;">${logoHTML}</td>
                <td><strong style="color: var(--color-gold); font-size: 14px;">${b.name}</strong></td>
                <td><code style="font-family: monospace; font-size: 12px; color: var(--color-volt);">${iconStr}</code></td>
                <td style="font-weight: 600;">${brandProductCount} un</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="admin-action-btn edit btn-edit-brand" data-name="${b.name}" title="Editar Marca"><i class="fa-solid fa-pen"></i></button>
                        <button class="admin-action-btn delete btn-delete-brand" data-name="${b.name}" title="Deletar Marca"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            tr.querySelector(".btn-edit-brand").addEventListener("click", async () => {
                await openEditBrandModal(b.name);
            });

            tr.querySelector(".btn-delete-brand").addEventListener("click", async () => {
                if (confirm(`Tem certeza de que deseja excluir permanentemente a marca "${b.name}"? Todos os produtos associados terão seu campo de marca limpo.`)) {
                    await FutDB.deleteBrand(b.name);
                    await populateProductBrandOptions();
                    await loadBrandsTable();
                }
            });

            tableBrands.appendChild(tr);
        });
    }

    function resetBrandForm() {
        if (formBrandOldName) formBrandOldName.value = "";
        if (formBrandName) formBrandName.value = "";
        if (formBrandIcon) formBrandIcon.value = "";
        uploadedBrandLogo = "";
        if (brandLogoPreview) brandLogoPreview.innerHTML = "";
        if (formBrandLogoUpload) formBrandLogoUpload.value = "";
    }

    async function openEditBrandModal(name) {
        const brands = await FutDB.getBrands() || [];
        const b = brands.find(brand => brand.name.toLowerCase() === name.toLowerCase());
        if (!b) return;

        resetBrandForm();

        formBrandOldName.value = b.name;
        formBrandName.value = b.name;
        formBrandIcon.value = b.icon || "";
        uploadedBrandLogo = b.logo || "";
        
        if (b.logo && brandLogoPreview) {
            brandLogoPreview.innerHTML = `<img src="${b.logo}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; border: var(--glass-border); background-color: var(--bg-element); padding: 4px;">`;
        }

        modalBrandTitle.textContent = `Editar Marca: ${b.name}`;

        brandModal.classList.add("active");
    }

    if (btnOpenBrandModal) {
        btnOpenBrandModal.addEventListener("click", () => {
            resetBrandForm();
            modalBrandTitle.textContent = "Criar Nova Marca";
            brandModal.classList.add("active");
        });
    }

    if (btnCloseBrandModal) {
        btnCloseBrandModal.addEventListener("click", () => {
            brandModal.classList.remove("active");
        });
    }

    if (formBrandLogoUpload) {
        formBrandLogoUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("O logotipo excede o limite máximo de 2MB!");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedBrandLogo = event.target.result;
                    if (brandLogoPreview) {
                        brandLogoPreview.innerHTML = `<img src="${uploadedBrandLogo}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; border: var(--glass-border); background-color: var(--bg-element); padding: 4px;">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnSaveBrand) {
        btnSaveBrand.addEventListener("click", async () => {
            const oldName = formBrandOldName.value;
            const name = formBrandName.value.trim();
            const icon = formBrandIcon.value.trim();

            if (!name) {
                alert("Por favor, preencha o nome da marca!");
                return;
            }

            const brandData = {
                name,
                icon: icon || "fa-solid fa-tag",
                logo: uploadedBrandLogo
            };

            if (oldName) {
                // Editar marca existente
                const success = await FutDB.updateBrand(oldName, brandData);
                if (!success) {
                    alert("Erro ao atualizar marca ou nome duplicado!");
                    return;
                }
            } else {
                // Nova marca
                const success = await FutDB.addBrand(brandData);
                if (!success) {
                    alert("[TESTE-CODIGO-NOVO] Não foi possível cadastrar a marca. Ela já existe ou ocorreu um erro de banco!");
                    return;
                }
            }

            alert("✓ Marca salva com sucesso!");

            await populateProductBrandOptions();
            brandModal.classList.remove("active");
            await loadBrandsTable();
        });
    }

    // Ouvir novos pedidos do sistema para disparar atualizações instantâneas de estatísticas
    window.addEventListener("fc_orders_updated", async () => {
        if (paneHome.classList.contains("active")) await loadStats();
        if (paneOrders.classList.contains("active")) await loadOrdersTable();
    });

    window.addEventListener("fc_brands_updated", async () => {
        await populateProductBrandOptions();
        if (paneBrands && paneBrands.classList.contains("active")) await loadBrandsTable();
    });

    // --- TOGGLE DO MENU LATERAL RESPONSIVO MÓVEL ---
    const adminHamburgerBtn = document.getElementById("admin-hamburger-btn");
    const adminSidebar = document.querySelector(".admin-sidebar");

    if (adminHamburgerBtn && adminSidebar) {
        adminHamburgerBtn.addEventListener("click", () => {
            adminSidebar.classList.toggle("active");
        });

        // Fechar barra lateral após clicar em qualquer aba (no mobile)
        document.querySelectorAll(".admin-sidebar .profile-menu-item").forEach(item => {
            item.addEventListener("click", () => {
                if (window.innerWidth <= 992) {
                    adminSidebar.classList.remove("active");
                }
            });
        });
    }

    // --- INICIALIZAÇÃO ---
    try {
        await checkAuth();
    } catch (err) {
        alert("Erro na inicialização checkAuth: " + err.message + "\nStack: " + err.stack);
    }
});
