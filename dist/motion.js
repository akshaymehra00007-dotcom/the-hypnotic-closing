// Dependency-free motion, with accessible reduced-motion and mobile fallbacks.
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const easing = 'cubic-bezier(.22,1,.36,1)';
const activeAnimations = new Set();
function animate(element, frames, options) {
  if (motionQuery.matches || !element.animate) return;
  const animation = element.animate(frames, options);
  activeAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
  return animation;
}
function entrance() {
  document.querySelectorAll('.headline-line>span').forEach((line, index) => {
    animate(line, [{transform:'translateY(112%) rotate(2deg)'},{transform:'translateY(0) rotate(0)'}], {duration:1100,delay:100+index*130,easing,fill:'backwards'});
  });
  animate(document.querySelector('.hero-art'), [{opacity:0,transform:'translateY(35px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}], {duration:1500,delay:150,easing,fill:'backwards'});
  ['.hero .eyebrow','.hero-description','.hero-copy .pill','.micro'].forEach((selector,index) => {
    animate(document.querySelector(selector), [{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}], {duration:800,delay:200+index*120,easing,fill:'backwards'});
  });
}
entrance();
// Observers animate only on entry; content never depends on a hidden CSS state.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const delay = Number(element.dataset.motionDelay || 0);
    animate(element,[{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay,easing,fill:'backwards'});
    revealObserver.unobserve(element);
  });
}, {threshold:.12});
document.querySelectorAll('.section-intro,.section>.eyebrow,.audience-layout>div,.faq-section>div,.final-cta').forEach(element=>revealObserver.observe(element));
document.querySelectorAll('.method-grid article,.principles>div').forEach((element,index)=>{
  element.dataset.motionDelay=String((index%3)*110); revealObserver.observe(element);
});
const art = document.querySelector('.hero-art');
art.addEventListener('pointermove', event => {
  if (motionQuery.matches || !finePointer.matches) return;
  const bounds=art.getBoundingClientRect();
  art.style.setProperty('--hero-x',String(((event.clientX-bounds.left)/bounds.width-.5)*2));
  art.style.setProperty('--hero-y',String(((event.clientY-bounds.top)/bounds.height-.5)*2));
});
art.addEventListener('pointerleave',()=>{art.style.setProperty('--hero-x','0');art.style.setProperty('--hero-y','0');});
document.querySelectorAll('.pill:not(.symbiote-button)').forEach(button=>{
  button.addEventListener('pointermove', event=>{
    if(motionQuery.matches || !finePointer.matches) return;
    const rect=button.getBoundingClientRect();
    button.style.setProperty('--magnet-x',`${(event.clientX-rect.left-rect.width/2)*.12}px`);
    button.style.setProperty('--magnet-y',`${(event.clientY-rect.top-rect.height/2)*.18}px`);
  });
  button.addEventListener('pointerleave',()=>{button.style.setProperty('--magnet-x','0px');button.style.setProperty('--magnet-y','0px');});
});
document.querySelectorAll('.method-grid article').forEach(card=>{
  card.addEventListener('pointermove',event=>{
    if(motionQuery.matches || !finePointer.matches) return;
    const rect=card.getBoundingClientRect();
    card.style.setProperty('--light-x',`${event.clientX-rect.left}px`);
    card.style.setProperty('--light-y',`${event.clientY-rect.top-rect.height*.08}px`);
  });
});
document.querySelectorAll('details').forEach(details=>details.addEventListener('toggle',()=>{
  if(details.open) animate(details.querySelector('p'),[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing});
}));
const progress=document.querySelector('.reading-progress');
const cta=document.querySelector('.final-cta');
let scrollFrame=0;
function updateScroll(){
  scrollFrame=0;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,window.scrollY/max)):0})`;
  if(!motionQuery.matches){const rect=cta.getBoundingClientRect(); if(rect.top<window.innerHeight && rect.bottom>0) cta.style.setProperty('--cta-shift',`${(window.innerHeight/2-rect.top)*.1}px`);}
}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});
window.addEventListener('resize',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);});
motionQuery.addEventListener('change',()=>{if(motionQuery.matches){activeAnimations.forEach(animation=>animation.cancel());activeAnimations.clear();}});
updateScroll();

