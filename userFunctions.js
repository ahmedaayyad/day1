// Data transformation
export const processUserData = (users) => users.map(user => ({ ...user, active: true }));

// Async data fetching
export const fetchUserPosts = (userId) => new Promise((resolve) => {
    setTimeout(() => {
        resolve([
            'Post 1: Introduction to JavaScript',
            'Post 2: Understanding ES6 Features',
            'Post 3: Working with Promises',
            'Post 4: Async/Await in Action',
            'Post 5: State Management Basics',
            'Post 6: React Patterns',
            'Post 7: Modern Web Development',
            'Post 8: JavaScript Best Practices'
        ]);
    }, 1000);
});

// Data transformation to HTML (Updated to use avatar)
export const createUserProfileHTML = (user) => `
    <div class="profile-card">
        <img src="${user.avatar}" alt="Profile picture of ${user.fullName}" class="profile-pic${!user.active ? ' status-inactive' : ''}">
        <div class="profile-info">
            <h3>${user.fullName}</h3>
            <p>Email: ${user.email}</p>
            <p>Position: ${user.position}</p>
            <span class="status${user.active ? ' status-active' : ' status-inactive'}">${user.active ? 'Active' : 'Inactive'}</span>
        </div>
        <button class="action-btn toggle-status-btn${user.active ? ' status-active' : ' status-inactive'}" aria-label="Toggle status for ${user.fullName}">
            Toggle Status
        </button>
    </div>
`;

// State management
export const createStateManager = (initialState) => {
    let state = { ...initialState };
    const subscribers = [];
    return {
        getState: () => state,
        setState: (newState) => {
            state = { ...state, ...newState };
            subscribers.forEach(callback => callback(state));
        },
        subscribe: (callback) => {
            subscribers.push(callback);
        }
    };
};
