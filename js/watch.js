// ============================================
// WATCH SPARKLINES
// ============================================
function initWatchSparklines() {
  ['watchO2Spark', 'watchPulseSpark'].forEach(id => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
  });
}

function drawSparkline(canvasId, data, minVal, maxVal, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  if (data.length < 2) return;

  const pad = 4;
  const drawW = w - pad * 2;
  const drawH = h - pad * 2;

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  data.forEach((val, i) => {
    const x = pad + (i / (data.length - 1)) * drawW;
    const norm = (val - minVal) / (maxVal - minVal);
    const y = pad + drawH * (1 - Math.max(0, Math.min(1, norm)));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Glow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.filter = 'blur(3px)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = pad + (i / (data.length - 1)) * drawW;
    const norm = (val - minVal) / (maxVal - minVal);
    const y = pad + drawH * (1 - Math.max(0, Math.min(1, norm)));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // Latest point dot
  const lastVal = data[data.length - 1];
  const lastX = pad + drawW;
  const lastNorm = (lastVal - minVal) / (maxVal - minVal);
  const lastY = pad + drawH * (1 - Math.max(0, Math.min(1, lastNorm)));

  ctx.beginPath();
  ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
  ctx.fillStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba');
  ctx.fill();
}

// ============================================
// VITALS -> WATCH UI
// ============================================
vitals.onUpdate((spo2, pulse, v) => {
  const watchO2El = document.getElementById('watchO2Value');
  watchO2El.textContent = spo2;
  const o2Color = getHexColor(spo2);
  watchO2El.style.color = o2Color;
  watchO2El.style.textShadow = `0 0 20px ${getGlowColor(spo2)}`;

  document.getElementById('watchPulseValue').textContent = pulse;

  drawSparkline('watchO2Spark', v.o2History, 85, 100, o2Color);
  drawSparkline('watchPulseSpark', v.pulseHistory, 50, 120, '#ff453a');
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initWatchSparklines();
});

window.addEventListener('resize', () => {
  initWatchSparklines();
});
