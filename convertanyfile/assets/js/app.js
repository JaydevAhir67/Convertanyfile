/**
 * ConvertAnyFile - Main App Initializer
 */

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-title');
  const nameField = document.getElementById('auth-name-field');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (!modal) return;
  modal.style.display = 'flex';

  if (mode === 'register') {
    title.innerText = 'Create Local Account';
    nameField.style.display = 'block';
    submitBtn.innerText = 'Register';
    submitBtn.dataset.mode = 'register';
  } else {
    title.innerText = 'Sign In to ConvertAnyFile';
    nameField.style.display = 'none';
    submitBtn.innerText = 'Sign In';
    submitBtn.dataset.mode = 'login';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}

async function handleAuthSubmit() {
  const submitBtn = document.getElementById('auth-submit-btn');
  const mode = submitBtn.dataset.mode || 'login';
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value;

  try {
    if (mode === 'register') {
      await AuthController.register(name, email, password);
    } else {
      await AuthController.login(email, password);
    }
    closeAuthModal();
  } catch (err) {
    alert("Authentication error: " + err.message);
  }
}
