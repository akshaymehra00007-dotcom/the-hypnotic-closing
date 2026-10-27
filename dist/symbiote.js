(() => {
  'use strict';
  const button = document.querySelector('.symbiote-button');
  if (!button) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerDevice = matchMedia('(hover: hover) and (pointer: fine)');
  const ns = 'http://www.w3.org/2000/svg';
  const field = document.createElementNS(ns, 'svg');
  field.classList.add('symbiote-field');
  field.setAttribute('aria-hidden', 'true');
  field.setAttribute('hidden', '');
  function make(tag, className) {
    const node = document.createElementNS(ns, tag);
    node.setAttribute('class', className); field.append(node); return node;
  }
  const body = make('path', 'tendril');
  const thread = make('path', 'tendril');
  const shine = make('path', 'tendril-shine');
  const bead = make('ellipse', 'cursor-bead');
  const glint = make('ellipse', 'bead-glint');
  document.body.append(field);
  let rect, dirty = true, visible = true, enabled = false, frame = 0;
  let state = 'idle', lastTime = 0, releaseAt = 0;
  const mouse = {x: -10000, y: -10000};
  const tip = {x: 0, y: 0, vx: 0, vy: 0};
  let swell = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const f = value => value.toFixed(2);
  function setState(next) {state = next; button.dataset.symbioteState = next;}
  function measure() {rect = button.getBoundingClientRect(); dirty = false;}
  function anchor() {
    const radius = rect.height / 2;
    const x = clamp(mouse.x, rect.left + radius, rect.right - radius);
    const y = rect.top + radius;
    const dx = mouse.x - x, dy = mouse.y - y;
    const length = Math.hypot(dx, dy) || 1;
    return {x: x + dx / length * radius, y: y + dy / length * radius};
  }
  function distance() {
    return Math.hypot(Math.max(rect.left - mouse.x, 0, mouse.x - rect.right), Math.max(rect.top - mouse.y, 0, mouse.y - rect.bottom));
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    field.setAttribute('hidden', ''); swell = 0; setState(enabled ? 'idle' : 'disabled');
  }
  function schedule() {if (!frame && enabled && visible && !document.hidden) frame = requestAnimationFrame(tick);}
  function release(now) {if (state !== 'retracting') {releaseAt = now; setState('retracting');}}
  function tick(now) {
    frame = 0;
    if (!enabled || !visible || document.hidden) {stop(); return;}
    if (dirty) measure();
    const dt = clamp((now - (lastTime || now - 16.67)) / 1000, .001, .032);
    lastTime = now;
    const separation = distance();
    if (state === 'idle') {
      if (separation > 58) {lastTime = 0; return;}
      const start = anchor();
      Object.assign(tip, {x: start.x, y: start.y, vx: 0, vy: 0});
      setState('attached'); field.removeAttribute('hidden');
    }
    if (state === 'attached' && separation > 240) release(now);
    const start = anchor();
    const retracting = state === 'retracting';
    const target = retracting ? start : mouse;
    // A critically damped spring, integrated at bounded time steps for high-refresh displays.
    const steps = Math.ceil(dt / .008), step = dt / steps;
    for (let i = 0; i < steps; i++) {
      tip.vx += ((target.x - tip.x) * 230 - tip.vx * 25) * step;
      tip.vy += ((target.y - tip.y) * 230 - tip.vy * 25) * step;
      tip.x += tip.vx * step; tip.y += tip.vy * step;
    }
    swell += ((retracting ? 0 : 1) - swell) * (1 - Math.exp(-dt * 12));
    const dx = tip.x - start.x, dy = tip.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length, ny = dx / length;
    const tension = clamp(length / 250, 0, 1);
    const width = (11 - tension * 6) * swell + 1;
    const curl = Math.sin(now * .003) * Math.min(length * .1, 11) * swell;
    const sag = Math.min(length * .17, 24);
    const c1 = {x: start.x + dx * .28 + nx * curl, y: start.y + dy * .28 + sag + ny * curl};
    const c2 = {x: start.x + dx * .74 - nx * curl, y: start.y + dy * .74 + sag - ny * curl};
    body.setAttribute('d', `M${f(start.x+nx*width)},${f(start.y+ny*width)} C${f(c1.x+nx*width*.5)},${f(c1.y+ny*width*.5)} ${f(c2.x+nx*1.4)},${f(c2.y+ny*1.4)} ${f(tip.x)},${f(tip.y)} C${f(c2.x-nx*1.4)},${f(c2.y-ny*1.4)} ${f(c1.x-nx*width*.5)},${f(c1.y-ny*width*.5)} ${f(start.x-nx*width)},${f(start.y-ny*width)} Z`);
    thread.setAttribute('d', `M${f(start.x+nx*width*1.5)},${f(start.y+ny*width*1.5)} Q${f(c1.x+nx*22*swell)},${f(c1.y+ny*22*swell)} ${f(tip.x)},${f(tip.y)} Q${f(c1.x+nx*18*swell)},${f(c1.y+ny*18*swell)} ${f(start.x+nx*(width*1.5+2*swell))},${f(start.y+ny*(width*1.5+2*swell))} Z`);
    shine.setAttribute('d', `M${f(start.x+nx*width*.5)},${f(start.y+ny*width*.5)} Q${f(c1.x)},${f(c1.y)} ${f(start.x+dx*.6)},${f(start.y+dy*.6+sag*.6)}`);
    bead.setAttribute('cx',f(tip.x)); bead.setAttribute('cy',f(tip.y));
    bead.setAttribute('rx',f(5.2*swell)); bead.setAttribute('ry',f(6.5*swell));
    glint.setAttribute('cx',f(tip.x-1.5));glint.setAttribute('cy',f(tip.y-2));
    glint.setAttribute('rx',f(1.1*swell));glint.setAttribute('ry',f(2*swell));
    if (retracting && (length < 1.5 || now - releaseAt > 800)) {stop(); return;}
    // Sleep while stationary. Input and scroll events restart the spring immediately.
    if (!retracting && Math.hypot(mouse.x-tip.x,mouse.y-tip.y)<.15 && Math.hypot(tip.vx,tip.vy)<.6) {lastTime=0;return;}
    schedule();
  }
  function configure() {
    enabled = pointerDevice.matches && !reduced.matches;
    dirty = true; stop();
  }
  window.addEventListener('pointermove', event => {
    if (!enabled || !visible || event.pointerType === 'touch') return;
    mouse.x=event.clientX; mouse.y=event.clientY;
    // Pointer events only store input; geometry and SVG writes happen in one frame.
    schedule();
  }, {passive:true});
  window.addEventListener('scroll', () => {dirty=true;if(state!=='idle')schedule();}, {passive:true});
  window.addEventListener('resize', () => {dirty=true;if(state!=='idle')schedule();}, {passive:true});
  document.addEventListener('pointerout', event => {if(!event.relatedTarget && state==='attached'){release(performance.now());schedule();}});
  window.addEventListener('blur', stop);
  document.addEventListener('visibilitychange', () => {if(document.hidden)stop();});
  button.addEventListener('click', stop);
  reduced.addEventListener('change', configure); pointerDevice.addEventListener('change', configure);
  new IntersectionObserver(entries => {
    visible=entries[0].isIntersecting; dirty=true;
    if(!visible)stop();
  }, {rootMargin:'260px'}).observe(button);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(()=>{dirty=true;}).observe(button);
  configure();
})();

