console.log("Starting MindsetFlow...");

var REQUIRED_PASSWORD = "Lm@nny6221";
var isAuthenticated = false;

// Check if user is already authenticated
if (localStorage.getItem("mindsetflow_authenticated") === "true") {
    isAuthenticated = true;
}

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM ready");

    if (isAuthenticated) {
        console.log("User authenticated");
        showMainApp();
    } else {
        console.log("Showing password");
        showPassword();
    }
});

function showPassword() {
    console.log("Creating password screen");

    // Create elements step by step
    var overlay = document.createElement("div");
    overlay.className = "password-modal";
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;";

    var content = document.createElement("div");
    content.style.cssText = "background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; width: 90%;";

    var title = document.createElement("h1");
    title.textContent = "🔒 MindsetFlow Access";
    title.style.cssText = "margin-bottom: 10px; color: #333;";

    var subtitle = document.createElement("p");
    subtitle.textContent = "Enter password to access the application";
    subtitle.style.cssText = "margin-bottom: 30px; color: #666;";

    var input = document.createElement("input");
    input.type = "password";
    input.id = "passwordInput";
    input.placeholder = "Enter your password";
    input.style.cssText = "width: 100%; padding: 15px; margin-bottom: 20px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;";

    var button = document.createElement("button");
    button.textContent = "🔓 Unlock Application";
    button.style.cssText = "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; cursor: pointer;";
    button.onclick = checkPassword;

    var error = document.createElement("div");
    error.id = "passwordError";
    error.style.cssText = "margin-top: 15px; padding: 10px; background: #f8d7da; color: #721c24; border-radius: 8px; display: none;";
    error.textContent = "❌ Incorrect password. Please try again.";

    // Build the modal
    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(input);
    content.appendChild(button);
    content.appendChild(error);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Focus input and add Enter key listener
    input.focus();
    input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            checkPassword();
        }
    });

    console.log("Password screen ready");
}

function checkPassword() {
    console.log("Checking password");

    var input = document.getElementById("passwordInput");
    var error = document.getElementById("passwordError");
    var password = input.value;

    if (password === REQUIRED_PASSWORD) {
        console.log("Password correct!");

        // Set authentication
        localStorage.setItem("mindsetflow_authenticated", "true");
        isAuthenticated = true;

        // Remove password modal
        var modal = document.querySelector(".password-modal");
        if (modal) {
            modal.remove();
        }

        // Show main app
        showMainApp();
        showMessage("Welcome to MindsetFlow! Access granted.", "success");

    } else {
        console.log("Wrong password");

        // Show error
        error.style.display = "block";
        input.value = "";
        input.focus();
    }
}

function showMainApp() {
    console.log("Showing main app");

    // Show main app container
    var mainApp = document.getElementById("mainApp");
    if (mainApp) {
        mainApp.classList.remove("hidden");
    }

    // Hide setup wizard
    var setupWizard = document.getElementById("setupWizard");
    if (setupWizard) {
        setupWizard.classList.add("hidden");
    }

    // Set up navigation
    setupNavigation();

    // Load dashboard
    loadDashboard();

    showMessage("MindsetFlow ready!", "success");
}

function setupNavigation() {
    console.log("Setting up navigation");

    // Get all nav items
    var navItems = document.querySelectorAll(".nav__item");

    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener("click", function() {
            var section = this.getAttribute("data-section");
            if (section) {
                showSection(section);
            }
        });
    }

    // Create button handler
    var createBtn = document.getElementById("createContentBtn");
    if (createBtn) {
        createBtn.addEventListener("click", function() {
            showSection("create");
        });
    }
}

function showSection(sectionName) {
    console.log("Showing section: " + sectionName);

    // Update navigation
    var navItems = document.querySelectorAll(".nav__item");
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove("nav__item--active");
    }

    var activeNav = document.querySelector("[data-section='" + sectionName + "']");
    if (activeNav) {
        activeNav.classList.add("nav__item--active");
    }

    // Update sections
    var sections = document.querySelectorAll(".section");
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("section--active");
    }

    var activeSection = document.getElementById(sectionName);
    if (activeSection) {
        activeSection.classList.add("section--active");
    }

    // Load specific content
    if (sectionName === "dashboard") {
        loadDashboard();
    } else if (sectionName === "trending") {
        loadTrending();
    }

    showMessage("Switched to " + sectionName, "info");
}

function loadDashboard() {
    console.log("Loading dashboard");

    // Update stats
    var totalContent = document.getElementById("totalContent");
    var totalPlatforms = document.getElementById("totalPlatforms");
    var totalViews = document.getElementById("totalViews");
    var engagementRate = document.getElementById("engagementRate");

    if (totalContent) totalContent.textContent = "0";
    if (totalPlatforms) totalPlatforms.textContent = "0";
    if (totalViews) totalViews.textContent = "0";
    if (engagementRate) engagementRate.textContent = "0%";

    // Show empty content message
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

    // Create settings modal
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

function showMessage(text, type) {
    console.log("Message: " + text);

    var message = document.createElement("div");
    message.textContent = text;

    var colors = {
        "info": "#667eea",
        "success": "#28a745",
        "error": "#dc3545",
        "warning": "#ffc107"
    };

    var color = colors[type] || colors.info;

    message.style.cssText = "position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: " + color + "; color: white; border-radius: 8px; font-weight: 600; z-index: 10000; max-width: 400px; transform: translateX(100%); transition: transform 0.3s ease;";

    document.body.appendChild(message);

    // Animate in
    setTimeout(function() {
        message.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(function() {
        message.style.transform = "translateX(100%)";
        setTimeout(function() {
            if (message.parentNode) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 3000);
}

console.log("MindsetFlow loaded!");
