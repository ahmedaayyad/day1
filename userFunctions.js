export const processUserData = (users) => users.map(user => ({ ...user, active: true }));

export const fetchUserPosts = async (userId) => {
    try {
        console.log(`Fetching posts for userId: ${userId}`);
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();
        console.log(`Fetched ${posts.length} posts for userId ${userId}:`, posts);
        return posts.map(post => post.title);
    } catch (error) {
        console.error(`Error fetching posts for userId ${userId}:`, error.message);
        // Fallback data if API fetch fails
        return [
            'Fallback Post 1: Introduction to JavaScript',
            'Fallback Post 2: Understanding ES6 Features',
            'Fallback Post 3: Working with Promises'
        ];
    }
};

export const createUserProfileHTML = (user) => {
    const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(user.fullName)}`;
    return `
    <div class="profile-card">
        <img src="${avatarUrl}" alt="Profile picture of ${user.fullName}" class="profile-pic${!user.active ? ' status-inactive' : ''}">
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
};

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
