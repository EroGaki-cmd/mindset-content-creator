        console.log("🧠 MindsetFlow - Manual Connection Version Starting...");

        let selectedPost = null;
        let connectedPlatforms = [];
        let n8nConnected = false;

        document.addEventListener("DOMContentLoaded", function() {
            console.log("✅ DOM loaded - initializing manual connection interface");
            initializeApp();
        });

        function initializeApp() {
            loadSavedSettings();
            loadTrendingPosts();
            addActivity("🚀 MindsetFlow initialized - ready for manual connection");
            console.log("✅ Manual connection interface ready");
        }

        function loadSavedSettings() {
            const savedUrl = localStorage.getItem('mindsetflow_n8n_url');
            const savedPath = localStorage.getItem('mindsetflow_webhook_path');
            const savedKey = localStorage.getItem('mindsetflow_perplexity_key');

            if (savedUrl) document.getElementById('n8nServerUrl').value = savedUrl;
            if (savedPath) document.getElementById('webhookPath').value = savedPath;
            if (savedKey) document.getElementById('perplexityKey').value = savedKey;
        }

        function saveSettings() {
            const url = document.getElementById('n8nServerUrl').value;
            const path = document.getElementById('webhookPath').value;
            const key = document.getElementById('perplexityKey').value;

            localStorage.setItem('mindsetflow_n8n_url', url);
            localStorage.setItem('mindsetflow_webhook_path', path);
            localStorage.setItem('mindsetflow_perplexity_key', key);

            showToast("Settings saved successfully!", "success");
            addActivity("💾 Connection settings saved");
        }

        async function testConnection() {
            const url = document.getElementById('n8nServerUrl').value;
            const path = document.getElementById('webhookPath').value;

            if (!url || !path) {
                showToast("Please enter server URL and webhook path", "error");
                return;
            }

            showToast("Testing connection...", "info");
            addActivity("🔄 Testing n8n connection...");

            try {
                const webhookUrl = url + path;
                const response = await fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test: true,
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    n8nConnected = true;
                    updateConnectionStatus(true);
                    showToast("Connection successful! ✅", "success");
                    addActivity("✅ N8N connection established");
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                n8nConnected = false;
                updateConnectionStatus(false);
                showToast("Connection failed: " + error.message, "error");
                addActivity("❌ N8N connection failed");
                console.error("Connection test failed:", error);
            }
        }

        function updateConnectionStatus(connected) {
            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');

            if (connected) {
                statusDot.classList.add('connected');
                statusText.textContent = 'Connected';
            } else {
                statusDot.classList.remove('connected');
                statusText.textContent = 'Not Connected';
            }
        }

        function connectPlatform(platform) {
            const platforms = {
                youtube: {
                    name: "YouTube",
                    icon: "📺",
                    fields: [
                        { name: "clientId", label: "Client ID", type: "text", placeholder: "Your YouTube API Client ID" },
                        { name: "clientSecret", label: "Client Secret", type: "password", placeholder: "Your YouTube API Client Secret" },
                        { name: "refreshToken", label: "Refresh Token", type: "password", placeholder: "OAuth2 Refresh Token" }
                    ]
                },
                instagram: {
                    name: "Instagram",
                    icon: "📸", 
                    fields: [
                        { name: "accessToken", label: "Access Token", type: "password", placeholder: "Instagram Basic Display API Token" },
                        { name: "userId", label: "User ID", type: "text", placeholder: "Your Instagram User ID" }
                    ]
                },
                tiktok: {
                    name: "TikTok",
                    icon: "🎵",
                    fields: [
                        { name: "accessToken", label: "Access Token", type: "password", placeholder: "TikTok API Access Token" },
                        { name: "openId", label: "Open ID", type: "text", placeholder: "TikTok Open ID" }
                    ]
                },
                linkedin: {
                    name: "LinkedIn",
                    icon: "💼",
                    fields: [
                        { name: "accessToken", label: "Access Token", type: "password", placeholder: "LinkedIn API Access Token" },
                        { name: "personUrn", label: "Person URN", type: "text", placeholder: "urn:li:person:XXXXXXXXX" }
                    ]
                },
                facebook: {
                    name: "Facebook",
                    icon: "📘",
                    fields: [
                        { name: "accessToken", label: "Access Token", type: "password", placeholder: "Facebook Page Access Token" },
                        { name: "pageId", label: "Page ID", type: "text", placeholder: "Your Facebook Page ID" }
                    ]
                },
                twitter: {
                    name: "Twitter",
                    icon: "🐦",
                    fields: [
                        { name: "consumerKey", label: "Consumer Key", type: "text", placeholder: "Twitter API Consumer Key" },
                        { name: "consumerSecret", label: "Consumer Secret", type: "password", placeholder: "Twitter API Consumer Secret" },
                        { name: "accessToken", label: "Access Token", type: "password", placeholder: "Twitter Access Token" },
                        { name: "accessTokenSecret", label: "Access Token Secret", type: "password", placeholder: "Twitter Access Token Secret" }
                    ]
                }
            };

            const platformConfig = platforms[platform];
            if (!platformConfig) return;

            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');

            modalTitle.innerHTML = `${platformConfig.icon} Connect ${platformConfig.name}`;

            const formHtml = `
                <div class="api-form">
                    ${platformConfig.fields.map(field => `
                        <div class="form-group">
                            <label class="form-label">${field.label}</label>
                            <input type="${field.type}" class="form-control" id="${field.name}" placeholder="${field.placeholder}">
                        </div>
                    `).join('')}

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn" onclick="savePlatformConnection('${platform}')">Connect ${platformConfig.name}</button>
                        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    </div>
                </div>
            `;

            modalContent.innerHTML = formHtml;
            document.getElementById('socialModal').style.display = 'flex';
        }

        function savePlatformConnection(platform) {
            const modal = document.getElementById('socialModal');
            const inputs = modal.querySelectorAll('.form-control');
            const credentials = {};

            inputs.forEach(input => {
                credentials[input.id] = input.value;
            });

            // Save to localStorage
            localStorage.setItem(`mindsetflow_${platform}_creds`, JSON.stringify(credentials));

            // Update UI
            const platformCard = document.querySelector(`[onclick="connectPlatform('${platform}')"]`);
            platformCard.classList.add('connected');
            platformCard.querySelector('.platform-status').textContent = 'Connected';

            if (!connectedPlatforms.includes(platform)) {
                connectedPlatforms.push(platform);
            }

            closeModal();
            showToast(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`, "success");
            addActivity(`✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)} connected`);
        }

        function closeModal() {
            document.getElementById('socialModal').style.display = 'none';
        }

        async function loadTrendingPosts() {
            console.log("🔄 Loading trending mindset posts from Reddit...");
            addActivity("🔄 Fetching trending posts from Reddit");

            const endpoints = [
                "https://www.reddit.com/r/getmotivated/hot.json?limit=10",
                "https://www.reddit.com/r/selfimprovement/hot.json?limit=10",
                "https://www.reddit.com/r/decidingtobebetter/hot.json?limit=10"
            ];

            let allPosts = [];

            try {
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(endpoint);
                        const data = await response.json();

                        if (data.data && data.data.children) {
                            const posts = data.data.children
                                .map(child => child.data)
                                .filter(post => isValidMindsetPost(post));

                            allPosts.push(...posts);
                        }
                    } catch (error) {
                        console.error("Error fetching from", endpoint, error);
                    }
                }

                // Sort by engagement and take top 15
                allPosts.sort((a, b) => (b.ups + b.num_comments * 2) - (a.ups + a.num_comments * 2));
                allPosts = allPosts.slice(0, 15);

                displayTrendingPosts(allPosts);
                addActivity(`✅ Loaded ${allPosts.length} trending posts`);

            } catch (error) {
                console.error("❌ Error loading trending posts:", error);
                addActivity("❌ Failed to load trending posts");
            }
        }

        function isValidMindsetPost(post) {
            const mindsetKeywords = [
                'mindset', 'motivation', 'success', 'growth', 'habits',
                'discipline', 'goals', 'achievement', 'resilience', 'progress'
            ];

            const titleLower = post.title.toLowerCase();
            const bodyLower = (post.selftext || '').toLowerCase();

            return post.ups > 50 &&
                   !post.over_18 &&
                   post.selftext &&
                   post.selftext.length > 100 &&
                   mindsetKeywords.some(keyword => 
                       titleLower.includes(keyword) || bodyLower.includes(keyword)
                   );
        }

        function displayTrendingPosts(posts) {
            const container = document.getElementById('trendingPosts');

            if (posts.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #888; padding: 40px;">No trending posts found</div>';
                return;
            }

            container.innerHTML = posts.map(post => `
                <div class="trending-post" onclick="selectPost('${post.id}', this)" data-post='${JSON.stringify(post).replace(/'/g, "&#39;")}'>
                    <div class="post-title">${escapeHtml(post.title)}</div>
                    <div class="post-meta">
                        <span>r/${post.subreddit}</span>
                        <span>↑ ${post.ups}</span>
                        <span>💬 ${post.num_comments}</span>
                    </div>
                    <div class="post-preview">${escapeHtml(post.selftext.substring(0, 150))}...</div>
                </div>
            `).join('');
        }

        function selectPost(postId, element) {
            document.querySelectorAll('.trending-post').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');

            selectedPost = JSON.parse(element.dataset.post);

            console.log("✅ Selected post:", selectedPost.title);
            addActivity(`📋 Selected: "${selectedPost.title.substring(0, 40)}..."`);
        }

        async function generateContent() {
            if (!n8nConnected) {
                showToast("Please test and establish n8n connection first", "error");
                return;
            }

            if (!selectedPost) {
                showToast("Please select a trending post first", "error");
                return;
            }

            if (connectedPlatforms.length === 0) {
                showToast("Please connect at least one social media platform", "error");
                return;
            }

            console.log("🚀 Starting content generation and posting");
            addActivity("🚀 Starting content generation pipeline");

            const webhookUrl = document.getElementById('n8nServerUrl').value + document.getElementById('webhookPath').value;
            const perplexityKey = document.getElementById('perplexityKey').value;

            const requestData = {
                contentSource: "reddit",
                redditUrl: `https://reddit.com${selectedPost.permalink}`,
                selectedPlatforms: connectedPlatforms,
                config: {
                    perplexityApiKey: perplexityKey,
                    socialCredentials: getSocialCredentials()
                }
            };

            try {
                showToast("Generating content and posting to platforms...", "info");

                const response = await fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData)
                });

                if (response.ok) {
                    const result = await response.json();
                    showToast("Content generated and posted successfully! ✅", "success");
                    addActivity("✅ Content posted to all connected platforms");

                    console.log("✅ Content generation result:", result);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }

            } catch (error) {
                console.error("❌ Content generation error:", error);
                showToast("Content generation failed: " + error.message, "error");
                addActivity("❌ Content generation failed");
            }
        }

        function getSocialCredentials() {
            const credentials = {};
            connectedPlatforms.forEach(platform => {
                const saved = localStorage.getItem(`mindsetflow_${platform}_creds`);
                if (saved) {
                    credentials[platform] = JSON.parse(saved);
                }
            });
            return credentials;
        }

        function addActivity(message) {
            const feed = document.getElementById('activityFeed');
            const now = new Date();
            const timeStr = now.toLocaleTimeString();

            const activityHtml = `
                <div class="activity-item">
                    <div class="activity-content">
                        <div class="activity-icon"></div>
                        <div class="activity-text">${message}</div>
                    </div>
                    <div class="activity-time">${timeStr}</div>
                </div>
            `;

            feed.insertAdjacentHTML('afterbegin', activityHtml);

            // Keep only last 10 activities
            const items = feed.querySelectorAll('.activity-item');
            if (items.length > 10) {
                items[items.length - 1].remove();
            }
        }

        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);

            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 4000);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        console.log("🎉 MindsetFlow Manual Connection - Ready!");
        console.log("📋 Features loaded:");
        console.log("- ✅ Manual n8n connection testing");
        console.log("- ✅ Social media platform connections");
        console.log("- ✅ Reddit trending post selection");
        console.log("- ✅ Content generation and posting");