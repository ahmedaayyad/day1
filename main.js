import { processUserData, fetchUserPosts, createUserProfileHTML, createStateManager } from './userFunctions.js';
import { users, sampleUser } from './data.js';

const initUsersTable = (processedUsers, tableElement) => {
    console.log('Initializing users table with:', processedUsers);
    processedUsers.forEach((user, index) => {
        const { id, fullName, email } = user;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${fullName}</td>
            <td>${email}</td>
            <td><button class="action-btn view-btn" data-index="${index}" aria-label="View user ${fullName}">View</button></td>
        `;
        tableElement.appendChild(row);
    });
    console.log('Users table initialized:', tableElement.innerHTML);
};

const displayUserPosts = (postsListElement, postTitles) => {
    console.log('Displaying posts:', postTitles);
    postsListElement.innerHTML = '';
    postTitles.slice(0, 8).forEach((title) => {
        const li = document.createElement('li');
        li.textContent = `${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`;
        postsListElement.appendChild(li);
    });
    console.log('Posts list updated:', postsListElement.innerHTML);
};

const handleProfileUpdate = (profileElement, user, logFn) => {
    console.log('Updating profile for user:', user);
    profileElement.innerHTML = createUserProfileHTML(user);
    const toggleBtn = profileElement.querySelector('.toggle-status-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            user.active = !user.active;
            handleProfileUpdate(profileElement, user, logFn);
            logFn(`User status toggled: ${user.fullName} is now ${user.active ? 'Active' : 'Inactive'}`);
        });
    }
    console.log('Profile updated:', profileElement.innerHTML);
};

const setupViewButtons = (processedUsers, profileElement, logFn) => {
    console.log('Setting up view buttons for users:', processedUsers);
    const buttons = document.querySelectorAll('.view-btn');
    console.log('Found view buttons:', buttons);
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const { id, fullName, email } = processedUsers[index];
            const [first, last = ''] = fullName.split(' ');
            const featuredUser = { id, first, last, email, position: 'Team Member', active: true, fullName };
            handleProfileUpdate(profileElement, featuredUser, logFn);
            logFn(`User displayed: ${featuredUser.fullName}`);
        });
    });
};

const setupStateManagement = ({ initial, current }, stateManager, logFn) => {
    console.log('Setting up state management with initial state:', stateManager.getState());
    initial.textContent = JSON.stringify(stateManager.getState(), null, 2);
    current.textContent = JSON.stringify(stateManager.getState(), null, 2);
    stateManager.subscribe((state) => {
        current.textContent = JSON.stringify(state, null, 2);
        logFn(`State updated: ${JSON.stringify(state)}`);
    });
    setTimeout(() => stateManager.setState({ status: 'Active' }), 1000);
    setTimeout(() => stateManager.setState({ lastSeen: new Date().toLocaleString() }), 2000);
};

const createLogger = (consoleElement) => {
    const logMessages = [];
    return (message) => {
        const time = new Date().toLocaleTimeString();
        logMessages.push({ time, message });
        consoleElement.textContent += `${time} - ${message}\n`;
        consoleElement.scrollTop = consoleElement.scrollHeight;
        console.log(`Log: ${time} - ${message}`);
        return logMessages;
    };
};

const formatLogs = (consoleElement, logMessages) => {
    console.log('Formatting logs:', logMessages);
    consoleElement.textContent = logMessages.map(msg => `${msg.time} - ${msg.message}`).join('\n');
    consoleElement.scrollTop = consoleElement.scrollHeight;
};

const exportData = async (consoleElement, processedUsers, currentUser, stateManager, logFn) => {
    console.log('Exporting data...');
    const posts = await fetchUserPosts(1);
    consoleElement.textContent = `
Team Members: ${JSON.stringify(processedUsers, null, 2)}
User Profile: ${createUserProfileHTML(currentUser)}
Initial State: ${JSON.stringify(stateManager.getState(), null, 2)}
Recent Posts: ${JSON.stringify(posts.slice(0, 8), null, 2)}
    `;
    consoleElement.scrollTop = consoleElement.scrollHeight;
    logFn('Data exported');
};

const handleRefresh = async (postsListElement, logFn) => {
    logFn('Data refreshed');
    try {
        const titles = await fetchUserPosts(1);
        displayUserPosts(postsListElement, titles);
        logFn(`Refreshed ${titles.length} posts`);
    } catch (error) {
        logFn(`Refresh error: ${error.message}`);
    }
};

const initializeApp = async () => {
    console.log('Initializing app...');
    const processedUsers = processUserData(users);
    const usersTable = document.getElementById('processed-users');
    const postsList = document.getElementById('user-posts');
    const profileDisplay = document.getElementById('user-profile');
    const consoleOutput = document.querySelector('.logs-card pre');
    const stateElements = { initial: document.getElementById('initial-state'), current: document.getElementById('current-state') };
    let currentFeaturedUser = sampleUser;

    if (!usersTable || !postsList || !profileDisplay || !consoleOutput) {
        console.error('One or more DOM elements not found:', { usersTable, postsList, profileDisplay, consoleOutput });
        return;
    }

    const log = createLogger(consoleOutput);

    log('System initialized');
    log(`Loaded ${processedUsers.length} team members`);

    console.log('Processed users:', processedUsers);
    initUsersTable(processedUsers, usersTable);

    try {
        const titles = await fetchUserPosts(1);
        log(`Fetched ${titles.length} posts`);
        displayUserPosts(postsList, titles);
    } catch (error) {
        log(`Error fetching posts: ${error.message}`);
    }

    handleProfileUpdate(profileDisplay, currentFeaturedUser, log);
    setupViewButtons(processedUsers, profileDisplay, log);

    const userState = createStateManager({ name: 'Alex', status: 'Inactive' });
    setupStateManagement(stateElements, userState, log);

    log(`Profile displayed: ${currentFeaturedUser.fullName}`);

    document.getElementById('format-logs').addEventListener('click', () => formatLogs(consoleOutput, log('Formatting logs')));
    document.getElementById('export-data').addEventListener('click', () => exportData(consoleOutput, processedUsers, currentFeaturedUser, userState, log));
    document.querySelector('.refresh-btn').addEventListener('click', () => handleRefresh(postsList, log));
};

initializeApp().catch(error => console.error('App initialization failed:', error));
