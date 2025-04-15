import {
    processUserData,
    fetchUserPosts,
    createUserProfileHTML,
    createStateManager,
} from './userFunctions.js';
import { users, sampleUser } from './data.js';

// Function to initialize users table
function initUsersTable(processedUsers, tableElement) {
    processedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td><button class="action-btn view-btn" data-index="${index}">View</button></td>
        `;
        tableElement.appendChild(row);
    });
}

// Function to display user posts
function displayUserPosts(postsListElement, postTitles) {
    postsListElement.innerHTML = '';
    postTitles.slice(0, 8).forEach((title) => {
        const li = document.createElement('li');
        li.textContent = `${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`;
        postsListElement.appendChild(li);
    });
}

// Function to handle profile updates
function handleProfileUpdate(profileElement, user, logFn) {
    profileElement.innerHTML = createUserProfileHTML(user);
    const toggleBtn = profileElement.querySelector('.toggle-status-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            user.active = !user.active;
            handleProfileUpdate(profileElement, user, logFn);
            logFn(`User status toggled: ${user.fullName} is now ${user.active ? 'Active' : 'Inactive'}`);
        });
    }
}

// Function to handle view button clicks
function setupViewButtons(processedUsers, profileElement, logFn) {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const selectedUser = processedUsers[index];
            const featuredUser = {
                id: selectedUser.id,
                first: selectedUser.fullName.split(' ')[0],
                last: selectedUser.fullName.split(' ')[1] || '',
                email: selectedUser.email,
                position: 'Team Member',
                active: true,
                fullName: selectedUser.fullName
            };
            handleProfileUpdate(profileElement, featuredUser, logFn);
            logFn(`User displayed: ${featuredUser.fullName}`);
        });
    });
}

// Function to manage state updates
function setupStateManagement(stateElements, stateManager, logFn) {
    stateElements.initial.textContent = JSON.stringify(stateManager.getState(), null, 2);
    stateElements.current.textContent = JSON.stringify(stateManager.getState(), null, 2);
    
    stateManager.subscribe((state) => {
        stateElements.current.textContent = JSON.stringify(state, null, 2);
        logFn(`Status updated: ${JSON.stringify(state)}`);
    });

    setTimeout(() => stateManager.setState({ status: 'Active' }), 1000);
    setTimeout(() => stateManager.setState({ lastSeen: new Date().toLocaleString() }), 2000);
}

// Function to handle logging
function createLogger(consoleElement) {
    const logMessages = [];
    return (message) => {
        const time = new Date().toLocaleTimeString();
        logMessages.push({ time, message });
        consoleElement.textContent += `${time} - ${message}\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
        return logMessages;
    };
}

// Function to format logs
function formatLogs(consoleElement, logMessages) {
    consoleElement.textContent = logMessages.map(msg => `${msg.time} - ${msg.message}`).join('\n');
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Function to export data
async function exportData(consoleElement, processedUsers, currentUser, stateManager, logFn) {
    const posts = await fetchUserPosts(1).catch(() => []);
    consoleElement.textContent = `
Processed Users: ${JSON.stringify(processedUsers, null, 2)}
User Profile HTML: ${createUserProfileHTML(currentUser)}
Initial State: ${JSON.stringify(stateManager.getState(), null, 2)}
User Posts: ${JSON.stringify(posts.slice(0, 8), null, 2)}
    `;
    consoleElement.scrollTop = consoleElement.scrollHeight;
    logFn('Data exported');
}

// Function to handle refresh
function handleRefresh(postsListElement, logFn) {
    logFn('Data refreshed');
    fetchUserPosts(1)
        .then((titles) => {
            displayUserPosts(postsListElement, titles);
            logFn(`Refreshed ${titles.length} posts`);
        })
        .catch((error) => logFn(`Refresh error: ${error}`));
}

// Main initialization function
function initializeApp() {
    const processedUsers = processUserData(users);
    const usersTable = document.getElementById('processed-users');
    const postsList = document.getElementById('user-posts');
    const profileDisplay = document.getElementById('user-profile');
    const consoleOutput = document.getElementById('console-output');
    const stateElements = {
        initial: document.getElementById('initial-state'),
        current: document.getElementById('current-state')
    };
    let currentFeaturedUser = sampleUser;
    
    const log = createLogger(consoleOutput);

    // Initialize components
    initUsersTable(processedUsers, usersTable);
    fetchUserPosts(1).then((titles) => displayUserPosts(postsList, titles));
    handleProfileUpdate(profileDisplay, currentFeaturedUser, log);
    setupViewButtons(processedUsers, profileDisplay, log);
    
    const userState = createStateManager({ name: 'Alex', status: 'Inactive' });
    setupStateManagement(stateElements, userState, log);

    // Initial logs
    log('System initialized');
    log(`Loaded ${processedUsers.length} active users`);
    fetchUserPosts(1)
        .then((titles) => log(`Fetched ${titles.length} posts`))
        .catch((error) => log(`Error fetching posts: ${error}`));
    log(`Profile displayed: ${currentFeaturedUser.fullName}`);

    // Event listeners
    document.getElementById('format-logs').addEventListener('click', () => 
        formatLogs(consoleOutput, log('Formatting logs')));
    document.getElementById('export-data').addEventListener('click', () => 
        exportData(consoleOutput, processedUsers, currentFeaturedUser, userState, log));
    document.querySelector('.refresh-btn').addEventListener('click', () => 
        handleRefresh(postsList, log));
}

// Start the application
initializeApp();