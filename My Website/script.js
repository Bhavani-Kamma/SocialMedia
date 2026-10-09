// =====================================================
// STORYVERSE - SIMPLE AUTHENTICATION + WEBSITE SCRIPT
// =====================================================

const USERS_KEY = "storyVerseUsers";
const CURRENT_USER_KEY = "storyVerseCurrentUser";
const PROFILES_KEY = "storyVerseProfiles";
let selectedPerson = "";
let pendingProfilePicture = "";

// ---------- AUTH ----------
function switchAuth(type) {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");

    document.getElementById("loginMessage").textContent = "";
    document.getElementById("signupMessage").textContent = "";

    if (type === "signup") {
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
        loginTab.classList.remove("active");
        signupTab.classList.add("active");
    } else {
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        signupTab.classList.remove("active");
        loginTab.classList.add("active");
    }
}

function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function validUsername(username) {
    return /^[A-Za-z0-9_.]{3,30}$/.test(username);
}

function validPassword(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password);
}

function usernameExists(username, users) {
    return users.some(function(user) {
        return user.username.toLowerCase() === username.toLowerCase();
    });
}

function makeSuggestions(username, users) {
    const ideas = [
        username + "01",
        username + "123",
        username + "2026",
        username + "_01",
        username + "_123",
        username + ".01",
        username + "_story",
        "the_" + username
    ];

    const suggestions = [];

    ideas.forEach(function(name) {
        if (suggestions.length < 4 && validUsername(name) && !usernameExists(name, users)) {
            suggestions.push(name);
        }
    });

    return suggestions;
}

function showSuggestions(username, users) {
    const message = document.getElementById("signupMessage");
    const suggestions = makeSuggestions(username, users);

    let html = "That username already exists.<br>Try one of these:<br>";

    suggestions.forEach(function(name) {
        html += `<button type="button" onclick="useSuggestion('${name}')">${name}</button>`;
    });

    message.innerHTML = html;
    message.className = "auth-message error";
}

function useSuggestion(name) {
    document.getElementById("signupUsername").value = name;
    document.getElementById("signupMessage").textContent = "Username selected: " + name;
    document.getElementById("signupMessage").className = "auth-message success";
}

function signup(event) {
    event.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("signupMessage");

    if (!validUsername(username)) {
        message.textContent = "Username must be 3-30 characters and use only letters, numbers, _ and .";
        message.className = "auth-message error";
        return;
    }

    if (!validPassword(password)) {
        message.textContent = "Password must be 8 or more characters and contain uppercase, lowercase, number and special character.";
        message.className = "auth-message error";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.className = "auth-message error";
        return;
    }

    const users = getUsers();

    if (usernameExists(username, users)) {
        showSuggestions(username, users);
        return;
    }

    users.push({ username: username, password: password });
    saveUsers(users);

    // Move to login on the SAME PAGE.
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = "";
    document.getElementById("signupUsername").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    switchAuth("login");
    document.getElementById("loginMessage").textContent = "Account created successfully! Please log in.";
    document.getElementById("loginMessage").className = "auth-message success";
}

function login(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");
    const users = getUsers();

    const user = users.find(function(item) {
        return item.username.toLowerCase() === username.toLowerCase();
    });

    if (!user) {
        message.textContent = "Username not found. Please sign up first.";
        message.className = "auth-message error";
        return;
    }

    if (user.password !== password) {
        message.textContent = "Incorrect password. Please try again.";
        message.className = "auth-message error";
        return;
    }

    // SUCCESS MESSAGE FIRST.
    message.textContent = "Successfully logged in to your account!";
    message.className = "auth-message success";

    localStorage.setItem(CURRENT_USER_KEY, user.username);

    // Open the website after the success message is visible.
    setTimeout(function() {
        enterWebsite(user.username);
    }, 900);
}

function enterWebsite(username) {
    // Completely replace the login view with the website view.
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    // Always start the website at the very top.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    loadProfile(username);
    showPage("home");
    closeStory();
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    document.getElementById("app").classList.add("hidden");
    document.getElementById("authScreen").classList.remove("hidden");
    document.getElementById("loginPassword").value = "";
    document.getElementById("loginMessage").textContent = "";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    switchAuth("login");
}

// ---------- WEBSITE ----------
function showPage(pageName) {
    document.querySelectorAll(".page").forEach(function(page) {
        page.classList.add("hidden");
    });

    const page = document.getElementById(pageName);
    if (page) page.classList.remove("hidden");
}

function openStory(title) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("storyModal").classList.remove("hidden");
}

function closeStory() {
    document.getElementById("storyModal").classList.add("hidden");
}

function like(button) {
    if (button.innerText.includes("♡")) {
        button.innerText = "♥ Liked";
    } else {
        button.innerText = "♡ Like";
    }
}

function shareStory(title) {
    alert("You shared: " + title);
}

function generateStory() {
    const title = document.getElementById("title").value.trim();
    const story = document.getElementById("story").value.trim();
    const genre = document.getElementById("genre").value;

    if (title === "" || story === "") {
        alert("Please enter a title and story.");
        return;
    }

    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUser) {
        const posts = getUserPosts(currentUser);
        posts.unshift({
            title: title,
            story: story,
            genre: genre,
            date: new Date().toLocaleDateString()
        });
        saveUserPosts(currentUser, posts);
    }

    const result = document.getElementById("result");
    result.innerHTML =
        "<h3>🎬 Your Reel is Ready!</h3>" +
        "<div class='animation'>✨🎬✨</div>" +
        "<h3>" + escapeHTML(title) + "</h3>" +
        "<p>Your story has been converted into a short animated preview.</p>" +
        "<button onclick=\"openStory('" + title.replace(/'/g, "\\'") + "')\">Watch Reel</button>";

    loadPosts(currentUser);
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ---------- PROFILE ----------
function getProfiles() {
    try {
        const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
        return profiles && typeof profiles === "object" ? profiles : {};
    } catch (error) {
        return {};
    }
}

function saveProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function profileKey(username) {
    return (username || "").toLowerCase();
}

function getProfile(username) {
    const profiles = getProfiles();
    const key = profileKey(username);
    return profiles[key] || {
        username: username,
        name: username,
        bio: "Tell everyone about your stories.",
        interests: "Fantasy, Mystery, Adventure",
        avatar: "👩🏻"
    };
}

function saveProfileData(username, profile) {
    const profiles = getProfiles();
    profiles[profileKey(username)] = profile;
    saveProfiles(profiles);
}

function getPosts() {
    try {
        const posts = JSON.parse(localStorage.getItem("storyVersePosts") || "{}");
        return posts && typeof posts === "object" ? posts : {};
    } catch (error) {
        return {};
    }
}

function savePosts(posts) {
    localStorage.setItem("storyVersePosts", JSON.stringify(posts));
}

function getUserPosts(username) {
    const posts = getPosts();
    return Array.isArray(posts[profileKey(username)]) ? posts[profileKey(username)] : [];
}

function saveUserPosts(username, userPosts) {
    const posts = getPosts();
    posts[profileKey(username)] = userPosts;
    savePosts(posts);
}

function loadProfile(username) {
    const profile = getProfile(username);
    document.getElementById("profileUsername").textContent = "@" + profile.username;
    document.getElementById("profileName").textContent = profile.name || profile.username;
    document.getElementById("profileBio").textContent = profile.bio || "Tell everyone about your stories.";
    document.getElementById("profileInterests").textContent = "🎭 Genres: " + (profile.interests || "Not added yet");
    setAvatarElement(document.getElementById("profileAvatar"), profile.avatar || "👩🏻");
    loadPosts(username);
}

function setAvatarElement(element, avatar) {
    if (!element) return;
    if (avatar && avatar.startsWith("data:image")) {
        element.innerHTML = "<img src=\"" + avatar + "\" alt=\"Profile picture\">";
    } else {
        element.textContent = avatar || "👩🏻";
    }
}

function openEditProfile() {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return;

    const profile = getProfile(username);
    document.getElementById("editUsername").value = profile.username;
    document.getElementById("editName").value = profile.name || "";
    document.getElementById("editBio").value = profile.bio || "";
    document.getElementById("editInterests").value = profile.interests || "";
    document.getElementById("profileSaveMessage").textContent = "";
    pendingProfilePicture = profile.avatar || "👩🏻";
    setAvatarElement(document.getElementById("editProfileAvatar"), pendingProfilePicture);
    document.getElementById("profilePictureInput").value = "";
    document.getElementById("editProfileModal").classList.remove("hidden");
}

function closeEditProfile() {
    document.getElementById("editProfileModal").classList.add("hidden");
}

function chooseAvatar(avatar) {
    pendingProfilePicture = avatar;
    setAvatarElement(document.getElementById("editProfileAvatar"), avatar);
}

function previewProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        pendingProfilePicture = e.target.result;
        setAvatarElement(document.getElementById("editProfileAvatar"), pendingProfilePicture);
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) return;

    const name = document.getElementById("editName").value.trim() || username;
    const bio = document.getElementById("editBio").value.trim() || "Tell everyone about your stories.";
    const interests = document.getElementById("editInterests").value.trim() || "Not added yet";

    const profile = {
        username: username,
        name: name,
        bio: bio,
        interests: interests,
        avatar: pendingProfilePicture || "👩🏻"
    };

    saveProfileData(username, profile);
    loadProfile(username);

    const message = document.getElementById("profileSaveMessage");
    message.textContent = "Profile updated successfully!";
    message.className = "auth-message success";

    setTimeout(function() {
        closeEditProfile();
    }, 700);
}

function loadPosts(username) {
    const container = document.getElementById("myPosts");
    if (!container || !username) return;

    const posts = getUserPosts(username);

    if (posts.length === 0) {
        container.innerHTML = "<p class='no-posts'>You have not created any posts yet. Create a story and it will appear here.</p>";
        return;
    }

    container.innerHTML = posts.map(function(post, index) {
        return "<article class='post-card'>" +
            "<div class='post-animation'>" + (index % 3 === 0 ? "✨📖✨" : index % 3 === 1 ? "🌙📚🌙" : "🚀📖🚀") + "</div>" +
            "<div class='post-details'>" +
            "<h3>" + escapeHTML(post.title) + "</h3>" +
            "<p class='post-genre'>🎭 " + escapeHTML(post.genre) + " • " + escapeHTML(post.date) + "</p>" +
            "<p>" + escapeHTML(post.story.length > 140 ? post.story.slice(0, 140) + "..." : post.story) + "</p>" +
            "<button onclick=\"openStory('" + post.title.replace(/'/g, "\\'") + "')\">▶ Watch</button>" +
            "</div></article>";
    }).join("");
}

function selectPerson(name) {
    selectedPerson = name;
    document.getElementById("person").innerText = "Chat with " + name;
    document.getElementById("messageArea").innerHTML = "<p class='received'>Hi! Did you read my latest story? 😊</p>";
}

function sendMessage() {
    const input = document.getElementById("message");
    const message = input.value.trim();

    if (message === "") return;

    if (selectedPerson === "") {
        alert("Select a person first.");
        return;
    }

    const p = document.createElement("p");
    p.className = "sent";
    p.textContent = message;
    document.getElementById("messageArea").appendChild(p);
    input.value = "";
}

// ---------- START ----------
document.addEventListener("DOMContentLoaded", function() {
    // Always show login first when the link is opened.
    document.getElementById("authScreen").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
    closeStory();

    document.getElementById("search").addEventListener("keyup", function() {
        const searchText = this.value.toLowerCase();
        document.querySelectorAll(".card").forEach(function(card) {
            card.style.display = card.innerText.toLowerCase().includes(searchText) ? "block" : "none";
        });
    });
});
