
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const wheel = $("#wheel");
const ctx = wheel.getContext("2d");
let rotation = 0;              
let spinning = false;

let options = [
    "Seçenek 1", "Seçenek 2", "Seçenek 3", "Seçenek 4", "Seçenek 5", "Seçenek 6"
];

const COLORS = (n) =>
    Array.from({ length: n }, (_, i) => `hsl(${Math.round(i * 360 / n)}, 85%, 55%)`);

function updateCount() { $("#count").textContent = options.length; }

function redraw() {
    const W = wheel.width, H = wheel.height;
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 10;
    ctx.clearRect(0, 0, W, H);

    if (options.length === 0) {
        ctx.fillStyle = "#2a3348";
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#8fa3c7";
        ctx.font = "bold 22px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.textAlign = "center";
        ctx.fillText("Seçenek ekleyin", cx, cy + 8);
        return;
    }

    const colors = COLORS(options.length);
    const arc = (2 * Math.PI) / options.length;
    const rot = (rotation * Math.PI) / 180; 

    for (let i = 0; i < options.length; i++) {
        const start = i * arc + rot;
        const end = start + arc;

        // dilim
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();

        // metin
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 22px system-ui, -apple-system, Segoe UI, Roboto";
        
        ctx.fillText(options[i], r - 16, 7);
        ctx.restore();
    }

   
}

// -- UI: seçenek listesi ----------------------------------------
function refreshList() {
    const ul = $("#optionList");
    ul.innerHTML = "";
    options.forEach((text, idx) => {
        const li = document.createElement("li");

        const input = document.createElement("input");
        input.value = text;
        input.addEventListener("input", e => {
            options[idx] = e.target.value || `Seçenek ${idx + 1}`;
            updateCount(); redraw();
        });

        const btnUp = document.createElement("button");
        btnUp.className = "icon-btn"; btnUp.title = "Yukarı";
        btnUp.textContent = "↑";
        btnUp.onclick = () => { if (idx > 0) { [options[idx - 1], options[idx]] = [options[idx], options[idx - 1]]; refreshList(); redraw(); } };

        const btnDown = document.createElement("button");
        btnDown.className = "icon-btn"; btnDown.title = "Aşağı";
        btnDown.textContent = "↓";
        btnDown.onclick = () => { if (idx < options.length - 1) { [options[idx + 1], options[idx]] = [options[idx], options[idx + 1]]; refreshList(); redraw(); } };

        const btnDel = document.createElement("button");
        btnDel.className = "icon-btn"; btnDel.title = "Sil";
        btnDel.textContent = "🗑";
        btnDel.onclick = () => { options.splice(idx, 1); refreshList(); updateCount(); redraw(); };

        const actions = document.createElement("div");
        actions.className = "actions";
        actions.append(btnUp, btnDown, btnDel);

        li.append(input, actions);
        ul.append(li);
    });
    updateCount();
}

// tek tek ekleme
$("#addBtn").onclick = () => {
    const val = $("#optionInput").value.trim();
    if (!val) return;
    options.push(val);
    $("#optionInput").value = "";
    refreshList(); redraw();
};

// toplu ekleme
$("#bulkToggle").onchange = (e) => {
    const on = e.target.checked;
    $("#bulkArea").style.display = on ? "block" : "none";
    $("#bulkAddBtn").style.display = on ? "inline-block" : "none";
};
$("#bulkAddBtn").onclick = () => {
    const lines = $("#bulkArea").value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length) options.push(...lines);
    $("#bulkArea").value = "";
    refreshList(); redraw();
};

// -- Spin mekaniği ----------------------------------------------
const spinBtn = $("#spinBtn");
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function spin() {
    if (spinning || options.length === 0) return;
    spinning = true; spinBtn.disabled = true; $("#result").textContent = "";

    const n = options.length;
    const arcDeg = 360 / n;

   
    const winnerIndex = Math.floor(Math.random() * n);

  
    const targetAngle = winnerIndex * arcDeg + arcDeg / 2;


    let finalRotation = (360 - targetAngle);

    finalRotation += 360 * (5 + Math.floor(Math.random() * 4));

    const start = rotation;
    const delta = ((finalRotation - start) + 360 * 20) % 3600; 
    const dur = 4000;
    const t0 = performance.now();

    const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = easeOutCubic(p);
        rotation = start + delta * eased;
        redraw();
        if (p < 1) requestAnimationFrame(tick);
        else finish();
    };
    requestAnimationFrame(tick);

    function finish() {
        rotation = finalRotation % 360;
        redraw();
        const winner = options[winnerIndex] || "???";
        $("#result").innerHTML = `<span class="badge">Kazanan: ${winner}</span>`;
        spinning = false; spinBtn.disabled = false;
    }
}

spinBtn.addEventListener("click", spin);

refreshList();
redraw();
