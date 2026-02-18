/**
 * MockApiService simulating backend behavior.
 * Stores data in memory for the session.
 */

const USERS = [
    {
        id: "u1",
        name: "Alex Dev",
        handle: "alex_code",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        verified: true,
    },
    {
        id: "u2",
        name: "Sarah Design",
        handle: "sarah_ux",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        verified: false,
    },
    {
        id: "u3",
        name: "Tech News",
        handle: "technews_es",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
        verified: true,
    },
];

const POSTS = [
    {
        id: "p1",
        userId: "u1",
        content: "Just finished building a new feature for the DevNet FP project! 🚀 #coding #react",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        likes: 12,
        reposts: 2,
        replies: 1,
        image: null,
    },
    {
        id: "p2",
        userId: "u3",
        content: "Breaking: New version of React just dropped. Here is what you need to know. 👇\n\n1. Server Components are stable\n2. New Hook APIs\n3. Improved Hydration",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        likes: 342,
        reposts: 89,
        replies: 45,
        image: null,
    },
    {
        id: "p2b",
        userId: "u2",
        content: "Can someone help me with this CSS Grid layout? It is driving me crazy 😅",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        likes: 5,
        reposts: 0,
        replies: 3,
        image: "https://placehold.co/600x400/16181c/e7e9ea?text=CSS+Grid+Error",
    }
];

const TRENDS = [
    { topic: "Programming", name: "#DevNetFP", posts: "2,456 posts" },
    { topic: "Technology", name: "ChatGPT 5", posts: "145k posts" },
    { topic: "Politics", name: "Elections", posts: "54k posts" },
    { topic: "Entertainment", name: "Star Wars", posts: "12k posts" },
];

class MockApiService {
    constructor() {
        this.posts = [...POSTS];
        this.currentUser = {
            id: "me",
            name: "Pol User",
            handle: "pol_dev",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pol",
            verified: false,
        };
    }

    getCurrentUser() {
        return Promise.resolve(this.currentUser);
    }

    getPosts() {
        // Sort by newest
        const sorted = [...this.posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Enrich with user data
        const enriched = sorted.map(post => {
            const user = USERS.find(u => u.id === post.userId) || this.currentUser;
            return { ...post, user };
        });

        return Promise.resolve(enriched);
    }

    createPost(content) {
        const newPost = {
            id: `p${Date.now()}`,
            userId: this.currentUser.id,
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            reposts: 0,
            replies: 0,
            image: null,
        };
        this.posts.unshift(newPost);
        return Promise.resolve({ ...newPost, user: this.currentUser });
    }

    toggleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (post.likedByMe) {
                post.likes--;
                post.likedByMe = false;
            } else {
                post.likes++;
                post.likedByMe = true;
            }
            return Promise.resolve(post);
        }
        return Promise.reject("Post not found");
    }

    getTrends() {
        return Promise.resolve(TRENDS);
    }

    getWhoToFollow() {
        return Promise.resolve(USERS.slice(0, 3));
    }
}

export const mockApi = new MockApiService();
