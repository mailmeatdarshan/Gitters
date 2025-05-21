
const url = "https://api.github.com/users/";

const get = (element) => document.getElementById(`${element}`);

const input = get("searchInput");
const btn = get("searchBtn");
const themeSwitch = get("themeSwitch");
const errorContainer = get("errorContainer");
const profileCard = get("profileCard");
const searchHistory = get("searchHistory");
const noResults = get("errorMessage"); // Your error message element
const loadingIndicator = get("loadingIndicator");


function initApp() {

    btn.addEventListener('click', handleSearch);
    input.addEventListener('keydown', handleEnterKey);
    themeSwitch.addEventListener('click', toggleTheme);
    
    loadThemePreference();

    loadSearchHistory();
    
    const lastSearched = getRecentSearches()[0];
    if (lastSearched) {
        getUserData(url + lastSearched);
    } else {
  
        getUserData(url + "mailmeatdarshan");
    }
}

// Handle search button click
function handleSearch() {
    const username = input.value.trim();
    if (username !== "") {
        showLoading(true);
        getUserData(url + username);
    }
}

// Handle Enter key press in search input
function handleEnterKey(e) {
    if (e.key === 'Enter') {
        if (input.value.trim() !== "") {
            handleSearch();
        }
    }
}

// Show/hide loading indicator
function showLoading(isLoading) {
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
    
    if (btn) {
        btn.disabled = isLoading;
    }
}

// Fetch GitHub user data
async function getUserData(gitUrl) {
    try {
        showLoading(true);
        
        // Hide error message
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
        const response = await fetch(gitUrl);
        const data = await response.json();
        
        if (!response.ok || data.message === "Not Found") {
            showError("No profile with this username");
            return;
        }
        
        // Update profile with fetched data
        updateProfile(data);
        
        // Add to search history
        addToSearchHistory(data);
        
        // Show profile card
        if (profileCard) {
            profileCard.style.display = 'grid';
        }
        
    } catch (error) {
        showError("An error occurred. Please try again.");
        console.error("Error fetching GitHub user:", error);
    } finally {
        showLoading(false);
    }
}

// Show error message
function showError(message) {
    if (errorContainer) {
        errorContainer.style.display = 'flex';
        noResults.textContent = message;
    }
    
    if (profileCard) {
        profileCard.style.display = 'none';
    }
    
    // Hide error after 3 seconds
    setTimeout(() => {
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }, 3000);
}

// Update profile UI with user data
function updateProfile(data) {
    if (data.message !== "Not Found") {
        function checkNull(apiItem, domItem) {
            if (apiItem === "" || apiItem === null) {
                domItem.style.opacity = 0.5;
                domItem.previousElementSibling.style.opacity = 0.5;
                return false;
            } else {
                return true;
            }
        }

        const userImage = get("avatar");
        const name = get("name");
        const username = get("login");
        const date = get("joinDate");
        const repos = get("repos");
        const followers = get("followers");
        const following = get("following");
        const profileBio = get("bio");
        const location = get("location");
        const website = get("website");
        const twitter = get("twitter");
        const company = get("company");
        const visitGithubBtn = get("visitGithubBtn");
        

        const reposLink = get("reposLink");
        const followersLink = get("followersLink");
        const followingLink = get("followingLink");

        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Update main profile elements
        if (userImage) userImage.src = data.avatar_url;
        if (name) name.innerText = data?.name || data?.login;
        
        // Update username with GitHub link
        if (username) {
            username.innerText = `@${data?.login}`;
            username.href = data?.html_url;
            username.target = "_blank";
            username.title = "View profile on GitHub";
        }
        
        // Update visit GitHub profile button
        if (visitGithubBtn) {
            visitGithubBtn.href = data?.html_url;
            visitGithubBtn.target = "_blank";
        }
        
        if (date) {
            const dateSegment = data?.created_at.split("T").shift().split("-");
            date.innerText = `Joined ${dateSegment[2]} ${month[dateSegment[1] - 1]} ${dateSegment[0]}`;
        }

        if (profileBio) {
            profileBio.innerText = (data?.bio === null) ? "This Profile has no Bio" : data?.bio;
        }

        // Update stats with links
        if (repos) {
            repos.innerText = data?.public_repos;
        }
        
        if (reposLink) {
            reposLink.href = `${data?.html_url}?tab=repositories`;
            reposLink.target = "_blank";
            reposLink.title = "View repositories";
        }
        
        if (followers) {
            followers.innerText = data?.followers;
        }
        
        if (followersLink) {
            followersLink.href = `${data?.html_url}?tab=followers`;
            followersLink.target = "_blank";
            followersLink.title = "View followers";
        }
        
        if (following) {
            following.innerText = data?.following;
        }
        
        if (followingLink) {
            followingLink.href = `${data?.html_url}?tab=following`;
            followingLink.target = "_blank";
            followingLink.title = "View following";
        }

        // Handle location
        if (location) {
            location.innerHTML = `<i class="ri-map-pin-line"></i> ${checkNull(data?.location, location) ? data?.location : "Not Available"}`;
            if (!data?.location) location.classList.add("unavailable");
            else location.classList.remove("unavailable");
        }

        // Handle website (blog)
        if (website) {
            if (checkNull(data?.blog, website)) {
                const blogUrl = ensureHttpPrefix(data?.blog);
                
                // Find or create the text element
                let linkTextEl = website.querySelector('.link-text');
                if (!linkTextEl) {
                    website.innerHTML = `<i class="ri-link"></i> <span class="link-text">${formatUrl(data?.blog)}</span>`;
                    linkTextEl = website.querySelector('.link-text');
                } else {
                    linkTextEl.textContent = formatUrl(data?.blog);
                }
                
                website.classList.add('clickable');
                website.onclick = () => window.open(blogUrl, '_blank');
                website.style.cursor = "pointer";
                website.classList.remove("unavailable");
                website.title = "Visit website";
            } else {
                website.innerHTML = `<i class="ri-link"></i> <span class="link-text">Not Available</span>`;
                website.onclick = null;
                website.style.cursor = "default";
                website.classList.add("unavailable");
                website.classList.remove('clickable');
                website.title = "";
            }
        }

        // Handle Twitter
        if (twitter) {
            if (checkNull(data?.twitter_username, twitter)) {
                // Find or create the text element
                let linkTextEl = twitter.querySelector('.link-text');
                if (!linkTextEl) {
                    twitter.innerHTML = `<i class="ri-twitter-x-fill"></i> <span class="link-text">@${data?.twitter_username}</span>`;
                    linkTextEl = twitter.querySelector('.link-text');
                } else {
                    linkTextEl.textContent = `@${data?.twitter_username}`;
                }
                
                twitter.classList.add('clickable');
                twitter.onclick = () => window.open(`https://twitter.com/${data?.twitter_username}`, '_blank');
                twitter.style.cursor = "pointer";
                twitter.classList.remove("unavailable");
                twitter.title = "Visit Twitter profile";
            } else {
                twitter.innerHTML = `<i class="ri-twitter-x-fill"></i> <span class="link-text">Not Available</span>`;
                twitter.onclick = null;
                twitter.style.cursor = "default";
                twitter.classList.add("unavailable");
                twitter.classList.remove('clickable');
                twitter.title = "";
            }
        }

        // Handle company
        if (company) {
            // Find or create the text element
            let linkTextEl = company.querySelector('.link-text');
            if (!linkTextEl) {
                company.innerHTML = `<i class="ri-building-line"></i> <span class="link-text">${checkNull(data?.company, company) ? data?.company : "Not Available"}</span>`;
            } else {
                linkTextEl.textContent = checkNull(data?.company, company) ? data?.company : "Not Available";
            }
            
            if (!data?.company) company.classList.add("unavailable");
            else company.classList.remove("unavailable");
        }
    } else {
        showError("No profile with this username");
    }
}

// Format URL for display
function formatUrl(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
}

// Ensure URL has http/https prefix
function ensureHttpPrefix(url) {
    if (!url) return "#";
    if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
    }
    return url;
}

// Add user to search history
function addToSearchHistory(userData) {
    const searches = getRecentSearches();
    
    // Remove if already exists
    const existingIndex = searches.findIndex(username => username === userData.login);
    if (existingIndex !== -1) {
        searches.splice(existingIndex, 1);
    }
    
    // Add to beginning of array
    searches.unshift(userData.login);
    
    // Keep only the most recent 5 searches
    const recentSearches = searches.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('gitters-recent-searches', JSON.stringify(recentSearches));
    
    // Update UI
    updateSearchHistoryUI();
}

// Get recent searches from localStorage
function getRecentSearches() {
    const searches = localStorage.getItem('gitters-recent-searches');
    return searches ? JSON.parse(searches) : [];
}

// Load search history from localStorage and update UI
function loadSearchHistory() {
    updateSearchHistoryUI();
}

// Update search history UI
async function updateSearchHistoryUI() {
    if (!searchHistory) return;
    
    const searches = getRecentSearches();
    searchHistory.innerHTML = '';
    
    const recentSearchesContainer = get("recentSearches");
    if (searches.length === 0) {
        if (recentSearchesContainer) {
            recentSearchesContainer.style.display = 'none';
        }
        return;
    }
    
    if (recentSearchesContainer) {
        recentSearchesContainer.style.display = 'block';
    }
    
    for (const username of searches) {
        try {
            // Create history item element
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Try to fetch mini avatar
            try {
                const response = await fetch(`${url}${username}`);
                const userData = await response.json();
                
                if (response.ok) {
                    const avatar = document.createElement('img');
                    avatar.src = userData.avatar_url;
                    avatar.className = 'history-avatar';
                    historyItem.appendChild(avatar);
                } else {
                    // Use placeholder if user data unavailable
                    const avatar = document.createElement('img');
                    avatar.src = "/api/placeholder/30/30";
                    avatar.className = 'history-avatar';
                    historyItem.appendChild(avatar);
                }
            } catch (error) {
                // Use placeholder on error
                const avatar = document.createElement('img');
                avatar.src = "/api/placeholder/30/30";
                avatar.className = 'history-avatar';
                historyItem.appendChild(avatar);
            }
            
            // Add username text
            historyItem.appendChild(document.createTextNode(username));
            
            // Add click event
            historyItem.addEventListener('click', () => {
                input.value = username;
                getUserData(url + username);
            });
            
            searchHistory.appendChild(historyItem);
        } catch (error) {
            console.error("Error updating history item:", error);
        }
    }
}

// Theme functionality
function toggleTheme() {
    const body = document.body;
    const themeText = themeSwitch.querySelector('.theme-text');
    const themeIcon = themeSwitch.querySelector('i');
    
    body.classList.toggle('dark');
    
    if (body.classList.contains('dark')) {
        if (themeText) themeText.textContent = 'LIGHT';
        if (themeIcon) themeIcon.className = 'ri-sun-line';
        localStorage.setItem('gitters-theme', 'dark');
    } else {
        if (themeText) themeText.textContent = 'DARK';
        if (themeIcon) themeIcon.className = 'ri-moon-line';
        localStorage.setItem('gitters-theme', 'light');
    }
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('gitters-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeText = themeSwitch.querySelector('.theme-text');
    const themeIcon = themeSwitch.querySelector('i');
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        document.body.classList.add('dark');
        if (themeText) themeText.textContent = 'LIGHT';
        if (themeIcon) themeIcon.className = 'ri-sun-line';
    } else {
        document.body.classList.remove('dark');
        if (themeText) themeText.textContent = 'DARK';
        if (themeIcon) themeIcon.className = 'ri-moon-line';
    }
}

document.addEventListener('DOMContentLoaded', initApp);