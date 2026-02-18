// ============================================
// THEME TOGGLE
// ============================================
const root = document.documentElement;

function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeIcon.innerHTML = theme === 'dark' ? '&#9790;' : '&#9788;';
    themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    localStorage.setItem('o2pulse-theme', theme);
    // Fire custom event so page-specific code can react
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Restore saved theme
  const saved = localStorage.getItem('o2pulse-theme');
  if (saved) setTheme(saved);
}

// ============================================
// SIMULATED VITAL SIGNS (shared state)
// ============================================
const vitals = {
  currentSpO2: 97,
  currentPulse: 72,
  o2History: [],
  pulseHistory: [],
  SPARK_POINTS: 20,
  listeners: [],

  update() {
    this.currentSpO2 += (Math.random() - 0.48) * 0.5;
    this.currentSpO2 = Math.max(85, Math.min(100, this.currentSpO2));

    this.currentPulse += (Math.random() - 0.5) * 2;
    this.currentPulse = Math.max(55, Math.min(110, this.currentPulse));

    this.o2History.push(this.currentSpO2);
    this.pulseHistory.push(this.currentPulse);
    if (this.o2History.length > this.SPARK_POINTS) this.o2History.shift();
    if (this.pulseHistory.length > this.SPARK_POINTS) this.pulseHistory.shift();

    const spo2 = Math.round(this.currentSpO2);
    const pulse = Math.round(this.currentPulse);

    this.listeners.forEach(fn => fn(spo2, pulse, this));
  },

  onUpdate(fn) {
    this.listeners.push(fn);
  },

  start() {
    this.update();
    setInterval(() => this.update(), 2000);
  }
};

// Color helpers
function getGaugeColor(spo2) {
  if (spo2 >= 90) return 'var(--green)';
  if (spo2 >= 82) return 'var(--yellow)';
  return 'var(--red)';
}

function getHexColor(spo2) {
  if (spo2 >= 90) return '#30d158';
  if (spo2 >= 82) return '#ffd60a';
  return '#ff3b30';
}

function getGlowColor(spo2) {
  if (spo2 >= 90) return 'rgba(48, 209, 88, 0.4)';
  if (spo2 >= 82) return 'rgba(255, 214, 10, 0.4)';
  return 'rgba(255, 59, 48, 0.4)';
}

function getStatusText(spo2) {
  if (spo2 >= 95) return 'Normal';
  if (spo2 >= 90) return 'Slightly Low';
  if (spo2 >= 82) return 'Warning';
  return 'Critical';
}

function getStatusBg(spo2) {
  if (spo2 >= 90) return 'rgba(48, 209, 88, 0.15)';
  if (spo2 >= 82) return 'rgba(255, 214, 10, 0.15)';
  return 'rgba(255, 59, 48, 0.15)';
}

function getStatusColor(spo2) {
  if (spo2 >= 90) return 'var(--green)';
  if (spo2 >= 82) return 'var(--yellow)';
  return 'var(--red)';
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  vitals.start();
});
