const API_URLS = {
  auth: 'https://functions.poehali.dev/8c76c606-38f2-4740-90e4-e062821995d9',
  users: 'https://functions.poehali.dev/0a02feff-1209-485f-8975-16742c2df63f',
  chats: 'https://functions.poehali.dev/e338b3a1-5223-4fea-a10f-5abfe57129c8',
  messages: 'https://functions.poehali.dev/91cb650c-3aa9-4d2f-b91f-947de3eecde2',
  upload: 'https://functions.poehali.dev/1b760d3d-9050-46b2-b241-ea62855a5d16',
};

export const api = {
  async register(username: string, email: string, password: string, firstName: string, lastName?: string) {
    const res = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, email, password, firstName, lastName }),
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    return res.json();
  },

  async searchUsers(query: string, userId?: number) {
    const params = new URLSearchParams({ search: query });
    const headers: HeadersInit = {};
    if (userId) headers['X-User-Id'] = String(userId);
    
    const res = await fetch(`${API_URLS.users}?${params}`, { headers });
    return res.json();
  },

  async updateUser(userId: number, updates: any) {
    const res = await fetch(API_URLS.users, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    return res.json();
  },

  async blockUser(blockerId: number, blockedId: number) {
    const res = await fetch(API_URLS.users, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block', blockerId, blockedId }),
    });
    return res.json();
  },

  async getChats(userId: number) {
    const res = await fetch(API_URLS.chats, {
      headers: { 'X-User-Id': String(userId) },
    });
    return res.json();
  },

  async createChat(user1Id: number, user2Id: number) {
    const res = await fetch(API_URLS.chats, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1Id, user2Id }),
    });
    return res.json();
  },

  async getMessages(chatId: number) {
    const params = new URLSearchParams({ chatId: String(chatId) });
    const res = await fetch(`${API_URLS.messages}?${params}`);
    return res.json();
  },

  async sendMessage(chatId: number, senderId: number, text: string) {
    const res = await fetch(API_URLS.messages, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, senderId, text }),
    });
    return res.json();
  },

  async uploadAvatar(file: string, type: string) {
    const res = await fetch(API_URLS.upload, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, type }),
    });
    return res.json();
  },
};
