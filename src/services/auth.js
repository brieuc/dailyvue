// src/services/auth.js
export const authService = {
  async login(username, password) {

    // Pas d'auth header pour le login
    const response = await fetch(`${process.env.VUE_APP_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {username: username,
          password: password
        })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    console.log("token " + data.token);
    localStorage.setItem('token', data.token);
    return data.token;
  },

  logout() {
    console.log('Token supprimé:', Date.now());
    //localStorage.removeItem('token');
  },

  isLoggedIn() {
    console.log("Athsevice is loggin " + localStorage.getItem('token'));
    return !!localStorage.getItem('token');
  }
};