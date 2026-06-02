/**
 * FUTCOMMERCE - CENTRAL STATE & DATABASE MANAGER
 * 
 * Este arquivo funciona como o banco de dados da plataforma, utilizando localStorage
 * para manter os dados sincronizados em tempo real entre a loja virtual e o painel administrativo.
 */

(function() {

// --- RESET DE DADOS VIA PARÂMETRO URL ---
try {
    if (window.location.search.includes("reset=true") || window.location.search.includes("clear=true")) {
        localStorage.clear();
        console.log("[DEBUG] LocalStorage limpo com sucesso!");
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.location.href = cleanUrl;
    }
} catch (err) {
    alert("Erro no reset hook do state.js: " + err.message + "\nStack: " + err.stack);
}


// --- FUNÇÃO PARA GERAR SVGs PREMIUM DE CAMISAS EM ALTA RESOLUÇÃO ---
// Permite renderizar camisas dinâmicas com cores, listras, golas e escudos reais do time
function generateJerseySVG(config) {
    const {
        primaryColor = '#E30613',
        secondaryColor = '#000000',
        stripeColor = '#000000',
        stripePattern = 'none', // 'vertical', 'horizontal', 'sash' (faixa diagonal), 'none', 'hoops'
        collarColor = '#FFFFFF',
        accentColor = '#FFFFFF',
        crestSVG = '', // Minimalist badge path or shape
        brand = 'adidas', // 'adidas', 'nike', 'puma'
        sponsorText = 'FLY EMIRATES'
    } = config;

    let patterns = '';
    let details = '';

    // Gerar padrões visuais com base no tipo de estampa da camisa
    if (stripePattern === 'vertical') {
        patterns = `
            <g opacity="0.85">
                <rect x="35" y="40" width="15" height="150" fill="${stripeColor}" />
                <rect x="65" y="40" width="15" height="150" fill="${stripeColor}" />
                <rect x="95" y="40" width="15" height="150" fill="${stripeColor}" />
                <rect x="125" y="40" width="15" height="150" fill="${stripeColor}" />
                <rect x="150" y="40" width="15" height="150" fill="${stripeColor}" />
            </g>`;
    } else if (stripePattern === 'horizontal') {
        patterns = `
            <g opacity="0.85">
                <rect x="20" y="60" width="160" height="15" fill="${stripeColor}" />
                <rect x="20" y="90" width="160" height="15" fill="${stripeColor}" />
                <rect x="20" y="120" width="160" height="15" fill="${stripeColor}" />
                <rect x="20" y="150" width="160" height="15" fill="${stripeColor}" />
                <rect x="20" y="180" width="160" height="15" fill="${stripeColor}" />
            </g>`;
    } else if (stripePattern === 'sash') {
        patterns = `
            <path d="M 30,50 L 170,170 L 170,195 L 30,75 Z" fill="${stripeColor}" opacity="0.9" />`;
    } else if (stripePattern === 'halves') {
        patterns = `
            <rect x="100" y="40" width="80" height="150" fill="${stripeColor}" />`;
    }

    // Desenho do logotipo da marca
    let brandLogo = '';
    if (brand === 'adidas') {
        brandLogo = `
            <g fill="${accentColor}" transform="translate(65, 68) scale(0.06)">
                <path d="M 0,120 L 30,120 L 70,30 L 40,30 Z" />
                <path d="M 45,120 L 75,120 L 115,10 L 85,10 Z" />
                <path d="M 90,120 L 120,120 L 160,0 L 130,0 Z" />
            </g>`;
    } else if (brand === 'nike') {
        brandLogo = `
            <path d="M 65,72 C 73,72 82,68 87,63 C 80,68 71,69 66,66 C 60,63 58,58 56,54 C 58,58 61,64 68,67 Z" fill="${accentColor}" transform="translate(5, 5) scale(0.9)" />`;
    } else { // Puma ou genérico
        brandLogo = `
            <circle cx="70" cy="72" r="4" fill="${accentColor}" />
            <path d="M 68,75 L 75,70 L 78,73 Z" fill="${accentColor}" />`;
    }

    // Retorna a string SVG completa correspondente à camisa tridimensionalizada
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
        <!-- Definições de Sombras e Efeitos -->
        <defs>
            <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
                <stop offset="50%" stop-color="#000000" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.4" />
            </linearGradient>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${primaryColor}" />
                <stop offset="50%" stop-color="${primaryColor}" filter="brightness(1.1)" />
                <stop offset="100%" stop-color="${primaryColor}" filter="brightness(0.9)" />
            </linearGradient>
            <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="%23000000" flood-opacity="0.35"/>
            </filter>
        </defs>

        <!-- Sombra Projetada Atrás da Camisa -->
        <path d="M 30,50 L 50,40 L 150,40 L 170,50 L 195,90 L 175,105 L 165,95 L 165,200 C 165,208 158,215 150,215 L 50,215 C 42,215 35,208 35,200 L 35,95 L 25,105 L 5,90 Z" fill="%23000000" opacity="0.25" filter="blur(5px)" />

        <g filter="url(%23dropShadow)">
            <!-- Manga Esquerda -->
            <path d="M 50,40 L 25,48 L 5,90 L 25,105 L 45,75 Z" fill="${secondaryColor}" />
            <path d="M 5,90 L 25,105 L 29,101 L 9,86 Z" fill="${accentColor}" opacity="0.8" />
            
            <!-- Manga Direita -->
            <path d="M 150,40 L 175,48 L 195,90 L 175,105 L 155,75 Z" fill="${secondaryColor}" />
            <path d="M 195,90 L 175,105 L 171,101 L 191,86 Z" fill="${accentColor}" opacity="0.8" />

            <!-- Corpo Principal -->
            <path d="M 50,40 L 150,40 L 165,90 L 165,200 C 165,208 158,215 150,215 L 50,215 C 42,215 35,208 35,200 L 35,90 Z" fill="${primaryColor}" />
            
            <!-- Estampas / Listras -->
            <g>
                <clipPath id="bodyClip">
                    <path d="M 50,40 L 150,40 L 165,90 L 165,200 C 165,208 158,215 150,215 L 50,215 C 42,215 35,208 35,200 L 35,90 Z" />
                </clipPath>
                <g clip-path="url(%23bodyClip)">
                    ${patterns}
                </g>
            </g>

            <!-- Barra Inferior -->
            <path d="M 35,198 L 165,198 L 165,205 C 165,210 158,215 150,215 L 50,215 C 42,215 35,210 35,205 Z" fill="${secondaryColor}" opacity="0.9" />

            <!-- Gola V / Detalhes de Costura -->
            <path d="M 80,40 L 120,40 L 100,65 Z" fill="${collarColor}" />
            <path d="M 85,40 L 115,40 L 100,58 Z" fill="%230a0c10" />

            <!-- Logotipos da Marca & Escudo -->
            ${brandLogo}

            <!-- Escudo do Time Simulado -->
            <g transform="translate(125, 65)">
                ${crestSVG}
            </g>

            <!-- Patrocinador Master -->
            <text x="100" y="140" font-family="'Outfit', 'Impact', sans-serif" font-weight="bold" font-size="14" fill="${accentColor}" text-anchor="middle" letter-spacing="1.5" opacity="0.9" stroke="rgba(0,0,0,0.5)" stroke-width="0.5">${sponsorText}</text>

            <!-- Sombras Tridimensionais Realistas de Tecido -->
            <path d="M 50,40 L 150,40 L 165,90 L 165,200 C 165,208 158,215 150,215 L 50,215 C 42,215 35,208 35,200 L 35,90 Z" fill="url(%23jerseyGrad)" />
        </g>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
}

// --- ESCUDOS MOCK VETORIAIS ---
const CRESTS = {
    flamengo: `<path d="M 0,0 L 16,0 C 16,0 18,12 8,20 C -2,12 0,0 0,0 Z" fill="%23000000" stroke="%23FFFFFF" stroke-width="1.5"/><text x="8" y="11" font-size="8" font-family="sans-serif" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">CRF</text>`,
    corinthians: `<circle cx="8" cy="8" r="8" fill="%23FFFFFF" stroke="%23E30613" stroke-width="1.5"/><rect x="6" y="2" width="4" height="12" fill="%23000000"/><rect x="2" y="6" width="12" height="4" fill="%23000000"/><circle cx="8" cy="8" r="5" fill="%23FFFFFF" stroke="%23000000" stroke-width="1.5"/><text x="8" y="11" font-size="6" font-family="sans-serif" font-weight="bold" fill="%23000000" text-anchor="middle">SCCP</text>`,
    realmadrid: `<circle cx="8" cy="8" r="8" fill="%23e5a93b" stroke="%23FFFFFF" stroke-width="1"/><circle cx="8" cy="8" r="6" fill="%2300529F"/><path d="M 2,12 L 14,4" stroke="%23FFFFFF" stroke-width="2"/><text x="8" y="10" font-size="7" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">MC</text>`,
    barcelona: `<path d="M 0,0 L 16,0 C 16,10 12,16 8,18 C 4,16 0,10 0,0 Z" fill="%2300529F" stroke="%23e5a93b" stroke-width="1"/><rect x="0" y="0" width="8" height="6" fill="%23E30613"/><rect x="0" y="0" width="16" height="3" fill="%23FFFFFF"/><rect x="7" y="0" width="2" height="6" fill="%23FFFFFF"/><text x="8" y="13" font-size="6" font-weight="bold" fill="%23e5a93b" text-anchor="middle">FCB</text>`,
    brasil: `<path d="M 0,0 L 16,0 L 16,10 C 16,15 8,19 8,19 C 8,19 0,15 0,10 Z" fill="%23009B3A" stroke="%23FFDF00" stroke-width="1"/><rect x="3" y="3" width="10" height="7" fill="%23FFDF00"/><circle cx="8" cy="6.5" r="3" fill="%23002776"/><text x="8" y="14" font-size="5" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">CBF</text>`,
    argentina: `<path d="M 0,0 L 16,0 L 16,12 C 16,16 8,19 8,19 C 8,19 0,16 0,12 Z" fill="%2374ACDF" stroke="%23FFFFFF" stroke-width="1.5"/><rect x="0" y="4" width="16" height="4" fill="%23FFFFFF"/><circle cx="8" cy="6" r="2" fill="%23FFDF00"/><text x="8" y="13.5" font-size="5" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">AFA</text>`,
    milan: `<ellipse cx="8" cy="9" rx="6" ry="9" fill="%23FFFFFF" stroke="%23e5a93b" stroke-width="1"/><rect x="2" y="3" width="6" height="12" fill="%23E30613"/><rect x="4" y="3" width="2" height="12" fill="%23000000"/><rect x="8" y="3" width="6" height="12" fill="%23FFFFFF"/><path d="M 8,3 L 8,15 M 5,9 L 14,9" stroke="%23E30613" stroke-width="1"/><text x="8" y="16" font-size="5" font-weight="bold" fill="%23000000" text-anchor="middle">ACM</text>`,
    boca: `<path d="M 0,0 L 16,0 C 16,10 12,16 8,18 C 4,16 0,10 0,0 Z" fill="%23003A70" stroke="%23FFC72C" stroke-width="1.5"/><rect x="0" y="6" width="16" height="5" fill="%23FFC72C"/><text x="8" y="11" font-size="6" font-weight="bold" fill="%23003A70" text-anchor="middle">CABJ</text>`,
    corinthians_blackout: `<circle cx="8" cy="8" r="8" fill="%231a1a1a" stroke="%233a3a3a" stroke-width="1.5"/><rect x="6" y="2" width="4" height="12" fill="%232e2e2e"/><rect x="2" y="6" width="12" height="4" fill="%232e2e2e"/><circle cx="8" cy="8" r="5" fill="%231a1a1a" stroke="%233a3a3a" stroke-width="1.5"/><text x="8" y="11" font-size="6" font-family="sans-serif" font-weight="bold" fill="%233a3a3a" text-anchor="middle">SCCP</text>`
};

// --- BANCO DE DADOS DE PRODUTOS INICIAIS ---
const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        sku: "FLA-2026-HOME",
        name: "Camisa Flamengo Home 2026/27",
        title: "Manto Sagrado Adidas Torcedor",
        description: "O novo Manto Sagrado do Flamengo traz as tradicionais listras horizontais rubro-negras com grafismos texturizados inspirados na pulsação da torcida no Maracanã. Tecnologia antitranspirante de alta qualidade.",
        price: 349.90,
        promoPrice: 299.90,
        category: "Futebol Nacional",
        subcategory: "Flamengo",
        collection: "Temporada 2026",
        brand: "Adidas",
        team: "Flamengo",
        gender: "Masculino",
        type: "Torcedor",
        rating: 4.9,
        reviewsCount: 142,
        images: [
            generateJerseySVG({
                primaryColor: '#e30613',
                secondaryColor: '#000000',
                stripeColor: '#000000',
                stripePattern: 'horizontal',
                collarColor: '#ffffff',
                accentColor: '#ffffff',
                crestSVG: CRESTS.flamengo,
                brand: 'adidas',
                sponsorText: 'PIXBET'
            }),
            generateJerseySVG({
                primaryColor: '#000000',
                secondaryColor: '#e30613',
                stripeColor: '#e30613',
                stripePattern: 'horizontal',
                collarColor: '#ffffff',
                accentColor: '#ffffff',
                crestSVG: CRESTS.flamengo,
                brand: 'adidas',
                sponsorText: 'PIXBET'
            })
        ],
        designerConfig: {
            primaryColor: '#e30613',
            secondaryColor: '#000000',
            accentColor: '#ffffff',
            stripePattern: 'horizontal',
            collarColor: '#ffffff',
            crest: 'flamengo',
            brand: 'adidas',
            sponsorText: 'PIXBET'
        },
        sizes: [
            { name: "P", stock: 12, price: 299.90 },
            { name: "M", stock: 24, price: 299.90 },
            { name: "G", stock: 18, price: 299.90 },
            { name: "GG", stock: 8, price: 309.90 }, // Preço específico
            { name: "XG", stock: 0, price: 319.90 }  // Esgotado
        ],
        reviews: [
            { author: "Gabriel S.", rating: 5, date: "2026-05-10", text: "Excelente qualidade, listras perfeitas e caimento sensacional! O manto mais lindo dos últimos anos." },
            { author: "Mariana L.", rating: 5, date: "2026-05-08", text: "Comprei de presente para o meu namorado e ele amou. Entrega super rápida da FutCommerce!" },
            { author: "Rodrigo M.", rating: 4, date: "2026-05-01", text: "A camisa é linda. Tecido confortável. Só achei um pouco justa na gola, mas nada que incomode." }
        ],
        featured: true,
        trending: true,
        promo: true
    },
    {
        id: "prod-2",
        sku: "COR-2026-HOME",
        name: "Camisa Corinthians Home 2026",
        title: "Manto Alvinegro Nike",
        description: "Celebrando a garra do povo paulista, o manto home do Corinthians traz o clássico visual minimalista off-white com detalhes pretos elegantes e um acabamento texturizado premium nas mangas.",
        price: 349.90,
        promoPrice: 329.90,
        category: "Futebol Nacional",
        subcategory: "Corinthians",
        collection: "Temporada 2026",
        brand: "Nike",
        team: "Corinthians",
        gender: "Unissex",
        type: "Torcedor",
        rating: 4.8,
        reviewsCount: 98,
        images: [
            generateJerseySVG({
                primaryColor: '#f7f7f7',
                secondaryColor: '#121212',
                stripeColor: '#f7f7f7',
                stripePattern: 'none',
                collarColor: '#121212',
                accentColor: '#121212',
                crestSVG: CRESTS.corinthians,
                brand: 'nike',
                sponsorText: 'NEO QUÍMICA'
            }),
            generateJerseySVG({
                primaryColor: '#121212',
                secondaryColor: '#f7f7f7',
                stripeColor: '#121212',
                stripePattern: 'none',
                collarColor: '#f7f7f7',
                accentColor: '#f7f7f7',
                crestSVG: CRESTS.corinthians,
                brand: 'nike',
                sponsorText: 'NEO QUÍMICA'
            })
        ],
        designerConfig: {
            primaryColor: '#f7f7f7',
            secondaryColor: '#121212',
            accentColor: '#121212',
            stripePattern: 'none',
            collarColor: '#121212',
            crest: 'corinthians',
            brand: 'nike',
            sponsorText: 'NEO QUÍMICA'
        },
        sizes: [
            { name: "P", stock: 15, price: 329.90 },
            { name: "M", stock: 20, price: 329.90 },
            { name: "G", stock: 22, price: 329.90 },
            { name: "GG", stock: 5, price: 329.90 },
            { name: "XG", stock: 4, price: 349.90 }
        ],
        reviews: [
            { author: "Thiago P.", rating: 5, date: "2026-05-18", text: "Camisa sensacional. Muito linda e estilosa para usar no dia a dia. Vai Corinthians!" },
            { author: "Carla S.", rating: 4, date: "2026-04-29", text: "Linda demais, porém aconselho pegar um tamanho maior que o normal. Tecido super respirável." }
        ],
        featured: true,
        trending: false,
        promo: true
    },
    {
        id: "prod-3",
        sku: "RMA-2026-HOME",
        name: "Camisa Real Madrid Home 26/27",
        title: "Manto Merengue Oficial",
        description: "Represente os reis da Europa com o clássico manto branco com detalhes em dourado metálico. Tecnologia de ponta Heat.Rdy que oferece ventilação máxima e absorção de suor premium.",
        price: 399.90,
        promoPrice: null,
        category: "Futebol Europeu",
        subcategory: "Real Madrid",
        collection: "Champions League",
        brand: "Adidas",
        team: "Real Madrid",
        gender: "Masculino",
        type: "Jogador",
        rating: 5.0,
        reviewsCount: 187,
        images: [
            generateJerseySVG({
                primaryColor: '#ffffff',
                secondaryColor: '#0c2240',
                stripeColor: '#ffffff',
                stripePattern: 'none',
                collarColor: '#e5a93b',
                accentColor: '#e5a93b',
                crestSVG: CRESTS.realmadrid,
                brand: 'adidas',
                sponsorText: 'EMIRATES'
            }),
            generateJerseySVG({
                primaryColor: '#e5a93b',
                secondaryColor: '#0c2240',
                stripeColor: '#e5a93b',
                stripePattern: 'none',
                collarColor: '#ffffff',
                accentColor: '#ffffff',
                crestSVG: CRESTS.realmadrid,
                brand: 'adidas',
                sponsorText: 'EMIRATES'
            })
        ],
        designerConfig: {
            primaryColor: '#ffffff',
            secondaryColor: '#0c2240',
            accentColor: '#e5a93b',
            stripePattern: 'none',
            collarColor: '#e5a93b',
            crest: 'realmadrid',
            brand: 'adidas',
            sponsorText: 'EMIRATES'
        },
        sizes: [
            { name: "P", stock: 8, price: 399.90 },
            { name: "M", stock: 15, price: 399.90 },
            { name: "G", stock: 10, price: 399.90 },
            { name: "GG", stock: 7, price: 399.90 },
            { name: "XG", stock: 2, price: 399.90 }
        ],
        reviews: [
            { author: "Felipe T.", rating: 5, date: "2026-05-14", text: "Simplesmente espetacular. Os detalhes dourados são de outro nível. Qualidade impecável." }
        ],
        featured: true,
        trending: true,
        promo: false
    },
    {
        id: "prod-4",
        sku: "FCB-2026-HOME",
        name: "Camisa Barcelona Home 26/27",
        title: "Manto Blaugrana Nike",
        description: "O novo design do Barcelona divide a camisa em duas cores clássicas - azul e grená, prestando tributo à rica história do clube catalão e sua lendária academia La Masia.",
        price: 379.90,
        promoPrice: 319.90,
        category: "Futebol Europeu",
        subcategory: "Barcelona",
        collection: "Temporada 2026",
        brand: "Nike",
        team: "Barcelona",
        gender: "Masculino",
        type: "Torcedor",
        rating: 4.7,
        reviewsCount: 74,
        images: [
            generateJerseySVG({
                primaryColor: '#a50044',
                secondaryColor: '#004d98',
                stripeColor: '#004d98',
                stripePattern: 'halves',
                collarColor: '#ffed00',
                accentColor: '#ffed00',
                crestSVG: CRESTS.barcelona,
                brand: 'nike',
                sponsorText: 'SPOTIFY'
            })
        ],
        designerConfig: {
            primaryColor: '#a50044',
            secondaryColor: '#004d98',
            accentColor: '#ffed00',
            stripePattern: 'halves',
            collarColor: '#ffed00',
            crest: 'barcelona',
            brand: 'nike',
            sponsorText: 'SPOTIFY'
        },
        sizes: [
            { name: "P", stock: 5, price: 319.90 },
            { name: "M", stock: 8, price: 319.90 },
            { name: "G", stock: 0, price: 319.90 },
            { name: "GG", stock: 12, price: 319.90 },
            { name: "XG", stock: 5, price: 329.90 }
        ],
        reviews: [
            { author: "Lucas A.", rating: 5, date: "2026-05-02", text: "Camisa histórica. As duas metades lembraram a camisa do centenário. Indispensável para torcedores." }
        ],
        featured: false,
        trending: true,
        promo: true
    },
    {
        id: "prod-5",
        sku: "BRA-2026-HOME",
        name: "Camisa Seleção Brasileira Home 26",
        title: "Amarelinha Clássica Nike",
        description: "Vista a camisa mais vitoriosa do planeta. A nova amarelinha traz marcas d'água texturizadas que representam a fauna e a flora brasileiras, aliadas a uma gola retrô super confortável.",
        price: 349.90,
        promoPrice: null,
        category: "Seleções",
        subcategory: "Brasil",
        collection: "Edição Limitada",
        brand: "Nike",
        team: "Seleção Brasileira",
        gender: "Unissex",
        type: "Torcedor",
        rating: 4.9,
        reviewsCount: 220,
        images: [
            generateJerseySVG({
                primaryColor: '#ffdf00',
                secondaryColor: '#009b3a',
                stripeColor: '#ffdf00',
                stripePattern: 'none',
                collarColor: '#002776',
                accentColor: '#009b3a',
                crestSVG: CRESTS.brasil,
                brand: 'nike',
                sponsorText: 'BRASIL'
            })
        ],
        designerConfig: {
            primaryColor: '#ffdf00',
            secondaryColor: '#009b3a',
            accentColor: '#009b3a',
            stripePattern: 'none',
            collarColor: '#002776',
            crest: 'brasil',
            brand: 'nike',
            sponsorText: 'BRASIL'
        },
        sizes: [
            { name: "P", stock: 25, price: 349.90 },
            { name: "M", stock: 30, price: 349.90 },
            { name: "G", stock: 20, price: 349.90 },
            { name: "GG", stock: 15, price: 349.90 },
            { name: "XG", stock: 10, price: 359.90 }
        ],
        reviews: [],
        featured: true,
        trending: true,
        promo: false
    },
    {
        id: "prod-6",
        sku: "ARG-2026-HOME",
        name: "Camisa Argentina Home 2026",
        title: "Manto Alviceleste Adidas",
        description: "A camisa de três estrelas dos atuais campeões do mundo. Listras verticais celestes e brancas clássicas com detalhes dourados especiais do escudo de campeão da FIFA no centro.",
        price: 379.90,
        promoPrice: 299.90,
        category: "Seleções",
        subcategory: "Argentina",
        collection: "Temporada 2026",
        brand: "Adidas",
        team: "Seleção Argentina",
        gender: "Masculino",
        type: "Torcedor",
        rating: 4.8,
        reviewsCount: 112,
        images: [
            generateJerseySVG({
                primaryColor: '#ffffff',
                secondaryColor: '#74acdf',
                stripeColor: '#74acdf',
                stripePattern: 'vertical',
                collarColor: '#000000',
                accentColor: '#e5a93b',
                crestSVG: CRESTS.argentina,
                brand: 'adidas',
                sponsorText: 'AFA'
            })
        ],
        designerConfig: {
            primaryColor: '#ffffff',
            secondaryColor: '#74acdf',
            accentColor: '#e5a93b',
            stripePattern: 'vertical',
            collarColor: '#000000',
            crest: 'argentina',
            brand: 'adidas',
            sponsorText: 'AFA'
        },
        sizes: [
            { name: "P", stock: 10, price: 299.90 },
            { name: "M", stock: 14, price: 299.90 },
            { name: "G", stock: 15, price: 299.90 },
            { name: "GG", stock: 0, price: 299.90 },
            { name: "XG", stock: 3, price: 309.90 }
        ],
        reviews: [],
        featured: false,
        trending: false,
        promo: true
    },
    {
        id: "prod-7",
        sku: "MIL-1996-RETRO",
        name: "Camisa Milan 1995/96 Retrô",
        title: "Camisa Retrô Scudetto Rossonero",
        description: "Uma verdadeira obra de arte do futebol mundial. Reedição fiel da temporada 95/96, época de craques lendários como Roberto Baggio, Weah e Maldini. Listras rossoneras verticais elegantes com o clássico patrocinador master.",
        price: 249.90,
        promoPrice: 199.90,
        category: "Retrô",
        subcategory: "Milan",
        collection: "Camisas Retrô",
        brand: "Retrô",
        team: "Milan",
        gender: "Unissex",
        type: "Retrô",
        rating: 4.9,
        reviewsCount: 88,
        images: [
            generateJerseySVG({
                primaryColor: '#e30613',
                secondaryColor: '#000000',
                stripeColor: '#000000',
                stripePattern: 'vertical',
                collarColor: '#ffffff',
                accentColor: '#ffffff',
                crestSVG: CRESTS.milan,
                brand: 'adidas',
                sponsorText: 'OPEL'
            })
        ],
        designerConfig: {
            primaryColor: '#e30613',
            secondaryColor: '#000000',
            accentColor: '#ffffff',
            stripePattern: 'vertical',
            collarColor: '#ffffff',
            crest: 'milan',
            brand: 'adidas',
            sponsorText: 'OPEL'
        },
        sizes: [
            { name: "P", stock: 5, price: 199.90 },
            { name: "M", stock: 10, price: 199.90 },
            { name: "G", stock: 12, price: 199.90 },
            { name: "GG", stock: 5, price: 199.90 },
            { name: "XG", stock: 2, price: 209.90 }
        ],
        reviews: [
            { author: "Alessandro B.", rating: 5, date: "2026-04-20", text: "Excelente réplica! Lembra a infância dourada da Serie A italiana. Tecido muito confortável e escudo perfeitamente costurado." }
        ],
        featured: true,
        trending: true,
        promo: true
    },
    {
        id: "prod-8",
        sku: "BOC-2001-RETRO",
        name: "Camisa Boca Juniors 2001 Retrô",
        title: "Manto de La Bombonera",
        description: "Relembre as noites mágicas da Libertadores com esta camisa icônica. Amarelo vibrante sobre azul marinho escuro, imortalizada por Riquelme e Palermo na conquista do continente.",
        price: 249.90,
        promoPrice: 219.90,
        category: "Retrô",
        subcategory: "Boca Juniors",
        collection: "Camisas Retrô",
        brand: "Retrô",
        team: "Boca Juniors",
        gender: "Masculino",
        type: "Retrô",
        rating: 4.8,
        reviewsCount: 65,
        images: [
            generateJerseySVG({
                primaryColor: '#003a70',
                secondaryColor: '#ffc72c',
                stripeColor: '#ffc72c',
                stripePattern: 'none',
                collarColor: '#ffc72c',
                accentColor: '#ffffff',
                crestSVG: CRESTS.boca,
                brand: 'nike',
                sponsorText: 'QUILMES'
            })
        ],
        designerConfig: {
            primaryColor: '#003a70',
            secondaryColor: '#ffc72c',
            accentColor: '#ffffff',
            stripePattern: 'none',
            collarColor: '#ffc72c',
            crest: 'boca',
            brand: 'nike',
            sponsorText: 'QUILMES'
        },
        sizes: [
            { name: "P", stock: 4, price: 219.90 },
            { name: "M", stock: 8, price: 219.90 },
            { name: "G", stock: 7, price: 219.90 },
            { name: "GG", stock: 3, price: 219.90 },
            { name: "XG", stock: 1, price: 219.90 }
        ],
        reviews: [],
        featured: false,
        trending: true,
        promo: true
    },
    {
        id: "prod-9",
        sku: "COR-BLK-2026",
        name: "Camisa Corinthians Blackout Edition 2026",
        title: "Edição Especial Limitada Blackout",
        description: "O novo manto Blackout Edition do Corinthians traz a elegância sombria de um design inteiramente preto chumbo fosco, com listras verticais em preto carbono brilhante. O escudo minimalista e o patrocinador cinza chumbo metálico completam um visual de elite insuperável.",
        price: 389.90,
        promoPrice: 349.90,
        category: "Especial Blackout",
        subcategory: "Corinthians",
        collection: "Edição Limitada",
        brand: "Nike",
        team: "Corinthians",
        gender: "Masculino",
        type: "Jogador",
        rating: 5.0,
        reviewsCount: 42,
        images: [
            generateJerseySVG({
                primaryColor: '#121212',
                secondaryColor: '#1e1e1e',
                stripeColor: '#1a1a1a',
                stripePattern: 'vertical',
                collarColor: '#121212',
                accentColor: '#3a3a3a',
                crestSVG: CRESTS.corinthians_blackout,
                brand: 'nike',
                sponsorText: 'VAIDEBET'
            })
        ],
        designerConfig: {
            primaryColor: '#121212',
            secondaryColor: '#1e1e1e',
            accentColor: '#3a3a3a',
            stripePattern: 'vertical',
            collarColor: '#121212',
            crest: 'corinthians_blackout',
            brand: 'nike',
            sponsorText: 'VAIDEBET'
        },
        sizes: [
            { name: "P", stock: 8, price: 349.90 },
            { name: "M", stock: 12, price: 349.90 },
            { name: "G", stock: 10, price: 349.90 },
            { name: "GG", stock: 6, price: 359.90 },
            { name: "XG", stock: 2, price: 369.90 }
        ],
        reviews: [
            { author: "Maurício J.", rating: 5, date: "2026-05-24", text: "Espetacular! A camisa blackout é a mais bonita que já comprei. O acabamento dos detalhes em chumbo é sensacional." }
        ],
        featured: true,
        trending: true,
        promo: true
    },
    {
        id: "prod-10",
        sku: "FLA-RET-1981",
        name: "Camisa Flamengo Retrô Legend 1981",
        title: "Relíquia Histórica Zico Campeão",
        description: "Reedição impecável do manto sagrado de 1981, ano em que o Flamengo conquistou o topo do mundo no Japão sob o comando do Galinho Zico. Com listras rubro-negras finas tradicionais, gola V branca vintage e o clássico patrocinador master branco.",
        price: 269.90,
        promoPrice: 229.90,
        category: "Especial Blackout",
        subcategory: "Flamengo",
        collection: "Camisas Retrô",
        brand: "Retrô",
        team: "Flamengo",
        gender: "Unissex",
        type: "Retrô",
        rating: 4.9,
        reviewsCount: 75,
        images: [
            generateJerseySVG({
                primaryColor: '#e30613',
                secondaryColor: '#000000',
                stripeColor: '#000000',
                stripePattern: 'horizontal',
                collarColor: '#ffffff',
                accentColor: '#ffffff',
                crestSVG: CRESTS.flamengo,
                brand: 'adidas',
                sponsorText: 'LUBRAX'
            })
        ],
        designerConfig: {
            primaryColor: '#e30613',
            secondaryColor: '#000000',
            accentColor: '#ffffff',
            stripePattern: 'horizontal',
            collarColor: '#ffffff',
            crest: 'flamengo',
            brand: 'adidas',
            sponsorText: 'LUBRAX'
        },
        sizes: [
            { name: "P", stock: 6, price: 229.90 },
            { name: "M", stock: 15, price: 229.90 },
            { name: "G", stock: 12, price: 229.90 },
            { name: "GG", stock: 4, price: 229.90 },
            { name: "XG", stock: 2, price: 239.90 }
        ],
        reviews: [
            { author: "Zico Neto", rating: 5, date: "2026-05-20", text: "Vestir essa camisa é sentir a história de 81 na pele. Perfeição em cada costura rubro-negra e na gola clássica!" }
        ],
        featured: true,
        trending: true,
        promo: true
    }
];

// --- BANNER E CONFIGURAÇÃO VISUAL INICIAL ---
const DEFAULT_BANNERS = [
    {
        id: "banner-1",
        title: "LANÇAMENTO: NOVAS SELEÇÕES 2026",
        subtitle: "Garanta a Amarelinha Oficial e o Manto de três estrelas Argentino com Frete Grátis acima de R$ 299!",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop", // Link estético caso use background, ou geramos degrade em CSS
        bgColor: "linear-gradient(135deg, #1e2530 0%, #0a0c10 100%)",
        btnText: "Ver Lançamentos",
        link: "#selecoes",
        active: true
    },
    {
        id: "banner-2",
        title: "RETRO LEGENDS COLLECTION",
        subtitle: "Vista a glória do futebol clássico com reedições icônicas dos anos 90 e 2000. Descontos de até 20%!",
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop",
        bgColor: "linear-gradient(135deg, #0c2240 0%, #a50044 100%)",
        btnText: "Comprar Retrô",
        link: "#retro",
        active: true
    }
];

const DEFAULT_POPUPS = {
    active: true,
    title: "🔥 BEM-VINDO AO FUTCOMMERCE!",
    message: "Cadastre seu e-mail e ganhe 10% DE DESCONTO na sua primeira compra com o cupom abaixo!",
    couponCode: "FUT10",
    discount: 10,
    btnText: "Copiar Cupom e Explorar",
    placeholder: "Digite seu melhor e-mail..."
};

// --- ESTRUTURA DE CATEGORIAS E TIMES ---
const DEFAULT_CATEGORIES = [
    { name: "Futebol Nacional", subcategories: ["Flamengo", "Corinthians", "São Paulo", "Palmeiras"] },
    { name: "Futebol Europeu", subcategories: ["Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Milan"] },
    { name: "Seleções", subcategories: ["Brasil", "Argentina", "França", "Alemanha"] },
    { name: "Retrô", subcategories: ["Milan", "Boca Juniors", "Manchester United", "Flamengo"] },
    { name: "Especial Blackout", subcategories: ["Corinthians", "Flamengo"] }
];

const DEFAULT_COLLECTIONS = [
    "Temporada 2026",
    "Edição Limitada",
    "Camisas Retrô",
    "Champions League"
];

const DEFAULT_BRANDS = [
    { name: "Nike", icon: "fa-solid fa-bolt" },
    { name: "Adidas", icon: "fa-solid fa-circle-nodes" },
    { name: "Puma", icon: "fa-solid fa-cat" },
    { name: "Retrô", icon: "fa-solid fa-clock-rotate-left" }
];

// --- USUÁRIOS E DADOS PADRÃO ---
const DEFAULT_USERS = {
    admin: { email: "admin@futcommerce.com.br", password: "admin", name: "Administrador Geral" },
    client: { 
        email: "torcedor@gmail.com", 
        password: "123", 
        name: "Artur Vidal Silva",
        addresses: [
            { id: "addr-1", type: "Casa", street: "Av. Atlântica", number: "1540", complement: "Apto 302", neighborhood: "Copacabana", city: "Rio de Janeiro", state: "RJ", cep: "22021-001", default: true }
        ],
        favorites: ["prod-1", "prod-3"]
    }
};

// --- CONFIGURAÇÃO E INICIALIZAÇÃO DO SUPABASE ---
let supabase = null;
let useSupabase = false;

if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.URL && window.SUPABASE_CONFIG.ANON_KEY) {
    try {
        supabase = window.supabase.createClient(window.SUPABASE_CONFIG.URL, window.SUPABASE_CONFIG.ANON_KEY);
        useSupabase = true;
        console.log("FutCommerce: Conectado ao Supabase com sucesso.");
    } catch (e) {
        console.error("Erro ao inicializar Supabase: ", e);
    }
} else {
    console.log("FutCommerce: Utilizando LocalStorage local (Modo de Desenvolvimento).");
}

// --- SEEDER DO BANCO DE DADOS SUPABASE SE ESTIVER VAZIO ---
async function seedDatabaseIfEmpty() {
    if (!useSupabase) return;
    try {
        // 1. Categorias
        const { data: cats, error: errCats } = await supabase.from('fc_categories').select('name');
        if (errCats) throw new Error("Erro ao buscar categorias: " + errCats.message);
        if (!cats || cats.length === 0) {
            console.log("Supabase: Semeando categorias...");
            const catsToInsert = DEFAULT_CATEGORIES.map(c => ({
                name: c.name,
                subcategories: c.subcategories || []
            }));
            const { error: insErr } = await supabase.from('fc_categories').insert(catsToInsert);
            if (insErr) throw new Error("Erro ao semear categorias: " + insErr.message);
        }

        // 2. Marcas
        const { data: brands, error: errBrands } = await supabase.from('fc_brands').select('name');
        if (errBrands) throw new Error("Erro ao buscar marcas: " + errBrands.message);
        if (!brands || brands.length === 0) {
            console.log("Supabase: Semeando marcas...");
            const brandsToInsert = DEFAULT_BRANDS.map(b => ({
                name: b.name,
                icon: b.icon || null,
                logo: null
            }));
            const { error: insErr } = await supabase.from('fc_brands').insert(brandsToInsert);
            if (insErr) throw new Error("Erro ao semear marcas: " + insErr.message);
        }

        // 3. Produtos
        const { data: prods, error: errProds } = await supabase.from('fc_products').select('id');
        if (errProds) throw new Error("Erro ao buscar produtos: " + errProds.message);
        if (!prods || prods.length === 0) {
            console.log("Supabase: Semeando produtos...");
            const prodsToInsert = DEFAULT_PRODUCTS.map(p => ({
                id: p.id,
                name: p.name,
                title: p.title || null,
                description: p.description || null,
                price: p.price,
                promoprice: p.promoPrice || null,
                brand: p.brand,
                category: p.category,
                gender: p.gender,
                type: p.type,
                collection: p.collection || null,
                image: p.image || (p.images && p.images[0]) || null,
                images: p.images || [],
                sizes: p.sizes || [],
                ratings: p.reviews || [],
                sku: p.sku || "",
                team: p.team || "",
                rating: p.rating || 5.0,
                reviewsCount: p.reviewsCount || 0
            }));
            const { error: insErr } = await supabase.from('fc_products').insert(prodsToInsert);
            if (insErr) throw new Error("Erro ao semear produtos: " + insErr.message);
        }

        // 4. Banners & Popups
        const { data: banners, error: errBanners } = await supabase.from('fc_banners').select('id');
        if (errBanners) throw new Error("Erro ao buscar banners: " + errBanners.message);
        if (!banners || banners.length === 0) {
            console.log("Supabase: Semeando banners...");
            const bannersToInsert = DEFAULT_BANNERS.map((b, idx) => ({
                id: idx + 1,
                image: b.image,
                title: b.title || null,
                subtitle: b.subtitle || null,
                bg_color: b.bgColor || null,
                btn_text: b.btnText || null,
                link: b.link || null,
                active: b.active !== false
            }));
            const { error: insErr } = await supabase.from('fc_banners').insert(bannersToInsert);
            if (insErr) throw new Error("Erro ao semear banners: " + insErr.message);
        }

        const { data: popups, error: errPopups } = await supabase.from('fc_popups').select('id');
        if (errPopups) throw new Error("Erro ao buscar popups: " + errPopups.message);
        if (!popups || popups.length === 0) {
            console.log("Supabase: Semeando popup...");
            const popupToInsert = {
                id: 1,
                active: DEFAULT_POPUPS.active,
                title: DEFAULT_POPUPS.title,
                message: DEFAULT_POPUPS.message,
                coupon_code: DEFAULT_POPUPS.couponCode,
                discount: DEFAULT_POPUPS.discount,
                btn_text: DEFAULT_POPUPS.btnText,
                placeholder: DEFAULT_POPUPS.placeholder
            };
            const { error: insErr } = await supabase.from('fc_popups').insert(popupToInsert);
            if (insErr) throw new Error("Erro ao semear popup: " + insErr.message);
        }
        console.log("Supabase: Verificação de seed concluída com sucesso!");
    } catch (e) {
        console.error("Erro inesperado ao semear dados:", e);
        alert("Erro de Banco (Supabase): " + e.message);
    }
}

// --- INICIALIZAÇÃO DO LOCALSTORAGE ---
function initDatabase() {
    // 1. Inicializar ou atualizar produtos
    if (!localStorage.getItem("fc_products")) {
        localStorage.setItem("fc_products", JSON.stringify(DEFAULT_PRODUCTS));
    } else {
        const existing = JSON.parse(localStorage.getItem("fc_products"));
        let updated = false;
        
        DEFAULT_PRODUCTS.forEach(p => {
            if (!existing.some(ex => ex.id === p.id)) {
                existing.push(p);
                updated = true;
            }
        });

        existing.forEach(p => {
            if (p.images) {
                p.images = p.images.map(img => {
                    if (img && img.startsWith("data:image/svg+xml;utf8,")) {
                        const rawSvg = img.replace("data:image/svg+xml;utf8,", "");
                        updated = true;
                        return `data:image/svg+xml,${encodeURIComponent(rawSvg)}`;
                    }
                    return img;
                });
            }

            if (!p.designerConfig) {
                const defP = DEFAULT_PRODUCTS.find(dp => dp.id === p.id);
                if (defP) {
                    p.designerConfig = defP.designerConfig;
                    updated = true;
                } else {
                    p.designerConfig = {
                        primaryColor: "#000000",
                        secondaryColor: "#ff0000",
                        accentColor: "#ffffff",
                        stripePattern: "none",
                        collarColor: "#ffffff",
                        crest: "flamengo",
                        brand: "adidas",
                        sponsorText: "PIXBET"
                    };
                    updated = true;
                }
            }
        });

        if (updated) {
            localStorage.setItem("fc_products", JSON.stringify(existing));
        }
    }

    // 2. Migrar imagens do carrinho (fc_cart)
    let cart = localStorage.getItem("fc_cart") ? JSON.parse(localStorage.getItem("fc_cart")) : null;
    if (cart) {
        let cartUpdated = false;
        cart.forEach(item => {
            if (item.image && item.image.startsWith("data:image/svg+xml;utf8,")) {
                const rawSvg = item.image.replace("data:image/svg+xml;utf8,", "");
                item.image = `data:image/svg+xml,${encodeURIComponent(rawSvg)}`;
                cartUpdated = true;
            }
        });
        if (cartUpdated) {
            localStorage.setItem("fc_cart", JSON.stringify(cart));
        }
    }

    // 3. Migrar imagens dos pedidos (fc_orders)
    let orders = localStorage.getItem("fc_orders") ? JSON.parse(localStorage.getItem("fc_orders")) : null;
    if (orders) {
        let ordersUpdated = false;
        orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (item.image && item.image.startsWith("data:image/svg+xml;utf8,")) {
                        const rawSvg = item.image.replace("data:image/svg+xml;utf8,", "");
                        item.image = `data:image/svg+xml,${encodeURIComponent(rawSvg)}`;
                        ordersUpdated = true;
                    }
                });
            }
        });
        if (ordersUpdated) {
            localStorage.setItem("fc_orders", JSON.stringify(orders));
        }
    }

    if (!localStorage.getItem("fc_coupons")) {
        localStorage.setItem("fc_coupons", JSON.stringify([]));
    }
    if (!localStorage.getItem("fc_banners")) {
        localStorage.setItem("fc_banners", JSON.stringify(DEFAULT_BANNERS));
    }
    if (!localStorage.getItem("fc_popups")) {
        localStorage.setItem("fc_popups", JSON.stringify(DEFAULT_POPUPS));
    }
    if (!localStorage.getItem("fc_categories")) {
        localStorage.setItem("fc_categories", JSON.stringify(DEFAULT_CATEGORIES));
    } else {
        const existingCats = JSON.parse(localStorage.getItem("fc_categories"));
        if (!existingCats.some(c => c.name === "Especial Blackout")) {
            existingCats.push({ name: "Especial Blackout", subcategories: ["Corinthians", "Flamengo"] });
            localStorage.setItem("fc_categories", JSON.stringify(existingCats));
        }
    }
    if (!localStorage.getItem("fc_brands")) {
        localStorage.setItem("fc_brands", JSON.stringify(DEFAULT_BRANDS));
    }
    if (!localStorage.getItem("fc_collections")) {
        localStorage.setItem("fc_collections", JSON.stringify(DEFAULT_COLLECTIONS));
    }
    if (!localStorage.getItem("fc_users")) {
        localStorage.setItem("fc_users", JSON.stringify(DEFAULT_USERS));
    } else {
        const users = JSON.parse(localStorage.getItem("fc_users"));
        if (!users.admin) {
            users.admin = DEFAULT_USERS.admin;
            localStorage.setItem("fc_users", JSON.stringify(users));
        }
    }
    if (!localStorage.getItem("fc_orders")) {
        localStorage.setItem("fc_orders", JSON.stringify([]));
    }
    if (!localStorage.getItem("fc_cart")) {
        localStorage.setItem("fc_cart", JSON.stringify([]));
    }
}

// Executar inicialização imediata e seed do Supabase
try {
    initDatabase();
    seedDatabaseIfEmpty();
} catch (err) {
    alert("Erro na inicialização do state.js: " + err.message + "\nStack: " + err.stack);
}

// --- OBJETO CENTRAL DE MÉTODOS DO SISTEMA ---
const FutDB = {
    // --- PRODUTOS ---
    getProducts: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_products').select('*').order('created_at', { ascending: true });
            if (error) { console.error("Erro getProducts:", error); return []; }
            return (data || []).map(p => ({
                ...p,
                sku: p.sku || "",
                team: p.team || "",
                price: p.price !== undefined && p.price !== null ? Number(p.price) : 0.0,
                promoPrice: p.promoprice !== undefined && p.promoprice !== null ? Number(p.promoprice) : null,
                rating: p.rating !== undefined && p.rating !== null ? Number(p.rating) : 5.0,
                reviewsCount: p.reviewsCount !== undefined && p.reviewsCount !== null ? Number(p.reviewsCount) : (p.ratings ? p.ratings.length : 0),
                images: p.images || [],
                sizes: p.sizes || [],
                reviews: p.ratings || []
            }));
        }
        return JSON.parse(localStorage.getItem("fc_products"));
    },
    saveProducts: async function(products) {
        if (useSupabase) {
            const prodsToUpsert = products.map(p => ({
                id: p.id,
                name: p.name,
                title: p.title || null,
                description: p.description || null,
                price: p.price,
                promoprice: p.promoPrice || null,
                brand: p.brand,
                category: p.category,
                gender: p.gender,
                type: p.type,
                collection: p.collection || null,
                image: p.image || (p.images && p.images[0]) || null,
                images: p.images || [],
                sizes: p.sizes || [],
                ratings: p.reviews || [],
                sku: p.sku || "",
                team: p.team || "",
                rating: p.rating || 5.0,
                reviewsCount: p.reviewsCount || 0
            }));
            const { error } = await supabase.from('fc_products').upsert(prodsToUpsert);
            if (error) console.error("Erro saveProducts:", error);
            window.dispatchEvent(new Event("fc_products_updated"));
            return;
        }
        localStorage.setItem("fc_products", JSON.stringify(products));
        window.dispatchEvent(new Event("fc_products_updated"));
    },
    getProductById: async function(id) {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_products').select('*').eq('id', id).single();
            if (error || !data) { console.error("Erro getProductById:", error); return null; }
            return {
                ...data,
                sku: data.sku || "",
                team: data.team || "",
                price: data.price !== undefined && data.price !== null ? Number(data.price) : 0.0,
                promoPrice: data.promoprice !== undefined && data.promoprice !== null ? Number(data.promoprice) : null,
                rating: data.rating !== undefined && data.rating !== null ? Number(data.rating) : 5.0,
                reviewsCount: data.reviewsCount !== undefined && data.reviewsCount !== null ? Number(data.reviewsCount) : (data.ratings ? data.ratings.length : 0),
                images: data.images || [],
                sizes: data.sizes || [],
                reviews: data.ratings || []
            };
        }
        const products = JSON.parse(localStorage.getItem("fc_products"));
        return products.find(p => p.id === id);
    },
    addProduct: async function(product) {
        product.id = "prod-" + Date.now();
        product.reviews = [];
        product.reviewsCount = 0;
        product.rating = 5.0;
        
        if (useSupabase) {
            const prodToInsert = {
                id: product.id,
                name: product.name,
                title: product.title || null,
                description: product.description || null,
                price: product.price,
                promoprice: product.promoPrice || null,
                brand: product.brand,
                category: product.category,
                gender: product.gender,
                type: product.type,
                collection: product.collection || null,
                image: product.image || (product.images && product.images[0]) || null,
                images: product.images || [],
                sizes: product.sizes || [],
                ratings: product.reviews || [],
                sku: product.sku || "",
                team: product.team || "",
                rating: product.rating || 5.0,
                reviewsCount: product.reviewsCount || 0
            };
            const { error } = await supabase.from('fc_products').insert(prodToInsert);
            if (error) {
                console.error("Erro addProduct:", error);
                throw new Error("Erro no Supabase ao adicionar produto: " + error.message);
            }
            window.dispatchEvent(new Event("fc_products_updated"));
            return product;
        }
        
        const products = JSON.parse(localStorage.getItem("fc_products"));
        products.push(product);
        localStorage.setItem("fc_products", JSON.stringify(products));
        window.dispatchEvent(new Event("fc_products_updated"));
        return product;
    },
    updateProduct: async function(updatedProd) {
        if (useSupabase) {
            const { data: existing } = await supabase.from('fc_products').select('ratings, sku, team, rating, reviewsCount').eq('id', updatedProd.id).single();
            const prodToUpsert = {
                id: updatedProd.id,
                name: updatedProd.name,
                title: updatedProd.title || null,
                description: updatedProd.description || null,
                price: updatedProd.price,
                promoprice: updatedProd.promoPrice || null,
                brand: updatedProd.brand,
                category: updatedProd.category,
                gender: updatedProd.gender,
                type: updatedProd.type,
                collection: updatedProd.collection || null,
                image: updatedProd.image || (updatedProd.images && updatedProd.images[0]) || null,
                images: updatedProd.images || [],
                sizes: updatedProd.sizes || [],
                ratings: updatedProd.reviews || (existing ? existing.ratings : []),
                sku: updatedProd.sku || (existing ? existing.sku : "") || "",
                team: updatedProd.team || (existing ? existing.team : "") || "",
                rating: updatedProd.rating || (existing ? existing.rating : 5.0) || 5.0,
                reviewsCount: updatedProd.reviewsCount || (existing ? existing.reviewsCount : 0) || 0
            };
            const { error } = await supabase.from('fc_products').upsert(prodToUpsert);
            if (error) {
                console.error("Erro updateProduct:", error);
                throw new Error("Erro no Supabase ao atualizar produto: " + error.message);
            }
            window.dispatchEvent(new Event("fc_products_updated"));
            return true;
        }
        
        const products = JSON.parse(localStorage.getItem("fc_products"));
        const idx = products.findIndex(p => p.id === updatedProd.id);
        if (idx !== -1) {
            if (!updatedProd.reviews) updatedProd.reviews = products[idx].reviews;
            if (!updatedProd.reviewsCount) updatedProd.reviewsCount = products[idx].reviewsCount;
            if (!updatedProd.rating) updatedProd.rating = products[idx].rating;
            products[idx] = updatedProd;
            localStorage.setItem("fc_products", JSON.stringify(products));
            window.dispatchEvent(new Event("fc_products_updated"));
            return true;
        }
        return false;
    },
    deleteProduct: async function(id) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_products').delete().eq('id', id);
            if (error) {
                console.error("Erro deleteProduct:", error);
                throw new Error("Erro no Supabase ao deletar produto: " + error.message);
            }
            window.dispatchEvent(new Event("fc_products_updated"));
            return;
        }
        const products = JSON.parse(localStorage.getItem("fc_products"));
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem("fc_products", JSON.stringify(filtered));
        window.dispatchEvent(new Event("fc_products_updated"));
    },

    // --- CARRINHO (Mantido no LocalStorage do Cliente como Sacola Local) ---
    getCart: function() {
        return JSON.parse(localStorage.getItem("fc_cart")) || [];
    },
    saveCart: function(cart) {
        localStorage.setItem("fc_cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("fc_cart_updated"));
    },
    addToCart: async function(productId, sizeName, quantity = 1) {
        const cart = this.getCart();
        const product = await this.getProductById(productId);
        if (!product) return false;

        const sizeObj = product.sizes.find(s => s.name === sizeName);
        if (!sizeObj || sizeObj.stock < quantity) return false;

        const cartItemIdx = cart.findIndex(item => item.productId === productId && item.size === sizeName);

        if (cartItemIdx !== -1) {
            if (cart[cartItemIdx].quantity + quantity <= sizeObj.stock) {
                cart[cartItemIdx].quantity += quantity;
            } else {
                return false;
            }
        } else {
            cart.push({
                id: "cart-" + Date.now() + Math.random().toString(36).substr(2, 5),
                productId: productId,
                name: product.name,
                image: product.image || product.images[0],
                price: sizeObj.price,
                size: sizeName,
                quantity: quantity
            });
        }
        this.saveCart(cart);
        return true;
    },
    updateCartItemQuantity: async function(cartItemId, newQty) {
        const cart = this.getCart();
        const item = cart.find(i => i.id === cartItemId);
        if (!item) return false;

        const product = await this.getProductById(item.productId);
        const sizeObj = product.sizes.find(s => s.name === item.size);

        if (newQty <= 0) {
            this.removeFromCart(cartItemId);
            return true;
        }

        if (sizeObj && sizeObj.stock >= newQty) {
            item.quantity = newQty;
            this.saveCart(cart);
            return true;
        }
        return false;
    },
    removeFromCart: function(cartItemId) {
        const cart = this.getCart();
        const filtered = cart.filter(i => i.id !== cartItemId);
        this.saveCart(filtered);
    },
    clearCart: function() {
        this.saveCart([]);
    },

    // --- PEDIDOS ---
    getOrders: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_orders').select('*').order('created_at', { ascending: false });
            if (error) { console.error("Erro getOrders:", error); return []; }
            return (data || []).map(o => ({
                id: o.id,
                date: o.created_at ? o.created_at.split('T')[0] : (o.date || new Date().toISOString().split('T')[0]),
                userEmail: o.user_email,
                items: o.items,
                total: o.total,
                discount: o.discount,
                finalTotal: o.final_total,
                address: o.address,
                paymentMethod: o.payment_method,
                status: o.status,
                trackingHistory: o.tracking_history
            }));
        }
        return JSON.parse(localStorage.getItem("fc_orders")) || [];
    },
    saveOrders: async function(orders) {
        if (useSupabase) {
            const mapped = orders.map(o => ({
                id: o.id,
                user_email: o.userEmail,
                items: o.items,
                total: o.total,
                discount: o.discount || 0,
                final_total: o.finalTotal || o.total,
                address: o.address,
                payment_method: o.paymentMethod,
                status: o.status,
                tracking_history: o.trackingHistory || []
            }));
            const { error } = await supabase.from('fc_orders').upsert(mapped);
            if (error) console.error("Erro saveOrders:", error);
            window.dispatchEvent(new Event("fc_orders_updated"));
            return;
        }
        localStorage.setItem("fc_orders", JSON.stringify(orders));
        window.dispatchEvent(new Event("fc_orders_updated"));
    },
    createOrder: async function(orderData) {
        const orderId = "PED-" + Math.floor(100000 + Math.random() * 900000);
        const orderDate = new Date().toISOString().split('T')[0];
        
        const newOrder = {
            id: orderId,
            date: orderDate,
            status: "Pendente",
            ...orderData
        };

        if (orderData.couponCode) {
            const coupons = await this.getCoupons();
            const cup = coupons.find(c => c.code.toUpperCase() === orderData.couponCode.toUpperCase() && c.active);
            if (cup) {
                const total = newOrder.total;
                if (cup.discountType === 'fixed') {
                    newOrder.total = Math.max(0, total - cup.discountValue);
                } else if (cup.discountType === 'percent') {
                    newOrder.total = total * (1 - cup.discountValue / 100);
                }
            } else if (orderData.couponCode.toUpperCase() === "FUT10") {
                newOrder.total = newOrder.total * 0.9;
            }
        }

        const products = await this.getProducts();
        newOrder.items.forEach(orderItem => {
            const prod = products.find(p => p.id === orderItem.productId);
            if (prod) {
                const sizeObj = prod.sizes.find(s => s.name === orderItem.size);
                if (sizeObj) {
                    sizeObj.stock -= orderItem.quantity;
                    if (sizeObj.stock < 0) sizeObj.stock = 0;
                }
            }
        });
        await this.saveProducts(products);

        if (useSupabase) {
            const { error } = await supabase.from('fc_orders').insert({
                id: newOrder.id,
                user_email: newOrder.userEmail,
                items: newOrder.items,
                total: orderData.total,
                discount: orderData.total - newOrder.total,
                final_total: newOrder.total,
                address: newOrder.address,
                payment_method: newOrder.paymentMethod,
                status: newOrder.status,
                tracking_history: newOrder.trackingHistory || []
            });
            if (error) {
                console.error("Erro createOrder:", error);
                alert("Erro ao salvar pedido no Banco de Dados (Supabase): " + error.message + "\n\nPor favor, execute o comando:\nALTER TABLE fc_orders DISABLE ROW LEVEL SECURITY;\nno painel SQL do seu console do Supabase para desativar a política de segurança de linha e permitir compras.");
                return null;
            }
            window.dispatchEvent(new Event("fc_orders_updated"));
            this.clearCart();
            return newOrder;
        }

        const orders = await this.getOrders();
        orders.unshift(newOrder);
        this.saveOrders(orders);
        this.clearCart();
        return newOrder;
    },
    updateOrderStatus: async function(orderId, newStatus) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_orders').update({ status: newStatus }).eq('id', orderId);
            if (error) { console.error("Erro updateOrderStatus:", error); return false; }
            window.dispatchEvent(new Event("fc_orders_updated"));
            return true;
        }
        const orders = await this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            await this.saveOrders(orders);
            return true;
        }
        return false;
    },

    // --- USUÁRIOS E AUTENTICAÇÃO ---
    getUsers: function() {
        return JSON.parse(localStorage.getItem("fc_users"));
    },
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem("fc_current_user"));
    },
    setCurrentUser: function(user) {
        localStorage.setItem("fc_current_user", JSON.stringify(user));
        window.dispatchEvent(new Event("fc_auth_changed"));
    },
    login: async function(email, password, isAdmin = false) {
        const normEmail = email.trim().toLowerCase();
        const normPassword = password.trim();
        
        if (isAdmin) {
            if (normEmail === "admin@futcommerce.com.br" && normPassword === "admin") {
                const adminSession = { email: "admin@futcommerce.com.br", name: "Administrador Geral", isAdmin: true };
                this.setCurrentUser(adminSession);
                return adminSession;
            }
            if (useSupabase) {
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email: normEmail, password: normPassword });
                    if (!error && data.user && data.user.email.toLowerCase() === "admin@futcommerce.com.br") {
                        const adminSession = { email: data.user.email, name: "Administrador Geral", isAdmin: true };
                        this.setCurrentUser(adminSession);
                        return adminSession;
                    }
                } catch (e) {}
            }
        } else {
            // Permitir login local com o usuário de testes mesmo usando Supabase
            if (normEmail === "torcedor@gmail.com" && normPassword === "123") {
                const clientSession = { 
                    email: "torcedor@gmail.com", 
                    name: "Artur Vidal Silva",
                    isAdmin: false,
                    addresses: [
                        { id: "addr-1", type: "Casa", street: "Av. Atlântica", number: "1540", complement: "Apto 302", neighborhood: "Copacabana", city: "Rio de Janeiro", state: "RJ", cep: "22021-001", default: true }
                    ],
                    favorites: ["prod-1", "prod-3"]
                };
                this.setCurrentUser(clientSession);
                return clientSession;
            }

            if (useSupabase) {
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email: normEmail, password: normPassword });
                    if (error) {
                        console.error("Erro login Supabase:", error.message);
                        return null;
                    }
                    if (data.user) {
                        const clientSession = {
                            email: data.user.email,
                            name: data.user.user_metadata.name || data.user.email.split('@')[0],
                            isAdmin: false,
                            addresses: data.user.user_metadata.addresses || [],
                            favorites: data.user.user_metadata.favorites || []
                        };
                        this.setCurrentUser(clientSession);
                        return clientSession;
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                const users = this.getUsers();
                if (users.client.email.toLowerCase() === normEmail && users.client.password === normPassword) {
                    const clientSession = { email, ...users.client, isAdmin: false };
                    this.setCurrentUser(clientSession);
                    return clientSession;
                }
            }
        }
        return null;
    },
    registerClient: async function(email, password, name) {
        if (useSupabase) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        addresses: [],
                        favorites: []
                    }
                }
            });
            if (error) {
                console.error("Erro register Supabase:", error);
                return { success: false, message: error.message };
            }
            return { success: true, user: data.user };
        } else {
            const users = this.getUsers();
            users.client = {
                email,
                password,
                name,
                addresses: [],
                favorites: []
            };
            localStorage.setItem("fc_users", JSON.stringify(users));
            return { success: true };
        }
    },
    logout: async function() {
        if (useSupabase) {
            try {
                await supabase.auth.signOut();
            } catch(e) {}
        }
        localStorage.removeItem("fc_current_user");
        window.dispatchEvent(new Event("fc_auth_changed"));
    },
    updateClientProfile: async function(updatedClient) {
        if (useSupabase) {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name: updatedClient.name,
                    addresses: updatedClient.addresses,
                    favorites: updatedClient.favorites
                }
            });
            if (error) console.error("Erro updateClientProfile Supabase:", error);
            
            const curUser = this.getCurrentUser();
            if (curUser && !curUser.isAdmin) {
                this.setCurrentUser({ ...curUser, ...updatedClient });
            }
            return;
        }
        const users = this.getUsers();
        users.client = { ...users.client, ...updatedClient };
        localStorage.setItem("fc_users", JSON.stringify(users));

        const curUser = this.getCurrentUser();
        if (curUser && !curUser.isAdmin) {
            this.setCurrentUser({ ...curUser, ...updatedClient });
        }
    },

    // --- MARKETING (BANNERS & POPUPS) ---
    getBanners: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_banners').select('*').order('id', { ascending: true });
            if (error) { console.error("Erro getBanners:", error); return []; }
            return data.map(b => ({
                id: b.id,
                title: b.title,
                subtitle: b.subtitle,
                image: b.image,
                bgColor: b.bg_color || b.bgColor,
                btnText: b.btn_text || b.btnText,
                link: b.link,
                active: b.active
            }));
        }
        return JSON.parse(localStorage.getItem("fc_banners"));
    },
    saveBanners: async function(banners) {
        if (useSupabase) {
            const mapped = banners.map(b => ({
                id: b.id,
                title: b.title,
                subtitle: b.subtitle,
                image: b.image,
                bg_color: b.bgColor,
                btn_text: b.btnText,
                link: b.link,
                active: b.active
            }));
            const { error } = await supabase.from('fc_banners').upsert(mapped);
            if (error) console.error("Erro saveBanners:", error);
            window.dispatchEvent(new Event("fc_banners_updated"));
            return;
        }
        localStorage.setItem("fc_banners", JSON.stringify(banners));
        window.dispatchEvent(new Event("fc_banners_updated"));
    },
    getPopups: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_popups').select('*').eq('id', 1).maybeSingle();
            if (error) { console.error("Erro getPopups:", error); return null; }
            if (data) {
                return {
                    active: data.active,
                    title: data.title,
                    message: data.message,
                    couponCode: data.coupon_code || data.couponCode,
                    discount: data.discount,
                    btnText: data.btn_text || data.btnText,
                    placeholder: data.placeholder
                };
            }
            return DEFAULT_POPUPS;
        }
        return JSON.parse(localStorage.getItem("fc_popups"));
    },
    savePopups: async function(popup) {
        if (useSupabase) {
            const mapped = {
                id: 1,
                active: popup.active,
                title: popup.title,
                message: popup.message,
                coupon_code: popup.couponCode,
                discount: popup.discount,
                btn_text: popup.btnText,
                placeholder: popup.placeholder
            };
            const { error } = await supabase.from('fc_popups').upsert(mapped);
            if (error) console.error("Erro savePopups:", error);
            window.dispatchEvent(new Event("fc_popups_updated"));
            return;
        }
        localStorage.setItem("fc_popups", JSON.stringify(popup));
        window.dispatchEvent(new Event("fc_popups_updated"));
    },

    // --- TAXONOMIAS (CATEGORIAS) ---
    getCategories: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_categories').select('*').order('name', { ascending: true });
            if (error) { console.error("Erro getCategories:", error); return []; }
            return data;
        }
        return JSON.parse(localStorage.getItem("fc_categories"));
    },
    saveCategories: async function(categories) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_categories').upsert(categories);
            if (error) console.error("Erro saveCategories:", error);
            window.dispatchEvent(new Event("fc_categories_updated"));
            return;
        }
        localStorage.setItem("fc_categories", JSON.stringify(categories));
        window.dispatchEvent(new Event("fc_categories_updated"));
    },
    addCategory: async function(category) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_categories').insert(category);
            if (error) {
                console.error("Erro addCategory:", error);
                throw new Error("Erro no Supabase ao adicionar categoria: " + error.message);
            }
            window.dispatchEvent(new Event("fc_categories_updated"));
            return true;
        }
        const categories = await this.getCategories();
        if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
            return false;
        }
        categories.push(category);
        await this.saveCategories(categories);
        return true;
    },
    updateCategory: async function(oldName, updatedCategory) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_categories').update(updatedCategory).eq('name', oldName);
            if (error) {
                console.error("Erro updateCategory:", error);
                throw new Error("Erro no Supabase ao atualizar categoria: " + error.message);
            }
            window.dispatchEvent(new Event("fc_categories_updated"));
            return true;
        }
        const categories = await this.getCategories();
        const idx = categories.findIndex(c => c.name.toLowerCase() === oldName.toLowerCase());
        if (idx !== -1) {
            categories[idx] = updatedCategory;
            await this.saveCategories(categories);
            if (oldName.toLowerCase() !== updatedCategory.name.toLowerCase()) {
                const products = await this.getProducts();
                products.forEach(p => {
                    if (p.category === oldName) {
                        p.category = updatedCategory.name;
                    }
                });
                await this.saveProducts(products);
            }
            return true;
        }
        return false;
    },
    deleteCategory: async function(name) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_categories').delete().eq('name', name);
            if (error) console.error("Erro deleteCategory:", error);
            window.dispatchEvent(new Event("fc_categories_updated"));
            return true;
        }
        const categories = await this.getCategories();
        const filtered = categories.filter(c => c.name.toLowerCase() !== name.toLowerCase());
        await this.saveCategories(filtered);
        const products = await this.getProducts();
        products.forEach(p => {
            if (p.category === name) {
                p.category = "";
            }
        });
        await this.saveProducts(products);
        return true;
    },
    associateProductsWithCategory: async function(categoryName, productIds) {
        if (useSupabase) {
            const { data: prods } = await supabase.from('fc_products').select('id, category');
            if (prods) {
                for (const p of prods) {
                    let newCat = p.category;
                    if (productIds.includes(p.id)) {
                        newCat = categoryName;
                    } else if (p.category === categoryName) {
                        newCat = "";
                    }
                    if (newCat !== p.category) {
                        await supabase.from('fc_products').update({ category: newCat }).eq('id', p.id);
                    }
                }
            }
            window.dispatchEvent(new Event("fc_products_updated"));
            return;
        }
        const products = await this.getProducts();
        products.forEach(p => {
            if (productIds.includes(p.id)) {
                p.category = categoryName;
            } else if (p.category === categoryName) {
                p.category = "";
            }
        });
        await this.saveProducts(products);
    },
    getCollections: function() {
        return JSON.parse(localStorage.getItem("fc_collections")) || DEFAULT_COLLECTIONS;
    },
    saveCollections: function(collections) {
        localStorage.setItem("fc_collections", JSON.stringify(collections));
    },

    // --- MARCAS ---
    getBrands: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_brands').select('*').order('name', { ascending: true });
            if (error) { console.error("Erro getBrands:", error); return []; }
            return data;
        }
        return JSON.parse(localStorage.getItem("fc_brands")) || [];
    },
    saveBrands: async function(brands) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_brands').upsert(brands);
            if (error) console.error("Erro saveBrands:", error);
            window.dispatchEvent(new Event("fc_brands_updated"));
            return;
        }
        localStorage.setItem("fc_brands", JSON.stringify(brands));
        window.dispatchEvent(new Event("fc_brands_updated"));
    },
    addBrand: async function(brand) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_brands').insert(brand);
            if (error) {
                console.error("Erro addBrand:", error);
                throw new Error("Erro no Supabase ao adicionar marca: " + error.message);
            }
            window.dispatchEvent(new Event("fc_brands_updated"));
            return true;
        }
        const brands = await this.getBrands();
        if (brands.some(b => b.name.toLowerCase() === brand.name.toLowerCase())) {
            return false;
        }
        brands.push(brand);
        await this.saveBrands(brands);
        return true;
    },
    updateBrand: async function(oldName, updatedBrand) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_brands').update(updatedBrand).eq('name', oldName);
            if (error) {
                console.error("Erro updateBrand:", error);
                throw new Error("Erro no Supabase ao atualizar marca: " + error.message);
            }
            window.dispatchEvent(new Event("fc_brands_updated"));
            return true;
        }
        const brands = await this.getBrands();
        const idx = brands.findIndex(b => b.name.toLowerCase() === oldName.toLowerCase());
        if (idx !== -1) {
            brands[idx] = updatedBrand;
            await this.saveBrands(brands);
            if (oldName.toLowerCase() !== updatedBrand.name.toLowerCase()) {
                const products = await this.getProducts();
                products.forEach(p => {
                    if (p.brand.toLowerCase() === oldName.toLowerCase()) {
                        p.brand = updatedBrand.name;
                    }
                });
                await this.saveProducts(products);
            }
            return true;
        }
        return false;
    },
    deleteBrand: async function(name) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_brands').delete().eq('name', name);
            if (error) console.error("Erro deleteBrand:", error);
            window.dispatchEvent(new Event("fc_brands_updated"));
            return true;
        }
        const brands = await this.getBrands();
        const filtered = brands.filter(b => b.name.toLowerCase() !== name.toLowerCase());
        await this.saveBrands(filtered);
        const products = await this.getProducts();
        products.forEach(p => {
            if (p.brand.toLowerCase() === name.toLowerCase()) {
                p.brand = "";
            }
        });
        await this.saveProducts(products);
        return true;
    },

    // --- CUPONS ---
    getCoupons: async function() {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_coupons').select('*').order('code', { ascending: true });
            if (error) { console.error("Erro getCoupons:", error); return []; }
            return (data || []).map(c => ({
                id: c.id,
                code: c.code,
                discountValue: c.value,
                discountType: c.type,
                active: c.status
            }));
        }
        return JSON.parse(localStorage.getItem("fc_coupons")) || [];
    },
    saveCoupons: async function(coupons) {
        if (useSupabase) {
            const mapped = coupons.map(c => ({
                id: c.id,
                code: c.code,
                value: c.discountValue,
                type: c.discountType,
                status: c.active
            }));
            const { error } = await supabase.from('fc_coupons').upsert(mapped);
            if (error) console.error("Erro saveCoupons:", error);
            window.dispatchEvent(new Event("fc_coupons_updated"));
            return;
        }
        localStorage.setItem("fc_coupons", JSON.stringify(coupons));
        window.dispatchEvent(new Event("fc_coupons_updated"));
    },
    getCouponById: async function(id) {
        if (useSupabase) {
            const { data, error } = await supabase.from('fc_coupons').select('*').eq('id', id).single();
            if (error) { console.error("Erro getCouponById:", error); return null; }
            return {
                id: data.id,
                code: data.code,
                discountValue: data.value,
                discountType: data.type,
                active: data.status
            };
        }
        const coupons = await this.getCoupons();
        return coupons.find(c => c.id === id);
    },
    addCoupon: async function(coupon) {
        coupon.id = "coup-" + Date.now();
        coupon.code = coupon.code.toUpperCase().trim();
        if (useSupabase) {
            const { error } = await supabase.from('fc_coupons').insert({
                id: coupon.id,
                code: coupon.code,
                value: coupon.discountValue,
                type: coupon.discountType,
                status: coupon.active
            });
            if (error) console.error("Erro addCoupon:", error);
            window.dispatchEvent(new Event("fc_coupons_updated"));
            return coupon;
        }
        const coupons = await this.getCoupons();
        coupons.push(coupon);
        await this.saveCoupons(coupons);
        return coupon;
    },
    updateCoupon: async function(updatedCoup) {
        updatedCoup.code = updatedCoup.code.toUpperCase().trim();
        if (useSupabase) {
            const { error } = await supabase.from('fc_coupons').upsert({
                id: updatedCoup.id,
                code: updatedCoup.code,
                value: updatedCoup.discountValue,
                type: updatedCoup.discountType,
                status: updatedCoup.active
            });
            if (error) { console.error("Erro updateCoupon:", error); return false; }
            window.dispatchEvent(new Event("fc_coupons_updated"));
            return true;
        }
        const coupons = await this.getCoupons();
        const idx = coupons.findIndex(c => c.id === updatedCoup.id);
        if (idx !== -1) {
            coupons[idx] = updatedCoup;
            await this.saveCoupons(coupons);
            return true;
        }
        return false;
    },
    deleteCoupon: async function(id) {
        if (useSupabase) {
            const { error } = await supabase.from('fc_coupons').delete().eq('id', id);
            if (error) console.error("Erro deleteCoupon:", error);
            window.dispatchEvent(new Event("fc_coupons_updated"));
            return;
        }
        const coupons = await this.getCoupons();
        const filtered = coupons.filter(c => c.id !== id);
        await this.saveCoupons(filtered);
    },

    // Como estamos no navegador, vamos gerar uma camisa personalizada mockada
    // se o administrador enviar um formulário com cores personalizadas
    generateCustomJersey: function(config) {
        return generateJerseySVG(config);
    }
};

// Exportar globalmente para que todas as páginas consigam acessar o mesmo banco
window.FutDB = FutDB;

// --- ESCUTA PARA ATUALIZAÇÃO CROSS-TAB E REALTIME SUPABASE ---
window.addEventListener("storage", (e) => {
    if (e.key === "fc_cart") {
        window.dispatchEvent(new Event("fc_cart_updated"));
    }
    if (!useSupabase) {
        if (e.key === "fc_products") window.dispatchEvent(new Event("fc_products_updated"));
        if (e.key === "fc_orders") window.dispatchEvent(new Event("fc_orders_updated"));
        if (e.key === "fc_banners") window.dispatchEvent(new Event("fc_banners_updated"));
        if (e.key === "fc_popups") window.dispatchEvent(new Event("fc_popups_updated"));
        if (e.key === "fc_brands") window.dispatchEvent(new Event("fc_brands_updated"));
        if (e.key === "fc_categories") window.dispatchEvent(new Event("fc_categories_updated"));
    }
});

// Canal Realtime para sincronizar abas no Supabase
if (useSupabase) {
    try {
        supabase.channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fc_products' }, () => {
                window.dispatchEvent(new Event("fc_products_updated"));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fc_orders' }, () => {
                window.dispatchEvent(new Event("fc_orders_updated"));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fc_banners' }, () => {
                window.dispatchEvent(new Event("fc_banners_updated"));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fc_popups' }, () => {
                window.dispatchEvent(new Event("fc_popups_updated"));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fc_brands' }, () => {
                window.dispatchEvent(new Event("fc_brands_updated"));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fc_categories' }, () => {
                window.dispatchEvent(new Event("fc_categories_updated"));
            })
            .subscribe();
    } catch (e) {
        console.error("Erro ao registrar Realtime Subscriptions:", e);
    }
}

})();

