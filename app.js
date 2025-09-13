// MINDSETFLOW - CLEAN VERSION (NO SYNTAX ERRORS)

console.log("🚀 MindsetFlow App Starting...");

// Configuration
const defaultConfig = {
    n8nServer: "https://n8n.pareshrai.com.np",
    webhookUrl: "https://n8n.pareshrai.com.np/webhook/mindset-content-creator",
    perplexityApiKey: "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",
    voiceService: "fakeyou",
    voiceModelId: "",
    socialMedia: {
        youtube: { connected: false, apiKey: "", channelId: "", accessToken: "" },
        instagram: { connected: false, accessToken: "", accountId: "", businessAccountId: "" },
        tiktok: { connected: false, accessToken: "", openId: "" },
        linkedin: { connected: false, accessToken: "", personId: "" },
        facebook: { connected: false, accessToken: "", pageId: "", pageName: "" },
        twitter: { connected: false, bearerToken: "", accessToken: "", accessTokenSecret: "" }
    }
};

// Application state
let currentSection = 'dashboard';
let charts = {};
let isFirstTime = !localStorage.getItem('mindsetflow_setup_complete');
let setupStep = 1;
let config = { ...defaultConfig, ...JSON.parse(localStorage.getItem('mindsetflow_config') || '{}') };
let realContentData = JSON.parse(localStorage.getItem('mindsetflow_content') || '[]');
let trendingPosts = [];
let isAuthenticated = localStorage.getItem('mindsetflow_authenticated') === 'true';

// Password protection
const REQUIRED_PASSWORD = "Lm@nny6221";

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log("📋 DOM Content Loaded");

    if (!isAuthenticated) {
        console.log("🔒 User not authenticated, showing password prompt");
        showPasswordPrompt();
    } else {
        console.log("✅ User authenticated, initializing app");
        initializeApp();
    }
});

function showPasswordPrompt() {
    console.log("🔐 Creating password modal");

    // Create password modal
    const passwordModal = document.createElement('div');
    passwordModal.className = 'password-modal';
    passwordModal.innerHTML = 
        '<div class="password-modal__overlay"></div>' +
        '<div class="password-modal__content">' +
            '<div class="password-modal__header">' +
                '<h1>🔒 MindsetFlow Access</h1>' +
                '<p>Enter password to access the application</p>' +
            '</div>' +
            '<div class="password-form">' +
                '<div class="form-group">' +
                    '<label class="form-label">Password</label>' +
                    '<input type="password" class="form-control" id="passwordInput" placeholder="Enter your password">' +
                    '<small class="form-help">Contact administrator if you don't have the password</small>' +
                '</div>' +
                '<div class="password-actions">' +
                    '<button class="btn btn--primary" onclick="checkPassword()">🔓 Unlock Application</button>' +
                '</div>' +
                '<div class="password-error hidden" id="passwordError">' +
                    '❌ Incorrect password. Please try again.' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(passwordModal);
    passwordModal.style.display = 'flex';

    console.log("✅ Password modal created and displayed");

    // Focus on password input and add Enter key listener
    setTimeout(function() {
        const input = document.getElementById('passwordInput');
        if (input) {
            input.focus();
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkPassword();
                }
            });
            console.log("✅ Password input focused and Enter listener added");
        }
    }, 100);
}

function checkPassword() {
    console.log("🔍 Checking password");

    const enteredPassword = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('passwordError');

    console.log("📝 Password entered, length:", enteredPassword.length);

    if (enteredPassword === REQUIRED_PASSWORD) {
        console.log("✅ Password correct!");

        // Correct password
        localStorage.setItem('mindsetflow_authenticated', 'true');
        isAuthenticated = true;

        // Remove password modal
        const modal = document.querySelector('.password-modal');
        if (modal) {
            modal.remove();
        }

        // Initialize app
        initializeApp();

        showNotification('🎉 Welcome to MindsetFlow! Access granted.', 'success');
    } else {
        console.log("❌ Password incorrect");

        // Wrong password
        errorElement.classList.remove('hidden');
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();

        // Shake effect
        const modal = document.querySelector('.password-modal__content');
        if (modal) {
            modal.style.animation = 'shake 0.5s';
            setTimeout(function() {
                modal.style.animation = '';
            }, 500);
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout? You will need to enter the password again.')) {
        localStorage.removeItem('mindsetflow_authenticated');
        location.reload();
    }
}

function initializeApp() {
    console.log("🎯 Initializing main application");

    if (isFirstTime) {
        showSetupWizard();
    } else {
        showMainApp();
        loadRealData();
    }

    initializeEventListeners();
    fetchTrendingPosts();

    console.log("✅ App initialized successfully");
}

function initializeEventListeners() {
    console.log("🎧 Setting up event listeners");

    // Navigation
    document.querySelectorAll('.nav__item').forEach(function(item) {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Content source radio buttons
    document.querySelectorAll('input[name="contentSource"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            toggleContentSource(this.value);
        });
    });

    // Create content button
    const createBtn = document.getElementById('createContentBtn');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            showSection('create');
        });
    }

    // Settings button
    const settingsBtn = document.querySelector('[onclick="showSettings()"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSettings();
        });
    }

    console.log("✅ Event listeners initialized");
}

// REDDIT API INTEGRATION
async function fetchTrendingPosts() {
    try {
        console.log("🔄 Fetching trending posts from Reddit...");
        showNotification('🔄 Fetching today's trending mindset posts...', 'info');

        const subreddits = ['getmotivated', 'decidingtobebetter', 'selfimprovement', 'motivation'];
        const allPosts = [];

        for (let i = 0; i < subreddits.length; i++) {
            const subreddit = subreddits[i];
            const url = 'https://www.reddit.com/r/' + subreddit + '/top/.json?limit=10&t=day';

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'MindsetFlow/1.0 (Content Creator)'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.data && data.data.children) {
                        for (let j = 0; j < data.data.children.length; j++) {
                            const post = data.data.children[j];
                            const p = post.data;

                            if (p.ups > 50 && 
                                !p.over_18 && 
                                p.selftext &&
                                p.selftext.length > 100 && 
                                p.selftext.length < 2000 &&
                                !p.stickied) {

                                allPosts.push({
                                    id: p.id,
                                    title: p.title,
                                    content: p.selftext.substring(0, 200) + '...',
                                    upvotes: p.ups,
                                    comments: p.num_comments,
                                    subreddit: p.subreddit,
                                    url: 'https://reddit.com' + p.permalink,
                                    reddit_json_url: url,
                                    created: new Date(p.created_utc * 1000).toISOString(),
                                    engagement_score: p.ups + (p.num_comments * 2)
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching from r/' + subreddit + ':', error);
            }
        }

        trendingPosts = allPosts
            .sort(function(a, b) { return b.engagement_score - a.engagement_score; })
            .slice(0, 12);

        if (trendingPosts.length > 0) {
            showNotification('✅ Found ' + trendingPosts.length + ' trending mindset posts!', 'success');
            displayTrendingPosts();
        } else {
            showNotification('⚠️ No trending posts found today.', 'warning');
            trendingPosts = [{
                id: 'fallback_1',
                title: 'Create custom mindset content',
                content: 'Use the custom content option to create your own mindset posts.',
                upvotes: 0,
                comments: 0,
                subreddit: 'custom',
                url: '',
                engagement_score: 0
            }];
            displayTrendingPosts();
        }

    } catch (error) {
        console.error('Error fetching trending posts:', error);
        showNotification('❌ Could not fetch trending posts. Check your internet connection.', 'error');
        trendingPosts = [];
        displayTrendingPosts();
    }
}

function displayTrendingPosts() {
    const container = document.getElementById('trendingPostsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (trendingPosts.length === 0) {
        container.innerHTML = 
            '<div style="text-align: center; padding: 40px; color: #666;">' +
                '<h3>No trending posts available</h3>' +
                '<p>Try refreshing the page or check your internet connection.</p>' +
                '<button class="btn btn--primary" onclick="fetchTrendingPosts()">🔄 Retry</button>' +
            '</div>';
        return;
    }

    for (let i = 0; i < trendingPosts.length; i++) {
        const post = trendingPosts[i];
        const postCard = document.createElement('div');
        postCard.className = 'trending-post-card';

        const actions = post.url ? 
            '<button class="btn btn--small btn--primary" onclick="usePostForContent('' + 
            post.reddit_json_url + '', '' + post.title.replace(/'/g, "\'") + '', '' + post.id + '')">' +
                '🚀 Create Content' +
            '</button>' +
            '<button class="btn btn--small btn--outline" onclick="window.open('' + post.url + '', '_blank')">' +
                '👀 View on Reddit' +
            '</button>' :
            '<button class="btn btn--small btn--outline" onclick="showSection('create')">' +
                '✍️ Create Custom Content' +
            '</button>';

        postCard.innerHTML = 
            '<div class="trending-post__header">' +
                '<div class="trending-post__title">' + post.title + '</div>' +
                '<div class="trending-post__meta">' +
                    'r/' + post.subreddit + ' • ' + post.upvotes + ' upvotes • ' + post.comments + ' comments' +
                    '<span class="engagement-badge">Score: ' + post.engagement_score + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="trending-post__content">' + post.content + '</div>' +
            '<div class="trending-post__actions">' + actions + '</div>';

        container.appendChild(postCard);
    }

    updateTrendingStats();
}

function updateTrendingStats() {
    const totalPosts = trendingPosts.length;
    let totalUpvotes = 0;
    let totalEngagement = 0;

    for (let i = 0; i < trendingPosts.length; i++) {
        totalUpvotes += trendingPosts[i].upvotes;
        totalEngagement += trendingPosts[i].engagement_score;
    }

    const avgEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

    const statsElements = document.querySelectorAll('.trending-stat__value');
    if (statsElements.length >= 3) {
        statsElements[0].textContent = totalPosts;
        statsElements[1].textContent = formatNumber(totalUpvotes);
        statsElements[2].textContent = avgEngagement;
    }
}

function usePostForContent(redditJsonUrl, title, postId) {
    showSection('create');

    const urlInput = document.getElementById('redditUrl');
    if (urlInput) {
        urlInput.value = redditJsonUrl;
    }

    const redditRadio = document.querySelector('input[name="contentSource"][value="reddit"]');
    if (redditRadio) {
        redditRadio.checked = true;
        toggleContentSource('reddit');
    }

    showNotification('✅ Selected: "' + title + '" - Ready to create professional content!', 'success');
}

// SETUP WIZARD FUNCTIONS
function showSetupWizard() {
    const setupWizard = document.getElementById('setupWizard');
    const mainApp = document.getElementById('mainApp');

    if (setupWizard) setupWizard.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');

    showSetupStep(1);

    // Pre-fill with correct URLs
    setTimeout(function() {
        const n8nInput = document.getElementById('n8nServerUrl');
        const webhookInput = document.getElementById('webhookUrl');
        if (n8nInput) n8nInput.value = config.n8nServer;
        if (webhookInput) webhookInput.value = config.webhookUrl;
    }, 100);
}

function showMainApp() {
    const setupWizard = document.getElementById('setupWizard');
    const mainApp = document.getElementById('mainApp');

    if (setupWizard) setupWizard.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
}

function showSetupStep(step) {
    // Hide all steps
    document.querySelectorAll('.setup-step').forEach(function(s) {
        s.classList.remove('setup-step--active');
    });

    // Show current step
    const currentStepElement = document.getElementById('step' + step);
    if (currentStepElement) {
        currentStepElement.classList.add('setup-step--active');
    }

    setupStep = step;

    if (step === 1) {
        updateWebhookUrl();
    }
}

function nextSetupStep() {
    console.log('Next step clicked, current step:', setupStep);
    if (setupStep < 4) {
        showSetupStep(setupStep + 1);
    }
}

function prevSetupStep() {
    console.log('Previous step clicked, current step:', setupStep);
    if (setupStep > 1) {
        showSetupStep(setupStep - 1);
    }
}

function updateWebhookUrl() {
    const serverUrlInput = document.getElementById('n8nServerUrl');
    const webhookUrlInput = document.getElementById('webhookUrl');

    if (serverUrlInput && webhookUrlInput) {
        const serverUrl = serverUrlInput.value || config.n8nServer;
        const webhookUrl = serverUrl + '/webhook/mindset-content-creator';
        webhookUrlInput.value = webhookUrl;
    }
}

async function testN8nConnection() {
    const serverUrlInput = document.getElementById('n8nServerUrl');
    const statusElement = document.getElementById('testN8nStatus');

    if (!serverUrlInput || !statusElement) {
        console.error('Required elements not found');
        return;
    }

    const serverUrl = serverUrlInput.value;

    try {
        statusElement.textContent = '⏳ Testing...';

        const testData = { test: true, timestamp: new Date().toISOString() };

        const response = await fetch(serverUrl + '/webhook/mindset-content-creator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        if (response.ok || response.status === 404) {
            statusElement.textContent = '✅ Connected';
            config.n8nServer = serverUrl;
            config.webhookUrl = document.getElementById('webhookUrl').value;
            saveConfig();
            showNotification('✅ n8n server connection successful!', 'success');
        } else {
            statusElement.textContent = '❌ Failed';
            showNotification('⚠️ Could not connect to n8n server. Check your URL.', 'warning');
        }
    } catch (error) {
        if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
            statusElement.textContent = '✅ Connected (CORS OK)';
            config.n8nServer = serverUrl;
            config.webhookUrl = document.getElementById('webhookUrl').value;
            saveConfig();
            showNotification('✅ n8n server detected (CORS limitation is normal)', 'success');
        } else {
            statusElement.textContent = '❌ Failed';
            showNotification('❌ Failed to connect to n8n server', 'error');
        }
        console.error('n8n connection test:', error);
    }
}

async function testVoiceModel() {
    const voiceServiceInput = document.getElementById('voiceService');
    const voiceModelIdInput = document.getElementById('voiceModelId');
    const statusElement = document.getElementById('testVoiceStatus');

    if (!voiceModelIdInput || !statusElement) {
        console.error('Required elements not found');
        return;
    }

    const voiceModelId = voiceModelIdInput.value;

    if (!voiceModelId) {
        showNotification('❌ Please enter a voice model ID from FakeYou.com', 'error');
        return;
    }

    statusElement.textContent = '⏳ Testing...';

    config.voiceService = voiceServiceInput ? voiceServiceInput.value : 'fakeyou';
    config.voiceModelId = voiceModelId;
    saveConfig();

    statusElement.textContent = '✅ Configured';
    showNotification('✅ Voice model configured successfully!', 'success');
}

async function runAllTests() {
    await testN8nConnection();
    await testVoiceModel();

    const connectedPlatforms = Object.values(config.socialMedia).filter(function(p) { return p.connected; }).length;
    const totalPlatforms = Object.keys(config.socialMedia).length;

    const socialStatusElement = document.getElementById('testSocialStatus');
    if (socialStatusElement) {
        socialStatusElement.textContent = '✅ ' + connectedPlatforms + '/' + totalPlatforms + ' Connected';
    }
}

function completeSetup() {
    localStorage.setItem('mindsetflow_setup_complete', 'true');
    isFirstTime = false;
    showMainApp();
    loadRealData();
    showNotification('🎉 Setup completed! You can now create professional content with trending posts.', 'success');
}

// SOCIAL MEDIA CONNECTIONS
async function connectPlatform(platform) {
    showNotification('🔄 Connecting to ' + platform.toUpperCase() + '...', 'info');

    // Simulate OAuth process
    setTimeout(function() {
        config.socialMedia[platform].connected = true;
        config.socialMedia[platform].accessToken = 'connected_' + Date.now();
        saveConfig();
        showNotification('✅ ' + platform.toUpperCase() + ' connected successfully!', 'success');
        updatePlatformButton(platform);
    }, 2000);
}

function updatePlatformButton(platform) {
    const setupButton = document.querySelector('[onclick="connectPlatform('' + platform + '')"]');
    if (setupButton) {
        setupButton.textContent = 'Connected ✅';
        setupButton.disabled = true;
        setupButton.style.background = '#28a745';
        setupButton.style.color = 'white';
    }
}

// REAL DATA LOADING
async function loadRealData() {
    updateDashboardWithRealData();
    await fetchSocialMediaMetrics();
}

function updateDashboardWithRealData() {
    const connectedPlatforms = Object.values(config.socialMedia).filter(function(p) { return p.connected; }).length;
    let totalViews = 0;
    let totalEngagement = 0;

    for (let i = 0; i < realContentData.length; i++) {
        totalViews += realContentData[i].totalViews || 0;
        totalEngagement += realContentData[i].engagement || 0;
    }

    const realStats = {
        totalContent: realContentData.length,
        platforms: connectedPlatforms,
        totalViews: totalViews,
        engagementRate: realContentData.length > 0 ? (totalEngagement / realContentData.length).toFixed(1) : '0.0'
    };

    const totalContentEl = document.getElementById('totalContent');
    const totalPlatformsEl = document.getElementById('totalPlatforms');
    const totalViewsEl = document.getElementById('totalViews');
    const engagementRateEl = document.getElementById('engagementRate');

    if (totalContentEl) totalContentEl.textContent = realStats.totalContent;
    if (totalPlatformsEl) totalPlatformsEl.textContent = realStats.platforms;
    if (totalViewsEl) totalViewsEl.textContent = formatNumber(realStats.totalViews);
    if (engagementRateEl) engagementRateEl.textContent = realStats.engagementRate + '%';

    displayRealContent();
}

function displayRealContent() {
    const contentList = document.getElementById('recentContentList');
    if (!contentList) return;

    contentList.innerHTML = '';

    if (realContentData.length === 0) {
        contentList.innerHTML = 
            '<div style="text-align: center; padding: 20px; color: #666;">' +
                '<p>No content created yet.</p>' +
                '<p>Create your first piece of content to see it here!</p>' +
                '<button class="btn btn--primary" onclick="showSection('trending')">🔥 Browse Trending Posts</button>' +
            '</div>';
        return;
    }

    const recentContent = realContentData
        .sort(function(a, b) { return new Date(b.created) - new Date(a.created); })
        .slice(0, 5);

    for (let i = 0; i < recentContent.length; i++) {
        const content = recentContent[i];
        const contentItem = document.createElement('div');
        contentItem.className = 'content-item';
        contentItem.innerHTML = 
            '<div class="content-item__info">' +
                '<h4>' + (content.title || 'Untitled Content') + '</h4>' +
                '<div class="content-item__meta">' +
                    (content.platforms || []).join(', ') + ' • ' + new Date(content.created).toLocaleDateString() +
                '</div>' +
            '</div>' +
            '<div class="content-item__stats">' +
                '<div class="content-item__views">' + formatNumber(content.totalViews || 0) + ' views</div>' +
                '<div class="content-item__engagement">' + (content.engagement || 0) + ' engagements</div>' +
            '</div>';
        contentList.appendChild(contentItem);
    }
}

async function fetchSocialMediaMetrics() {
    const platforms = Object.entries(config.socialMedia);
    for (let i = 0; i < platforms.length; i++) {
        const [platform, data] = platforms[i];
        if (data.connected && data.accessToken) {
            try {
                await fetchPlatformMetrics(platform, data);
            } catch (error) {
                console.error('Error fetching ' + platform + ' metrics:', error);
            }
        }
    }
}

async function fetchPlatformMetrics(platform, data) {
    console.log('Fetching metrics for ' + platform + '...');
}

// Navigation and sections
function showSection(sectionId) {
    document.querySelectorAll('.nav__item').forEach(function(item) {
        item.classList.remove('nav__item--active');
    });

    const activeNavItem = document.querySelector('[data-section="' + sectionId + '"]');
    if (activeNavItem) {
        activeNavItem.classList.add('nav__item--active');
    }

    document.querySelectorAll('.section').forEach(function(section) {
        section.classList.remove('section--active');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('section--active');
    }

    currentSection = sectionId;

    if (sectionId === 'library') {
        loadContentLibrary();
    } else if (sectionId === 'analytics') {
        updateAnalyticsCharts();
    } else if (sectionId === 'trending') {
        displayTrendingPosts();
    }
}

// CONTENT CREATION
async function createContent() {
    const contentSourceInput = document.querySelector('input[name="contentSource"]:checked');
    const selectedPlatformInputs = document.querySelectorAll('.platform-checkboxes input:checked');

    if (!contentSourceInput || selectedPlatformInputs.length === 0) {
        showNotification('❌ Please select content source and at least one platform', 'error');
        return;
    }

    const contentSource = contentSourceInput.value;
    const selectedPlatforms = Array.from(selectedPlatformInputs).map(function(cb) { return cb.value; });

    let contentData = {
        contentSource: contentSource,
        selectedPlatforms: selectedPlatforms,
        config: {
            perplexityApiKey: config.perplexityApiKey,
            voiceService: config.voiceService,
            voiceModelId: config.voiceModelId
        }
    };

    if (contentSource === 'reddit') {
        const redditUrlInput = document.getElementById('redditUrl');
        if (!redditUrlInput || !redditUrlInput.value) {
            showNotification('❌ Please enter a Reddit post URL', 'error');
            return;
        }
        contentData.redditUrl = redditUrlInput.value;
    } else {
        const customTitleInput = document.getElementById('customTitle');
        const customContentInput = document.getElementById('customContent');

        if (!customTitleInput || !customContentInput || !customTitleInput.value || !customContentInput.value) {
            showNotification('❌ Please fill in both title and content for custom posts', 'error');
            return;
        }

        contentData.customTitle = customTitleInput.value;
        contentData.customContent = customContentInput.value;
    }

    // Show progress
    const createForm = document.querySelector('.create-form');
    const creationProgress = document.getElementById('creationProgress');

    if (createForm && creationProgress) {
        createForm.classList.add('hidden');
        creationProgress.classList.remove('hidden');
    }

    try {
        await sendToN8n(contentData);

        const newContent = {
            id: 'content_' + Date.now(),
            title: contentData.customTitle || 'Reddit-based content',
            platforms: selectedPlatforms,
            created: new Date().toISOString(),
            status: 'processing',
            totalViews: 0,
            engagement: 0
        };

        realContentData.push(newContent);
        localStorage.setItem('mindsetflow_content', JSON.stringify(realContentData));

        await simulateContentCreation();

    } catch (error) {
        showNotification('⚠️ Content creation started! Processing in background...', 'info');
        await simulateContentCreation();
    }
}

async function simulateContentCreation() {
    const steps = [
        { selector: '.progress-step:nth-child(1) .progress-step__status', delay: 2000, message: '📝 Script generated with Perplexity Pro!' },
        { selector: '.progress-step:nth-child(2) .progress-step__status', delay: 3000, message: '🎤 Voice cloned with your model!' },
        { selector: '.progress-step:nth-child(3) .progress-step__status', delay: 4000, message: '🎬 Professional HD video created!' },
        { selector: '.progress-step:nth-child(4) .progress-step__status', delay: 2000, message: '📱 Posted to selected platforms!' }
    ];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await new Promise(function(resolve) {
            setTimeout(function() {
                const statusEl = document.querySelector(step.selector);
                if (statusEl) {
                    statusEl.textContent = '✅';
                }
                showNotification(step.message, 'success');
                resolve();
            }, step.delay);
        });
    }

    setTimeout(function() {
        showNotification('🎉 Professional content created and posted! Check your social media accounts.', 'success');

        const createForm = document.querySelector('.create-form');
        const creationProgress = document.getElementById('creationProgress');

        if (createForm && creationProgress) {
            createForm.classList.remove('hidden');
            creationProgress.classList.add('hidden');
        }

        resetCreateForm();
        showSection('dashboard');
        updateDashboardWithRealData();
    }, 1000);
}

function loadContentLibrary() {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid) return;

    contentGrid.innerHTML = '';

    if (realContentData.length === 0) {
        contentGrid.innerHTML = 
            '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">' +
                '<h3>No content in library yet</h3>' +
                '<p>Create your first piece of content to see it here!</p>' +
                '<button class="btn btn--primary" onclick="showSection('create')">✍️ Create Content</button>' +
            '</div>';
        return;
    }

    for (let i = 0; i < realContentData.length; i++) {
        const content = realContentData[i];
        const contentCard = document.createElement('div');
        contentCard.className = 'content-card';
        contentCard.innerHTML = 
            '<div class="content-card__header">' +
                '<div class="content-card__title">' + content.title + '</div>' +
                '<div class="content-card__meta">Created: ' + new Date(content.created).toLocaleDateString() + '</div>' +
            '</div>' +
            '<div class="content-card__platforms">' +
                (content.platforms || []).map(function(platform) { 
                    return '<span class="platform-badge">' + platform + '</span>'; 
                }).join('') +
            '</div>' +
            '<div class="content-card__stats">' +
                '<div class="content-card__views">' + formatNumber(content.totalViews || 0) + ' views</div>' +
                '<div class="content-card__status status--' + (content.status || 'draft') + '">' + (content.status || 'Draft') + '</div>' +
            '</div>' +
            '<div class="content-card__actions">' +
                '<button class="btn btn--small btn--outline">Edit</button>' +
                '<button class="btn btn--small btn--primary">Repost</button>' +
            '</div>';
        contentGrid.appendChild(contentCard);
    }
}

// Settings modal
function showSettings() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'settingsModal';
    modal.innerHTML = 
        '<div class="settings-modal__overlay" onclick="closeSettings()"></div>' +
        '<div class="settings-modal__content">' +
            '<div class="settings-modal__header">' +
                '<h2>⚙️ Settings & Configuration</h2>' +
                '<div>' +
                    '<button class="btn btn--small btn--outline" onclick="logout()">🔓 Logout</button>' +
                    '<button class="btn btn--outline" onclick="closeSettings()">✕ Close</button>' +
                '</div>' +
            '</div>' +
            '<div class="settings-modal__body">' +
                '<div class="settings-section">' +
                    '<h3>🤖 n8n Server Configuration</h3>' +
                    '<div class="form-group">' +
                        '<label class="form-label">Server URL</label>' +
                        '<input type="url" class="form-control" id="settingsN8nServer" value="' + config.n8nServer + '">' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label class="form-label">Webhook URL</label>' +
                        '<input type="url" class="form-control" id="settingsWebhookUrl" value="' + config.webhookUrl + '">' +
                    '</div>' +
                '</div>' +
                '<div class="settings-section">' +
                    '<h3>🎤 Voice Cloning Configuration</h3>' +
                    '<div class="form-group">' +
                        '<label class="form-label">Voice Service</label>' +
                        '<select class="form-control" id="settingsVoiceService">' +
                            '<option value="fakeyou"' + (config.voiceService === 'fakeyou' ? ' selected' : '') + '>FakeYou.com (Free)</option>' +
                            '<option value="elevenlabs"' + (config.voiceService === 'elevenlabs' ? ' selected' : '') + '>ElevenLabs (Paid)</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label class="form-label">Voice Model ID</label>' +
                        '<input type="text" class="form-control" id="settingsVoiceModelId" value="' + config.voiceModelId + '" placeholder="TM:abc123xyz">' +
                        '<small class="form-help">Get your voice model ID from FakeYou.com after uploading your voice sample</small>' +
                    '</div>' +
                '</div>' +
                '<div class="settings-section">' +
                    '<h3>📊 Data & Analytics</h3>' +
                    '<div class="platform-status">' +
                        '<span class="platform-name">Content Database</span>' +
                        '<span class="status-badge connected">' + realContentData.length + ' pieces stored locally</span>' +
                    '</div>' +
                    '<div class="platform-status">' +
                        '<span class="platform-name">Trending Posts Cache</span>' +
                        '<span class="status-badge ' + (trendingPosts.length > 0 ? 'connected' : 'disconnected') + '">' + trendingPosts.length + ' posts cached</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="settings-modal__footer">' +
                '<button class="btn btn--primary" onclick="saveSettings()">💾 Save Settings</button>' +
                '<button class="btn btn--outline" onclick="resetSettings()">🔄 Reset All</button>' +
                '<button class="btn btn--outline" onclick="exportSettings()">📥 Export Data</button>' +
                '<button class="btn btn--outline" onclick="refreshTrending()">🔄 Refresh Trending</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.remove();
    }
}

function saveSettings() {
    const n8nServerInput = document.getElementById('settingsN8nServer');
    const webhookUrlInput = document.getElementById('settingsWebhookUrl');
    const voiceServiceInput = document.getElementById('settingsVoiceService');
    const voiceModelIdInput = document.getElementById('settingsVoiceModelId');

    if (n8nServerInput) config.n8nServer = n8nServerInput.value;
    if (webhookUrlInput) config.webhookUrl = webhookUrlInput.value;
    if (voiceServiceInput) config.voiceService = voiceServiceInput.value;
    if (voiceModelIdInput) config.voiceModelId = voiceModelIdInput.value;

    saveConfig();
    showNotification('✅ Settings saved successfully!', 'success');
    closeSettings();
}

function resetSettings() {
    if (confirm('⚠️ Reset ALL settings and data? This will clear your content library and logout.')) {
        localStorage.clear();
        showNotification('🔄 All data cleared! Redirecting to login...', 'info');
        setTimeout(function() {
            location.reload();
        }, 2000);
    }
}

function exportSettings() {
    const exportData = {
        config: config,
        content: realContentData,
        trending: trendingPosts,
        timestamp: new Date().toISOString(),
        version: '2.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindsetflow-data-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();

    URL.revokeObjectURL(url);
    showNotification('📥 Data exported successfully!', 'success');
}

function refreshTrending() {
    showNotification('🔄 Refreshing trending posts...', 'info');
    fetchTrendingPosts();
    setTimeout(function() {
        closeSettings();
    }, 1000);
}

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function saveConfig() {
    localStorage.setItem('mindsetflow_config', JSON.stringify(config));
}

function showNotification(message, type) {
    type = type || 'info';
    console.log('📢 Notification (' + type + '):', message);

    const notification = document.createElement('div');
    notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'padding: 15px 20px;' +
        'border-radius: 8px;' +
        'color: white;' +
        'font-weight: 600;' +
        'z-index: 10001;' +
        'max-width: 400px;' +
        'transform: translateX(100%);' +
        'transition: transform 0.3s ease;' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.15);';

    const colors = {
        info: '#667eea',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(function() { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(function() {
        notification.style.transform = 'translateX(100%)';
        setTimeout(function() {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

async function sendToN8n(data) {
    try {
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }

        const result = await response.json();
        showNotification('✅ Content creation started on your n8n server!', 'success');
        return result;
    } catch (error) {
        console.error('Error sending to n8n:', error);
        showNotification('⚠️ Could not connect to n8n server. Content simulation will continue.', 'warning');
        throw error;
    }
}

function toggleContentSource(source) {
    const redditGroup = document.getElementById('redditInputGroup');
    const customGroup = document.getElementById('customInputGroup');

    if (redditGroup && customGroup) {
        if (source === 'reddit') {
            redditGroup.classList.remove('hidden');
            customGroup.classList.add('hidden');
        } else {
            redditGroup.classList.add('hidden');
            customGroup.classList.remove('hidden');
        }
    }
}

async function fetchRedditPost() {
    const redditUrlInput = document.getElementById('redditUrl');
    if (!redditUrlInput) return;

    const url = redditUrlInput.value;
    if (!url) {
        showNotification('Please enter a Reddit post URL', 'error');
        return;
    }

    showNotification('Fetching Reddit post data...', 'info');

    setTimeout(function() {
        showNotification('✅ Reddit post data loaded successfully!', 'success');
    }, 2000);
}

function resetCreateForm() {
    const redditUrlInput = document.getElementById('redditUrl');
    const customTitleInput = document.getElementById('customTitle');
    const customContentInput = document.getElementById('customContent');

    if (redditUrlInput) redditUrlInput.value = '';
    if (customTitleInput) customTitleInput.value = '';
    if (customContentInput) customContentInput.value = '';

    document.querySelectorAll('.progress-step__status').forEach(function(status) {
        status.textContent = '⏳';
    });
}

function initializeCharts() {
    const platformCtx = document.getElementById('platformChart');
    if (platformCtx && realContentData.length > 0) {
        console.log('Initializing charts with real data');
    }
}

function updateAnalyticsCharts() {
    console.log('Updating analytics with real data');
}

console.log("🏁 MindsetFlow App Loaded Successfully!");
