/* ============================================
   KODO — Glitch Engine & Effects
   ============================================ */

(function () {
  'use strict';

  // ---- Configuration ----
  const HEARTBEAT_MS = 2800;
  const JAPANESE = '鼓動';
  const ENGLISH = 'Kodo';

  // ---- Glitch Effect ----
  const container = document.getElementById('glitch-container');
  const mainText = document.getElementById('glitch-main');
  const layers = container.querySelectorAll('.glitch-layer');
  let showingJapanese = true;

  function setAllText(text) {
    mainText.textContent = text;
    layers.forEach(l => (l.textContent = text));
  }

  function glitchBeat() {
    // Phase 1: rapid micro-glitches
    const microCount = 3 + Math.floor(Math.random() * 3);
    let i = 0;

    function microGlitch() {
      if (i >= microCount) {
        // Phase 2: hard glitch + swap text
        container.classList.remove('glitching');
        container.classList.add('glitching-hard');

        showingJapanese = !showingJapanese;
        setAllText(showingJapanese ? JAPANESE : ENGLISH);

        // If showing English, switch font
        if (!showingJapanese) {
          mainText.style.fontFamily = "var(--font-display)";
          mainText.style.letterSpacing = "0.04em";
          layers.forEach(l => {
            l.style.fontFamily = "var(--font-display)";
            l.style.letterSpacing = "0.04em";
          });
        } else {
          mainText.style.fontFamily = "";
          mainText.style.letterSpacing = "";
          layers.forEach(l => {
            l.style.fontFamily = "";
            l.style.letterSpacing = "";
          });
        }

        setTimeout(() => {
          container.classList.remove('glitching-hard');
        }, 120);

        return;
      }

      container.classList.add('glitching');
      setTimeout(() => {
        container.classList.remove('glitching');
        setTimeout(() => {
          i++;
          microGlitch();
        }, 30 + Math.random() * 40);
      }, 40 + Math.random() * 60);
    }

    microGlitch();
  }

  // Start heartbeat loop
  setInterval(glitchBeat, HEARTBEAT_MS);
  // First beat after short delay
  setTimeout(glitchBeat, 1200);

  // ---- Background Grid Canvas ----
  const canvas = document.getElementById('grid-bg');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Grid configuration
  const GRID_SIZE = 60;
  const LINE_COLOR = 'rgba(0, 232, 208, 0.06)';
  const NODE_COLOR = 'rgba(0, 232, 208, 0.15)';
  const PULSE_COLOR = 'rgba(0, 232, 208, 0.5)';

  // Pulse nodes — points that periodically light up
  const pulseNodes = [];
  const PULSE_COUNT = 8;

  function initPulses() {
    pulseNodes.length = 0;
    const cols = Math.ceil(width / GRID_SIZE);
    const rows = Math.ceil(height / GRID_SIZE);
    for (let i = 0; i < PULSE_COUNT; i++) {
      pulseNodes.push({
        x: Math.floor(Math.random() * cols) * GRID_SIZE,
        y: Math.floor(Math.random() * rows) * GRID_SIZE,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
  }

  initPulses();

  let time = 0;

  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    time += 0.016;

    // Draw grid lines
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= width; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Draw intersection dots
    ctx.fillStyle = NODE_COLOR;
    for (let x = 0; x <= width; x += GRID_SIZE) {
      for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }

    // Draw pulse nodes
    pulseNodes.forEach(node => {
      const glow = Math.sin(time * node.speed + node.phase) * 0.5 + 0.5;
      if (glow > 0.2) {
        const radius = 2 + glow * 4;
        const alpha = glow * 0.6;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 232, 208, ${alpha})`;
        ctx.fill();

        // Glow halo
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius * 6
        );
        gradient.addColorStop(0, `rgba(0, 232, 208, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });

    requestAnimationFrame(drawGrid);
  }

  requestAnimationFrame(drawGrid);

  // ---- Scroll reveal for features ----
  const cards = document.querySelectorAll('.feature-card');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger the animation
          const idx = Array.from(cards).indexOf(entry.target);
          entry.target.style.animationDelay = `${idx * 0.1}s`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach(card => observer.observe(card));
})();
