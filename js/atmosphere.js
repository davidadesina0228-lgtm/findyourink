/* =====================================================================
   atmosphere.js — living backgrounds.
   <section data-atmosphere="gold|ink|embers|zenith"><canvas class="atmo-canvas"></canvas>…
     gold   — WebGL: molten gold veins moving through black ink (hub hero)
     ink    — Canvas: ink blooms on paper that follow the pointer (journal)
     embers — Canvas: rising embers (Cave Echoes, GleamShield)
     zenith — Canvas: embers + slow starlight (GleamShield hero)
   Scenes sleep off-screen, in hidden tabs, and for reduced motion.
   ===================================================================== */
(() => {
  'use strict';
  const hosts = [...document.querySelectorAll('[data-atmosphere]')];
  if (!hosts.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isPaused = () => reduce.matches || document.documentElement.classList.contains('motion-paused');
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ------------------------------------------------------------------ */
  /* GOLD — WebGL                                                       */
  /* ------------------------------------------------------------------ */
  const FRAG = `
precision mediump float;
uniform vec2 u_res; uniform float u_t; uniform vec2 u_m; uniform float u_focus;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1.,0.)), u.x), mix(h(i+vec2(0.,1.)), h(i+vec2(1.,1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++){ v += a * n(p); p = r * p * 2.02 + 3.1; a *= 0.5; } return v + a * 0.5; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_t * 0.045;
  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.7 + 3.4 * q + vec2(1.7, 9.2) + 0.2 * t), fbm(p * 1.7 + 3.4 * q + vec2(8.3, 2.8) - 0.15 * t));
  float f = fbm(p * 1.3 + 3.0 * r);
  float veins = pow(smoothstep(0.52, 0.98, f), 2.6);
  float smoke = smoothstep(0.15, 0.95, f);
  vec2 lp = vec2(u_focus, 0.52) + (u_m - 0.5) * vec2(0.22, -0.18);
  float d = length((uv - lp) * vec2(u_res.x / u_res.y, 1.0));
  float light = exp(-2.6 * d);
  vec3 col = vec3(0.043, 0.039, 0.031);
  col += vec3(0.34, 0.24, 0.09) * smoke * smoke * (0.30 + 1.1 * light);
  col += vec3(0.92, 0.75, 0.42) * veins * (0.30 + 1.9 * light);
  col += vec3(1.0, 0.86, 0.55) * pow(light, 6.0) * 0.08;
  col *= smoothstep(1.35, 0.2, length(p * vec2(0.9, 1.1)));
  col += (h(gl_FragCoord.xy + fract(u_t)) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

  function goldScene(host, canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) { host.classList.add('atmo-fallback'); return null; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    // Compile in the background where the GPU driver allows it, so opening the page never stalls.
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    let ready = false, failed = false, uRes, uT, uM, uF;
    const finish = () => {
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { failed = true; host.classList.add('atmo-fallback'); return; }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uRes = gl.getUniformLocation(prog, 'u_res');
      uT = gl.getUniformLocation(prog, 'u_t');
      uM = gl.getUniformLocation(prog, 'u_m');
      uF = gl.getUniformLocation(prog, 'u_focus');
      ready = true;
      if (isPaused()) scene.draw(0); // Paused on entry: render one still frame.
    };
    const poll = () => {
      if (gl.isContextLost()) return;
      if (!parallel || gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) finish();
      else requestAnimationFrame(poll);
    };
    const focus = parseFloat(host.dataset.focus || '0.66');
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    host.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || isPaused()) return;
      const r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height;
    }, { passive: true });
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); host.classList.add('atmo-fallback'); }, { once: true });
    host.classList.add('atmo-live');
    const scene = {
      scale: coarse ? 0.45 : 0.5,
      fps: coarse ? 24 : 30,
      calmOnScroll: true,
      draw(t) {
        if (!ready || failed) return;
        mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uT, t + 20);
        gl.uniform2f(uM, mx, my);
        gl.uniform1f(uF, innerWidth < 760 ? 0.5 : focus);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
    };
    // Runs after the runner has sized the canvas (it calls size() right after creating scenes).
    requestAnimationFrame(poll);
    return scene;
  }

  /* ------------------------------------------------------------------ */
  /* INK — blooms on paper                                              */
  /* ------------------------------------------------------------------ */
  function blotSprite(seed, color) {
    const s = document.createElement('canvas');
    s.width = s.height = 128;
    const c = s.getContext('2d');
    let a = seed * 9301 + 49297;
    const rand = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    for (let i = 0; i < 26; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 1.6) * 34;
      const x = 64 + Math.cos(ang) * dist, y = 64 + Math.sin(ang) * dist;
      const r = 8 + rand() * 26;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${color},.42)`);
      g.addColorStop(0.6, `rgba(${color},.18)`);
      g.addColorStop(1, `rgba(${color},0)`);
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    return s;
  }

  function inkScene(host, canvas) {
    const ctx = canvas.getContext('2d');
    // Colours are pre-multiplied by the paper tone, so plain blending looks like the
    // old "multiply" blend without making the GPU blend the whole hero every frame.
    const black = [1, 2, 3, 4, 5, 6].map((i) => blotSprite(i, '20,18,14'));
    const gold = [7, 8, 9].map((i) => blotSprite(i, '168,129,56'));
    const blooms = [];
    let last = 0, px = -1, py = -1, inkTime = 0;
    const add = (x, y, big, isGold) => {
      blooms.push({ x, y, born: inkTime, r: (big ? 90 : 34) + Math.random() * (big ? 120 : 46), life: big ? 9000 : 5200, s: (isGold ? gold : black)[Math.floor(Math.random() * 3)], rot: Math.random() * 6.28, a: isGold ? 0.38 : 0.14 + Math.random() * 0.1 });
      if (blooms.length > 140) blooms.shift();
    };
    host.addEventListener('pointermove', (e) => {
      if (isPaused()) return;
      const now = performance.now();
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (now - last < 42 || (Math.abs(x - px) + Math.abs(y - py) < 14)) return;
      last = now; px = x; py = y;
      add(x * scaleX, y * scaleY, false, Math.random() < 0.06);
    }, { passive: true });
    host.addEventListener('pointerdown', (e) => {
      if (isPaused()) return;
      const r = host.getBoundingClientRect();
      add((e.clientX - r.left) * scaleX, (e.clientY - r.top) * scaleY, true, Math.random() < 0.3);
    }, { passive: true });
    let scaleX = 1, scaleY = 1, nextDrop = 0;
    return {
      scale: coarse ? 0.75 : 1,
      fps: 30,
      resize(w, h, cw, ch) { scaleX = cw / w; scaleY = ch / h; },
      draw(t, now) {
        inkTime = now;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        if (now > nextDrop) {
          nextDrop = now + 2200 + Math.random() * 2600;
          add(w * (0.64 + Math.random() * 0.34), h * (0.18 + Math.random() * 0.5), true, Math.random() < 0.3);
        }
        for (let i = blooms.length - 1; i >= 0; i--) {
          const b = blooms[i];
          const k = (now - b.born) / b.life;
          if (k >= 1) { blooms.splice(i, 1); continue; }
          const grow = 1 - Math.pow(1 - Math.min(k * 2.4, 1), 3);
          const size = b.r * (0.25 + grow * 0.75) * 2;
          ctx.globalAlpha = b.a * (k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45);
          ctx.save();
          ctx.translate(b.x, b.y); ctx.rotate(b.rot + k * 0.2);
          ctx.drawImage(b.s, -size / 2, -size / 2, size, size);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      },
      staticFrame() {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        [[0.78, 0.36, 210, 0], [0.9, 0.62, 150, 1], [0.62, 0.7, 120, 0]].forEach(([x, y, r, g]) => {
          ctx.globalAlpha = g ? 0.4 : 0.14;
          ctx.drawImage((g ? gold : black)[0], w * x - r, h * y - r, r * 2, r * 2);
        });
        ctx.globalAlpha = 1;
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* EMBERS / ZENITH                                                    */
  /* ------------------------------------------------------------------ */
  function glowSprite(rgb) {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const c = s.getContext('2d');
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.18, `rgba(${rgb},.75)`);
    g.addColorStop(0.45, `rgba(${rgb},.16)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return s;
  }

  function emberScene(host, canvas, withStars) {
    const ctx = canvas.getContext('2d');
    const sprites = [glowSprite('255,170,90'), glowSprite('255,214,150'), glowSprite('232,120,58')];
    const star = glowSprite('235,230,255');
    const count = coarse ? 34 : 70;
    const parts = [];
    const stars = [];
    const spawn = (p, w, h, initial) => {
      p.x = Math.random() * w;
      p.y = initial ? Math.random() * h : h + 20 + Math.random() * 60;
      p.vy = -(0.25 + Math.random() * 0.9) * (h / 900);
      p.vx = (Math.random() - 0.5) * 0.3;
      p.size = 2 + Math.pow(Math.random(), 3) * 16;
      p.sprite = sprites[Math.floor(Math.random() * sprites.length)];
      p.phase = Math.random() * 6.28;
      p.life = 0.6 + Math.random() * 0.4;
    };
    let ready = false;
    return {
      scale: coarse ? 0.75 : 1,
      fps: coarse ? 30 : 40,
      resize(w, h, cw, ch) {
        parts.length = 0; stars.length = 0;
        for (let i = 0; i < count; i++) { const p = {}; spawn(p, cw, ch, true); parts.push(p); }
        if (withStars) for (let i = 0; i < (coarse ? 60 : 130); i++) stars.push({ x: Math.random() * cw, y: Math.pow(Math.random(), 1.6) * ch * 0.62, s: 0.6 + Math.random() * 2.2, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.6 });
        ready = true;
      },
      draw(t) {
        if (!ready) return;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        if (withStars) stars.forEach((s) => {
          ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
          const z = s.s * 4;
          ctx.drawImage(star, s.x - z / 2, s.y - z / 2, z, z);
        });
        parts.forEach((p) => {
          p.y += p.vy * 1.6;
          p.x += p.vx + Math.sin(t * 0.8 + p.phase) * 0.35;
          if (p.y < -30) spawn(p, w, h, false);
          const fade = clamp(p.y / h, 0, 1);
          ctx.globalAlpha = p.life * (0.15 + 0.85 * fade) * (0.7 + 0.3 * Math.sin(t * 3 + p.phase));
          const z = p.size * 3;
          ctx.drawImage(p.sprite, p.x - z / 2, p.y - z / 2, z, z);
        });
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
    };
  }

  /* ------------------------------------------------------------------ */
  /* Runner                                                             */
  /* ------------------------------------------------------------------ */
  const scenes = hosts.map((host) => {
    const canvas = host.querySelector('canvas.atmo-canvas');
    if (!canvas) return null;
    const kind = host.dataset.atmosphere;
    let scene = null;
    try {
      if (kind === 'gold') scene = goldScene(host, canvas);
      else if (kind === 'ink') scene = inkScene(host, canvas);
      else if (kind === 'embers') scene = emberScene(host, canvas, false);
      else if (kind === 'zenith') scene = emberScene(host, canvas, true);
    } catch { scene = null; }
    if (!scene) return null;
    return { host, canvas, scene, visible: false, lastDraw: 0 };
  }).filter(Boolean);

  function size(s) {
    const r = s.host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * s.scene.scale;
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (s.canvas.width !== w || s.canvas.height !== h) {
      s.canvas.width = w; s.canvas.height = h;
      s.scene.resize?.(r.width, r.height, w, h);
      if (isPaused()) still(s);
    }
  }
  function still(s) {
    if (s.scene.staticFrame) s.scene.staticFrame();
    else s.scene.draw(elapsed / 1000, elapsed);
  }

  let raf = 0;
  let elapsed = 0, lastFrameTime = 0;
  // While the reader is actively scrolling, scenes give the GPU back to the scroll:
  // the heavy shader holds its frame, the particle scenes drop to a gentle 20fps.
  let lastScroll = -1e9;
  addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
  function loop(now) {
    raf = 0;
    if (document.hidden || isPaused()) { lastFrameTime = 0; return; }
    if (lastFrameTime) elapsed += clamp(now - lastFrameTime, 0, 80);
    lastFrameTime = now;
    const scrolling = now - lastScroll < 140;
    let any = false;
    scenes.forEach((s) => {
      if (!s.visible) return;
      any = true;
      if (scrolling && s.scene.calmOnScroll) return;
      const fps = scrolling ? Math.min(s.scene.fps, 20) : s.scene.fps;
      if (now - s.lastDraw < 1000 / fps) return;
      s.lastDraw = now;
      s.scene.draw(elapsed / 1000, elapsed);
    });
    if (any) raf = requestAnimationFrame(loop);
    else lastFrameTime = 0;
  }
  const kick = () => {
    if (!raf && !isPaused() && !document.hidden) {
      lastFrameTime = 0;
      raf = requestAnimationFrame(loop);
    }
  };
  const syncMotion = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastFrameTime = 0;
    // Pausing holds the current canvas. Only initialization/resize needs a still.
    if (!isPaused()) kick();
  };

  scenes.forEach(size);
  if (isPaused()) scenes.forEach(still);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { const s = scenes.find((x) => x.host === e.target); if (s) s.visible = e.isIntersecting; });
    kick();
  }, { rootMargin: '80px 0px' });
  scenes.forEach((s) => io.observe(s.host));
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { scenes.forEach(size); kick(); });
    scenes.forEach((s) => ro.observe(s.host));
  } else addEventListener('resize', () => { scenes.forEach(size); kick(); });
  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('site:motion-change', syncMotion);
  reduce.addEventListener('change', syncMotion);
})();
