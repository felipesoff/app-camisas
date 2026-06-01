/**
 * FUTCOMMERCE - CONTROLADOR DO PORTAL DO CLIENTE
 * 
 * Lógica da área do cliente (profile.html). Gerencia fluxo de autenticação local,
 * navegação por abas laterais, renderização de histórico de pedidos, cadastro
 * de novos endereços e listagem dinâmica de camisas favoritadas.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // --- ESTADO LOCAL ---
    let currentUser = null;

    // --- ELEMENTOS DO DOM ---
    const loginContainer = document.getElementById("profile-login-container");
    const dashboardContainer = document.getElementById("profile-dashboard-container");

    // Login Form
    const inputEmail = document.getElementById("login-email");
    const inputPassword = document.getElementById("login-password");
    const btnLoginSubmit = document.getElementById("btn-login-submit");

    // Dashboard Info
    const avatarInitial = document.getElementById("client-avatar-initial");
    const displayName = document.getElementById("client-display-name");
    const displayEmail = document.getElementById("client-display-email");

    // Menu Abas
    const menuTabOrders = document.getElementById("menu-tab-orders");
    const menuTabAddresses = document.getElementById("menu-tab-addresses");
    const menuTabFavs = document.getElementById("menu-tab-favs");
    const menuTabLogout = document.getElementById("menu-tab-logout");

    // Panéis
    const paneOrders = document.getElementById("pane-orders");
    const paneAddresses = document.getElementById("pane-addresses");
    const paneFavs = document.getElementById("pane-favs");

    // Listas/Grids
    const ordersListWrapper = document.getElementById("orders-list-wrapper");
    const addressesListWrapper = document.getElementById("addresses-list-wrapper");
    const favoritesGrid = document.getElementById("favorites-grid");

    // Modal de Endereço
    const addressModal = document.getElementById("address-modal");
    const btnOpenAddressModal = document.getElementById("btn-open-address-modal");
    const btnCloseAddressModal = document.getElementById("btn-close-address-modal");
    const btnSaveAddress = document.getElementById("btn-save-address");

    // Modal de Rastreamento
    const trackingModal = document.getElementById("tracking-modal");
    const btnCloseTrackingModal = document.getElementById("btn-close-tracking-modal");

    // Inputs Endereço
    const addrType = document.getElementById("addr-type");
    const addrCep = document.getElementById("addr-cep");
    const addrStreet = document.getElementById("addr-street");
    const addrNumber = document.getElementById("addr-number");
    const addrComplement = document.getElementById("addr-complement");
    const addrNeighborhood = document.getElementById("addr-neighborhood");
    const addrCity = document.getElementById("addr-city");
    const addrState = document.getElementById("addr-state");

    // Header Badge Count
    const cartBadgeCount = document.getElementById("cart-badge-count");
    
    function updateCartBadge() {
        const cart = FutDB.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadgeCount.textContent = totalItems;
        cartBadgeCount.style.display = totalItems > 0 ? "flex" : "none";
    }
    updateCartBadge();

    // --- CHECAGEM DE AUTENTICAÇÃO ---
    function checkAuth() {
        currentUser = FutDB.getCurrentUser();

        // Se estiver logado, mas for Admin, redireciona pro painel dele
        if (currentUser && currentUser.isAdmin) {
            window.location.href = "admin.html";
            return;
        }

        if (currentUser) {
            loginContainer.style.display = "none";
            dashboardContainer.style.display = "grid";
            setupDashboard();
        } else {
            loginContainer.style.display = "block";
            dashboardContainer.style.display = "none";
        }
    }

    // --- PROCESSO DE LOGIN ---
    btnLoginSubmit.addEventListener("click", async () => {
        const email = inputEmail.value.trim();
        const password = inputPassword.value.trim();

        if (!email || !password) {
            alert("Preencha todos os campos para fazer o login!");
            return;
        }

        const session = await FutDB.login(email, password, false);
        if (session) {
            checkAuth();
        } else {
            alert("E-mail ou senha incorretos! Para fins de teste, use torcedor@gmail.com e senha 123.");
        }
    });

    // --- LOGOUT ---
    menuTabLogout.addEventListener("click", async () => {
        if (confirm("Deseja realmente sair da sua conta?")) {
            await FutDB.logout();
            checkAuth();
        }
    });

    // --- CONFIGURAÇÃO DA ÁREA LOGADA ---
    function setupDashboard() {
        // Dados Pessoais
        displayName.textContent = currentUser.name;
        displayEmail.textContent = currentUser.email;
        avatarInitial.textContent = currentUser.name.charAt(0).toUpperCase();

        // Checar aba na URL (Ex: profile.html?tab=favs)
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam) {
            switchTab(tabParam);
        } else {
            switchTab("orders"); // default
        }
    }

    // --- CONTROLE DE TROCA DE ABAS ---
    const tabsMap = {
        orders: { btn: menuTabOrders, pane: paneOrders, load: loadOrders },
        addresses: { btn: menuTabAddresses, pane: paneAddresses, load: loadAddresses },
        favs: { btn: menuTabFavs, pane: paneFavs, load: loadFavorites }
    };

    async function switchTab(tabName) {
        if (!tabsMap[tabName]) return;

        // Desativar todas as abas e painéis
        Object.keys(tabsMap).forEach(k => {
            tabsMap[k].btn.classList.remove("active");
            tabsMap[k].pane.classList.remove("active");
            tabsMap[k].pane.style.display = "none";
        });

        // Ativar aba clicada
        tabsMap[tabName].btn.classList.add("active");
        tabsMap[tabName].pane.classList.add("active");
        tabsMap[tabName].pane.style.display = "block";

        // Carregar dados específicos
        await tabsMap[tabName].load();
    }

    // Ouvintes dos cliques nas abas
    menuTabOrders.addEventListener("click", () => switchTab("orders"));
    menuTabAddresses.addEventListener("click", () => switchTab("addresses"));
    menuTabFavs.addEventListener("click", () => switchTab("favs"));

    // --- MODAL DE RASTREAMENTO: FECHAR ---
    if (btnCloseTrackingModal) {
        btnCloseTrackingModal.addEventListener("click", () => {
            trackingModal.classList.remove("active");
        });
    }

    // --- LÓGICA PRINCIPAL DO RASTREAMENTO LOGÍSTICO ---
    function openTrackingModal(order) {
        const trackingCode = document.getElementById("tracking-code-display");
        const stepNodes = [1, 2, 3, 4].map(n => document.getElementById(`step-node-${n}`));
        const stepDates = [1, 2, 3, 4].map(n => document.getElementById(`step-date-${n}`));
        const stepperProgress = document.getElementById("stepper-progress-bar");
        const logList = document.getElementById("tracking-log-list");

        // Gerar código de rastreamento único para o pedido
        const orderNum = order.id.replace("PED-", "");
        trackingCode.textContent = `FTX-${orderNum}-BR`;

        // Mapear status para índice do stepper
        const STATUS_MAP = { "Pendente": 0, "Pago": 1, "Enviado": 2, "Entregue": 3 };
        const activeStep = STATUS_MAP[order.status] !== undefined ? STATUS_MAP[order.status] : 0;

        // Calcular datas retroativas com base na data do pedido
        const baseDate = new Date(order.date + "T10:00:00");
        function addHours(d, h) { return new Date(d.getTime() + h * 3600000); }
        function fmtDate(d) { return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }
        function fmtDateTime(d) { return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }

        const dates = [
            baseDate,                   // Aprovado (data do pedido)
            addHours(baseDate, 26),     // Embalado (~1 dia depois)
            addHours(baseDate, 50),     // Em Trânsito (~2 dias depois)
            addHours(baseDate, 122)     // Entregue (~5 dias depois)
        ];

        // Atualizar stepper visual
        stepNodes.forEach((node, idx) => {
            node.classList.remove("active", "completed");
            stepDates[idx].textContent = "—";

            if (idx < activeStep) {
                node.classList.add("completed");
                stepDates[idx].textContent = fmtDate(dates[idx]);
            } else if (idx === activeStep) {
                node.classList.add("active");
                stepDates[idx].textContent = fmtDate(dates[idx]);
            }
        });

        // Calcular largura da barra de progresso (de 0% a 90%)
        const progressWidths = ["0%", "30%", "63%", "92%"];
        stepperProgress.style.width = progressWidths[activeStep];

        // Gerar logs de eventos retroativos
        const ALL_LOGS = [
            { label: "Pedido recebido e pagamento confirmado pelo sistema.",                 date: dates[0] },
            { label: "Nota fiscal emitida pelo vendedor (NF-e processada).",                date: addHours(dates[0], 2) },
            { label: "Manto sagrado em processo de embalagem especial.",                    date: addHours(dates[0], 18) },
            { label: "Camisa embalada e etiqueta de envio gerada.",                         date: dates[1] },
            { label: "Objeto coletado pela FutExpress — Unidade de Despacho.",              date: addHours(dates[1], 4) },
            { label: "Em trânsito: Triagem no centro de distribuição.",                     date: dates[2] },
            { label: "Em trânsito: Transferido para unidade da cidade de destino.",         date: addHours(dates[2], 24) },
            { label: "Saiu para entrega ao destinatário final.",                            date: addHours(dates[2], 46) },
            { label: `Objeto entregue no endereço: ${order.address}.`,                      date: dates[3] }
        ];

        // Exibir apenas logs até o status atual
        const logsToShow = ALL_LOGS.filter((_, idx) => {
            if (activeStep === 0) return idx <= 1;
            if (activeStep === 1) return idx <= 3;
            if (activeStep === 2) return idx <= 7;
            return true;
        });

        logList.innerHTML = "";
        // Mostrar do mais recente para o mais antigo
        [...logsToShow].reverse().forEach((log, idx) => {
            const item = document.createElement("div");
            item.className = `tracking-log-item${idx === 0 ? " latest" : ""}`;
            item.innerHTML = `
                ${log.label}
                <span class="tracking-log-time">${fmtDateTime(log.date)}</span>
            `;
            logList.appendChild(item);
        });

        // Abrir o modal
        trackingModal.classList.add("active");
    }

    // --- TAB 1: CARREGAR HISTÓRICO DE PEDIDOS ---
    async function loadOrders() {
        const orders = await FutDB.getOrders();
        // Filtrar pedidos que pertencem ao cliente logado
        const clientOrders = orders.filter(o => o.userEmail === currentUser.email);

        ordersListWrapper.innerHTML = "";

        if (clientOrders.length === 0) {
            ordersListWrapper.innerHTML = `
                <div style="text-align: center; padding: 50px 0; color: var(--color-text-sub); border: var(--glass-border); border-radius: var(--border-radius-lg); background-color: var(--bg-element);">
                    <i class="fa-solid fa-receipt" style="font-size: 36px; margin-bottom: 12px; opacity: 0.3;"></i>
                    <p style="font-size: 14px;">Você ainda não realizou nenhuma compra. Visite nosso catálogo!</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 16px; padding: 8px 16px; font-size: 12px;">Comprar Camisas</a>
                </div>
            `;
            return;
        }

        clientOrders.forEach(order => {
            const card = document.createElement("div");
            card.className = "order-card";

            // Detalhes do status
            let statusClass = `status-${order.status.toLowerCase()}`;
            
            // Gerar linhas dos produtos do pedido
            let itemsHTML = "";
            order.items.forEach(item => {
                itemsHTML += `
                    <div class="order-item-row">
                        <span>⚽ ${item.name} (Tam: <strong>${item.size}</strong>) x${item.quantity}</span>
                        <strong>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</strong>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="order-header-row">
                    <div>
                        <span style="font-size: 12px; color: var(--color-text-sub); display: block;">CÓDIGO DO PEDIDO</span>
                        <strong style="color: var(--color-volt); font-size: 15px;">#${order.id}</strong>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--color-text-sub); display: block;">DATA</span>
                        <span style="font-weight: 600; font-size: 14px;">${order.date}</span>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: var(--color-text-sub); display: block;">PAGAMENTO</span>
                        <span style="font-weight: 600; font-size: 14px;">${order.paymentMethod}</span>
                    </div>
                    <div>
                        <span class="order-status-badge ${statusClass}">${order.status}</span>
                    </div>
                </div>

                <div class="order-item-list">
                    ${itemsHTML}
                </div>

                <div style="border-top: 1px dashed rgba(255,255,255,0.06); margin-top: 16px; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 13px; color: var(--color-text-sub);">
                    <button class="btn-track-order" id="btn-track-${order.id}">
                        <i class="fa-solid fa-truck-fast"></i> Rastrear Manto
                    </button>
                    <span style="font-size: 16px; color: #ffffff;">Total: <strong style="color: var(--color-volt);">R$ ${order.total.toFixed(2).replace('.', ',')}</strong></span>
                </div>
            `;

            ordersListWrapper.appendChild(card);

            // Ouvinte para o botão de rastreamento
            const btnTrack = card.querySelector(`#btn-track-${order.id}`);
            if (btnTrack) {
                btnTrack.addEventListener("click", () => openTrackingModal(order));
            }
        });
    }

    // --- TAB 2: CARREGAR ENDEREÇOS ---
    function loadAddresses() {
        const addresses = currentUser.addresses || [];
        addressesListWrapper.innerHTML = "";

        if (addresses.length === 0) {
            addressesListWrapper.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-sub); border: var(--glass-border); border-radius: var(--border-radius-lg); background-color: var(--bg-element);">
                    <i class="fa-solid fa-map-pin" style="font-size: 32px; opacity: 0.3; margin-bottom: 12px;"></i>
                    <p style="font-size: 14px;">Nenhum endereço de entrega cadastrado. Cadastre um endereço para fretes rápidos!</p>
                </div>
            `;
            return;
        }

        addresses.forEach(addr => {
            const card = document.createElement("div");
            card.className = "review-card";
            card.style.position = "relative";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.justifyContent = "space-between";
            
            let defaultBadge = addr.default 
                ? `<span class="badge badge-new" style="position: absolute; top: 16px; right: 16px; font-size: 9px; background-color: var(--color-volt);">Padrão</span>`
                : "";

            card.innerHTML = `
                ${defaultBadge}
                <div>
                    <h4 style="font-weight: 700; font-size: 15px; margin-bottom: 8px; color: var(--color-volt);"><i class="fa-solid fa-location-dot"></i> ${addr.type}</h4>
                    <p style="font-size: 13px; color: #ffffff;">${addr.street}, Nº ${addr.number}</p>
                    <p style="font-size: 12px; color: var(--color-text-sub);">${addr.complement ? addr.complement + ' - ' : ''}${addr.neighborhood}</p>
                    <p style="font-size: 12px; color: var(--color-text-sub);">${addr.city}/${addr.state} | CEP ${addr.cep}</p>
                </div>
            `;
            addressesListWrapper.appendChild(card);
        });
    }

    // --- MODAL DE ENDEREÇO (CONTROLE) ---
    btnOpenAddressModal.addEventListener("click", () => {
        addressModal.classList.add("active");
    });
    
    function closeModal() {
        addressModal.classList.remove("active");
        // Limpar inputs
        addrType.value = "Casa";
        addrCep.value = "";
        addrStreet.value = "";
        addrNumber.value = "";
        addrComplement.value = "";
        addrNeighborhood.value = "";
        addrCity.value = "";
        addrState.value = "";
    }
    
    btnCloseAddressModal.addEventListener("click", closeModal);

    // CEP input mascara
    addrCep.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 5) {
            value = value.substring(0, 5) + "-" + value.substring(5, 8);
        }
        e.target.value = value;
    });

    // Salvar Novo Endereço
    btnSaveAddress.addEventListener("click", async () => {
        const type = addrType.value.trim();
        const cep = addrCep.value.trim();
        const street = addrStreet.value.trim();
        const number = addrNumber.value.trim();
        const complement = addrComplement.value.trim();
        const neighborhood = addrNeighborhood.value.trim();
        const city = addrCity.value.trim();
        const state = addrState.value.trim();

        if (!type || cep.length < 9 || !street || !number || !neighborhood || !city || !state) {
            alert("Por favor, preencha todos os campos obrigatórios identificados!");
            return;
        }

        const newAddr = {
            id: "addr-" + Date.now(),
            type,
            cep,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            default: currentUser.addresses && currentUser.addresses.length === 0 ? true : false
        };

        if (!currentUser.addresses) currentUser.addresses = [];
        currentUser.addresses.push(newAddr);

        // Atualizar state central
        await FutDB.updateClientProfile(currentUser);
        
        // Re-render
        loadAddresses();
        closeModal();
        alert("✓ Endereço de entrega salvo com sucesso!");
    });

    // --- TAB 3: CARREGAR FAVORITOS ---
    async function loadFavorites() {
        const favIds = currentUser.favorites || [];
        favoritesGrid.innerHTML = "";

        if (favIds.length === 0) {
            favoritesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px 0; color: var(--color-text-sub); border: var(--glass-border); border-radius: var(--border-radius-lg); background-color: var(--bg-element);">
                    <i class="fa-regular fa-heart" style="font-size: 36px; opacity: 0.3; margin-bottom: 12px;"></i>
                    <p style="font-size: 14px;">Você ainda não possui mantos favoritados. Clique nos corações da loja!</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 16px; padding: 8px 16px; font-size: 12px;">Ver Vitrine</a>
                </div>
            `;
            return;
        }

        for (const id of favIds) {
            const prod = await FutDB.getProductById(id);
            if (!prod) continue; // Segurança

            const card = document.createElement("div");
            card.className = "product-card";
            
            // Preço
            let priceHTML = prod.promoPrice 
                ? `<span class="price-current" style="font-size: 16px;">R$ ${prod.promoPrice.toFixed(2).replace('.', ',')}</span>`
                : `<span class="price-original" style="font-size: 16px;">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>`;

            card.innerHTML = `
                <button class="btn-fav active" style="background-color: var(--color-danger); border-color: var(--color-danger);" title="Remover"><i class="fa-solid fa-heart" style="color: #fff;"></i></button>
                <div class="card-img-wrapper" style="height: 180px;">
                    <img src="${prod.images[0]}" alt="${prod.name}" style="max-height: 140px;">
                </div>
                <div class="card-info" style="padding: 14px;">
                    <span class="card-category" style="font-size: 10px;">${prod.brand || prod.team || ""}</span>
                    <h3 class="card-title" style="font-size: 13px; height: 34px; margin-bottom: 6px;">${prod.name}</h3>
                    <div class="card-footer" style="margin-top: 10px;">
                        ${priceHTML}
                        <a href="product.html?id=${prod.id}" class="btn-quick-buy" style="width: 32px; height: 32px; border-radius: 4px;" title="Ver detalhes"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px;"></i></a>
                    </div>
                </div>
            `;

            // Clique do coração ativo para desfavoritar imediatamente
            card.querySelector(".btn-fav").addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm(`Remover "${prod.name}" dos favoritos?`)) {
                    currentUser.favorites = currentUser.favorites.filter(fid => fid !== prod.id);
                    await FutDB.updateClientProfile(currentUser);
                    await loadFavorites(); // recarrega aba
                }
            });

            favoritesGrid.appendChild(card);
        }
    }

    // Ouvir alterações do DB
    window.addEventListener("fc_orders_updated", () => {
        if (paneOrders.classList.contains("active")) loadOrders();
    });

    // --- INICIALIZAÇÃO ---
    checkAuth();
});
