export const processUserData = (users) => users.map(user => ({ ...user, active: true }));

export const fetchUserPosts = async (userId) => {
    try {
        console.log(`Fetching posts for userId: ${userId}`); // Debug log
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();
        console.log(`Fetched ${posts.length} posts for userId ${userId}:`, posts); // Debug log
        return posts.map(post => post.title);
    } catch (error) {
        console.error(`Error fetching posts for userId ${userId}:`, error.message); // Debug log
        return [];
    }
};

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
