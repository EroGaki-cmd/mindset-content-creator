console.log("MindsetFlow DOM only version starting...");

var REQUIRED_PASSWORD = "Lm@nny6221";
var isAuthenticated = localStorage.getItem("mindsetflow_authenticated") === "true";

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded");
    if (isAuthenticated) {
        showMainApp();
    } else {
        showPassword();
    }
});

function showPassword() {
    console.log("Showing password prompt with pure DOM");

    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";
    overlay.className = "password-modal";

    var modal = document.createElement("div");
    modal.style.background = "white";
    modal.style.padding = "40px";
    modal.style.borderRadius = "20px";
    modal.style.textAlign = "center";
    modal.style.maxWidth = "400px";
    modal.style.width = "90%";

    var title = document.createElement("h1");
    title.textContent = "🔒 MindsetFlow Access";
    title.style.marginBottom = "10px";
    title.style.color = "#333";

    var subtitle = document.createElement("p");
    subtitle.textContent = "Enter password to access the application";
    subtitle.style.marginBottom = "30px";
    subtitle.style.color = "#666";

    var input = document.createElement("input");
    input.type = "password";
    input.id = "passwordInput";
    input.placeholder = "Enter your password";
    input.style.width = "100%";
    input.style.padding = "15px";
    input.style.marginBottom = "20px";
    input.style.border = "2px solid #ddd";
    input.style.borderRadius = "8px";
    input.style.fontSize = "16px";

    var button = document.createElement("button");
    button.textContent = "🔓 Unlock Application";
    button.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "15px 30px";
    button.style.borderRadius = "8px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.onclick = checkPassword;

    var error = document.createElement("div");
    error.id = "passwordError";
    error.style.marginTop = "15px";
    error.style.padding = "10px";
    error.style.background = "#f8d7da";
    error.style.color = "#721c24";
    error.style.borderRadius = "8px";
    error.style.display = "none";
    error.textContent = "❌ Incorrect password. Please try again.";

    modal.appendChild(title);
    modal.appendChild(subtitle);
    modal.appendChild(input);
    modal.appendChild(button);
    modal.appendChild(error);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    input.focus();
    input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            checkPassword();
        }
    });
}

function checkPassword() {
    console.log("Checking password");
    var input = document.getElementById("passwordInput");
    var error = document.getElementById("passwordError");

    if (input.value === REQUIRED_PASSWORD) {
        console.log("Password correct!");
        localStorage.setItem("mindsetflow_authenticated", "true");
        isAuthenticated = true;
        var modal = document.querySelector(".password-modal");
        if (modal) {
            modal.remove();
        }
        showMainApp();
        showMessage("Welcome to MindsetFlow! Access granted.", "success");
    } else {
        console.log("Password incorrect");
        error.style.display = "block";
        input.value = "";
        input.focus();
    }
}

function showMainApp() {
    console.log("Showing main app");
    var mainApp = document.getElementById("mainApp");
    if (mainApp) {
        mainApp.classList.remove("hidden");
    }
    var setup = document.getElementById("setupWizard");
    if (setup) {
        setup.classList.add("hidden");
    }
    setupNavigation();
    loadDashboard();
    showMessage("MindsetFlow ready!", "success");
}

function setupNavigation() {
    console.log("Setting up navigation");
    var navItems = document.querySelectorAll(".nav__item");
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener("click", function() {
            var section = this.getAttribute("data-section");
            if (section) {
                showSection(section);
            }
        });
    }
    var createBtn = document.getElementById("createContentBtn");
    if (createBtn) {
        createBtn.addEventListener("click", function() {
            showSection("create");
        });
    }
}

function showSection(section) {
    console.log("Showing section: " + section);
    var navItems = document.querySelectorAll(".nav__item");
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove("nav__item--active");
    }
    var activeNav = document.querySelector("[data-section='" + section + "']");
    if (activeNav) {
        activeNav.classList.add("nav__item--active");
    }
    var sections = document.querySelectorAll(".section");
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("section--active");
    }
    var activeSection = document.getElementById(section);
    if (activeSection) {
        activeSection.classList.add("section--active");
    }
    if (section === "dashboard") {
        loadDashboard();
    } else if (section === "trending") {
        loadTrending();
    }
    showMessage("Switched to " + section, "info");
}

function loadDashboard() {
    console.log("Loading dashboard");
    var totalContent = document.getElementById("totalContent");
    var totalPlatforms = document.getElementById("totalPlatforms");
    var totalViews = document.getElementById("totalViews");
    var engagementRate = document.getElementById("engagementRate");
    if (totalContent) totalContent.textContent = "0";
    if (totalPlatforms) totalPlatforms.textContent = "0";
    if (totalViews) totalViews.textContent = "0";
    if (engagementRate) engagementRate.textContent = "0%";
    var contentList = document.getElementById("recentContentList");
    if (contentList) {
        contentList.innerHTML = "<div style='text-align: center; padding: 20px; color: #666;'><p>No content created yet.</p><p>Create your first piece of content!</p><button class='btn btn--primary' onclick='showSection("create")'>Create Content</button></div>";
    }
}

function loadTrending() {
    console.log("Loading trending posts");
    var container = document.getElementById("trendingPostsContainer");
    if (container) {
        container.innerHTML = "<div style='text-align: center; padding: 40px; color: #666;'><h3>Trending Posts</h3><p>This feature will load trending Reddit posts.</p><p>Coming soon!</p></div>";
    }
}

function showSettings() {
    console.log("Showing settings");
    var overlay = document.createElement("div");
    overlay.className = "settings-modal";
    overlay.id = "settingsModal";
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;";
    var content = document.createElement("div");
    content.style.cssText = "background: white; padding: 40px; border-radius: 20px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;";
    var header = document.createElement("div");
    header.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;";
    var title = document.createElement("h2");
    title.textContent = "⚙️ Settings";
    title.style.margin = "0";
    var closeBtn = document.createElement("button");
    closeBtn.textContent = "✕ Close";
    closeBtn.style.cssText = "background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;";
    closeBtn.onclick = closeSettings;
    var logoutBtn = document.createElement("button");
    logoutBtn.textContent = "🔓 Logout";
    logoutBtn.style.cssText = "background: #ffc107; color: #333; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;";
    logoutBtn.onclick = logout;
    var buttonContainer = document.createElement("div");
    buttonContainer.appendChild(logoutBtn);
    buttonContainer.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(buttonContainer);
    var body = document.createElement("div");
    body.innerHTML = "<div style='margin-bottom: 20px;'><h3>🤖 n8n Server</h3><p>Server: https://n8n.pareshrai.com.np</p><p>Webhook: https://n8n.pareshrai.com.np/webhook/mindset-content-creator</p></div><div style='margin-bottom: 20px;'><h3>🎤 Voice Cloning</h3><p>Service: FakeYou.com</p><p>Status: Ready for setup</p></div><div><h3>📱 Social Media</h3><p>All platforms ready for connection</p></div>";
    content.appendChild(header);
    content.appendChild(body);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

function closeSettings() {
    var modal = document.getElementById("settingsModal");
    if (modal) {
        modal.remove();
    }
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("mindsetflow_authenticated");
        location.reload();
    }
}

function showMessage(msg, type) {
    console.log(msg);
    var notification = document.createElement("div");
    notification.textContent = msg;
    var colors = { info: "#667eea", success: "#28a745", error: "#dc3545", warning: "#ffc107" };
    var color = colors[type] || colors.info;
    notification.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: " + color + "; color: white; border-radius: 8px; font-weight: 600; z-index: 10000; max-width: 400px; transform: translateX(100%); transition: transform 0.3s ease;";
    document.body.appendChild(notification);
    setTimeout(function() { notification.style.transform = "translateX(0)"; }, 100);
    setTimeout(function() { notification.style.transform = "translateX(100%)"; setTimeout(function() { if (notification.parentNode) { document.body.removeChild(notification); } }, 300); }, 3000);
}

console.log("MindsetFlow DOM only version loaded!");
