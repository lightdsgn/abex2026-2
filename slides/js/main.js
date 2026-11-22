// Navegação e animações dos slides (GSAP)
{
const stage=document.getElementById('stage');
const slides=[...document.querySelectorAll('.slide')];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur=0,step=0,tl=null;
function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform='scale('+s+')'}
addEventListener('resize',fit);fit();

// ondas de áudio
function waves(id,seed){const el=document.getElementById(id);let h='';for(let i=0;i<46;i++){const v=Math.abs(Math.sin(i*0.55+seed)*Math.cos(i*0.23+seed*2));h+='<i style="height:'+(8+v*48)+'px"></i>'}el.innerHTML=h}
waves('wv1',1);waves('wv2',1);

// pictograma do slide 2: 30 pessoas, 1 em cada 3 destacada
document.querySelectorAll('.ppl').forEach(el=>{
  const p='<svg viewBox="0 0 24 30" fill="currentColor"><circle cx="12" cy="7" r="5.5"/><path d="M2 30c0-7.5 4.5-12 10-12s10 4.5 10 12z"/></svg>';
  let h='';for(let i=0;i<30;i++)h+='<i class="'+(i%3===0?'hit':'')+'">'+p+'</i>';
  el.innerHTML=h;
});
const fmt=(v,d)=>v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
function maxStep(s){let m=0;s.querySelectorAll('[data-step]').forEach(e=>m=Math.max(m,+e.dataset.step));return m}

const fx={
    s2(t,s){t.from(s.querySelectorAll('.ppl i'),{opacity:0,y:10,stagger:.02,duration:.35,ease:'power2.out'},.5)
          .from(s.querySelectorAll('.ppl i.hit'),{color:'rgba(255,255,255,.3)',stagger:.06,duration:.3},'+=.1')},
  s1(t,s){
    // ordem: celular entra → texto → notificações → cartão em gradiente → card GOLPE! cai
    const png=s.classList.contains('usa-png');
    const clock=s.querySelector('.clock2');
    const noticeText=s.querySelectorAll('.nb div > *');
    if(clock){
      gsap.set(clock,{opacity:0,y:-24,scale:.88,filter:'blur(8px)'});
    }
    if(!png){
      gsap.set(noticeText,{opacity:0,x:-24,filter:'blur(3px)'});
    }
    t.from(s.querySelector(png?'.png-cel':'.iph'),{y:180,rotate:14,opacity:0,duration:1.1,ease:'power3.out'},.1)
     .from(s.querySelectorAll('.s1t'),{y:36,opacity:0,stagger:.12,duration:.8,ease:'power3.out'},.7)
     .from(s.querySelectorAll(png?'.png-n1,.png-n2,.png-n3':'.nb'),{x:-70,opacity:0,stagger:.28,duration:.75,ease:'back.out(1.4)'},1.5)
    if(clock){
      t.to(clock,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.8,ease:'back.out(1.8)'},1.05);
    }
    if(!png){
      t.to(noticeText,{opacity:1,x:0,filter:'blur(0px)',stagger:.12,duration:.55,ease:'power2.out'},1.9);
    }
    t
     .from(s.querySelector('.back'),{scale:.55,opacity:0,transformOrigin:'50% 60%',duration:1,ease:'power3.out'},2.5)
     .fromTo(s.querySelector('.tag2'),{scale:0,rotate:-30},{scale:1,rotate:-8,duration:.6,ease:'back.out(2.6)'},3.3)
     .to(s.querySelector('.tag2'),{keyframes:{rotate:[-8,-13,-4,-10,-8]},duration:.6,ease:'none'})
     .add(()=>{},3.3);
    const bank=s.querySelector('#s1 .n1');
    if(bank){
      t.call(()=>bank.classList.remove('shine'),null,2.7)
       .call(()=>bank.classList.add('shine'),null,2.72)
       .call(()=>bank.classList.remove('shine'),null,3.47);
    }
    const wp=s.querySelector('.wire path'),wd=s.querySelector('.wire circle'),L=wp.getTotalLength();
    gsap.set(wp,{strokeDasharray:L,strokeDashoffset:L});
    t.to(wp,{strokeDashoffset:0,duration:.5,ease:'power2.out'},3.75)
     .from(wd,{scale:0,transformOrigin:'50% 50%',duration:.35,ease:'back.out(3)'},4.15)},
  
  s3(t,s){t.to(s.querySelector('.nd.k .ball'),{scale:1.12,repeat:3,yoyo:true,duration:.4,ease:'sine.inOut'},'+=.2')},
  s5(t,s){},
  s9(t,s){},
  s11(t,s){
    const pw=s.querySelector('#pw'),m=s.querySelector('#pwm'),l=s.querySelector('#pwl');
    const type=(txt,at)=>{const o={n:0};t.to(o,{n:txt.length,duration:txt.length*.07,ease:'none',onUpdate:()=>pw.textContent=txt.slice(0,Math.round(o.n))},at)};
    pw.textContent='';l.innerHTML='&nbsp;';gsap.set(m,{width:0,background:'#ff3b30'});
    type('12345678','+=.3');
    t.to(m,{width:'14%',duration:.4}).call(()=>{l.innerHTML='<span style="color:#ff6b5e">Fraca: está entre as senhas mais usadas</span>'});
    t.to({},{duration:1.4});
    t.call(()=>{pw.textContent='';l.innerHTML='&nbsp;'});t.set(m,{width:0});
    type('sol-cachorro-janela-violao','+=.1');
    t.to(m,{width:'100%',background:'#E85002',duration:.6}).call(()=>{l.innerHTML='<span style="color:#FF7A2F">Forte: longa, fácil de lembrar, só sua</span>'});
  },
  s12(t,s){const sw=s.querySelectorAll('.sw');sw.forEach(x=>x.classList.remove('on'));
    s.querySelectorAll('.sw:not(.off)').forEach((x,i)=>t.call(()=>x.classList.add('on'),null,.6+i*.22))},
  s13(t,s){t.fromTo(s.querySelector('.line i'),{width:0},{width:'100%',duration:1.6,ease:'power2.inOut'},.4)}
};

function enter(i,back){
  const s=slides[i];
  if(tl){tl.progress(1);tl.kill()}  // termina a animação anterior antes de começar outra (evita elementos invisíveis)
  slides.forEach(x=>x.classList.remove('on','go'));
  s.classList.add('on');
  if(s.id==='s1'){
    s.classList.remove('s1-animate');
    void s.offsetWidth;
    s.classList.add('s1-animate');
  }
  step=back?maxStep(s):0;
  s.querySelectorAll('[data-step]').forEach(e=>{gsap.set(e,{opacity:+e.dataset.step<=step?1:0,y:0,scale:1});mark(s,+e.dataset.step,+e.dataset.step<=step)});
  tl=gsap.timeline();
  if(!RM){
    const els=[...s.querySelectorAll('[data-a]')];
    els.forEach((e,k)=>{const v=e.dataset.a;const from={opacity:0,duration:.8,ease:'power3.out',clearProps:'transform,opacity'};
      if(v==='l')from.x=-70;else if(v==='r')from.x=70;else if(v==='s'){from.scale=.92;from.y=20}else from.y=36;
      tl.from(e,from,.05+k*.06)});
    s.querySelectorAll('[data-draw]').forEach(p=>{const L=p.getTotalLength?p.getTotalLength():400;gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});tl.to(p,{strokeDashoffset:0,duration:1.2,ease:'power2.inOut'},.5)});
    s.querySelectorAll('[data-count]').forEach(e=>{const v=parseFloat(e.dataset.count),d=+(e.dataset.dec||0),suf=e.dataset.suf||'';const o={v:0};
      tl.to(o,{v,duration:1.6,ease:'power2.out',onUpdate:()=>e.textContent=fmt(o.v,d)+suf},.3)});
    if(fx[s.id])fx[s.id](tl,s);
  }else{
    s.querySelectorAll('[data-draw]').forEach(p=>gsap.set(p,{strokeDasharray:'none',strokeDashoffset:0}));
    if(s.id==='s12')s.querySelectorAll('.sw:not(.off)').forEach(x=>x.classList.add('on'));
    if(s.id==='s11'){s.querySelector('#pw').textContent='sol-cachorro-janela-violao';gsap.set('#pwm',{width:'100%',background:'#E85002'})}
  }
  document.getElementById('bar').style.width=((i+1)/slides.length*100)+'%';
  document.getElementById('cnt').textContent=(i+1)+' / '+slides.length;
  try{if(location.hash!=='#s'+(i+1))history.replaceState(null,'','#s'+(i+1))}catch(e){}
}
function mark(s,n,on){
  if(s.id==='s5'){const u=s.querySelector('.u'+n);if(u)u.classList.toggle('lit',on)}
  if(s.id==='s9'){const m=s.querySelector('.m'+n);if(m)m.classList.toggle('lit',on)}
}
function next(){
  const s=slides[cur];
  if(step<maxStep(s)){step++;const els=s.querySelectorAll('[data-step="'+step+'"]');
    gsap.fromTo(els,{opacity:0,y:18,scale:.96},{opacity:1,y:0,scale:1,duration:RM?0:.5,ease:'back.out(1.5)'});mark(s,step,true);return}
  if(cur<slides.length-1){cur++;enter(cur,false)}
}
function prev(){if(cur>0){cur--;enter(cur,true)}}
function fullscreen(){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}}
addEventListener('keydown',e=>{
  if(['ArrowRight','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();next()}
  else if(['ArrowLeft','PageUp','Backspace'].includes(e.key)){e.preventDefault();prev()}
  else if(e.key==='Home'){cur=0;enter(0,false)}else if(e.key==='End'){cur=slides.length-1;enter(cur,true)}
  else if(e.key==='f'||e.key==='F')fullscreen();
});
document.getElementById('vp').addEventListener('click',e=>{if(e.target.closest('a,button'))return;(e.clientX<innerWidth*0.25)?prev():next()});
document.getElementById('nx').addEventListener('click',next);
document.getElementById('pv').addEventListener('click',prev);
document.getElementById('fs').addEventListener('click',fullscreen);
let tx=null;addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
addEventListener('touchend',e=>{if(tx===null)return;const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50){d<0?next():prev()}tx=null});
document.querySelectorAll('img.opt').forEach(img=>{const bad=()=>img.remove();if(img.complete&&!img.naturalWidth)bad();else img.addEventListener('error',bad)});
// usa os PNGs da capa se assets/capa/celular.png existir; imagens que faltarem somem sozinhas
document.querySelectorAll('.hero-png img').forEach(img=>{
  const ok=()=>{if(img.classList.contains('png-cel')){document.getElementById('s1').classList.add('usa-png');if(cur===0)enter(0,false)}};
  const bad=()=>img.remove();
  if(img.complete){img.naturalWidth?ok():bad()}else{img.addEventListener('load',ok);img.addEventListener('error',bad)}
});
function fromHash(){const m=/^#s(\d+)$/.exec(location.hash);const n=m?Math.min(Math.max(+m[1]-1,0),slides.length-1):0;cur=n;enter(n,false)}
addEventListener('hashchange',()=>{const m=/^#s(\d+)$/.exec(location.hash);if(m&&+m[1]-1!==cur)fromHash()});
fromHash();
}
