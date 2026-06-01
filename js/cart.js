/**
 * FUTCOMMERCE - CONTROLADOR DO CARRINHO E CHECKOUT
 * 
 * Lógica da página cart.html. Controla a listagem e edição do carrinho, cálculo de frete,
 * aplicação de cupons, transição de gateways de pagamento, o funcionamento interativo em 3D
 * do cartão de crédito virtual, contagem regressiva do PIX e finalização do pedido.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- ESTADO FINANCEIRO ---
    let subtotal = 0;
    let shippingFee = 0;
    let discountVal = 0;
    let discountPercent = 0;
    let appliedCoupon = null;
    let total = 0;
    let paymentMethod = "pix"; // pix, card, boleto

    // --- ELEMENTOS DO DOM ---
    const cartPageContent = document.getElementById("cart-page-content");
    const cartEmptyState = document.getElementById("cart-empty-state");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const btnClearCart = document.getElementById("btn-clear-cart");

    // Resumo
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryShipping = document.getElementById("summary-shipping");
    const summaryDiscount = document.getElementById("summary-discount");
    const summaryTotal = document.getElementById("summary-total");

    // Frete
    const shippingCep = document.getElementById("shipping-cep");
    const btnCalcShipping = document.getElementById("btn-calc-shipping");
    const shippingResultMsg = document.getElementById("shipping-result-msg");

    // Cupom
    const couponInput = document.getElementById("coupon-code-input");
    const btnApplyCoupon = document.getElementById("btn-apply-coupon");
    const couponResultMsg = document.getElementById("coupon-result-msg");

    // Gateways de Pagamento
    const paySelectPix = document.getElementById("pay-select-pix");
    const paySelectCard = document.getElementById("pay-select-card");
    const paySelectBoleto = document.getElementById("pay-select-boleto");
    const framePix = document.getElementById("frame-pix");
    const frameCard = document.getElementById("frame-card");
    const frameBoleto = document.getElementById("frame-boleto");

    // PIX timer & Copiar
    const pixTimerClock = document.getElementById("pix-timer-clock");
    const btnCopyPix = document.getElementById("btn-copy-pix");
    const pixCopyCode = document.getElementById("pix-copy-code");
    
    // Boleto Copiar
    const btnCopyBoleto = document.getElementById("btn-copy-boleto");

    // Cartão 3D Virtual & Inputs
    const visualCard = document.getElementById("visual-credit-card");
    const visualCardBrand = document.getElementById("visual-card-brand");
    const visualCardNumber = document.getElementById("visual-card-number");
    const visualCardHolder = document.getElementById("visual-card-holder");
    const visualCardExpiry = document.getElementById("visual-card-expiry");
    const visualCardCvv = document.getElementById("visual-card-cvv");

    const inputCardNumber = document.getElementById("card-input-number");
    const inputCardHolder = document.getElementById("card-input-holder");
    const inputCardExpiry = document.getElementById("card-input-expiry");
    const inputCardCvv = document.getElementById("card-input-cvv");

    const btnFinishCheckout = document.getElementById("btn-finish-checkout");

    // Header Cart Badge
    const cartBadgeCount = document.getElementById("cart-badge-count");
    
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

    // --- SISTEMA DE TAB DO PIX TIMER ---
    let pixMinutes = 5;
    let pixSeconds = 0;
    let pixInterval = null;

    function startPixTimer() {
        if (pixInterval) clearInterval(pixInterval);
        pixMinutes = 5;
        pixSeconds = 0;

        pixInterval = setInterval(() => {
            if (pixSeconds === 0) {
                if (pixMinutes === 0) {
                    clearInterval(pixInterval);
                    pixTimerClock.innerHTML = `<span style="color: var(--color-danger);"><i class="fa-solid fa-triangle-exclamation"></i> Chave PIX expirada! Recarregue a página</span>`;
                    return;
                }
                pixMinutes--;
                pixSeconds = 59;
            } else {
                pixSeconds--;
            }

            const minStr = String(pixMinutes).padStart(2, '0');
            const secStr = String(pixSeconds).padStart(2, '0');
            pixTimerClock.querySelector("strong").textContent = `${minStr}:${secStr}`;
        }, 1000);
    }
    startPixTimer();

    // --- CARREGAR E RENDERIZAR CARRINHO ---
    function renderCart() {
        const cart = FutDB.getCart();
        
        if (cart.length === 0) {
            cartPageContent.style.display = "none";
            cartEmptyState.style.display = "block";
            return;
        }

        cartPageContent.style.display = "grid";
        cartEmptyState.style.display = "none";

        cartItemsContainer.innerHTML = "";
        subtotal = 0;

        cart.forEach(item => {
            const rowTotal = item.price * item.quantity;
            subtotal += rowTotal;

            const itemDiv = document.createElement("div");
            itemDiv.className = "cart-item";
            itemDiv.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <span class="cart-item-size">Tamanho: <strong>${item.size}</strong></span>
                </div>
                <div class="cart-item-qty">
                    <div class="qty-btn btn-minus" data-id="${item.id}">-</div>
                    <span class="qty-number">${item.quantity}</span>
                    <div class="qty-btn btn-plus" data-id="${item.id}">+</div>
                </div>
                <div class="cart-item-price">
                    R$ ${rowTotal.toFixed(2).replace('.', ',')}
                </div>
                <i class="fa-regular fa-trash-can cart-item-remove" data-id="${item.id}" title="Remover item"></i>
            `;

            // Botão Menos
            itemDiv.querySelector(".btn-minus").addEventListener("click", async () => {
                if (item.quantity > 1) {
                    const success = await FutDB.updateCartItemQuantity(item.id, item.quantity - 1);
                    if (success) renderCart();
                } else {
                    if (confirm(`Deseja remover "${item.name}" do carrinho?`)) {
                        FutDB.removeFromCart(item.id);
                        renderCart();
                    }
                }
            });

            // Botão Mais
            itemDiv.querySelector(".btn-plus").addEventListener("click", async () => {
                const success = await FutDB.updateCartItemQuantity(item.id, item.quantity + 1);
                if (success) {
                    renderCart();
                } else {
                    alert("Estoque máximo atingido para este tamanho!");
                }
            });

            // Lixeira Remover
            itemDiv.querySelector(".cart-item-remove").addEventListener("click", () => {
                if (confirm(`Deseja remover "${item.name}" do carrinho?`)) {
                    FutDB.removeFromCart(item.id);
                    renderCart();
                }
            });

            cartItemsContainer.appendChild(itemDiv);
        });

        // Auto-recalcular preços do painel
        recalculateTotals();
        updateCartBadge();
    }

    // --- RECALCULAR TOTAIS GERAIS ---
    function recalculateTotals() {
        // Desconto
        if (appliedCoupon) {
            if (appliedCoupon.discountType === "percent") {
                discountVal = subtotal * (appliedCoupon.discountValue / 100);
            } else if (appliedCoupon.discountType === "fixed") {
                discountVal = Math.min(subtotal, appliedCoupon.discountValue);
            }
        } else {
            discountVal = 0;
        }
        
        // Frete Grátis acima de R$ 299
        if (subtotal >= 299) {
            shippingFee = 0;
            shippingResultMsg.textContent = "✓ FRETE GRÁTIS ATIVADO!";
            shippingResultMsg.style.color = "var(--color-success)";
            summaryShipping.textContent = "GRÁTIS";
            summaryShipping.style.color = "var(--color-success)";
        } else {
            // Se já foi calculado anteriormente
            if (shippingFee > 0) {
                summaryShipping.textContent = `R$ ${shippingFee.toFixed(2).replace('.', ',')}`;
                summaryShipping.style.color = "#ffffff";
            } else {
                summaryShipping.textContent = "Calcular";
                summaryShipping.style.color = "var(--color-text-sub)";
            }
        }

        total = Math.max(0, subtotal + shippingFee - discountVal);

        summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        summaryDiscount.textContent = discountVal > 0 ? `- R$ ${discountVal.toFixed(2).replace('.', ',')}` : `R$ 0,00`;
        summaryTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // --- CALCULAR CEP ---
    btnCalcShipping.addEventListener("click", () => {
        const cep = shippingCep.value.replace(/\D/g, "");
        if (cep.length !== 8) {
            alert("Insira um CEP válido de 8 dígitos para simular!");
            return;
        }

        if (subtotal >= 299) {
            shippingFee = 0;
        } else {
            shippingFee = 15.00;
        }

        shippingResultMsg.style.color = "var(--color-volt)";
        shippingResultMsg.textContent = shippingFee === 0 ? "Entrega expressa em 3 dias: GRÁTIS" : "Entrega expressa em 3 dias: R$ 15,00";
        recalculateTotals();
    });

    // Mascarar CEP
    shippingCep.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 5) {
            value = value.substring(0, 5) + "-" + value.substring(5, 8);
        }
        e.target.value = value;
    });

    // --- APLICAR CUPOM ---
    btnApplyCoupon.addEventListener("click", async () => {
        const code = couponInput.value.trim().toUpperCase();
        if (!code) {
            alert("Por favor, digite o código de um cupom!");
            return;
        }

        // Buscar do banco
        const coupons = await FutDB.getCoupons();
        const found = coupons.find(c => c.code.toUpperCase() === code && c.active);

        if (found) {
            appliedCoupon = found;
            couponResultMsg.style.color = "var(--color-success)";
            const discText = found.discountType === "percent" ? `${found.discountValue}%` : `R$ ${found.discountValue.toFixed(2).replace('.', ',')}`;
            couponResultMsg.textContent = `✓ CUPOM '${found.code}' APLICADO! Desconto de ${discText}.`;
            recalculateTotals();
        } else {
            // Caso seja o padrão hardcoded fallback (caso os cupons no banco estejam vazios)
            if (code === "FUT10") {
                appliedCoupon = { code: "FUT10", discountType: "percent", discountValue: 10, active: true };
                couponResultMsg.style.color = "var(--color-success)";
                couponResultMsg.textContent = "✓ CUPOM 'FUT10' APLICADO! 10% DE DESCONTO.";
                recalculateTotals();
            } else {
                appliedCoupon = null;
                couponResultMsg.style.color = "var(--color-danger)";
                couponResultMsg.textContent = "❌ Cupom inválido ou expirado.";
                recalculateTotals();
            }
        }
    });

    // --- SELEÇÃO DE MÉTODO DE PAGAMENTO ---
    function selectPaymentMethod(method) {
        paymentMethod = method;

        // Desativar botões
        paySelectPix.classList.remove("active");
        paySelectCard.classList.remove("active");
        paySelectBoleto.classList.remove("active");

        // Ocultar frames
        framePix.classList.remove("active");
        frameCard.classList.remove("active");
        frameBoleto.classList.remove("active");

        if (method === "pix") {
            paySelectPix.classList.add("active");
            framePix.classList.add("active");
            startPixTimer(); // Reiniciar tempo do pix
        } else if (method === "card") {
            paySelectCard.classList.add("active");
            frameCard.classList.add("active");
        } else if (method === "boleto") {
            paySelectBoleto.classList.add("active");
            frameBoleto.classList.add("active");
        }
    }

    paySelectPix.addEventListener("click", () => selectPaymentMethod("pix"));
    paySelectCard.addEventListener("click", () => selectPaymentMethod("card"));
    paySelectBoleto.addEventListener("click", () => selectPaymentMethod("boleto"));

    // --- COPIAR TEXTOS DOS GATEWAYS ---
    btnCopyPix.addEventListener("click", () => {
        navigator.clipboard.writeText(pixCopyCode.value).then(() => {
            btnCopyPix.innerHTML = `✓ Código Copiado!`;
            btnCopyPix.style.backgroundColor = "var(--color-success)";
            btnCopyPix.style.color = "var(--color-text-dark)";
            
            setTimeout(() => {
                btnCopyPix.innerHTML = `<i class="fa-regular fa-copy"></i> Copiar Código Copia e Cola`;
                btnCopyPix.style.backgroundColor = "";
                btnCopyPix.style.color = "";
            }, 2000);
        });
    });

    btnCopyBoleto.addEventListener("click", () => {
        const boletoInput = btnCopyBoleto.previousElementSibling;
        navigator.clipboard.writeText(boletoInput.value).then(() => {
            btnCopyBoleto.innerHTML = `✓ Copiado com Sucesso!`;
            btnCopyBoleto.style.backgroundColor = "var(--color-success)";
            btnCopyBoleto.style.color = "var(--color-text-dark)";
            
            setTimeout(() => {
                btnCopyBoleto.innerHTML = `<i class="fa-regular fa-copy"></i> Copiar Código do Boleto`;
                btnCopyBoleto.style.backgroundColor = "";
                btnCopyBoleto.style.color = "";
            }, 2000);
        });
    });

    // --- CARTÃO VIRTUAL INTERATIVO 3D (LÓGICA) ---
    // Número do cartão
    inputCardNumber.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        
        // Determinar bandeira do cartão visualmente
        if (value.startsWith("4")) {
            visualCardBrand.className = "fa-brands fa-cc-visa";
            visualCardBrand.style.color = "#00e676";
        } else if (value.startsWith("5")) {
            visualCardBrand.className = "fa-brands fa-cc-mastercard";
            visualCardBrand.style.color = "var(--color-gold)";
        } else {
            visualCardBrand.className = "fa-regular fa-credit-card";
            visualCardBrand.style.color = "#ffffff";
        }

        // Formatar com espaços
        let formatted = "";
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += value[i];
        }
        e.target.value = formatted.substring(0, 19);

        // Preencher visual
        visualCardNumber.textContent = formatted || "•••• •••• •••• ••••";
    });

    // Nome impresso
    inputCardHolder.addEventListener("input", (e) => {
        let val = e.target.value.toUpperCase();
        visualCardHolder.textContent = val || "NOME COMPLETO";
    });

    // Validade
    inputCardExpiry.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 2) {
            val = val.substring(0, 2) + "/" + val.substring(2, 4);
        }
        e.target.value = val;
        visualCardExpiry.textContent = val || "MM/AA";
    });

    // CVV - Flip do cartão 3D ao focar
    inputCardCvv.addEventListener("focus", () => {
        visualCard.classList.add("flipped");
    });
    inputCardCvv.addEventListener("blur", () => {
        visualCard.classList.remove("flipped");
    });
    inputCardCvv.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        visualCardCvv.textContent = val || "•••";
    });

    // --- ESVAZIAR CARRINHO ---
    btnClearCart.addEventListener("click", () => {
        if (confirm("Tem certeza de que deseja esvaziar o seu carrinho?")) {
            FutDB.clearCart();
            renderCart();
        }
    });

    // --- FINALIZAR COMPRA ---
    btnFinishCheckout.addEventListener("click", () => {
        const cart = FutDB.getCart();
        if (cart.length === 0) {
            alert("Carrinho vazio!");
            return;
        }

        // Verificar Login do Usuário
        const currentUser = FutDB.getCurrentUser();
        if (!currentUser || currentUser.isAdmin) {
            alert("Para finalizar seu pedido de mantos, faça o login na sua conta!");
            window.location.href = "profile.html";
            return;
        }

        // Validar dados do Cartão se for o método escolhido
        if (paymentMethod === "card") {
            const num = inputCardNumber.value.replace(/\s/g, "");
            const name = inputCardHolder.value.trim();
            const exp = inputCardExpiry.value.trim();
            const cvv = inputCardCvv.value.trim();

            if (num.length < 16) {
                alert("Insira os 16 dígitos do número do cartão!");
                return;
            }
            if (!name) {
                alert("Insira o nome do titular do cartão!");
                return;
            }
            if (exp.length < 5) {
                alert("Insira a data de validade (MM/AA) do cartão!");
                return;
            }
            if (cvv.length < 3) {
                alert("Insira o código de segurança CVV (três ou quatro dígitos)!");
                return;
            }
        }

        // Endereço de entrega (recuperar do cliente)
        const address = (currentUser.addresses && currentUser.addresses.length > 0) 
            ? currentUser.addresses.find(a => a.default) || currentUser.addresses[0]
            : { street: "Não cadastrado", number: "", city: "N/A", state: "N/A" };

        const orderData = {
            items: cart,
            subtotal: subtotal,
            shipping: shippingFee,
            discount: discountVal,
            total: total,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            paymentMethod: paymentMethod === "pix" ? "PIX" : paymentMethod === "card" ? "Cartão de Crédito" : "Boleto Bancário",
            address: `${address.street}, Nº ${address.number} - ${address.city}/${address.state}`
        };

        // Criar overlay de processamento para simular banco / transação
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(10, 12, 16, 0.95)";
        overlay.style.zIndex = "9999";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.gap = "20px";
        overlay.innerHTML = `
            <div style="color: var(--color-volt); font-size: 54px; animation: spin 1.2s linear infinite;" class="fa-solid fa-circle-notch"></div>
            <h2 style="font-weight: 800; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Processando seu Pagamento...</h2>
            <p style="color: var(--color-text-sub); font-size: 14px;">Aguardando aprovação do gateway financeiro FutCommerce...</p>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        document.body.appendChild(overlay);

        // Simular aprovação rápida
        setTimeout(async () => {
            // Salvar pedido no localStorage e reduzir estoques
            const orderCreated = await FutDB.createOrder(orderData);

            // Remover overlay
            overlay.remove();

            // Emitir sucesso
            alert(`✓ PEDIDO APROVADO! Código: ${orderCreated.id}\nSeu pagamento via ${orderCreated.paymentMethod} foi validado com sucesso. Obrigado pela sua compra!`);

            // Redirecionar para perfil onde o pedido aparece
            window.location.href = "profile.html?tab=orders";
        }, 2200);
    });

    // --- INICIALIZAÇÃO ---
    renderCart();
});
