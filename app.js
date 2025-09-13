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
    ]
};

// Configuration (stored in localStorage)
const defaultConfig = {
    n8nServer: "http://localhost:5678",
    webhookUrl: "http://localhost:5678/webhook/mindset-content-creator",
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
}

// Setup Wizard Functions
function showSetupWizard() {
    document.getElementById('setupWizard').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    showSetupStep(1);
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

// Test connection functions
async function testN8nConnection() {
    const serverUrl = document.getElementById('n8nServerUrl').value;
    const statusElement = document.getElementById('testN8nStatus');

    try {
        statusElement.textContent = '⏳ Testing...';

        // Simple test - try to reach the server
        const response = await fetch(`${serverUrl}/healthz`, { method: 'GET' });

        if (response.ok) {
            statusElement.textContent = '✅ Connected';
            config.n8nServer = serverUrl;
            config.webhookUrl = document.getElementById('webhookUrl').value;
            saveConfig();
        } else {
            statusElement.textContent = '❌ Failed';
        }
    } catch (error) {
        statusElement.textContent = '❌ Failed';
        console.error('n8n connection test failed:', error);
    }
}

async function testVoiceModel() {
    const voiceService = document.getElementById('voiceService').value;
    const voiceModelId = document.getElementById('voiceModelId').value;
    const statusElement = document.getElementById('testVoiceStatus');

    if (!voiceModelId) {
        alert('Please enter a voice model ID');
        return;
    }

    try {
        statusElement.textContent = '⏳ Testing...';

        // Save voice settings
        config.voiceService = voiceService;
        config.voiceModelId = voiceModelId;
        saveConfig();

        statusElement.textContent = '✅ Configured';
    } catch (error) {
        statusElement.textContent = '❌ Failed';
        console.error('Voice model test failed:', error);
    }
}

function connectPlatform(platform) {
    // In a real implementation, this would open OAuth flows
    // For now, we'll simulate connection
    config.socialMedia[platform].connected = true;
    saveConfig();

    // Update button text
    event.target.textContent = 'Connected ✅';
    event.target.disabled = true;
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
    showNotification('Setup completed successfully! 🎉');
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

    // Simulate fetching Reddit post
    showNotification('Fetching Reddit post...', 'info');

    setTimeout(() => {
        showNotification('Reddit post fetched successfully!', 'success');
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

    // Show progress
    document.querySelector('.create-form').classList.add('hidden');
    document.getElementById('creationProgress').classList.remove('hidden');

    // Simulate content creation process
    await simulateContentCreation();
}

async function simulateContentCreation() {
    const steps = [
        { selector: '.progress-step:nth-child(1) .progress-step__status', delay: 2000 },
        { selector: '.progress-step:nth-child(2) .progress-step__status', delay: 3000 },
        { selector: '.progress-step:nth-child(3) .progress-step__status', delay: 4000 },
        { selector: '.progress-step:nth-child(4) .progress-step__status', delay: 2000 }
    ];

    for (const step of steps) {
        await new Promise(resolve => {
            setTimeout(() => {
                document.querySelector(step.selector).textContent = '✅';
                resolve();
            }, step.delay);
        });
    }

    // Show completion
    setTimeout(() => {
        showNotification('Content created and posted successfully! 🎉', 'success');
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

// Settings Functions
function showSettings() {
    // This would open a settings modal or page
    // For now, we'll just show a notification
    showNotification('Settings panel would open here', 'info');
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
        transform: translateX(100%);
        transition: transform 0.3s ease;
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Send data to n8n webhook
async function sendToN8n(data) {
    try {
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                config: {
                    perplexityApiKey: config.perplexityApiKey,
                    voiceService: config.voiceService,
                    voiceModelId: config.voiceModelId,
                    platforms: Object.keys(config.socialMedia).filter(platform => 
                        config.socialMedia[platform].connected
                    )
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending to n8n:', error);
        throw error;
    }
}