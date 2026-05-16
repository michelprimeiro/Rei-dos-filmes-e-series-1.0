// ================= CORE DE SELEÇÃO DO DOM =================
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const mainContent = document.getElementById('mainContent');
const logoutBtn = document.getElementById('logoutBtn');
const userWelcome = document.getElementById('userWelcome');

const authModal = document.getElementById('authModal');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const videoPlayerModal = document.getElementById('videoPlayerModal');
const megaIframe = document.getElementById('megaIframe');
const seriesManager = document.getElementById('seriesManager');
const seasonTabsContainer = document.getElementById('seasonTabs');
const episodesGridContainer = document.getElementById('episodesGrid');
const playerBtnDub = document.getElementById('playerBtnDub');
const playerBtnLeg = document.getElementById('playerBtnLeg');

const historicoSection = document.getElementById('historicoSection');
const historicoGrid = document.getElementById('historicoGrid');

// ================= BASES DE DADOS UNIFICADAS =================
const seriesDatabase = {
    "76479": {
        name: "The Boys",
        image: "https://media.themoviedb.org/t/p/w58_and_h87_face/in1R2dDc421JxsoRWaIIAqVI2KE.jpg",
        seasons: { "1": 8, "2": 8, "3": 8, "4": 8 }
    },
    "62715": {
        name: "Dragon Ball Super",
        image: "https://media.themoviedb.org/t/p/w94_and_h141_face/cQDCIp92rTzTnd8mjb1syLhrAqy.jpg",
        seasons: { "1": 14, "2": 12 }
    },
    "95479": {
        name: "Jujutsu Kaisen",
        image: "https://media.themoviedb.org/t/p/w220_and_h330_face/8R1mMSC1gX1cg5ed7ns49JOEqw3.jpg",
        seasons: { "0": 10, "1": 59 }
    },
    "94664": {
        name: "Mushoku Tensei",
        image: "https://media.themoviedb.org/t/p/w130_and_h195_face/4vEel9ztoC3PtQFOktl...jpg",
        seasons: { "0": 3, "1": 23, "2": 24 }
    },
    "235930": {
        name: "Devil May Cry (2025)",
        image: "https://media.themoviedb.org/t/p/w220_and_h330_face/75KximV3WhtvlWFneTrf1Pw61cu.jpg",
        seasons: { "1": 8, "2": 8 }
    },
    "95557": {
        name: "INVENCÍVEL",
        image: "https://media.themoviedb.org/t/p/w220_and_h330_face/qhb7RWU9ad9a5m3HbeRRXzjaMXf.jpg",
        seasons: { "1": 8, "2": 8, "3": 8, "4": 8 }
    },
    "62829": {
        name: "Bonnie e Clyde",
        image: "https://media.themoviedb.org/t/p/w300_and_h450_face/tOLZpg3fxxdbkkMZWT3WfOM5d4k.jpg",
        seasons: { "1": 2 }
    }
}; // <-- Este fecha a constante seriesDatabase que abre lá em cima!

const moviesDatabase = {
    "299534": { name: "Vingadores: Ultimato", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400" },
    "634649": { name: "Homem-Aranha: Sem Volta...", image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400" },
    "1290821": { name: "Missão Refúgio (2026)", image: "https://image.tmdb.org/t/p/w500/z6D95XpE1bQ9wFpEAdwE1eIeB7j.jpg" },
    "1226863": { name: "Super Mario Galaxy: O Filme", image: "https://image.tmdb.org/t/p/w500/vGskXy4wN3b26bNcoUWhpcoq3wW.jpg" }
};

// Estados globais da sessão
let currentUser = null; 
let activeId = "";
let activeSeason = null;
let activeEpisode = null;
let activeType = "dub";

// Lifecycle de entrada do app
window.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('active_session');
    if (session) loginSuccess(session);
});

// ================= SISTEMA DE CONTROLE DE ACESSO =================
function switchAuthTab(tab) {
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.remove('form-hidden');
        registerForm.classList.add('form-hidden');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.remove('form-hidden');
        loginForm.classList.add('form-hidden');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    if (!user || !pass) return;

    let users = JSON.parse(localStorage.getItem('registered_users')) || {};
    if (users[user]) {
        alert("Erro: Este usuário já existe!");
        return;
    }

    users[user] = { password: pass };
    localStorage.setItem('registered_users', JSON.stringify(users));
    alert("Conta criada com sucesso! Podes fazer o teu login.");
    document.getElementById('registerForm').reset();
    switchAuthTab('login');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    let users = JSON.parse(localStorage.getItem('registered_users')) || {};
    if (users[user] && users[user].password === pass) {
        localStorage.setItem('active_session', user);
        loginSuccess(user);
        document.getElementById('loginForm').reset();
    } else {
        alert("Credenciais incorretas. Tenta novamente!");
    }
}

function enterAsGuest() {
    localStorage.setItem('active_session', 'Convidado');
    loginSuccess('Convidado');
}

function loginSuccess(username) {
    currentUser = username;
    authModal.classList.remove('modal-active');
    mainContent.classList.remove('content-hidden');
    userWelcome.innerText = `Olá, ${username}!`;
    logoutBtn.style.display = 'block';
    renderHistory();
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('active_session');
    currentUser = null;
    mainContent.classList.add('content-hidden');
    logoutBtn.style.display = 'none';
    userWelcome.innerText = '';
    authModal.classList.add('modal-active');
});

// ================= ENGINE DO REPRODUTOR MULTIMÉDIA =================
function openPlayer(id, season = null, episode = null, type = "dub") {
    activeId = id;
    activeType = type;

    if (season && episode) {
        activeSeason = parseInt(season);
        activeEpisode = parseInt(episode);
        seriesManager.style.display = "flex";
        renderSeasonTabs();
        renderEpisodesGrid();
    } else {
        activeSeason = null;
        activeEpisode = null;
        seriesManager.style.display = "none";
    }

    loadVideoUrl();
    saveToHistory(); 
    videoPlayerModal.classList.add('modal-active');
}

function loadVideoUrl() {
    let url = "";
    if (activeSeason && activeEpisode) {
        url = activeType === "dub" 
            ? `https://megaembed.com/embed/${activeId}-${activeSeason}-${activeEpisode}`
            : `https://megaembed.com/embed/${activeId}/${activeSeason}/${activeEpisode}`;
    } else {
        url = `https://megaembed.com/embed/${activeId}`;
    }
    megaIframe.src = url;
}

function renderSeasonTabs() {
    seasonTabsContainer.innerHTML = "";
    const seriesInfo = seriesDatabase[activeId];
    if (!seriesInfo) return;

    Object.keys(seriesInfo.seasons).forEach(seasonNum => {
        const btn = document.createElement("button");
        btn.classList.add("season-btn");
        if (parseInt(seasonNum) === activeSeason) btn.classList.add("active");
        btn.innerText = `Temp. ${seasonNum}`;
        btn.onclick = () => selectSeason(parseInt(seasonNum));
        seasonTabsContainer.appendChild(btn);
    });
}

function renderEpisodesGrid() {
    episodesGridContainer.innerHTML = "";
    const seriesInfo = seriesDatabase[activeId];
    if (!seriesInfo) return;

    const totalEpisodes = seriesInfo.seasons[activeSeason] || 8;
    for (let i = 1; i <= totalEpisodes; i++) {
        const btn = document.createElement("button");
        btn.classList.add("ep-btn");
        if (i === activeEpisode) btn.classList.add("active");
        btn.innerText = `Ep. ${i}`;
        btn.onclick = () => selectEpisode(i);
        episodesGridContainer.appendChild(btn);
    }
}

function selectSeason(seasonNum) {
    activeSeason = seasonNum;
    activeEpisode = 1;
    renderSeasonTabs();
    renderEpisodesGrid();
    loadVideoUrl();
    saveToHistory();
}

function selectEpisode(episodeNum) {
    activeEpisode = episodeNum;
    renderEpisodesGrid();
    loadVideoUrl();
    saveToHistory();
}

function switchPlayerType(type) {
    activeType = type;
    if (type === 'dub') {
        playerBtnDub.classList.add('active');
        playerBtnLeg.classList.remove('active');
    } else {
        playerBtnLeg.classList.add('active');
        playerBtnDub.classList.remove('active');
    }
    loadVideoUrl();
}

function closePlayer() {
    videoPlayerModal.classList.remove('modal-active');
    megaIframe.src = "";
    renderHistory(); 
}

videoPlayerModal.addEventListener('click', (e) => {
    if (e.target === videoPlayerModal) closePlayer();
});

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
});
menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));

// ================= GESTÃO ISOLADA DE HISTÓRICO =================
function saveToHistory() {
    if (!currentUser) return;
    const historyKey = `streaming_history_${currentUser}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    history = history.filter(item => item.id !== activeId);

    history.unshift({
        id: activeId,
        season: activeSeason,
        episode: activeEpisode,
        type: activeType,
        timestamp: Date.now()
    });

    if (history.length > 4) history.pop();
    localStorage.setItem(historyKey, JSON.stringify(history));
}

function renderHistory() {
    if (!currentUser) return;
    const historyKey = `streaming_history_${currentUser}`;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];
    historicoGrid.innerHTML = "";

    if (history.length === 0) {
        historicoSection.style.display = "none";
        return;
    }

    historicoSection.style.display = "block";
    history.forEach(item => {
        const info = seriesDatabase[item.id] || moviesDatabase[item.id];
        if (!info) return;

        const card = document.createElement('div');
        card.classList.add('card');
        
        const clickAction = item.season 
            ? `openPlayer('${item.id}', '${item.season}', '${item.episode}', '${item.type}')`
            : `openPlayer('${item.id}', null, null, '${item.type}')`;
            
        card.setAttribute('onclick', clickAction);

        const badgeHTML = item.season 
            ? `<div class="card-history-badge">T${item.season}:E${item.episode}</div>` 
            : `<div class="card-history-badge">Filme</div>`;

        card.innerHTML = `
            ${badgeHTML}
            <img src="${info.image}" alt="${info.name}">
            <div class="card-info">
                <h3>${info.name}</h3>
                <span class="badge dub">${item.type.toUpperCase()}</span>
            </div>
        `;
        historicoGrid.appendChild(card);
    });
}

function clearHistory() {
    if (!currentUser) return;
    localStorage.removeItem(`streaming_history_${currentUser}`);
    renderHistory();
}
// ============================================================================
// COLA ISTO NO FINAL DO TEU SCRIPT.JS - SISTEMA DE PESQUISA, CATEGORIAS E IDIOMAS
// ============================================================================

// Filtros Globais Ativos
let activeCategoryFilter = "all";
let activeLanguageFilter = "all";

// 1. ENGINE DA LUPA DE PESQUISA EM TEMPO REAL
function handleSearch() {
    const searchQuery = document.getElementById('searchBar').value.toLowerCase().trim();
    const cards = document.querySelectorAll('#catalogGrid .card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const category = card.getAttribute('data-category') || '';
        const lang = card.getAttribute('data-lang') || '';

        // Valida se o card atende à pesquisa por texto
        const matchesSearch = title.includes(searchQuery);
        
        // Valida se o card atende à categoria ativa do menu
        const matchesCategory = (activeCategoryFilter === "all" || category === activeCategoryFilter);
        
        // Valida se o card atende ao idioma selecionado
        const matchesLanguage = (activeLanguageFilter === "all" || lang === activeLanguageFilter || lang === "both");

        // Só mostra se passar em todas as regras ao mesmo tempo
        if (matchesSearch && matchesCategory && matchesLanguage) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// 2. FILTRAR POR CATEGORIA (CLIQUE NO MENU: FILMES, SÉRIES, ANIMES/DESENHOS)
function filterCategory(category) {
    activeCategoryFilter = category;
    
    const banner = document.getElementById('homeBanner');
    const catalogTitle = document.getElementById('catalogTitle');

    // Atualiza os títulos da página e esconde o banner gigante se não for a Home ('all')
    if (category === 'all') {
        if(banner) banner.style.display = "flex";
        if(catalogTitle) catalogTitle.innerText = "Todos os Títulos";
    } else {
        if(banner) banner.style.display = "none";
        if(catalogTitle) {
            if(category === 'filme') catalogTitle.innerText = "Filmes Disponíveis";
            if(category === 'serie') catalogTitle.innerText = "Séries Disponíveis";
            if(category === 'anime') catalogTitle.innerText = "Animes e Desenhos Disponíveis";
        }
    }

    // Fecha o menu responsivo no celular após clicar
    const navMenuElement = document.getElementById('navMenu');
    if (navMenuElement) navMenuElement.classList.remove('active');

    // Executa a filtragem combinada
    handleSearch();
}

// 3. FILTRAR POR AUDIO (DUBLADO OU LEGENDADO)
function filterLanguage(lang) {
    activeLanguageFilter = lang;

    // Gerencia as classes ativas dos botões visuais de idioma
    document.getElementById('filterAllLang').classList.remove('active');
    document.getElementById('filterDub').classList.remove('active');
    document.getElementById('filterLeg').classList.remove('active');

    if (lang === 'all') document.getElementById('filterAllLang').classList.add('active');
    if (lang === 'dub') document.getElementById('filterDub').classList.add('active');
    if (lang === 'leg') document.getElementById('filterLeg').classList.add('active');

    // Executa a filtragem combinada
    handleSearch();
}