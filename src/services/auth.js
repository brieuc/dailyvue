// src/services/auth.js
export const authService = {
  async login(username, password) {

    // Pas d'auth header pour le login
    const response = await fetch(`${process.env.VUE_APP_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          username: username,
          password: password
        })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.token;
  },

  logout() {
    localStorage.removeItem('token');
  },

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
};