// shared.js — loaded by every page

const BASE_URL = "http://localhost:5000";

function getToken() { return localStorage.getItem("bh_token"); }
function getUser()  { try { return JSON.parse(localStorage.getItem("bh_user")); } catch { return null; } }
function setAuth(token, user) {
  localStorage.setItem("bh_token", token);
  localStorage.setItem("bh_user", JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem("bh_token");
  localStorage.removeItem("bh_user");
}

function authHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: authHeaders(),
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Request failed");
  return data;
}

// Decode JWT payload (no verify — just for UI)
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch { return null; }
}

function timeLeft(end) {
  const diff = new Date(end) - new Date();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return Math.floor(h / 24) + "d " + (h % 24) + "h";
  return h + "h " + m + "m left";
}

function auctionPhase(auction) {
  const now = new Date();
  if (auction.status === "closed") return "closed";
  if (new Date(auction.start_time) > now) return "upcoming";
  if (new Date(auction.end_time) < now) return "closed";
  return "ongoing";
}

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function showToast(msg, type = "") {
  let t = document.getElementById("bh-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "bh-toast";
    t.style.cssText = `position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%) translateY(80px);
      background:#161920;border:1px solid rgba(255,255,255,0.08);border-radius:8px;
      padding:11px 22px;font-size:13px;font-family:'DM Sans',sans-serif;color:#f0ede8;
      transition:transform 0.3s ease;z-index:9999;white-space:nowrap;pointer-events:none;`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = type === "error" ? "#e05a5a" : type === "success" ? "#4caf82" : "rgba(255,255,255,0.08)";
  t.style.color = type === "error" ? "#e05a5a" : type === "success" ? "#4caf82" : "#f0ede8";
  t.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.transform = "translateX(-50%) translateY(80px)"; }, 3000);
}

// Render nav based on auth state
function renderNav(activePage = "") {
  const user = getUser() || (getToken() ? decodeToken(getToken()) : null);
  const navEl = document.getElementById("main-nav");
  if (!navEl) return;

  const links = [
    { href: "ongoing.html",       label: "Ongoing auctions",  dot: "green", page: "ongoing"    },
    { href: "upcoming.html",      label: "Upcoming auctions", dot: "blue",  page: "upcoming"   },
    { href: "closed.html",        label: "Closed auctions",   dot: "red",   page: "closed"     },
    { href: "bid-dashboard.html", label: "Bid Dashboard",     dot: null,    page: "dashboard"  },
  ];

  const navLinksHtml = links.map(l => `
    <li><a href="${l.href}" class="${activePage === l.page ? 'active' : ''}">
      ${l.dot ? `<span class="nav-dot dot-${l.dot}${l.dot === 'green' ? ' pulse' : ''}"></span>` : ""}
      ${l.label}
    </a></li>`).join("");

  const authHtml = user
    ? `<span class="nav-user">Hi, ${user.name || "User"}</span>
       ${user.role === "seller" ? `<a href="create-auction.html" class="btn-accent">+ List item</a>` : ""}
       <button class="btn-ghost" onclick="logout()">Sign out</button>`
    : `<a href="auction-auth.html" class="btn-ghost">Sign in</a>
       <a href="auction-auth.html" class="btn-accent">Get started</a>`;

  navEl.innerHTML = `
    <div class="nav-inner">
      <a href="index.html" class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="#0d0f14"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <span class="logo-name">Bid<span>Hive</span></span>
      </a>
      <ul class="nav-links">${navLinksHtml}</ul>
      <div class="nav-actions">${authHtml}</div>
    </div>`;
}

function logout() {
  clearAuth();
  window.location.href = "auction-auth.html";
}

// Global Image Error Handler: 
// Automatically catches any hotlink-blocked or 404 images from the Google scrape and displays an aesthetic fallback.
document.addEventListener('error', function(e) {
  if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
    e.target.onerror = null; // Prevent infinite fallback loops
    const text = encodeURIComponent(e.target.alt || 'BidHive Item');
    e.target.src = `https://placehold.co/600x600/161920/F5A623?text=${text}`;
  }
}, true);
