// ── CONFIG ───────────────────────────────────────────────
const API = 'https://backendexpressapp-441019053171.us-west1.run.app';
const ADK = 'http://localhost:8000';
const APP = 'my_agent';
const UID = 'dashboard_user';

// ── CLOCK ────────────────────────────────────────────────
const clockStart = Date.now();

function updateClock() {
    const elapsed = Math.floor((Date.now() - clockStart) / 1000);
    const h  = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m  = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s  = String(elapsed % 60).padStart(2, '0');
    document.getElementById('opsClock').textContent = `T+ ${h}:${m}:${s} UTC`;
}

// ── ISS ──────────────────────────────────────────────────
async function loadISS() {
    try {
        const res  = await fetch(`${API}/iss-location`);
        const data = await res.json();

        const lat = (+data.latitude).toFixed(1);
        const lon = (+data.longitude).toFixed(1);
        const alt = (+data.altitude).toFixed(0);
        const vel = Math.round(+data.velocity).toLocaleString();

        document.getElementById('cardLat').textContent    = `${lat}°`;
        document.getElementById('cardIssSub').textContent = `${lon}° lon · ${alt} km · Tracking Live`;
        document.getElementById('statAlt').textContent    = alt;

        addTick('iss', `ISS · ${lat}° N, ${lon}° · ${alt} km · ${vel} km/h`, 'g');
    } catch {
        document.getElementById('cardIssSub').textContent = 'ISS data unavailable — is the backend running?';
    }
}

// ── LAUNCHES ─────────────────────────────────────────────
async function loadLaunches() {
    try {
        const res  = await fetch(`${API}/launches`);
        const data = await res.json();
        const list = data.results || data || [];

        document.getElementById('cardLaunchCnt').textContent = list.length;
        document.getElementById('statMissions').textContent  = list.length;

        if (list[0]) {
            const net  = new Date(list[0].net || list[0].window_start);
            const diff = net - Date.now();
            const days = Math.floor(diff / 86400000);
            const hrs  = Math.floor((diff % 86400000) / 3600000);
            const name = (list[0].name || '').split('|')[0].trim();
            document.getElementById('cardLaunchSub').textContent = `Next: ${name} in ${days}d ${hrs}h`;
            addTick('launch0', `${name} · T-${days}d ${hrs}h to NET`, 'y');
        }

        list.slice(1, 4).forEach((launch, i) => {
            const net  = new Date(launch.net || launch.window_start);
            const diff = net - Date.now();
            const days = Math.floor(diff / 86400000);
            const hrs  = Math.floor((diff % 86400000) / 3600000);
            const name = (launch.name || '').split('|')[0].trim();
            addTick(`launch${i + 1}`, `${name} · T-${days}d ${hrs}h`, '');
        });

        renderLaunchTable(list);
    } catch {
        document.getElementById('cardLaunchSub').textContent = 'Launch data unavailable';
        document.getElementById('launchBody').innerHTML =
            '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem">Backend offline — run the Express server</td></tr>';
    }
}

function renderLaunchTable(list) {
    if (!list.length) return;

    document.getElementById('launchBody').innerHTML = list.slice(0, 8).map(l => {
        const net    = l.net || l.window_start;
        const date   = net
            ? new Date(net).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : '—';
        const status = l.status?.abbrev || l.status?.name || 'TBD';
        const cls    = status === 'Go' ? 'go' : status === 'Hold' ? 'hold' : 'tbd';
        const rocket = l.rocket?.configuration?.name || '—';
        const pad    = l.pad?.location?.name || l.pad?.name || '—';

        return `<tr>
            <td class="mission-name">${l.name || '—'}</td>
            <td>${rocket}</td>
            <td class="mono-date">${date}</td>
            <td>${pad}</td>
            <td><span class="pill ${cls}">${status}</span></td>
        </tr>`;
    }).join('');
}

// ── NEWS ─────────────────────────────────────────────────
async function loadNews() {
    try {
        const res  = await fetch(`${API}/space-news`);
        const data = await res.json();
        const list = data.results || data || [];

        document.getElementById('cardNewsCnt').textContent = list.length;
        document.getElementById('statNews').textContent    = list.length;

        list.slice(0, 4).forEach((article, i) =>
            addTick(`news${i}`, (article.title || '').slice(0, 70), 'p')
        );

        renderNewsGrid(list);
    } catch {
        document.getElementById('newsGrid').innerHTML = '<p style="color:var(--text-muted)">News unavailable</p>';
    }
}

function renderNewsGrid(list) {
    document.getElementById('newsGrid').innerHTML = list.slice(0, 6).map(a => {
        const summary = (a.summary || '').slice(0, 110);
        const more    = (a.summary || '').length > 110 ? '...' : '';
        return `<div class="news-card" onclick="window.open('${a.url || '#'}', '_blank')">
            <div class="news-source">${a.news_site || a.newsSite || 'NEWS'}</div>
            <div class="news-title">${a.title || ''}</div>
            <div class="news-summary">${summary}${more}</div>
        </div>`;
    }).join('');
}

// ── SPACEX ───────────────────────────────────────────────
async function loadSpaceX() {
    try {
        const res  = await fetch(`${API}/spacex-launches`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.docs || [];

        document.getElementById('cardSpacexCnt').textContent = list.length;
        document.getElementById('statSpacex').textContent    = list.length;

        if (list[0]) {
            const name = list[0].name || list[0].mission_name || 'TBD';
            document.getElementById('cardSpacexSub').textContent = `Next: ${name}`;
        }
    } catch {
        document.getElementById('cardSpacexCnt').textContent = '—';
    }
}

// ── TICKER ───────────────────────────────────────────────
const tickerStore = {};

function addTick(key, text, color) {
    tickerStore[key] = { text, color };
    rebuildTicker();
}

function rebuildTicker() {
    const entries = Object.values(tickerStore);
    if (!entries.length) return;

    const html = [...entries, ...entries]
        .map(({ text, color }) =>
            `<span class="tick"><span class="td ${color}"></span>${text}<span class="tick-sep">·</span></span>`
        )
        .join('');

    document.getElementById('tickerTrack').innerHTML = html;
}

// ── CHAT ─────────────────────────────────────────────────
let sessionId = null;

function openChat() {
    document.getElementById('chatOverlay').classList.add('open');
    document.getElementById('chatIn').focus();
}

function closeChat() {
    document.getElementById('chatOverlay').classList.remove('open');
}

function handleOverlayClick(event) {
    if (event.target === document.getElementById('chatOverlay')) closeChat();
}

function handleChatKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMsg();
    }
}

async function ensureSession() {
    if (sessionId) return;
    const id = `s_${Date.now()}`;
    try {
        await fetch(`${ADK}/apps/${APP}/users/${UID}/sessions/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
    } catch { /* proceed even if creation endpoint varies */ }
    sessionId = id;
}

function appendMsg(text, role) {
    const el  = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = text;
    const box = document.getElementById('chatMsgs');
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
}

async function sendMsg() {
    const input = document.getElementById('chatIn');
    const btn   = document.getElementById('chatSend');
    const text  = input.value.trim();
    if (!text) return;

    input.value  = '';
    btn.disabled = true;
    appendMsg(text, 'user');
    const thinking = appendMsg('Thinking...', 'agent thinking');

    try {
        await ensureSession();

        const res = await fetch(`${ADK}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_name:    APP,
                user_id:     UID,
                session_id:  sessionId,
                new_message: { role: 'user', parts: [{ text }] }
            })
        });

        const events = await res.json();
        let reply = '';

        for (let i = events.length - 1; i >= 0; i--) {
            const content = events[i]?.content;
            if (content?.role === 'model') {
                const part = content.parts?.find(p => p.text);
                if (part) { reply = part.text; break; }
            }
        }

        thinking.className   = 'msg agent';
        thinking.textContent = reply || 'No response received.';
    } catch {
        thinking.className   = 'msg agent';
        thinking.textContent = 'Agent offline — run: adk web my_agent';
    }

    btn.disabled = false;
    document.getElementById('chatIn').focus();
}

// ── INIT ─────────────────────────────────────────────────
loadISS();
loadLaunches();
loadNews();
loadSpaceX();

setInterval(updateClock, 1000);
setInterval(loadISS, 30000);
