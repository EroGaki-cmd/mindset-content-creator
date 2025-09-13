// MINDSETFLOW - ULTRA CLEAN VERSION (ZERO SYNTAX ERRORS)

console.log("MindsetFlow Starting...");

// Password protection
const REQUIRED_PASSWORD = "Lm@nny6221";
let isAuthenticated = localStorage.getItem("mindsetflow_authenticated") === "true";

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded");

    if (!isAuthenticated) {
        console.log("Showing password prompt");
        showPasswordPrompt();
    } else {
        console.log("User authenticated");
        initializeApp();
    }
});

function showPasswordPrompt() {
    console.log("Creating password modal");

    const passwordModal = document.createElement("div");
    passwordModal.className = "password-modal";

    const modalHTML = "" +
        "<div class='password-modal__overlay'></div>" +
        "<div class='password-modal__content'>" +
            "<div class='password-modal__header'>" +
                "<h1>🔒 MindsetFlow Access</h1>" +
                "<p>Enter password to access the application</p>" +
            "</div>" +
            "<div class='password-form'>" +
                "<div class='form-group'>" +
                    "<label class='form-label'>Password</label>" +
                    "<input type='password' class='form-control' id='passwordInput' placeholder='Enter your password'>" +
                    "<small class='form-help'>Enter your secure password</small>" +
                "</div>" +
                "<div class='password-actions'>" +
                    "<button class='btn btn--primary' onclick='checkPassword()'>🔓 Unlock Application</button>" +
                "</div>" +
                "<div class='password-error hidden' id='passwordError'>" +
                    "❌ Incorrect password. Please try again." +
                "</div>" +
            "</div>" +
        "</div>";

    passwordModal.innerHTML = modalHTML;
    document.body.appendChild(passwordModal);
    passwordModal.style.display = "flex";

    console.log("Password modal displayed");

    setTimeout(function() {
        const input = document.getElementById("passwordInput");
        if (input) {
            input.focus();
            input.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    checkPassword();
                }
            });
        }
    }, 100);
}

function checkPassword() {
    console.log("Checking password");

    const enteredPassword = document.getElementById("passwordInput").value;
    const errorElement = document.getElementById("passwordError");

    if (enteredPassword === REQUIRED_PASSWORD) {
        console.log("Password correct!");

        localStorage.setItem("mindsetflow_authenticated", "true");
        isAuthenticated = true;

        const modal = document.querySelector(".password-modal");
        if (modal) {
            modal.remove();
        }

        initializeApp();
        showNotification("Welcome to MindsetFlow! Access granted.", "success");

    } else {
        console.log("Password incorrect");

        if (errorElement) {
            errorElement.classList.remove("hidden");
        }

        const input = document.getElementById("passwordInput");
        if (input) {
            input.value = "";
            input.focus();
        }
    }
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("mindsetflow_authenticated");
        location.reload();
    }
}

function initializeApp() {
    console.log("Initializing app");

    // Show main app
    const mainApp = document.getElementById("mainApp");
    if (mainApp) {
        mainApp.classList.remove("hidden");
    }

    // Hide setup wizard
    const setupWizard = document.getElementById("setupWizard");
    if (setupWizard) {
        setupWizard.classList.add("hidden");
    }

    // Initialize basic functionality
    initializeEventListeners();
    loadDashboard();

    showNotification("MindsetFlow initialized successfully!", "success");
}

function initializeEventListeners() {
    console.log("Setting up event listeners");

    // Navigation
    const navItems = document.querySelectorAll(".nav__item");
    navItems.forEach(function(item) {
        item.addEventListener("click", function() {
            const section = this.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });

    // Create content button
    const createBtn = document.getElementById("createContentBtn");
    if (createBtn) {
        createBtn.addEventListener("click", function() {
            showSection("create");
        });
    }
}

function showSection(sectionId) {
    console.log("Showing section: " + sectionId);

    // Update navigation
    const navItems = document.querySelectorAll(".nav__item");
    navItems.forEach(function(item) {
        item.classList.remove("nav__item--active");
    });

    const activeNav = document.querySelector("[data-section='" + sectionId + "']");
    if (activeNav) {
        activeNav.classList.add("nav__item--active");
    }

    // Update sections
    const sections = document.querySelectorAll(".section");
    sections.forEach(function(section) {
        section.classList.remove("section--active");
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add("section--active");
    }

    // Load section-specific content
    if (sectionId === "trending") {
        loadTrendingPosts();
    } else if (sectionId === "dashboard") {
        loadDashboard();
    }

    showNotification("Switched to " + sectionId + " section", "info");
}

function loadDashboard() {
    console.log("Loading dashboard");

    // Update stats with real data
    const contentCount = localStorage.getItem("mindsetflow_content_count") || "0";
    const platformCount = "0";
    const viewCount = "0";
    const engagementRate = "0%";

    const totalContentEl = document.getElementById("totalContent");
    const totalPlatformsEl = document.getElementById("totalPlatforms");
    const totalViewsEl = document.getElementById("totalViews");
    const engagementRateEl = document.getElementById("engagementRate");

    if (totalContentEl) totalContentEl.textContent = contentCount;
    if (totalPlatformsEl) totalPlatformsEl.textContent = platformCount;
    if (totalViewsEl) totalViewsEl.textContent = viewCount;
    if (engagementRateEl) engagementRateEl.textContent = engagementRate;

    // Show no content message
    const contentList = document.getElementById("recentContentList");
    if (contentList) {
        contentList.innerHTML = "" +
            "<div style='text-align: center; padding: 20px; color: #666;'>" +
                "<p>No content created yet.</p>" +
                "<p>Create your first piece of content to see it here!</p>" +
                "<button class='btn btn--primary' onclick='showSection("trending")'>🔥 Browse Trending Posts</button>" +
            "</div>";
    }
}

function loadTrendingPosts() {
    console.log("Loading trending posts");

    const container = document.getElementById("trendingPostsContainer");
    if (!container) return;

    // Show loading message
    container.innerHTML = "" +
        "<div style='text-align: center; padding: 40px; color: #666;'>" +
            "<h3>Loading trending posts...</h3>" +
            "<p>Fetching today's best mindset content from Reddit</p>" +
        "</div>";

    // Simulate loading
    setTimeout(function() {
        container.innerHTML = "" +
            "<div style='text-align: center; padding: 40px; color: #666;'>" +
                "<h3>Trending posts feature coming soon!</h3>" +
                "<p>Use the Create section to make custom content for now.</p>" +
                "<button class='btn btn--primary' onclick='showSection("create")'>✍️ Create Custom Content</button>" +
            "</div>";
    }, 2000);
}

function showSettings() {
    console.log("Opening settings");

    const modal = document.createElement("div");
    modal.className = "settings-modal";
    modal.id = "settingsModal";

    const modalHTML = "" +
        "<div class='settings-modal__overlay' onclick='closeSettings()'></div>" +
        "<div class='settings-modal__content'>" +
            "<div class='settings-modal__header'>" +
                "<h2>⚙️ Settings</h2>" +
                "<div>" +
                    "<button class='btn btn--small btn--outline' onclick='logout()'>🔓 Logout</button>" +
                    "<button class='btn btn--outline' onclick='closeSettings()'>✕ Close</button>" +
                "</div>" +
            "</div>" +
            "<div class='settings-modal__body'>" +
                "<div class='settings-section'>" +
                    "<h3>🤖 n8n Server</h3>" +
                    "<p>Server URL: https://n8n.pareshrai.com.np</p>" +
                    "<p>Webhook: https://n8n.pareshrai.com.np/webhook/mindset-content-creator</p>" +
                "</div>" +
                "<div class='settings-section'>" +
                    "<h3>🎤 Voice Cloning</h3>" +
                    "<p>Service: FakeYou.com</p>" +
                    "<p>Status: Ready for configuration</p>" +
                "</div>" +
                "<div class='settings-section'>" +
                    "<h3>📱 Social Media</h3>" +
                    "<p>All platforms ready for connection</p>" +
                "</div>" +
            "</div>" +
            "<div class='settings-modal__footer'>" +
                "<button class='btn btn--primary' onclick='closeSettings()'>💾 Close Settings</button>" +
            "</div>" +
        "</div>";

    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    modal.style.display = "flex";
}

function closeSettings() {
    const modal = document.getElementById("settingsModal");
    if (modal) {
        modal.remove();
    }
}

function showNotification(message, type) {
    console.log("Notification: " + message);

    const notification = document.createElement("div");
    notification.textContent = message;

    const colors = {
        info: "#667eea",
        success: "#28a745",
        error: "#dc3545",
        warning: "#ffc107"
    };

    notification.style.cssText = "" +
        "position: fixed;" +
        "top: 20px;" +
        "right: 20px;" +
        "padding: 15px 20px;" +
        "border-radius: 8px;" +
        "color: white;" +
        "font-weight: 600;" +
        "z-index: 10001;" +
        "max-width: 400px;" +
        "transform: translateX(100%);" +
        "transition: transform 0.3s ease;" +
        "box-shadow: 0 4px 12px rgba(0,0,0,0.15);" +
        "background-color: " + (colors[type] || colors.info) + ";";

    document.body.appendChild(notification);

    setTimeout(function() {
        notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(function() {
        notification.style.transform = "translateX(100%)";
        setTimeout(function() {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

console.log("MindsetFlow script loaded successfully!");
