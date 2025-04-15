import { processUserData, fetchUserPosts, createUserProfileHTML, createStateManager } from './userFunctions.js';
import { users, sampleUser } from './data.js';

// Function to initialize users table (Data Transformation) - Added avatar column
const initUsersTable = (processedUsers, tableElement) => {
    processedUsers.forEach((user, index) => {
        const { id, fullName, email, avatar } = user; // Destructuring
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td><img src="${avatar}" alt="Avatar of ${fullName}" class="table-avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px; vertical-align: middle;">${fullName}</td>
            <td>${email}</td>
            <td><button class="action-btn view-btn" data-index="${index}" aria-label="View user ${fullName}">View</button></td>
        `;
        tableElement.appendChild(row);
    });
};

// Function to display user posts (Async Data Fetching with Promises)
const displayUserPosts = (postsListElement, postTitles) => {
    postsListElement.innerHTML = '';
    postTitles.slice(0, 8).forEach((title) => {
        const li = document.createElement('li');
        li.textContent = `${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`;
        postsListElement.appendChild(li);
    });
};

// Function to handle profile updates (React-like pattern: state update triggers UI re-render)
const handleProfileUpdate = (profileElement, user, logFn) => {
    profileElement.innerHTML = createUserProfileHTML(user);
    const toggleBtn = profileElement.querySelector('.toggle-status-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            user.active = !user.active;
            handleProfileUpdate(profileElement, user, logFn);
            logFn(`User status toggled: ${user.fullName} is now ${user.active ? 'Active' : 'Inactive'}`);
        });
    }
};

// Function to handle view button clicks (Event handling with arrow functions)
const setupViewButtons = (processedUsers, profileElement, logFn) => {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const { id, fullName, email, avatar } = processedUsers[index]; // Destructuring
            const [first, last = ''] = fullName.split(' ');
            const featuredUser = { id, first, last, email, position: 'Team Member', active: true, fullName, avatar };
            handleProfileUpdate(profileElement, featuredUser, logFn);
            logFn(`User displayed: ${featuredUser.fullName}`);
        });
    });
};

// Function to manage state updates (State Management with React-like subscription pattern)
const setupStateManagement = ({ initial, current }, stateManager, logFn) => {
    initial.textContent = JSON.stringify(stateManager.getState(), null, 2);
    current.textContent = JSON.stringify(stateManager.getState(), null, 2);
    stateManager.subscribe((state) => {
        current.textContent = JSON.stringify(state, null, 2);
        logFn(`State updated: ${JSON.stringify(state)}`);
    });
    setTimeout(() => stateManager.setState({ status: 'Active' }), 1000);
    setTimeout(() => stateManager.setState({ lastSeen: new Date().toLocaleString() }), 2000);
};

// Function to handle logging (Utility function with closure)
const createLogger = (consoleElement) => {
    const logMessages = [];
    return (message) => {
        const time = new Date().toLocaleTimeString();
        logMessages.push({ time, message });
        consoleElement.textContent += `${time} - ${message}\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
        return logMessages;
    };
};

// Function to format logs
const formatLogs = (consoleElement, logMessages) => {
    consoleElement.textContent = logMessages.map(msg => `${msg.time} - ${msg.message}`).join('\n');
    consoleElement.scrollTop = consoleElement.scrollHeight;
};

// Function to export data (Async/Await)
const exportData = async (consoleElement, processedUsers, currentUser, stateManager, logFn) => {
    const posts = await fetchUserPosts(1).catch(() => []);
    consoleElement.textContent = `
Team Members: ${JSON.stringify(processedUsers, null, 2)}
User Profile: ${createUserProfileHTML(currentUser)}
Initial State: ${JSON.stringify(stateManager.getState(), null, 2)}
Recent Posts: ${JSON.stringify(posts.slice(0, 8), null, 2)}
    `;
    consoleElement.scrollTop = consoleElement.scrollHeight;
    logFn('Data exported');
};

// Function to handle refresh (Async Data Fetching with Promises)
const handleRefresh = (postsListElement, logFn) => {
    logFn('Data refreshed');
    fetchUserPosts(1)
        .then((titles) => {
            displayUserPosts(postsListElement, titles);
            logFn(`Refreshed ${titles.length} posts`);
        })
        .catch((error) => logFn(`Refresh error: ${error}`));
};

// Main initialization function (Orchestrates the app)
const initializeApp = () => {
    const processedUsers = processUserData(users);
    const usersTable = document.getElementById('processed-users');
    const postsList = document.getElementById('user-posts');
    const profileDisplay = document.getElementById('user-profile');
    const consoleOutput = document.querySelector('.logs-card pre');
    const stateElements = { initial: document.getElementById('initial-state'), current: document.getElementById('current-state') };
    let currentFeaturedUser = sampleUser;
    const log = createLogger(consoleOutput);

    initUsersTable(processedUsers, usersTable);
    fetchUserPosts(1).then((titles) => displayUserPosts(postsList, titles));
    handleProfileUpdate(profileDisplay, currentFeaturedUser, log);
    setupViewButtons(processedUsers, profileDisplay, log);
    const userState = createStateManager({ name: 'Alex', status: 'Inactive' });
    setupStateManagement(stateElements, userState, log);

    log('System initialized');
    log(`Loaded ${processedUsers.length} team members`);
    fetchUserPosts(1)
        .then((titles) => log(`Fetched ${titles.length} posts`))
        .catch((error) => log(`Error fetching posts: ${error}`));
    log(`Profile displayed: ${currentFeaturedUser.fullName}`);

    document.getElementById('format-logs').addEventListener('click', () => formatLogs(consoleOutput, log('Formatting logs')));
    document.getElementById('export-data').addEventListener('click', () => exportData(consoleOutput, processedUsers, currentFeaturedUser, userState, log));
    document.querySelector('.refresh-btn').addEventListener('click', () => handleRefresh(postsList, log));
};

// Start the application
initializeApp();
