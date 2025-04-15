export const processUserData = (users) => users.map(user => ({ ...user, active: true }));

// Fetch actual user posts from JSONPlaceholder API
export const fetchUserPosts = async (userId) => {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const posts = await response.json();
        return posts.map(post => post.title); // Extract and return post titles
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Return empty array on error
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
