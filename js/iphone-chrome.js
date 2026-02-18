// ============================================
// TAB SWITCHING (inside app)
// ============================================
document.querySelectorAll('.tab-item').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ============================================
// TOGGLE -> INPUT VISIBILITY
// ============================================
document.querySelectorAll('[data-toggle-input]').forEach(toggle => {
  toggle.addEventListener('change', () => {
    const target = document.getElementById(toggle.dataset.toggleInput);
    if (target) target.classList.toggle('visible', toggle.checked);
  });
});

// ============================================
// THRESHOLD SLIDERS
// ============================================
const o2Slider = document.getElementById('o2Slider');
const o2Display = document.getElementById('o2ThresholdDisplay');
const o2Context = document.getElementById('o2Context');
o2Slider.addEventListener('input', () => {
  const v = parseInt(o2Slider.value);
  o2Display.textContent = v + '%';
  if (v >= 95) o2Context.textContent = `Alert when SpO2 drops below ${v}%. Very sensitive \u2014 may trigger often during sleep.`;
  else if (v >= 90) o2Context.textContent = `Alert when SpO2 drops below ${v}%. Recommended for general wellness monitoring.`;
  else if (v >= 85) o2Context.textContent = `Alert when SpO2 drops below ${v}%. Common threshold for sleep apnea monitoring.`;
  else o2Context.textContent = `Alert when SpO2 drops below ${v}%. Clinical threshold \u2014 only alerts on severe desaturation.`;
});

const pulseHighSlider = document.getElementById('pulseHighSlider');
const pulseHighDisplay = document.getElementById('pulseHighDisplay');
pulseHighSlider.addEventListener('input', () => {
  pulseHighDisplay.textContent = pulseHighSlider.value + ' bpm';
});

const pulseLowSlider = document.getElementById('pulseLowSlider');
const pulseLowDisplay = document.getElementById('pulseLowDisplay');
pulseLowSlider.addEventListener('input', () => {
  pulseLowDisplay.textContent = pulseLowSlider.value + ' bpm';
});

// ============================================
// HEALTH ALERT DISMISS
// ============================================
document.querySelectorAll('.health-alert-dismiss').forEach(btn => {
  btn.addEventListener('click', () => {
    const alert = btn.closest('.health-alert');
    alert.classList.add('dismissing');
    setTimeout(() => alert.remove(), 300);
  });
});

// ============================================
// AUTH MODAL
// ============================================
const authOverlay = document.getElementById('authOverlay');
const userIconBtn = document.getElementById('userIconBtn');
const authClose = document.getElementById('authClose');
let isLoggedIn = false;

userIconBtn.addEventListener('click', () => {
  if (isLoggedIn) {
    isLoggedIn = false;
    userIconBtn.classList.remove('logged-in');
    return;
  }
  authOverlay.classList.add('visible');
});

authClose.addEventListener('click', () => {
  authOverlay.classList.remove('visible');
});

authOverlay.addEventListener('click', (e) => {
  if (e.target === authOverlay) authOverlay.classList.remove('visible');
});

// Auth tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.auth === 'login' ? 'authLogin' : 'authRegister').classList.add('active');
  });
});

// Simulate sign in / register
document.querySelectorAll('.auth-submit, .auth-social').forEach(btn => {
  btn.addEventListener('click', () => {
    isLoggedIn = true;
    userIconBtn.classList.add('logged-in');
    authOverlay.classList.remove('visible');
  });
});
