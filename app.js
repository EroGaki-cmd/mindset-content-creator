console.log("MindsetFlow - No Password Version");

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded - starting app");
    initializeApp();
});

function initializeApp() {
    console.log("Initializing app");

    var mainApp = document.getElementById("mainApp");
    if (mainApp) {
        mainApp.classList.remove("hidden");
        console.log("Main app shown");
    }

    var setupWizard = document.getElementById("setupWizard");
    if (setupWizard) {
        setupWizard.classList.add("hidden");
        console.log("Setup wizard hidden");
    }

    setupNavigation();
    loadDashboard();
    console.log("App initialized successfully");
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

    console.log("Navigation setup complete");
}

function showSection(sectionName) {
    console.log("Showing section: " + sectionName);

    var navItems = document.querySelectorAll(".nav__item");
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove("nav__item--active");
    }

    var activeNav = document.querySelector("[data-section='" + sectionName + "']");
    if (activeNav) {
        activeNav.classList.add("nav__item--active");
    }

    var sections = document.querySelectorAll(".section");
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("section--active");
    }

    var activeSection = document.getElementById(sectionName);
    if (activeSection) {
        activeSection.classList.add("section--active");
    }

    if (sectionName === "dashboard") {
        loadDashboard();
    } else if (sectionName === "trending") {
        loadTrending();
    } else if (sectionName === "create") {
        loadCreate();
    } else if (sectionName === "library") {
        loadLibrary();
    } else if (sectionName === "analytics") {
        loadAnalytics();
    }
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
        var emptyDiv = document.createElement("div");
        emptyDiv.style.textAlign = "center";
        emptyDiv.style.padding = "20px";
        emptyDiv.style.color = "#666";

        var p1 = document.createElement("p");
        p1.textContent = "No content created yet.";

        var p2 = document.createElement("p");
        p2.textContent = "Welcome to MindsetFlow!";

        emptyDiv.appendChild(p1);
        emptyDiv.appendChild(p2);

        contentList.innerHTML = "";
        contentList.appendChild(emptyDiv);
    }
}

function loadTrending() {
    console.log("Loading trending section");

    var container = document.getElementById("trendingPostsContainer");
    if (container) {
        var div = document.createElement("div");
        div.style.textAlign = "center";
        div.style.padding = "40px";
        div.style.color = "#666";

        var h3 = document.createElement("h3");
        h3.textContent = "Trending Posts";

        var p = document.createElement("p");
        p.textContent = "This feature will show trending Reddit posts.";

        div.appendChild(h3);
        div.appendChild(p);

        container.innerHTML = "";
        container.appendChild(div);
    }
}

function loadCreate() {
    console.log("Loading create section");
}

function loadLibrary() {
    console.log("Loading library section");

    var contentGrid = document.getElementById("contentGrid");
    if (contentGrid) {
        var div = document.createElement("div");
        div.style.gridColumn = "1 / -1";
        div.style.textAlign = "center";
        div.style.padding = "40px";
        div.style.color = "#666";

        var h3 = document.createElement("h3");
        h3.textContent = "No content in library yet";

        var p = document.createElement("p");
        p.textContent = "Content will appear here after creation.";

        div.appendChild(h3);
        div.appendChild(p);

        contentGrid.innerHTML = "";
        contentGrid.appendChild(div);
    }
}

function loadAnalytics() {
    console.log("Loading analytics section");
}

function showSettings() {
    console.log("Showing settings");

    var overlay = document.createElement("div");
    overlay.id = "settingsModal";
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

    var content = document.createElement("div");
    content.style.background = "white";
    content.style.padding = "40px";
    content.style.borderRadius = "20px";
    content.style.maxWidth = "600px";
    content.style.width = "90%";

    var header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "30px";

    var title = document.createElement("h2");
    title.textContent = "Settings";
    title.style.margin = "0";

    var closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.background = "#dc3545";
    closeBtn.style.color = "white";
    closeBtn.style.border = "none";
    closeBtn.style.padding = "10px 20px";
    closeBtn.style.borderRadius = "5px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = closeSettings;

    var body = document.createElement("div");

    var section1 = document.createElement("div");
    section1.style.marginBottom = "20px";
    var h31 = document.createElement("h3");
    h31.textContent = "n8n Server";
    var p1 = document.createElement("p");
    p1.textContent = "Server: https://n8n.pareshrai.com.np";
    section1.appendChild(h31);
    section1.appendChild(p1);

    var section2 = document.createElement("div");
    section2.style.marginBottom = "20px";
    var h32 = document.createElement("h3");
    h32.textContent = "Voice Cloning";
    var p2 = document.createElement("p");
    p2.textContent = "Service: FakeYou.com";
    section2.appendChild(h32);
    section2.appendChild(p2);

    body.appendChild(section1);
    body.appendChild(section2);

    header.appendChild(title);
    header.appendChild(closeBtn);
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

console.log("MindsetFlow loaded - no password required");
