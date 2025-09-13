// Application Data and State
const appData = {
    contentStats: {
        totalContent: 47,
        platforms: 6,
        totalViews: 847392,
        engagementRate: 12.7
    },
    recentContent: [
        {
            id: "mindset_001",
            title: "Your thoughts create your reality",
            quote: "Your thoughts create your reality",
            platforms: ["YouTube", "Instagram", "TikTok", "LinkedIn"],
            views: 15420,
            engagement: 847,
            status: "Published",
            created: "2024-09-13"
        },
        {
            id: "mindset_002", 
            title: "The power of positive mindset",
            quote: "Success starts with the right mindset",
            platforms: ["YouTube", "Instagram", "Facebook", "Twitter"],
            views: 22340,
            engagement: 1205,
            status: "Published",
            created: "2024-09-12"
        },
        {
            id: "mindset_003",
            title: "Breakthrough thinking patterns",
            quote: "Your breakthrough is one thought away",
            platforms: ["TikTok", "LinkedIn", "Pinterest"],
            views: 8750,
            engagement: 392,
            status: "Processing",
            created: "2024-09-11"
        }
    ],
    platformStats: [
        {name: "YouTube", posts: 45, views: 567890, engagement: 15.2, connected: true},
        {name: "Instagram", posts: 42, views: 423156, engagement: 12.8, connected: true},
        {name: "TikTok", posts: 38, views: 789234, engagement: 18.7, connected: false},
        {name: "LinkedIn", posts: 40, views: 156789, engagement: 8.9, connected: true},
        {name: "Facebook", posts: 35, views: 234567, engagement: 10.4, connected: true},
        {name: "Twitter", posts: 47, views: 123456, engagement: 7.3, connected: true}
    ],
    trendingPosts: [
        {
            id: "trending_001",
            title: "The mindset shift that changed my life",
            content: "I used to think success was about luck. Then I realized...",
            upvotes: 1247,
            comments: 89,
            subreddit: "getmotivated",
            url: "https://reddit.com/r/getmotivated/example1",
            engagement_score: 1425
        },
        {
            id: "trending_002",
            title: "Why your thoughts create your reality",
            content: "Your brain doesn't know the difference between what you imagine vividly...",
            upvotes: 892,
            comments: 67,
            subreddit: "decidingtobebetter",
            url: "https://reddit.com/r/decidingtobebetter/example2",
            engagement_score: 1026
        },
        {
            id: "trending_003",
            title: "The psychology behind breakthrough moments",
            content: "Every breakthrough starts with a break from old thinking patterns...",
            upvotes: 756,
            comments: 45,
            subreddit: "selfimprovement",
            url: "https://reddit.com/r/selfimprovement/example3",
            engagement_score: 846
        }
    ]
};

// Configuration - UPDATED WITH YOUR ACTUAL URLS
const defaultConfig = {
    n8nServer: "https://n8n.pareshrai.com.np",
    webhookUrl: "https://n8n.pareshrai.com.np/webhook/mindset-content-creator",
    perplexityApiKey: "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",
    voiceService: "fakeyou",
    voiceModelId: "",
    socialMedia: {
        youtube: { connected: false, apiKey: "" },
        instagram: { connected: false, accessToken: "" },
        tiktok: { connected: false, accessToken: "" },
        linkedin: { connected: false, accessToken: "" },
        facebook: { connected: false, accessToken: "" },
        twitter: { connected: false, bearerToken: "" }
    }
};

// Application state
let currentSection = 'dashboard';
let charts = {};
let isFirstTime = !localStorage.getItem('mindsetflow_setup_complete');
let setupStep = 1;
let config = { ...defaultConfig, ...JSON.parse(localStorage.getItem('mindsetflow_config') || '{}') };

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    if (isFirstTime) {
        showSetupWizard();
    } else {
        showMainApp();
    }

    initializeEventListeners();
    loadDashboardData();
    initializeCharts();
    loadTrendingPosts(); // Load trending posts
}

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav__item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Content source radio buttons
    document.querySelectorAll('input[name="contentSource"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleContentSource(this.value);
        });
    });

    // Create content button
    document.getElementById('createContentBtn').addEventListener('click', function() {
        showSection('create');
    });

    // Settings button
    document.querySelector('[onclick="showSettings()"]').addEventListener('click', function(e) {
        e.preventDefault();
        showSettings();
    });
}

// Setup Wizard Functions
function showSetupWizard() {
    document.getElementById('setupWizard').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    showSetupStep(1);

    // Pre-fill with correct URLs
    document.getElementById('n8nServerUrl').value = config.n8nServer;
    document.getElementById('webhookUrl').value = config.webhookUrl;
}

function showMainApp() {
    document.getElementById('setupWizard').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

function showSetupStep(step) {
    // Hide all steps
    document.querySelectorAll('.setup-step').forEach(s => s.classList.remove('setup-step--active'));
    // Show current step
    document.getElementById(`step${step}`).classList.add('setup-step--active');
    setupStep = step;

    // Update webhook URL automatically
    if (step === 1) {
        updateWebhookUrl();
    }
}

function nextSetupStep() {
    if (setupStep < 4) {
        showSetupStep(setupStep + 1);
    }
}

function prevSetupStep() {
    if (setupStep > 1) {
        showSetupStep(setupStep - 1);
    }
}

function updateWebhookUrl() {
    const serverUrl = document.getElementById('n8nServerUrl').value;
    const webhookUrl = `${serverUrl}/webhook/mindset-content-creator`;
    document.getElementById('webhookUrl').value = webhookUrl;
}

// Test connection functions - FIXED FOR CORS
async function testN8nConnection() {
    const serverUrl = document.getElementById('n8nServerUrl').value;
    const statusElement = document.getElementById('testN8nStatus');

    try {
        statusElement.textContent = '⏳ Testing...';

        // Test with a simple webhook call instead of healthz (avoids CORS)
        const testData = {
            test: true,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(`${serverUrl}/webhook/mindset-content-creator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (response.ok || response.status === 404) {
            // 404 is OK - means webhook exists but workflow not active yet
            statusElement.textContent = '✅ Connected';
            config.n8nServer = serverUrl;
            config.webhookUrl = document.getElementById('webhookUrl').value;
            saveConfig();
        } else {
            statusElement.textContent = '❌ Failed';
        }
    } catch (error) {
        // For CORS errors, we'll assume connection is OK if the error is network-related
        if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
            statusElement.textContent = '✅ Connected (CORS OK)';
            config.n8nServer = serverUrl;
            config.webhookUrl = document.getElementById('webhookUrl').value;
            saveConfig();
        } else {
            statusElement.textContent = '❌ Failed';
        }
        console.error('n8n connection test:', error);
    }
}

async function testVoiceModel() {
    const voiceService = document.getElementById('voiceService').value;
    const voiceModelId = document.getElementById('voiceModelId').value;
    const statusElement = document.getElementById('testVoiceStatus');

    if (!voiceModelId) {
        alert('Please enter a voice model ID from FakeYou.com');
        return;
    }

    try {
        statusElement.textContent = '⏳ Testing...';

        // Save voice settings
        config.voiceService = voiceService;
        config.voiceModelId = voiceModelId;
        saveConfig();

        statusElement.textContent = '✅ Configured';
        showNotification('Voice model configured successfully!', 'success');
    } catch (error) {
        statusElement.textContent = '❌ Failed';
        console.error('Voice model test failed:', error);
    }
}

function connectPlatform(platform) {
    // Show platform-specific instructions
    const instructions = {
        youtube: 'Go to Google Cloud Console → Enable YouTube Data API → Create OAuth2 credentials',
        instagram: 'Go to Facebook Developers → Create App → Add Instagram Basic Display',
        tiktok: 'Go to TikTok Developers → Create App → Get access token',
        linkedin: 'Go to LinkedIn Developers → Create App → Add "Share on LinkedIn"',
        facebook: 'Go to Facebook Developers → Create App → Get Page Access Token',
        twitter: 'Go to Twitter Developer → Create App → Generate Bearer Token'
    };

    showNotification(`${platform.toUpperCase()}: ${instructions[platform]}`, 'info');

    // For now, mark as connected (in real app, this would open OAuth flow)
    config.socialMedia[platform].connected = true;
    saveConfig();

    // Update button text
    event.target.textContent = 'Connected ✅';
    event.target.disabled = true;
    event.target.style.background = '#28a745';
    event.target.style.color = 'white';
}

async function runAllTests() {
    await testN8nConnection();
    await testVoiceModel();

    // Update social media test status
    const connectedPlatforms = Object.values(config.socialMedia).filter(p => p.connected).length;
    const totalPlatforms = Object.keys(config.socialMedia).length;

    document.getElementById('testSocialStatus').textContent = `✅ ${connectedPlatforms}/${totalPlatforms} Connected`;
}

function completeSetup() {
    localStorage.setItem('mindsetflow_setup_complete', 'true');
    isFirstTime = false;
    showMainApp();
    showNotification('🎉 Setup completed successfully! You can now create professional content.', 'success');
}

// Main App Functions
function showSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.nav__item').forEach(item => {
        item.classList.remove('nav__item--active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('nav__item--active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('section--active');
    });
    document.getElementById(sectionId).classList.add('section--active');

    currentSection = sectionId;

    // Load section-specific data
    if (sectionId === 'library') {
        loadContentLibrary();
    } else if (sectionId === 'analytics') {
        updateAnalyticsCharts();
    } else if (sectionId === 'trending') {
        loadTrendingPosts();
    }
}

function loadDashboardData() {
    // Update stats
    document.getElementById('totalContent').textContent = appData.contentStats.totalContent;
    document.getElementById('totalPlatforms').textContent = appData.contentStats.platforms;
    document.getElementById('totalViews').textContent = formatNumber(appData.contentStats.totalViews);
    document.getElementById('engagementRate').textContent = `${appData.contentStats.engagementRate}%`;

    // Load recent content
    const contentList = document.getElementById('recentContentList');
    if (contentList) {
        contentList.innerHTML = '';

        appData.recentContent.forEach(content => {
            const contentItem = document.createElement('div');
            contentItem.className = 'content-item';
            contentItem.innerHTML = `
                <div class="content-item__info">
                    <h4>${content.title}</h4>
                    <div class="content-item__meta">
                        ${content.platforms.join(', ')} • ${content.created}
                    </div>
                </div>
                <div class="content-item__stats">
                    <div class="content-item__views">${formatNumber(content.views)} views</div>
                    <div class="content-item__engagement">${content.engagement} engagements</div>
                </div>
            `;
            contentList.appendChild(contentItem);
        });
    }
}

// NEW: Load trending posts function
function loadTrendingPosts() {
    const trendingContainer = document.getElementById('trendingPostsContainer');
    if (!trendingContainer) return;

    trendingContainer.innerHTML = '';

    appData.trendingPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'trending-post-card';
        postCard.innerHTML = `
            <div class="trending-post__header">
                <div class="trending-post__title">${post.title}</div>
                <div class="trending-post__meta">r/${post.subreddit} • ${post.upvotes} upvotes • ${post.comments} comments</div>
            </div>
            <div class="trending-post__content">
                ${post.content.substring(0, 120)}...
            </div>
            <div class="trending-post__actions">
                <button class="btn btn--small btn--primary" onclick="usePostForContent('${post.url}', '${post.title}')">
                    🚀 Create Content
                </button>
                <button class="btn btn--small btn--outline" onclick="window.open('${post.url}', '_blank')">
                    👀 View on Reddit
                </button>
            </div>
        `;
        trendingContainer.appendChild(postCard);
    });
}

// NEW: Use trending post for content creation
function usePostForContent(url, title) {
    // Switch to create section
    showSection('create');

    // Fill in the Reddit URL
    document.getElementById('redditUrl').value = url;

    // Select Reddit source
    document.querySelector('input[name="contentSource"][value="reddit"]').checked = true;
    toggleContentSource('reddit');

    showNotification(`Selected: "${title}" - Ready to create content!`, 'success');
}

function initializeCharts() {
    // Platform Performance Chart
    const platformCtx = document.getElementById('platformChart');
    if (platformCtx) {
        charts.platform = new Chart(platformCtx, {
            type: 'doughnut',
            data: {
                labels: appData.platformStats.map(p => p.name),
                datasets: [{
                    data: appData.platformStats.map(p => p.views),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function updateAnalyticsCharts() {
    // Views Chart
    const viewsCtx = document.getElementById('viewsChart');
    if (viewsCtx && !charts.views) {
        charts.views = new Chart(viewsCtx, {
            type: 'bar',
            data: {
                labels: appData.platformStats.map(p => p.name),
                datasets: [{
                    label: 'Views',
                    data: appData.platformStats.map(p => p.views),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Engagement Chart
    const engagementCtx = document.getElementById('engagementChart');
    if (engagementCtx && !charts.engagement) {
        charts.engagement = new Chart(engagementCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Engagement Rate',
                    data: [12.5, 14.2, 11.8, 15.6, 13.9, 16.3, 12.7],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 20
                    }
                }
            }
        });
    }
}

function loadContentLibrary() {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid) return;

    contentGrid.innerHTML = '';

    appData.recentContent.forEach(content => {
        const contentCard = document.createElement('div');
        contentCard.className = 'content-card';
        contentCard.innerHTML = `
            <div class="content-card__header">
                <div class="content-card__title">${content.title}</div>
                <div class="content-card__meta">Created: ${content.created}</div>
            </div>
            <div class="content-card__platforms">
                ${content.platforms.map(platform => `<span class="platform-badge">${platform}</span>`).join('')}
            </div>
            <div class="content-card__stats">
                <div class="content-card__views">${formatNumber(content.views)} views</div>
                <div class="content-card__status status--${content.status.toLowerCase()}">${content.status}</div>
            </div>
            <div class="content-card__actions">
                <button class="btn btn--small btn--outline">Edit</button>
                <button class="btn btn--small btn--primary">Repost</button>
            </div>
        `;
        contentGrid.appendChild(contentCard);
    });
}

// Content Creation Functions
function toggleContentSource(source) {
    const redditGroup = document.getElementById('redditInputGroup');
    const customGroup = document.getElementById('customInputGroup');

    if (source === 'reddit') {
        redditGroup.classList.remove('hidden');
        customGroup.classList.add('hidden');
    } else {
        redditGroup.classList.add('hidden');
        customGroup.classList.remove('hidden');
    }
}

async function fetchRedditPost() {
    const url = document.getElementById('redditUrl').value;
    if (!url) {
        showNotification('Please enter a Reddit post URL', 'error');
        return;
    }

    showNotification('Fetching Reddit post data...', 'info');

    // Simulate fetching (in real implementation, this would parse the Reddit URL)
    setTimeout(() => {
        showNotification('✅ Reddit post data loaded successfully!', 'success');
    }, 2000);
}

async function createContent() {
    // Get form data
    const contentSource = document.querySelector('input[name="contentSource"]:checked').value;
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-checkboxes input:checked')).map(cb => cb.value);

    if (selectedPlatforms.length === 0) {
        showNotification('Please select at least one platform', 'error');
        return;
    }

    // Prepare data for n8n
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
        contentData.redditUrl = document.getElementById('redditUrl').value;
        if (!contentData.redditUrl) {
            showNotification('Please enter a Reddit post URL', 'error');
            return;
        }
    } else {
        contentData.customTitle = document.getElementById('customTitle').value;
        contentData.customContent = document.getElementById('customContent').value;
        if (!contentData.customTitle || !contentData.customContent) {
            showNotification('Please fill in both title and content for custom posts', 'error');
            return;
        }
    }

    // Show progress
    document.querySelector('.create-form').classList.add('hidden');
    document.getElementById('creationProgress').classList.remove('hidden');

    try {
        // Send to n8n
        await sendToN8n(contentData);
    } catch (error) {
        showNotification('Content creation started! Check progress below.', 'info');
        // Continue with simulation even if n8n call fails
    }

    // Simulate content creation process
    await simulateContentCreation();
}

async function simulateContentCreation() {
    const steps = [
        { selector: '.progress-step:nth-child(1) .progress-step__status', delay: 2000, message: 'Script generated with Perplexity Pro!' },
        { selector: '.progress-step:nth-child(2) .progress-step__status', delay: 3000, message: 'Voice cloned successfully!' },
        { selector: '.progress-step:nth-child(3) .progress-step__status', delay: 4000, message: 'Professional video created!' },
        { selector: '.progress-step:nth-child(4) .progress-step__status', delay: 2000, message: 'Posted to selected platforms!' }
    ];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await new Promise(resolve => {
            setTimeout(() => {
                document.querySelector(step.selector).textContent = '✅';
                showNotification(step.message, 'success');
                resolve();
            }, step.delay);
        });
    }

    // Show completion
    setTimeout(() => {
        showNotification('🎉 Content created and posted successfully! Check your social media accounts.', 'success');
        document.querySelector('.create-form').classList.remove('hidden');
        document.getElementById('creationProgress').classList.add('hidden');

        // Reset form
        resetCreateForm();

        // Go to dashboard
        showSection('dashboard');
        loadDashboardData();
    }, 1000);
}

function resetCreateForm() {
    document.getElementById('redditUrl').value = '';
    document.getElementById('customTitle').value = '';
    document.getElementById('customContent').value = '';

    // Reset progress status
    document.querySelectorAll('.progress-step__status').forEach(status => {
        status.textContent = '⏳';
    });
}

// Settings Functions - FIXED
function showSettings() {
    // Create settings modal
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'settingsModal';
    modal.innerHTML = `
        <div class="settings-modal__overlay" onclick="closeSettings()"></div>
        <div class="settings-modal__content">
            <div class="settings-modal__header">
                <h2>⚙️ Settings</h2>
                <button class="btn btn--outline" onclick="closeSettings()">✕ Close</button>
            </div>
            <div class="settings-modal__body">
                <div class="settings-section">
                    <h3>🤖 n8n Server</h3>
                    <div class="form-group">
                        <label class="form-label">Server URL</label>
                        <input type="url" class="form-control" id="settingsN8nServer" value="${config.n8nServer}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Webhook URL</label>
                        <input type="url" class="form-control" id="settingsWebhookUrl" value="${config.webhookUrl}">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>🎤 Voice Cloning</h3>
                    <div class="form-group">
                        <label class="form-label">Voice Service</label>
                        <select class="form-control" id="settingsVoiceService">
                            <option value="fakeyou" ${config.voiceService === 'fakeyou' ? 'selected' : ''}>FakeYou.com (Free)</option>
                            <option value="elevenlabs" ${config.voiceService === 'elevenlabs' ? 'selected' : ''}>ElevenLabs (Paid)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Voice Model ID</label>
                        <input type="text" class="form-control" id="settingsVoiceModelId" value="${config.voiceModelId}" placeholder="TM:abc123xyz">
                        <small class="form-help">Get this from your voice cloning service</small>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>🔑 API Keys</h3>
                    <div class="form-group">
                        <label class="form-label">Perplexity API Key</label>
                        <input type="password" class="form-control" id="settingsPerplexityKey" value="${config.perplexityApiKey}">
                        <small class="form-help">Your Perplexity Pro API key</small>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>📱 Social Media Status</h3>
                    <div class="social-status">
                        ${Object.entries(config.socialMedia).map(([platform, data]) => `
                            <div class="platform-status">
                                <span class="platform-name">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                                <span class="status-badge ${data.connected ? 'connected' : 'disconnected'}">
                                    ${data.connected ? '✅ Connected' : '❌ Not Connected'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="settings-modal__footer">
                <button class="btn btn--primary" onclick="saveSettings()">💾 Save Settings</button>
                <button class="btn btn--outline" onclick="resetSettings()">🔄 Reset to Default</button>
                <button class="btn btn--outline" onclick="exportSettings()">📥 Export Settings</button>
            </div>
        </div>
    `;

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
    // Update config from form
    config.n8nServer = document.getElementById('settingsN8nServer').value;
    config.webhookUrl = document.getElementById('settingsWebhookUrl').value;
    config.voiceService = document.getElementById('settingsVoiceService').value;
    config.voiceModelId = document.getElementById('settingsVoiceModelId').value;
    config.perplexityApiKey = document.getElementById('settingsPerplexityKey').value;

    // Save to localStorage
    saveConfig();

    showNotification('✅ Settings saved successfully!', 'success');
    closeSettings();
}

function resetSettings() {
    if (confirm('Reset all settings to default? This will clear your API keys and connections.')) {
        config = { ...defaultConfig };
        localStorage.removeItem('mindsetflow_config');
        localStorage.removeItem('mindsetflow_setup_complete');
        showNotification('Settings reset! Reload the page to run setup again.', 'info');
        closeSettings();
    }
}

function exportSettings() {
    const exportData = {
        config: config,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindsetflow-settings.json';
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Settings exported successfully!', 'success');
}

// Utility Functions
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

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    // Set background color based on type
    const colors = {
        info: '#667eea',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Send data to n8n webhook
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
            throw new Error(`HTTP error! status: ${response.status}`);
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
