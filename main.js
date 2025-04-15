import { processUserData, fetchUserPosts, createUserProfileHTML, createStateManager } from './userFunctions.js';
import { users, sampleUser } from './data.js';

const initUsersTable = (processedUsers, tableElement) => {
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
};

const displayUserPosts = (postsListElement, postTitles) => {
    postsListElement.innerHTML = '';
    postTitles.slice(0, 8).forEach((title) => {
        const li = document.createElement('li');
        li.textContent = `${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`;
        postsListElement.appendChild(li);
    });
};

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

const setupViewButtons = (processedUsers, profileElement, logFn) => {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const { id, fullName, email, avatar } = processedUsers[index];
            const [first, last = ''] = fullName.split(' ');
            const featuredUser = { id, first, last, email, position: 'Team Member', active: true, fullName, avatar };
            handleProfileUpdate(profileElement, featuredUser, logFn);
            logFn(`User displayed: ${featuredUser.fullName}`);
        });
    });
};

const setupStateManagement = ({ initial, current }, stateManager, logFn) => {
    initial.textContent = JSON.stringify(stateManager.getState(), null, 2);
    current.textContent = JSON.stringify(stateManager.getState(), null, 2);
    stateManager.subscribe((state) => {
        current.textContent = JSON.stringify(state, null, 2);
        logFn(`State updated: ${JSON.stringify(state)}`);
    });
    setTimeout(() => stateManager.setState({ status
