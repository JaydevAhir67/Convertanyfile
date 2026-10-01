/**
 * ConvertAnyFile - Authentication Client Controller
 * Communicates with PHP /api/auth endpoints
 */

const AuthController = {
  currentUser: null,

  async checkSession() {
    try {
      const res = await fetch('api/auth/session.php');
      const data = await res.json();
      if (data.authenticated && data.user) {
        this.currentUser = data.user;
        this.updateUI();
      } else {
        this.currentUser = null;
        this.updateUI();
      }
    } catch (e) {
      console.warn('Session check error:', e);
    }
  },

  async login(email, password) {
    const res = await fetch('api/auth/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }
    this.currentUser = data.user;
    this.updateUI();
    return data.user;
  },

  async register(name, email, password) {
    const res = await fetch('api/auth/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed');
    }
    this.currentUser = data.user;
    this.updateUI();
    return data.user;
  },

  async logout() {
    await fetch('api/auth/logout.php', { method: 'POST' });
    this.currentUser = null;
    this.updateUI();
  },

  updateUI() {
    const userContainer = document.getElementById('nav-user-container');
    if (!userContainer) return;

    if (this.currentUser) {
      userContainer.innerHTML = `
        <span class="user-badge" style="font-size: 12px; color: #38bdf8; font-weight: 600;">${this.currentUser.name}</span>
        <button onclick="AuthController.logout()" class="btn-secondary" style="font-size: 11px; padding: 4px 10px; margin-left: 8px; border-radius: 6px; border: 1px solid #475569; color: #cbd5e1;">Logout</button>
      `;
    } else {
      userContainer.innerHTML = `
        <button onclick="openAuthModal('login')" class="btn-primary" style="font-size: 12px; padding: 6px 14px; border-radius: 8px; background: #06b6d4; color: #0f172a; font-weight: 700;">Sign In</button>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AuthController.checkSession();
});
