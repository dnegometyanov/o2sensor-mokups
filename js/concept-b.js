// ============================================
// SVG GRADIENT DEFS (injected once)
// ============================================
(function injectGradients() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <linearGradient id="gradO2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#30d158"/>
        <stop offset="100%" stop-color="#64d2ff"/>
      </linearGradient>
      <linearGradient id="gradPulse" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff3b30"/>
        <stop offset="100%" stop-color="#ff9f0a"/>
      </linearGradient>
    </defs>
  `;
  document.body.appendChild(svg);
})();

// ============================================
// DONUT RINGS
// ============================================
const RING_CIRCUMFERENCE = 2 * Math.PI * 50; // r=50

function updateRings(spo2, pulse) {
  // SpO2 ring: 80-100 range
  const o2Pct = Math.max(0, Math.min(1, (spo2 - 80) / 20));
  const o2Dash = o2Pct * RING_CIRCUMFERENCE;
  const ringO2 = document.getElementById('ringO2');
  ringO2.setAttribute('stroke-dasharray', `${o2Dash} ${RING_CIRCUMFERENCE}`);
  document.getElementById('ringO2Value').textContent = spo2;

  // Pulse ring: 40-160 range
  const pulsePct = Math.max(0, Math.min(1, (pulse - 40) / 120));
  const pulseDash = pulsePct * RING_CIRCUMFERENCE;
  const ringPulse = document.getElementById('ringPulse');
  ringPulse.setAttribute('stroke-dasharray', `${pulseDash} ${RING_CIRCUMFERENCE}`);
  document.getElementById('ringPulseValue').textContent = pulse;
}

// ============================================
// WELLNESS SCORE
// ============================================
function updateWellnessScore(spo2, pulse) {
  // Composite: SpO2 weight 60%, pulse normality 40%
  const o2Score = Math.max(0, Math.min(100, (spo2 - 80) / 20 * 100));
  const idealPulse = 72;
  const pulseDev = Math.abs(pulse - idealPulse);
  const pulseScore = Math.max(0, 100 - pulseDev * 2);
  const score = Math.round(o2Score * 0.6 + pulseScore * 0.4);

  document.getElementById('scoreValue').textContent = score;
  document.getElementById('scoreBar').style.width = score + '%';
}

// ============================================
// SLEEP DATA & CHART
// ============================================
let sleepData = [];

function generateSleepData() {
  sleepData = [];
  // 8 hours of data, ~1 sample per 10min = 48 points
  for (let i = 0; i < 48; i++) {
    const base = 95.5 + Math.sin(i / 8) * 1;
    const noise = (Math.random() - 0.5) * 2;
    const dip = (i > 16 && i < 22) ? -3 * Math.random() : 0;
    sleepData.push(Math.max(84, Math.min(100, base + noise + dip)));
  }
  // Update stats
  const avg = sleepData.reduce((a, b) => a + b, 0) / sleepData.length;
  const events = sleepData.filter(v => v < 90).length;
  document.getElementById('sleepAvgO2').textContent = Math.round(avg) + '%';
  document.getElementById('sleepEvents').textContent = Math.min(events, 5);

  const hours = 6 + Math.floor(Math.random() * 3);
  const mins = Math.floor(Math.random() * 60);
  document.getElementById('sleepDuration').textContent = hours + 'h ' + (mins < 10 ? '0' : '') + mins + 'm';
}

const sleepCanvas = document.getElementById('sleepChart');
const sleepCtx = sleepCanvas.getContext('2d');

function resizeSleepChart() {
  sleepCanvas.width = sleepCanvas.offsetWidth * 2;
  sleepCanvas.height = sleepCanvas.offsetHeight * 2;
  sleepCtx.scale(2, 2);
}

function drawSleepChart() {
  const w = sleepCanvas.offsetWidth;
  const h = sleepCanvas.offsetHeight;
  const isDark = root.getAttribute('data-theme') === 'dark';

  sleepCtx.clearRect(0, 0, w, h);
  if (sleepData.length === 0) return;

  const minY = 84, maxY = 100;
  const pad = 3;
  const cW = w - pad * 2;
  const cH = h - pad * 2;

  const points = sleepData.map((val, i) => ({
    x: pad + (i / (sleepData.length - 1)) * cW,
    y: pad + cH * (1 - (val - minY) / (maxY - minY))
  }));

  // Area fill
  sleepCtx.beginPath();
  sleepCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2;
    sleepCtx.bezierCurveTo(cpx, points[i - 1].y, cpx, points[i].y, points[i].x, points[i].y);
  }
  sleepCtx.lineTo(points[points.length - 1].x, pad + cH);
  sleepCtx.lineTo(points[0].x, pad + cH);
  sleepCtx.closePath();
  const grad = sleepCtx.createLinearGradient(0, pad, 0, pad + cH);
  grad.addColorStop(0, isDark ? 'rgba(191, 90, 242, 0.25)' : 'rgba(191, 90, 242, 0.2)');
  grad.addColorStop(1, isDark ? 'rgba(191, 90, 242, 0.02)' : 'rgba(191, 90, 242, 0.02)');
  sleepCtx.fillStyle = grad;
  sleepCtx.fill();

  // Line
  sleepCtx.beginPath();
  sleepCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2;
    sleepCtx.bezierCurveTo(cpx, points[i - 1].y, cpx, points[i].y, points[i].x, points[i].y);
  }
  sleepCtx.strokeStyle = isDark ? '#bf5af2' : '#9b4dca';
  sleepCtx.lineWidth = 1.5;
  sleepCtx.stroke();
}

// ============================================
// PERIOD SELECTOR
// ============================================
const periodLabels = { D: 'Today', W: 'This Week', M: 'This Month', '6M': '6 Months', Y: 'This Year' };
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('chartSubtitle').textContent = periodLabels[btn.dataset.period];
    generateChartData(btn.dataset.period);
    drawChart();
  });
});

// ============================================
// HISTORY CHART (gradient line)
// ============================================
const chartCanvas = document.getElementById('chartCanvas');
const chartCtx = chartCanvas.getContext('2d');
let chartData = [];

function generateChartData(period) {
  const counts = { D: 24, W: 7, M: 30, '6M': 26, Y: 12 };
  const n = counts[period] || 24;
  chartData = [];
  for (let i = 0; i < n; i++) {
    const base = 95 + Math.random() * 4;
    const dip = Math.random() < 0.15 ? -(Math.random() * 6 + 2) : 0;
    chartData.push(Math.max(82, Math.min(100, base + dip)));
  }
  const avg = chartData.reduce((a, b) => a + b, 0) / chartData.length;
  document.getElementById('statAvg').textContent = Math.round(avg) + '%';
  document.getElementById('statMin').textContent = Math.round(Math.min(...chartData)) + '%';
  document.getElementById('statMax').textContent = Math.round(Math.max(...chartData)) + '%';
}

function resizeChart() {
  chartCanvas.width = chartCanvas.offsetWidth * 2;
  chartCanvas.height = chartCanvas.offsetHeight * 2;
  chartCtx.scale(2, 2);
}

function drawChart() {
  const w = chartCanvas.offsetWidth;
  const h = chartCanvas.offsetHeight;
  const isDark = root.getAttribute('data-theme') === 'dark';

  chartCtx.clearRect(0, 0, w, h);
  if (chartData.length === 0) return;

  const minY = 80, maxY = 100;
  const padL = 0, padR = 0, padT = 4, padB = 4;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  // Safe zone
  const safeTop = padT + chartH * (1 - (100 - minY) / (maxY - minY));
  const safeBot = padT + chartH * (1 - (90 - minY) / (maxY - minY));
  chartCtx.fillStyle = isDark ? 'rgba(48, 209, 88, 0.08)' : 'rgba(48, 209, 88, 0.1)';
  chartCtx.fillRect(padL, safeTop, chartW, safeBot - safeTop);

  // Warning zone
  const warnBot = padT + chartH * (1 - (82 - minY) / (maxY - minY));
  chartCtx.fillStyle = isDark ? 'rgba(255, 214, 10, 0.04)' : 'rgba(255, 214, 10, 0.06)';
  chartCtx.fillRect(padL, safeBot, chartW, warnBot - safeBot);

  // 90% line
  chartCtx.beginPath();
  chartCtx.setLineDash([4, 4]);
  chartCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  chartCtx.lineWidth = 0.5;
  const y90 = padT + chartH * (1 - (90 - minY) / (maxY - minY));
  chartCtx.moveTo(padL, y90);
  chartCtx.lineTo(padL + chartW, y90);
  chartCtx.stroke();
  chartCtx.setLineDash([]);

  const points = chartData.map((val, i) => ({
    x: padL + (i / (chartData.length - 1)) * chartW,
    y: padT + chartH * (1 - (val - minY) / (maxY - minY))
  }));

  // Area fill with gradient
  chartCtx.beginPath();
  chartCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2;
    chartCtx.bezierCurveTo(cpx, points[i - 1].y, cpx, points[i].y, points[i].x, points[i].y);
  }
  chartCtx.lineTo(points[points.length - 1].x, padT + chartH);
  chartCtx.lineTo(points[0].x, padT + chartH);
  chartCtx.closePath();
  const areaGrad = chartCtx.createLinearGradient(0, padT, 0, padT + chartH);
  if (isDark) {
    areaGrad.addColorStop(0, 'rgba(48, 209, 88, 0.2)');
    areaGrad.addColorStop(0.5, 'rgba(100, 210, 255, 0.08)');
    areaGrad.addColorStop(1, 'rgba(100, 210, 255, 0.01)');
  } else {
    areaGrad.addColorStop(0, 'rgba(48, 209, 88, 0.25)');
    areaGrad.addColorStop(0.5, 'rgba(100, 210, 255, 0.1)');
    areaGrad.addColorStop(1, 'rgba(100, 210, 255, 0.02)');
  }
  chartCtx.fillStyle = areaGrad;
  chartCtx.fill();

  // Gradient line (green→cyan)
  chartCtx.beginPath();
  chartCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2;
    chartCtx.bezierCurveTo(cpx, points[i - 1].y, cpx, points[i].y, points[i].x, points[i].y);
  }
  const lineGrad = chartCtx.createLinearGradient(0, 0, w, 0);
  lineGrad.addColorStop(0, '#30d158');
  lineGrad.addColorStop(1, '#64d2ff');
  chartCtx.strokeStyle = lineGrad;
  chartCtx.lineWidth = 2;
  chartCtx.stroke();

  // Dots
  points.forEach((p, i) => {
    const val = chartData[i];
    let color = '#30d158';
    if (val < 82) color = '#ff3b30';
    else if (val < 90) color = '#ffd60a';

    chartCtx.beginPath();
    chartCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    chartCtx.fillStyle = color;
    chartCtx.fill();

    if (val < 90) {
      chartCtx.beginPath();
      chartCtx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      chartCtx.fillStyle = color === '#ff3b30' ? 'rgba(255,59,48,0.2)' : 'rgba(255,214,10,0.2)';
      chartCtx.fill();
    }
  });
}

// ============================================
// VITALS CALLBACK
// ============================================
vitals.onUpdate((spo2, pulse) => {
  updateRings(spo2, pulse);
  updateWellnessScore(spo2, pulse);
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  resizeSleepChart();
  resizeChart();
  generateSleepData();
  drawSleepChart();
  generateChartData('D');
  drawChart();
});

window.addEventListener('themechange', () => {
  drawChart();
  drawSleepChart();
});

window.addEventListener('resize', () => {
  resizeSleepChart();
  resizeChart();
  drawChart();
  drawSleepChart();
});
