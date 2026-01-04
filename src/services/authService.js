// Mock Authentication Service
// In the future, this will connect to the real backend API

const authService = {
    login: async (email, password) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: '1',
                    name: 'Member',
                    email: email,
                    avatar: 'https://github.com/shadcn.png',
                    role: 'user'
                };
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', 'mock-jwt-token');
                resolve(user);
            }, 800);
        });
    },

    register: async (email, password, name) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: '2',
                    name: name,
                    email: email,
                    avatar: 'https://github.com/shadcn.png',
                    role: 'user'
                };
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', 'mock-jwt-token');
                resolve(user);
            }, 800);
        });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Optional: clear watch history?
        // localStorage.removeItem('cw_history'); 
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default authService;
