import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFExporter } from './vendor/GLTFExporter.js';
import { decorate } from './desk-decor.js';
import { stylize } from './lowpoly-style.js';
import { createHoverOutline } from './hover-outline.js?v=art-pass-1';
import { buildNightStudio } from './night-studio.js?v=pixel-game-20261021';
import { addBlackCat } from './black-cat.js?v=art-pass-1';
import { createDesktopUI } from './desktop-ui.js?v=art-pass-1';
import { createRetroFilter } from './retro-filter.js?v=art-pass-1';
import { createArchiveCamera } from './archive-camera.js?v=art-pass-1';
import { createRoomAmbience } from './room-sound.js?v=art-pass-1';
import { createWindowRain } from './window-rain.js?v=rain-room';

const $=s=>document.querySelector(s), scene=new THREE.Scene();
scene.background=new THREE.Color('#c7c3b9');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;$('#scene').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(37,innerWidth/innerHeight,.1,80);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.8,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=3;controls.maxDistance=30;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.3;controls.enablePan=false;controls.screenSpacePanning=false;controls.enabled=false;controls.enableRotate=false;controls.enableZoom=false;controls.enableDamping=false;controls.minDistance=.5;
const model=new THREE.Group();model.name='Ataro_Original_Low_Poly_Studio';scene.add(model);
const hemi=new THREE.HemisphereLight('#fff9e9','#858577',2);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff3d6',3.4);sun.position.set(-4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:25});sun.shadow.normalBias=.025;sun.shadow.bias=-.0003;sun.shadow.radius=3;scene.add(sun);
const fill=new THREE.DirectionalLight('#d6e7ef',.65);fill.position.set(5,4,2);scene.add(fill);
const mats={};function mat(color,roughness=.85,metalness=0){let key=color+roughness+metalness;return mats[key]??=new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:true});}
const ivory=mat('#d0cfc3'),wood=mat('#a48351'),dark=mat('#222823'),metal=mat('#525952',.45,.65),paper=mat('#e5dfc8'),wallmat=mat('#bab8b0');
function mesh(g,m,p,parent=model){let o=new THREE.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,x,y,z,m=ivory,p=model){return mesh(new THREE.BoxGeometry(w,h,d),m,[x,y,z],p);}
function cyl(rt,rb,h,x,y,z,m=dark,p=model,n=12){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),m,[x,y,z],p);}
function rod(a,b,r=.02,m=metal,p=model,n=8){a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);let o=mesh(new THREE.CylinderGeometry(r,r,a.distanceTo(b),n),m,a.clone().add(b).multiplyScalar(.5).toArray(),p);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());return o;}
function group(name,key,x=0,y=0,z=0){let g=new THREE.Group();g.name=name;g.userData.key=key;g.position.set(x,y,z);model.add(g);if(key)objects[key]=g;return g;}
const objects={};
function texText(title,sub,bg='#3d504d',fg='#eadfc7'){let c=document.createElement('canvas');c.width=256;c.height=384;let x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,256,384);x.strokeStyle=fg;x.lineWidth=2;x.strokeRect(16,16,224,352);x.fillStyle=fg;x.font='14px Arial';x.fillText('ATARO / COLLECTION',28,45);x.font='26px Microsoft YaHei, Arial';let words=title.split('|');words.forEach((s,i)=>x.fillText(s,28,135+i*38));x.font='13px Arial';x.fillText(sub,28,330);let t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;return t;}
const textureLoader=new THREE.TextureLoader();let textures=[];for(let i=1;i<=8;i++){let tx=textureLoader.load(`assets/${String(i).padStart(2,'0')}.webp`);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;textures.push(tx);}
const coverPaths={crisis:'assets/cover-rise-and-crisis.svg',luxun:'assets/cover-lu-xun.svg',modern:'assets/cover-modern-warfare.svg',heroes:'assets/cover-company-of-heroes-2.svg',siege:'assets/cover-rainbow-six-siege.svg'};
const coverTextures=Object.fromEntries(Object.entries(coverPaths).map(([key,path])=>{const tx=textureLoader.load(path);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;return [key,tx];}));
function plane(w,h,tx,x,y,z,p=model){return mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tx,roughness:.95,side:THREE.DoubleSide}),[x,y,z],p);}
function frame(w,h,tx,x,y,z,p=model){box(w+.1,h+.1,.075,x,y,z,dark,p);return plane(w,h,tx,x,y,z+.042,p);}

// Room shell, shallow platform, skirting and a window with a physical roller blind.
box(7,.12,5.8,0,-.07,.35,mat('#b8b7ad'));
box(7,4.8,.12,0,2.35,-2.05,wallmat);
box(7,.10,.08,0,.02,-1.95,mat('#94988d'));
let windowGroup=group('Window_blind',null,-2.04,3.18,-1.95);
box(1.6,1.76,.07,0,0,0,mat('#7c867f'),windowGroup);box(1.47,1.6,.02,0,0,.05,mat('#c8d0c3'),windowGroup);
box(1.64,.09,.16,0,.89,.08,dark,windowGroup);box(1.46,1.25,.035,0,.2,.09,mat('#b0aea4'),windowGroup);rod([-.71,-.48,.13],[.71,-.48,.13],.018,metal,windowGroup);rod([.86,.8,.12],[.86,-.6,.12],.006,paper,windowGroup);
// Desk is a modeled slab, four tapered wooden legs and support rails.
const desk=group('Desk',null,0,0,0);box(3.9,.115,1.5,0,1.56,0,ivory,desk);
for(const x of [-1.78,1.78])for(const z of [-.58,.58]){const leg=box(.12,1.48,.12,x, .76,z,wood,desk);leg.rotation.z=x*.013;}
rod([-1.78,.2,-.58],[-1.78,.2,.58],.05,wood,desk,4);rod([1.78,.2,-.58],[1.78,.2,.58],.05,wood,desk,4);box(3.52,.11,.08,0,1.37,-.59,wood,desk);
// Laptop: individually modeled keyboard, hinge, bezel and textured display.
let laptop=group('Laptop_AI_Creative','ai',-.12,1.65,-.27);box(.8,.055,.53,0,0,0,metal,laptop);box(.7,.012,.27,0,.034,-.06,dark,laptop);for(let r=0;r<4;r++)for(let c=0;c<11;c++)box(.046,.008,.043,-.3+c*.06,.045,-.16+r*.06,mat('#5f675e'),laptop);box(.25,.006,.11,0,.035,.16,mat('#949a8b'),laptop);
const screen=new THREE.Group();laptop.add(screen);screen.position.set(0,.02,-.245);screen.rotation.x=-.14;box(.81,.52,.04,0,.26,0,dark,screen);plane(.73,.435,textures[2],0,.27,.023,screen);
// Sketchbook, visible artwork and a pencil.
let drawing=group('Open_sketchbook','drawing',-.94,1.64,.3);drawing.rotation.y=-.15;box(.56,.035,.4,0,0,0,paper,drawing);let art=plane(.53,.37,textures[0],0,.022,0,drawing);art.rotation.x=-Math.PI/2;rod([.3,.04,-.15],[.37,.04,.18],.012,mat('#292e23'),drawing);cyl(.017,.0,.05,.375,.04,.20,wood,drawing);
// Camera with lens barrels, sensor glass, grip, viewfinder and controls.
let cam=group('Camera_photography','photo',-1.45,1.73,.2);cam.rotation.y=.18;box(.38,.23,.17,0,0,0,metal,cam);box(.09,.24,.19,-.15,0,.015,dark,cam);box(.16,.075,.14,.02,.15,0,dark,cam);let lens=cyl(.10,.105,.16,.03,0,.15,dark,cam);lens.rotation.x=Math.PI/2;let glass=cyl(.075,.075,.012,.03,0,.236,mat('#193a3a',.1,.55),cam);glass.rotation.x=Math.PI/2;cyl(.038,.038,.022,-.10,.137,.015,dark,cam);
// Turntable, rotating vinyl grooves and articulated tonearm.
let turn=group('Turntable_music','music',1.13,1.68,-.08);box(.95,.12,.69,0,0,0,dark,turn);box(.9,.012,.64,0,.067,0,metal,turn);const disc=new THREE.Group();disc.position.set(-.13,.09,0);turn.add(disc);cyl(.265,.265,.02,0,0,0,mat('#141815',.6),disc,40);for(let r=.11;r<.25;r+=.025){let ring=mesh(new THREE.TorusGeometry(r,.0016,3,40),metal,[0,.011,0],disc);ring.rotation.x=Math.PI/2;}cyl(.08,.08,.023,0,0,0,mat('#a04736'),disc,20);cyl(.008,.008,.043,0,.02,0,metal,disc);rod([.32,.11,-.22],[.32,.19,-.22],.025,metal,turn);rod([.32,.19,-.22],[.22,.18,.17],.012,metal,turn);box(.045,.035,.09,.20,.17,.20,dark,turn);box(.96,.62,.025,0,.36,-.34,new THREE.MeshStandardMaterial({color:'#d5d4bf',transparent:true,opacity:.18,roughness:.2,side:THREE.DoubleSide}),turn);for(let x of [-.35,.35])for(let z of [-.23,.23])cyl(.045,.045,.035,x,-.075,z,dark,turn);
// Headphones on desk.
let headphones=group('Headphones',null,.53,1.68,.38);let band=mesh(new THREE.TorusGeometry(.14,.018,5,14,Math.PI),dark,[0,.02,0],headphones);band.rotation.x=-Math.PI/2;for(let x of [-.14,.14])box(.055,.05,.095,x,.025,0,dark,headphones);
// Adjustable desk lamp.
let lamp=group('Desk_lamp',null,-1.5,1.64,-.48);cyl(.15,.16,.045,0,0,0,dark,lamp);rod([0,.02,0],[-.13,.45,0],.022,dark,lamp);rod([-.13,.45,0],[.19,.7,0],.02,dark,lamp);for(let a of [[0,.02,0],[-.13,.45,0],[.19,.7,0]])mesh(new THREE.SphereGeometry(.036,8,6),metal,a,lamp);let shade=cyl(.055,.15,.19,.22,.64,.015,dark,lamp);shade.rotation.z=.5;let bulb=cyl(.12,.12,.007,.264,.56,.015,new THREE.MeshStandardMaterial({color:'#ffe6ad',emissive:'#ffc875',emissiveIntensity:.5}),lamp);bulb.rotation.z=.5;
const deskLight=new THREE.PointLight('#ffc579',0,3,2);deskLight.position.set(-1.24,2.14,-.44);scene.add(deskLight);
// Ergonomic chair: five-star base, casters, gas lift, cushion, back slats and armrests.
const chair=group('Office_chair','about',0,0,1.36);chair.rotation.y=-.23;cyl(.07,.08,.55,0,.42,0,metal,chair);for(let i=0;i<5;i++){let a=i*Math.PI*2/5,x=Math.sin(a)*.50,z=Math.cos(a)*.50;rod([0,.2,0],[x,.11,z],.035,metal,chair);let wheel=cyl(.065,.065,.055,x,.065,z,dark,chair);wheel.rotation.z=Math.PI/2;}
box(.77,.16,.69,0,.85,0,dark,chair);box(.7,.09,.62,0,.96,.01,mat('#454d41'),chair);rod([-.28,.86,-.26],[-.3,1.66,-.35],.035,dark,chair);rod([.28,.86,-.26],[.3,1.66,-.35],.035,dark,chair);box(.72,.09,.09,0,1.67,-.34,dark,chair);box(.62,.07,.08,0,1.1,-.31,dark,chair);for(let i=0;i<8;i++)box(.035,.48,.038,-.245+i*.07,1.38,-.325,mat('#454b41'),chair);for(let x of [-.43,.43]){rod([x,.91,0],[x,1.2,-.03],.025,metal,chair);box(.1,.06,.45,x,1.23,.01,dark,chair);}
// Floor lamp.
const standing=group('Floor_lamp',null,-2.7,0,.30);cyl(.27,.29,.055,0,.055,0,metal,standing);rod([0,.06,0],[0,2.52,0],.025,metal,standing);cyl(.31,.36,.43,0,2.52,0,mat('#d7d3bf'),standing,16);
// Bass guitar: extruded silhouette, pickguard, neck, frets, bridge, strings and tuners.
const bass=group('Bass_guitar','music',-2.16,.22,.57);bass.rotation.z=-.11;bass.rotation.y=.20;
let shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.40,-.02,-.38,.37,-.18,.55);shape.lineTo(-.15,.83);shape.lineTo(-.055,.57);shape.lineTo(.05,.57);shape.lineTo(.14,.85);shape.lineTo(.20,.48);shape.bezierCurveTo(.45,.30,.31,-.06,0,0);
mesh(new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:5}),mat('#1d2724',.5),[0,0,0],bass);
box(.12,.98,.075,0,1.01,.045,wood,bass);box(.10,.98,.012,0,1.01,.092,mat('#4a3e2c'),bass);box(.14,.27,.075,.014,1.62,.04,wood,bass);box(.16,.035,.035,0,.18,.13,metal,bass);box(.20,.06,.025,0,.38,.13,paper,bass);box(.16,.05,.025,0,.29,.13,dark,bass);
for(let i=0;i<15;i++)box(.105,.008,.006,0,.58+i*.057,.104,metal,bass);for(let i=0;i<4;i++){rod([-.033+i*.022,.19,.151],[-.033+i*.022,1.7,.108],.0025,metal,bass,4);cyl(.026,.026,.055,i%2?-.10:.10,1.52+i*.06,.04,metal,bass,6);}rod([-.22,0,0],[-.34,-.17,.2],.022,metal,bass);rod([.22,0,0],[.34,-.17,.2],.022,metal,bass);
// Floating shelf and individually bound books.
const shelf=group('Bookshelf','books',-.1,3.06,-1.74);box(1.75,.085,.40,0,0,0,wood,shelf);for(let x of [-.58,.58])box(.055,.25,.28,x,-.13,-.025,metal,shelf);
for(let i=0;i<7;i++){let h=.37+(i%3)*.04;const book=new THREE.Group();shelf.add(book);book.position.set(-.5+i*.145,.05,-.03);book.rotation.z=i===0?.11:0;box(.115,h,.24,0,h/2,0,mat(['#e1d7b2','#e9e8dc','#4a6560','#883e32','#2d3e3b','#b59859','#424745'][i]),book);box(.089,h-.025,.22,0,h/2,.012,paper,book);plane(.12,h,i%2?coverTextures.luxun:coverTextures.crisis,0,h/2,.125,book);}
// Real framed artwork and three-dimensional poster boards.
const graphics=group('Graphic_design_board','graphic',-.83,2.43,-1.89);frame(.53,.80,textures[4],-.21,0,0,graphics);frame(.32,.8,textures[5],.31,0,.025,graphics);
const games=group('Game_posters','games',2.07,2.90,-1.87);frame(.83,1.13,coverTextures.siege,0,0,0,games);frame(.53,.75,coverTextures.heroes,.89,-.14,0,games);frame(.55,.75,coverTextures.modern,-.81,-.15,0,games);
// VHS rack, each tape has a real spine, case and printed cover.
const videos=group('VHS_film_collection','films',2.6,.64,-.38);box(.73,.07,.7,0,-.49,0,wood,videos);for(let x of [-.3,.3])box(.06,1.1,.6,x,0,0,wood,videos);box(.73,.065,.7,0,.56,0,wood,videos);box(.73,.045,.7,0,-.04,0,wood,videos);
['LA LA|LAND','LE SILENCE|DE LA MER','HACHI'].forEach((title,i)=>{let x=-.21+i*.21;box(.17,.38,.28,x,.18,.08,dark,videos);plane(.165,.37,texText(title,['FILM','2004','US EDITION'][i],['#514369','#526478','#795644'][i]),x,.18,.224,videos);});
// Two records physically mounted on the wall; click to spin the turntable.
for(let i=0;i<2;i++){let o=cyl(.23,.23,.024,3.07,3.5-i*.6,-1.91,dark,model,32);o.rotation.x=Math.PI/2;o.userData.key='music';let lab=cyl(.07,.07,.03,3.07,3.5-i*.6,-1.89,mat(i?'#6d7552':'#a04d39'),model,16);lab.rotation.x=Math.PI/2;lab.userData.key='music';}
// A physical paper contact card.
const contact=group('Resume_card','about',.72,1.644,.5);let card=plane(.29,.19,texText('ATARO','PROFILE / CONTACT','#ded8bc','#293a2c'),0,0,0,contact);card.rotation.x=-Math.PI/2;

const decor=decorate({model,scene,box,cyl,rod,mesh,mat,plane,group,frame,texText,textures,desk,laptop,drawing,cam,turn,headphones,lamp,chair,standing,bass,shelf,graphics,games,videos,contact,windowGroup,wood,ivory,wallmat,hemi,sun,fill,deskLight});
const retro=stylize({model,scene,chair,laptop,wood,ivory,wallmat,renderer,hemi,sun,fill,deskLight});
const kitten=addBlackCat(chair);objects.cat=kitten.cat;
const practical=buildNightStudio({model,scene,box,cyl,rod,mesh,mat,plane,group,texText,textures,desk,laptop,chair,kitten,cam,drawing,turn,headphones,lamp,shelf,graphics,games,videos,contact,hemi,sun,fill,deskLight,renderer});
const hoverOutline=createHoverOutline(renderer,scene,camera,model);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const archiveCamera=createArchiveCamera(camera,controls,reduced);
const retroFilter=createRetroFilter($('#panel-content'));
let panelRequest=0,closing=false;
function presentPanel(){
  retroFilter.setDetailMode(false);
  const panel=$('#panel');closing=false;panel.classList.remove('leaving');
  document.body.classList.remove('archive-travel');document.body.classList.add('archive-open');
  $('#journey').textContent='';
  updateConsoleHelp();
  if(!panel.open)panel.showModal();
  $('#panel-content .work')?.focus({preventScroll:true});
  $('#panel-content').getAnimations().forEach(a=>a.cancel());
  if(!reduced)$('#panel-content').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.2,.75,.2,1)'});
}
async function closePanel(){
  if(closing)return;closing=true;++panelRequest;
  const panel=$('#panel');panel.classList.add('leaving');
  if(panel.open&&!reduced)await panel.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(12px)'}],{duration:160,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
  panel.close();retroFilter.setDetailMode(false);panel.getAnimations().forEach(a=>a.cancel());panel.classList.remove('leaving');
  activePanel=null;activeWork=null;document.body.classList.remove('archive-open','archive-travel');$('#journey').textContent='';
  await archiveCamera.restore();closing=false;
}
$('#panel').addEventListener('cancel',e=>{e.preventDefault();closePanel();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#panel').open&&archiveCamera.phase==='approaching'){e.preventDefault();closePanel();}});
let lang=localStorage.getItem('ataro-lang')==='en'?'en':'zh',night=true,pixel=true,hoverKey='',pointerDown=null,closeup=false;
const titles={bgm:['环境声 · 点击开关','Ambience · toggle'],cat:['小黑猫','Black cat'],'task-light':['桌灯 · 点击开关','Desk lamp · toggle'],'wall-light':['壁灯 · 点击开关','Wall lamp · toggle'],'globe-light':['氛围灯 · 点击开关','Accent lamp · toggle'],drawing:['绘画设计','Illustration'],ai:['AI 创意','AI Creative'],graphic:['平面设计','Graphic Design'],photo:['摄影后期','Photography'],books:['书籍','Books'],films:['电影收藏','Film Collection'],games:['电子游戏','Video Games'],music:['音乐收藏','Music Collection'],about:['关于我','About Me'],all:['全部作品','Selected Work']};
const names=[['角色与机甲','Character & Mecha'],['手枪概念绘画','Pistol Illustration'],['咖啡礼盒场景','Coffee Packaging Scene'],['企业官网展示','Corporate Website'],['招募新伙伴','Join the Team'],['企业介绍长图','Company Profile'],['白羽人像','White Feathers'],['打铁花','Molten Sparks']];
const workNotes=[
  ['角色与机甲共同构成画面的叙事中心；冷色机械光效与人物形成尺度和气氛的对比。','A character and a mecha share the visual focus. Cool mechanical light contrasts with the figure in scale and mood.'],
  ['深色主体与留白形成强烈轮廓，红色痕迹为概念绘画增加叙事张力。','The dark silhouette stands against open space, while red marks add narrative tension.'],
  ['咖啡包装置于花枝环绕的场景中，以暖色调突出礼盒的材质与图案。','The coffee package sits among blossoms; warm tones draw attention to its material and illustration.'],
  ['蓝色主视觉、清晰的标题和分区信息，呈现企业官网的首页方案。','A blue visual system, direct headline and structured sections define this corporate homepage concept.'],
  ['高对比的黄蓝配色、人物插画与醒目标题，让招募信息易于识别。','High-contrast yellow and blue, a character illustration and bold type make the recruitment message easy to spot.'],
  ['以分区、图标和数字组织企业信息，适合长页面的连续阅读。','Sections, icons and figures organize company information for continuous reading on a long page.'],
  ['柔和的人像光线与白色装置形成对照，保留人物的神情与服装细节。','Soft portrait light meets a white sculptural prop, keeping the expression and costume details visible.'],
  ['夜色中的金色火花铺满画面，人物与文字共同交代打铁花的场景。','Golden sparks fill the night scene, while the figure and lettering give context to the performance.']
];
const loc=a=>a[lang==='zh'?0:1],t=(a,b)=>lang==='zh'?a:b;let activePanel=null,activeWork=null;
const weather=createWindowRain(model);
model.getObjectByName('Lowpoly_night_city')?.children.filter(item=>item.isPoints).forEach(item=>item.visible=false);
const bgm=createRoomAmbience(updateMusicUI);
const desktopUI=createDesktopUI(open,t);
function updateMusicUI(state=bgm.state){
  practical.setMusicState(state);const playing=state.status==='playing',button=$('#bgm');
  button.setAttribute('aria-pressed',String(state.enabled));button.textContent=playing?t('环境声：开启','Ambience: on'):state.enabled?t('环境声：待播放','Ambience: ready'):t('开启环境声','Play ambience');
  button.title=t('敲击键盘 · 窗外雨声 · 远处鸣笛','Typing · rain · distant traffic');
  if($('#audio-status'))$('#audio-status').textContent=state.status==='error'?t('声音暂时无法开启，请点击重试。','Audio could not start. Please try again.'):playing?t('正在聆听雨夜工作室','Listening to the rainy studio'):t('点击开启环境声','Click to start ambience');
  if($('#audio-toggle'))$('#audio-toggle').textContent=state.enabled?t('关闭声音','Mute ambience'):t('开启声音','Play ambience');
}
function openMusicPanel(){activePanel='bgm';activeWork=null;hoverOutline.clear();$('#panel-content').innerHTML=`<div class="eyebrow">ATARO / RAINY STUDIO</div><h1 id="panel-title">${t('工作室环境声','Studio ambience')}</h1><p id="audio-status" role="status"></p><div class="audio-controls"><button id="audio-toggle"></button></div><p class="muted">${t('键盘轻响、窗外雨声，以及偶尔从远处传来的汽车鸣笛。点击桌上音响或任务栏按钮可开关声音。','Soft keyboard taps, rain outside, and occasional distant car horns. Toggle with the desk speaker or taskbar button.')}</p>`;$('#audio-toggle').onclick=()=>bgm.toggle();updateMusicUI();presentPanel();}
$('#bgm').onclick=()=>open('bgm');
function updateText(){updateMusicUI();document.documentElement.lang=lang==='zh'?'zh-CN':'en';practical.setLanguage(lang);$('#subtitle').textContent=t('沈智键 · 视觉创作者','SHEN ZHIJIAN · VISUAL CREATOR');$('#index').textContent=t('作品索引','Work');$('#about').textContent=loc(titles.about);$('#lang').textContent=t('EN','中文');$('#hint').textContent=t('点击场景物件探索 · Esc 返回','Click objects to explore · ESC Back');$('#reset').textContent=t('工作台','Studio view');$('#camera-mode').textContent=t('小猫近景','Cat close-up');$('#reset').setAttribute('aria-pressed',String(!closeup));$('#camera-mode').setAttribute('aria-pressed',String(closeup));$('#lighting').textContent=night?t('清晨','Dawn'):t('夜晚','Night');$('#pixel').textContent=t('PS2 滤镜','PS2 filter');$('#close').ariaLabel=t('关闭','Close');document.querySelectorAll('[data-key]').forEach(b=>b.textContent=loc(titles[b.dataset.key]));desktopUI.refresh();}
function reset(){++panelRequest;archiveCamera.cancel();document.body.classList.remove('archive-travel');$('#journey').textContent='';closeup=false;practical.frame(camera,controls,innerWidth,innerHeight,closeup);updateText();}
$('#camera-mode').onclick=()=>{++panelRequest;archiveCamera.cancel();document.body.classList.remove('archive-travel');$('#journey').textContent='';closeup=true;practical.frame(camera,controls,innerWidth,innerHeight,closeup);updateText();};
const propActions=new Map();
function reactProp(key){if(reduced)return;const object={drawing,photo:cam,ai:laptop,graphic:graphics}[key];if(object)propActions.set(object,{base:object.quaternion.clone(),elapsed:0});}
async function open(key,travel=true){hoverOutline.clear();if(key==='bgm'){if($('#panel').open&&activePanel==='bgm'){openMusicPanel();}else if(bgm.state.available&&bgm.state.status!=='error'){bgm.toggle();}else{openMusicPanel();}return;}if(key==='cat'){void bgm.meow(.7);kitten.react(reduced,camera);return;}if(practical.has(key)){practical.toggle(key);return;}
if(travel&&(!$('#panel').open||activePanel!==key)){
  reactProp(key);
  if($('#panel').open){$('#panel').close();document.body.classList.remove('archive-open');retroFilter.setDetailMode(false);}
  const request=++panelRequest;document.body.classList.add('archive-travel');
  $('#journey').textContent=t('走近 · ','Approaching · ')+loc(titles[key]);
  if(!await archiveCamera.focus(key)||request!==panelRequest)return;
}
activePanel=key;activeWork=null;let indexes={drawing:[0,1],ai:[2,3],graphic:[4,5],photo:[6,7],all:[0,1,2,3,4,5,6,7]}[key];let html=`<div class="eyebrow">MY DOCUMENTS / ATARO</div><h1 id="panel-title">${loc(titles[key])}</h1><p class="archive-intro">${indexes?t('选择作品以查看','Select a work to view'):t('个人收藏档案','Personal collection archive')}</p>`;
if(indexes)html+=`<div class="grid">${indexes.map(i=>`<button class="work" data-work="${i}" style="--order:${indexes.indexOf(i)}"><div class="work-image"><img src="assets/${String(i+1).padStart(2,'0')}.webp" alt="${loc(names[i])}"></div><span><small>${String(i+1).padStart(2,'0')} /</small> ${loc(names[i])}<b aria-hidden="true">▸</b></span></button>`).join('')}</div>`;
else if(key==='about')html+=`<div class="about-intro"><p>${t('我是沈智键，创作涉及绘画、摄影后期、平面设计与 AI 创意。我关注画面的情绪，也在意它能否清楚传达信息。','I’m Shen Zhijian. My work spans illustration, photography, graphic design and AI-assisted creation. I care about the mood of an image and how clearly it communicates.')}</p><p>${t('创作之外，喜欢 Bass、唱歌、电影、阅读和电子游戏。','Outside my practice: bass, singing, films, books and games.')}</p></div><div class="about-grid"><section><h2>${t('目前工作','Current work')}</h2><p><strong>${t('品牌运营 · 深圳市玛布瑞克科技有限公司','Brand operations · MBRK Technology')}</strong><small>2026.06 — ${t('至今','present')}</small></p><p>${t('参与包装与品牌形象设计、宣传片剪辑、网站制作及上线、素材拍摄。','Working across packaging, brand identity, promotional editing, website production and photography.')}</p></section><section><h2>${t('此前经历','Previous work')}</h2><p><strong>${t('全媒体运营 · 深圳市同人益有管理顾问有限公司','Multimedia operations · Tongren Yiyou')}</strong><small>2025.12 — 2026.06</small></p><p>${t('参与视频拍摄与剪辑、海报设计、IP 形象设计及网站制作。','Worked on video production, posters, character identity and websites.')}</p></section><section><h2>${t('创作工具','Creative tools')}</h2><p>Photoshop · Lightroom · CSP · Stable Diffusion · Premiere · DaVinci Resolve</p></section><section><h2>${t('联系','Contact')}</h2><a href="mailto:1245319472@qq.com">1245319472@qq.com ↗</a></section></div>`;
else{const lists={books:[['兴盛与危机','兴盛与危机','金观涛 / Jin Guantao',coverPaths.crisis],['鲁迅集','Collected Works of Lu Xun','鲁迅 / Lu Xun',coverPaths.luxun]],films:[['爱乐之城','La La Land',''],['沉静如海','Le Silence de la mer','2004'],['忠犬八公','Hachi: A Dog’s Tale',t('美国版','US version')]],games:[['使命召唤16','Call of Duty: Modern Warfare','',coverPaths.modern],['英雄连2','Company of Heroes 2','',coverPaths.heroes],['彩虹六号：围攻','Rainbow Six Siege','',coverPaths.siege]],music:[['Love Song','Love Song',t('方大同','Khalil Fong')],['1234567','1234567',t('方大同','Khalil Fong')]]};html+=`<div class="collection-shelf collection-${key}">`+lists[key].map((row,index)=>`<div class="collection-item">${row[3]?`<img class="collection-object collection-cover" src="${row[3]}" alt="${loc(row)}${t('封面',' cover')}" loading="lazy">`:`<span class="collection-object" style="--item-order:${index}" aria-hidden="true"></span>`}<div class="collection-copy"><strong>${loc(row)}</strong><div>${row[2]}</div></div></div>`).join('')+'</div>';}
$('#panel-content').innerHTML=html;presentPanel();$('#tooltip').style.display='none';}
$('#panel-content').addEventListener('click',e=>{let b=e.target.closest('[data-work]');if(b){activeWork=+b.dataset.work;showWork(activeWork);}if(e.target.closest('[data-back]')){const previous=activeWork;open(activePanel,false);document.querySelector(`[data-work="${previous}"]`)?.focus({preventScroll:true});}});
function showWork(i){retroFilter.setDetailMode(true);$('#panel-content').innerHTML=`<button data-back>← ${t('返回','Back')}</button><h1 id="panel-title">${loc(names[i])}</h1><div class="case-layout"><div class="case-media"><img class="full-image" src="assets/${String(i+1).padStart(2,'0')}.webp" alt="${loc(names[i])}"></div><aside class="case-info"><div class="eyebrow">${t('作品档案','PROJECT FILE')} / ${String(i+1).padStart(2,'0')}</div><h2>${loc(titles[i<2?'drawing':i<4?'ai':i<6?'graphic':'photo'])}</h2><p>${loc(workNotes[i])}</p><p class="muted">${t('完整画面保持原始清晰度。','Artwork is shown at original clarity.')}</p></aside></div>`;if(!reduced)$('#panel-content').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:220});$('#panel').scrollTop=0;updateConsoleHelp();$('#panel-content [data-back]').focus({preventScroll:true});}
function updateConsoleHelp(){
  const count=document.querySelectorAll('#panel-content .work').length;
  $('#console-help').innerHTML=`<span><kbd>← → ↑ ↓</kbd>${t('选择','SELECT')}</span><span><kbd>ENTER</kbd>${t('确认','CONFIRM')}</span><span><kbd>ESC</kbd>${t('关闭','CLOSE')}</span><span class="archive-count">${count?String(count).padStart(2,'0')+' '+t('个作品','WORKS'):'ATARO / ARCHIVE'}</span>${activeWork!==null?`<span class="original-label">${t('原画预览','ORIGINAL VIEW')}</span>`:`<button data-retro-toggle aria-pressed="${pixel}">${t('滤镜','FILTER')} ${pixel?'ON':'OFF'}</button>`}`;
}
// Arrow-key navigation supplements native Tab / Enter and pointer controls.
document.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey)return;
  const focused=document.activeElement;
  const container=focused?.closest('.grid,.shortcuts,header nav,.tools')||(focused===document.body&&!$('#panel').open?$('header nav'):null);
  if(!container)return;
  const buttons=[...container.querySelectorAll('button:not(:disabled)')],index=buttons.indexOf(focused);
  if(!buttons.length)return;
  if(index<0){e.preventDefault();buttons[0].focus();return;}
  e.preventDefault();
  const columns=container.matches('.grid,.shortcuts')?getComputedStyle(container).gridTemplateColumns.split(' ').length:1;
  let step=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:e.key==='ArrowUp'?-columns:columns;
  const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+step+buttons.length)%buttons.length;
  buttons[next].focus({preventScroll:true});buttons[next].scrollIntoView({block:'nearest',inline:'nearest'});
});
$('#close').onclick=closePanel;$('#panel').addEventListener('click',e=>{if(e.target===$('#panel')){const r=$('#panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}});
$('#index').onclick=()=>open('all');$('#about').onclick=()=>open('about');document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>open(b.dataset.key));$('#lang').onclick=()=>{lang=lang==='zh'?'en':'zh';localStorage.setItem('ataro-lang',lang);updateText();if($('#panel').open){let i=activeWork;open(activePanel,false);if(i!==null){activeWork=i;showWork(i);}}};
$('#reset').onclick=reset;$('#lighting').onclick=()=>{night=!night;practical.applyMood(night);document.body.classList.toggle('night',night);updateText();};
function resize(reframe=true){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  // A real low-resolution frame buffer, enlarged with nearest-neighbor sampling.
  const ratio=pixel?Math.min(.75,480/innerHeight,960/innerWidth):Math.min(devicePixelRatio,1.6);
  renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);
  renderer.domElement.style.imageRendering=pixel?'pixelated':'auto';
  retroFilter.setEnabled(pixel);
  if(reframe){practical.frame(camera,controls,innerWidth,innerHeight,closeup);archiveCamera.resize();}
}
function toggleRetro(){pixel=!pixel;$('#pixel').setAttribute('aria-pressed',String(pixel));resize(false);if($('#panel').open)updateConsoleHelp();}
$('#pixel').onclick=toggleRetro;
$('#console-help').addEventListener('click',e=>{if(e.target.closest('[data-retro-toggle]')){toggleRetro();$('#console-help [data-retro-toggle]').focus({preventScroll:true});}});
window.addEventListener('resize',resize);
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();function pick(x,y){let r=renderer.domElement.getBoundingClientRect();mouse.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);let hits=ray.intersectObject(model,true);if(!hits.length)return null;let node=hits[0].object;while(node&&node!==model){if(node.userData.key)return node;node=node.parent;}return null;}
function hit(x,y,touch=false){const direct=pick(x,y)?.userData.key;if(direct||!touch)return direct||null;
  const bounds=new THREE.Box3(),center=new THREE.Vector3(),screen=new THREE.Vector3();let nearest=null,distance=22;
  for(const key of ['drawing','photo','ai','graphic','books','films','games','music','bgm','cat']){
    const object=objects[key];if(!object)continue;bounds.setFromObject(object);bounds.getCenter(center);screen.copy(center).project(camera);
    if(screen.z<-1||screen.z>1)continue;
    const cx=(screen.x+1)*innerWidth/2,cy=(1-screen.y)*innerHeight/2,d=Math.hypot(x-cx,y-cy);
    if(d<distance&&pick(cx,cy)?.userData.key===key){distance=d;nearest=key;}
  }
  return nearest;
}
function clearHover(){clearTimeout(hoverTimer);hoverOutline.clear();hoverKey='';$('#tooltip').style.display='none';renderer.domElement.style.cursor='default';}
let pointerPosition=null,hoverTimer=null;
const workCounts={drawing:2,ai:2,graphic:2,photo:2,all:8};
function updateHover(){if(!pointerPosition||pointerDown||archiveCamera.busy||$('#panel').open){clearHover();return;}const {x,y}=pointerPosition;const target=pick(x,y),key=target?.userData.key||'';hoverOutline.setTarget(target);renderer.domElement.style.cursor=target?'pointer':'default';const tip=$('#tooltip');if(key!==hoverKey){clearTimeout(hoverTimer);tip.style.display='none';hoverKey=key;if(key)hoverTimer=setTimeout(()=>{if(hoverKey!==key||!pointerPosition||$('#panel').open)return;const count=workCounts[key];tip.textContent=loc(titles[key])+(count?` · ${count} ${t('件作品','works')}`:'');tip.style.display='block';},180);}if(key){tip.style.left=Math.min(innerWidth-190,x+16)+'px';tip.style.top=Math.min(innerHeight-45,y+16)+'px';}}
renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};clearHover();});
renderer.domElement.addEventListener('pointerup',e=>{if(pointerDown&&Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)<6){let key=hit(e.clientX,e.clientY,e.pointerType==='touch');if(key)open(key);}pointerDown=null;});
renderer.domElement.addEventListener('pointermove',e=>{pointerPosition=e.pointerType==='touch'?null:{x:e.clientX,y:e.clientY};updateHover();});
renderer.domElement.addEventListener('pointerleave',()=>{pointerPosition=null;pointerDown=null;clearHover();});
renderer.domElement.addEventListener('pointercancel',()=>{pointerPosition=null;pointerDown=null;clearHover();});
window.addEventListener('blur',()=>{pointerPosition=null;pointerDown=null;clearHover();});
controls.addEventListener('change',updateHover);
controls.enableDamping=false;
document.body.classList.add('night','cinematic');$('#pixel').setAttribute('aria-pressed','true');resize();reset();updateText();let clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);archiveCamera.update(dt);controls.update();practical.update(dt);kitten.update(dt,reduced);weather.update(dt,reduced);bgm.update(dt,kitten,reduced);for(const [object,action] of propActions){action.elapsed+=dt;const t=Math.min(1,action.elapsed/.12),angle=Math.sin(t*Math.PI)*THREE.MathUtils.degToRad(2);object.quaternion.copy(action.base).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),angle));if(t===1){object.quaternion.copy(action.base);propActions.delete(object);}}if(!reduced&&activePanel==='music'&&$('#panel').open)disc.rotation.y+=dt*.5;hoverOutline.render();});
THREE.DefaultLoadingManager.onLoad=()=>{$('#loading').style.display='none';};setTimeout(()=>{$('#loading').style.display='none';},1500);
// Expose read-only scene inspection and a genuine reusable binary model export for local QA.
window.studio={weather,retroFilter,archiveCamera,scene,model,camera,controls,renderer,objects,hit,open,hoverOutline,practical,kitten,bgm,exportGLB:()=>new Promise((resolve,reject)=>new GLTFExporter().parse(model,resolve,reject,{binary:true}))};
