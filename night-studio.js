import * as THREE from 'three';

// A close, fixed-camera workstation. All navigation objects remain actual 3D meshes.
export function buildNightStudio(ctx) {
  const {model,scene,box,cyl,rod,mesh,mat,plane,group,texText,textures,desk,laptop,chair,kitten,cam,drawing,turn,headphones,lamp,shelf,graphics,games,videos,contact,hemi,sun,fill,deskLight,renderer}=ctx;
  model.clear();
  model.name='Ataro_Night_Workstation';
  model.add(desk,chair,cam,drawing,turn,lamp,shelf,graphics,games,videos,contact);
  desk.clear();laptop.clear();model.add(laptop);laptop.scale.setScalar(1);laptop.rotation.set(0,0,0);
  const grain=(color,striped=false)=>{
    const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.fillStyle=color;c.fillRect(0,0,128,128);
    let seed=9612;for(let y=0;y<128;y++)for(let x=0;x<128;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;c.fillStyle=`rgba(${seed%2?'255,255,255':'0,0,0'},${.025+(seed%13)/280})`;c.fillRect(x,y,1,1);}
    if(striped){c.fillStyle='#11162620';for(let x=0;x<128;x+=8)c.fillRect(x,0,2,128);}
    const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
  };
  const plaster=new THREE.MeshStandardMaterial({color:'#a091b8',map:grain('#c2d4e5',true),roughness:1,flatShading:true});plaster.map.repeat.set(5,3);
  const walnut=new THREE.MeshStandardMaterial({color:'#505992',map:grain('#a091b8'),roughness:1,flatShading:true});
  const trim=mat('#505992'),dark=mat('#050933'),ivory=mat('#c2d4e5'),black=mat('#050933'),metal=mat('#a091b8');
  // Room edges extend past the camera; there is no floating display plinth.
  const room=group('Night_room_shell',null);
  box(14,.12,12,0,-.08,1,mat('#24202a'),room);
  box(.65,6,.12,-4.675,3,-1.46,plaster,room);
  box(6.15,6,.12,2.325,3,-1.46,plaster,room);
  box(3.6,1.38,.12,-2.55,.69,-1.46,plaster,room);
  box(3.6,1.7,.12,-2.55,5.19,-1.46,plaster,room);
  box(.12,6,8,-5.05,3,2.48,plaster,room);
  // Real window opening, projecting sill, mullions and city buildings beyond it.
  const window=group('City_window',null,-2.55,2.86,-1.35);
  for(const x of [-1.85,1.85])box(.10,3.08,.18,x,0,0,trim,window);
  for(const y of [-1.52,1.52])box(3.80,.10,.18,0,y,0,trim,window);
  box(.07,2.96,.14,0,0,.02,trim,window);box(3.68,.055,.12,0,-.13,.035,trim,window);
  box(3.94,.11,.38,0,-1.56,.09,trim,window);
  const sky=mesh(new THREE.PlaneGeometry(18,11),new THREE.MeshBasicMaterial({color:'#050933'}),[0,3,-7.3],model);
  const city=group('Lowpoly_night_city',null);
  const windowMats=['#fddb43','#c2d4e5','#a091b8','#505992'].map(color=>new THREE.MeshBasicMaterial({color}));
  for(let i=0;i<9;i++){
    const x=-10+i*1.25,h=4.3+(i*7%5)*.56,z=-4.1-(i%3)*.65,w=.86;
    box(w,h,.8,x,h/2,z,mat(i%2?'#151827':'#111622'),city);
    for(let row=0;row<Math.floor(h/.35)-1;row++)for(let col=0;col<4;col++){
      if((i*7+row*3+col*5)%7>3)continue;
      box(.09,.145,.008,x-w*.34+col*.18,.37+row*.35,z+.405,windowMats[(i+row+col)%4],city);
    }
    if(i%2===0)rod([x,h,z],[x,h+.42,z],.012,dark,city,4);
  }
  const stars=new THREE.BufferGeometry();const coords=[];
  for(let i=0;i<65;i++)coords.push(-7+(i*43%137)/10,3.1+(i*17%41)/10,-7.15);
  stars.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));const st=new THREE.Points(stars,new THREE.PointsMaterial({color:'#8c96ba',size:.012}));city.add(st);
  box(5.8,.13,1.75,.43,1.552,-.025,walnut,desk);
  for(const x of [-2.2,2.98])for(const z of [-.66,.62])box(.10,1.45,.10,x,.77,z,walnut,desk);
  box(5.25,.23,.055,.4,1.31,-.73,walnut,desk);
  chair.position.set(-.22,0,1.28);chair.rotation.y=Math.PI;
  // Recess the headrest and its support so the headphones clear it during a turn.
  for(const part of chair.children)if(part.isMesh&&part.position.y>1.72)part.position.z-=.15;
  // Thick CRT chassis, recessed screen, pedestal, speakers and tower.
  laptop.name='CRT_AI_archive';laptop.position.set(.02,1.64,-.51);
  box(.72,.07,.48,0,.045,.035,ivory,laptop);box(.26,.22,.24,0,.18,-.02,ivory,laptop);
  const chassis=new THREE.BoxGeometry(1.16,.94,.68),p=chassis.attributes.position;
  for(let i=0;i<p.count;i++)if(p.getZ(i)<0){p.setX(i,p.getX(i)*.74);p.setY(i,p.getY(i)*.80);}chassis.computeVertexNormals();
  mesh(chassis,ivory,[0,.76,-.16],laptop);
  box(1.13,.91,.07,0,.76,.19,ivory,laptop);
  box(1.00,.76,.01,0,.79,.229,dark,laptop);
  const cv=document.createElement('canvas');cv.width=512;cv.height=384;const c=cv.getContext('2d');
  const screenTexture=new THREE.CanvasTexture(cv);screenTexture.colorSpace=THREE.SRGBColorSpace;screenTexture.magFilter=THREE.NearestFilter;
  let language='zh',gameTime=0,gameFrame=0;
  const gameCanvas=document.createElement('canvas');gameCanvas.width=256;gameCanvas.height=192;
  const g=gameCanvas.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;
  function tile(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);}
  function drawScreen(){
    const scroll=Math.floor(gameTime*18)%512,navy='#050933',ice='#c2d4e5',yellow='#fddb43';
    tile(0,0,256,192,ice);tile(0,0,256,21,navy);
    g.fillStyle=ice;g.font='bold 8px monospace';g.fillText('ATARO   001250',7,13);g.fillText('COIN  x 08',103,13);g.fillText('WORLD  1-1',189,13);
    for(let i=0;i<7;i++){let x=((i*62-scroll*.32)%350+350)%350-42,y=33+(i%3)*17;tile(x,y+5,28,8,'#ffffff');tile(x+5,y,17,14,'#ffffff');tile(x+4,y+12,24,3,'#a091b8');}
    for(let i=0;i<4;i++){let x=((i*113-scroll*.53)%480+480)%480-56;tile(x,121,74,34,'#a091b8');tile(x+9,109,52,45,'#505992');tile(x+23,100,25,53,'#a091b8');}
    for(let i=0;i<8;i++){let x=((i*54+42-scroll)%512+512)%512-24,y=80+(i%3)*16;tile(x,y,17,16,'#050933');tile(x+2,y+2,13,12,'#a091b8');tile(x+4,y+4,9,2,'#fddb43');tile(x+3,y+11,11,2,'#505992');}
    for(let i=0;i<5;i++){let x=((i*83+70-scroll)%512+512)%512-14,y=55+(i%2)*15;tile(x+4,y,5,12,'#a97116');tile(x+5,y+1,3,10,yellow);tile(x+6,y+3,1,5,'#fff7ab');}
    for(let i=0;i<3;i++){let x=((i*164+115-scroll)%512+512)%512-24;tile(x,119,32,37,navy);tile(x+2,121,28,35,'#36786f');tile(x-3,116,38,9,navy);tile(x-1,117,34,6,'#56a48c');tile(x+5,126,3,27,'#83c4a7');}
    tile(0,155,256,37,navy);for(let i=0;i<17;i++){let x=i*16-(scroll%16);tile(x,156,15,15,'#8d5b47');tile(x+2,158,11,2,'#c6855e');tile(x,172,15,17,'#62445b');tile(x+1,173,13,2,'#8d5b47');}
    const bounce=Math.max(0,Math.sin(gameTime*3.4))*13,px=78,py=Math.round(132-bounce),step=Math.floor(gameTime*8)%2;
    tile(px+4,py-18,13,3,navy);tile(px+5,py-21,11,4,'#b74046');tile(px+2,py-18,19,4,'#b74046');
    tile(px+5,py-14,12,9,'#d99572');tile(px+15,py-12,5,3,'#d99572');tile(px+4,py-11,4,2,navy);tile(px+10,py-9,9,2,navy);
    tile(px+4,py-5,16,11,'#505992');tile(px+4,py-5,5,5,'#b74046');tile(px+15,py-5,5,5,'#b74046');tile(px+7,py-2,3,4,yellow);tile(px+15,py-2,3,4,yellow);
    tile(px+2,py+6,7,3,'#30314b');tile(px+14,py+6+(step?1:0),7,3,'#30314b');
    tile(0,189,256,3,navy);c.imageSmoothingEnabled=false;c.fillStyle=navy;c.fillRect(0,0,512,384);c.drawImage(gameCanvas,0,0,512,384);
    screenTexture.needsUpdate=true;
  }
  drawScreen();
  const screenMaterial=new THREE.MeshStandardMaterial({map:screenTexture,emissiveMap:screenTexture,emissive:'#c2d4e5',emissiveIntensity:.58,roughness:.75});
  mesh(new THREE.PlaneGeometry(.947,.704),screenMaterial,[0,.79,.236],laptop,'CRT_screen');
  for(let i=0;i<4;i++)box(.055,.018,.011,.23+i*.07,.362,.232,metal,laptop);
  mesh(new THREE.SphereGeometry(.015,6,4),new THREE.MeshBasicMaterial({color:'#81dc8a'}),[.42,.362,.24],laptop);
  const keyboard=group('Mechanical_keyboard','ai',-.22,1.665,.61);
  box(.91,.04,.35,0,0,0,ivory,keyboard);for(let x of [-.36,.36])for(let z of [-.11,.11])box(.07,.03,.05,x,-.035,z,black,keyboard);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++)box(.055,.012,.048,-.374+col*.068,.025,-.111+row*.067,mat((row+col)%5?'#858796':'#666b7d'),keyboard);
  box(.33,.012,.043,-.08,.025,.13,ivory,keyboard);
  const mouse=group('Wired_mouse','ai',.47,1.65,.43);const mouseBody=mesh(new THREE.SphereGeometry(1,8,5),ivory,[0,.034,0],mouse);mouseBody.scale.set(.082,.044,.125);
  rod([0,.071,-.06],[0,.076,.015],.003,metal,mouse,4);
  const mouseWire=new THREE.CatmullRomCurve3([new THREE.Vector3(.47,1.654,.35),new THREE.Vector3(.61,1.65,.19),new THREE.Vector3(.49,1.65,-.1),new THREE.Vector3(.8,1.66,-.35)]);mesh(new THREE.TubeGeometry(mouseWire,12,.008,5),black,[0,0,0],model);
  const tower=group('Desktop_tower','ai',1.13,1.65,-.43);
  box(.55,1.11,.67,0,.555,0,ivory,tower);box(.49,.99,.013,0,.57,.345,mat('#97939e'),tower);
  for(const y of [.92,.74]){box(.40,.13,.012,0,y,.36,dark,tower);box(.35,.085,.014,-.015,y,.371,mat('#696d7b'),tower);box(.2,.012,.015,-.04,y,.381,black,tower);}
  for(let i=0;i<6;i++)box(.30,.01,.01,0,.2+i*.035,.366,dark,tower);
  const power=cyl(.034,.034,.012,.12,.48,.37,mat('#c8c1bd'),tower,8);power.rotation.x=Math.PI/2;
  const speakerMat=mat('#5b5c6b');for(const x of [-.69,.71]){const speaker=group('Desktop_speaker','music',x,1.66,-.43);box(.18,.35,.22,0,.175,0,speakerMat,speaker);for(const y of [.12,.27]){const disk=cyl(y<.2?.055:.025,y<.2?.055:.025,.012,0,y,.118,black,speaker,10);disk.rotation.x=Math.PI/2;}}
  // Dedicated room-ambience speaker, distinct from the music collection.
  const bgmSpeaker=group('Interactive_BGM_speaker','bgm',1.78,1.617,.45);bgmSpeaker.rotation.y=.15;
  box(.36,.54,.32,0,.27,0,walnut,bgmSpeaker);box(.326,.50,.018,0,.27,.168,dark,bgmSpeaker);
  const ring=mesh(new THREE.TorusGeometry(.106,.012,5,12),black,[0,.29,.186],bgmSpeaker);
  const woofer=cyl(.088,.105,.027,0,.29,.182,mat('#4d505e'),bgmSpeaker,12);woofer.rotation.x=Math.PI/2;
  const dust=cyl(.041,.045,.022,0,.29,.206,black,bgmSpeaker,10);dust.rotation.x=Math.PI/2;
  const tweeter=cyl(.034,.034,.014,0,.445,.185,metal,bgmSpeaker,10);tweeter.rotation.x=Math.PI/2;
  const knob=cyl(.023,.023,.028,-.087,.085,.188,metal,bgmSpeaker,8);knob.rotation.x=Math.PI/2;
  const speakerLED=new THREE.MeshStandardMaterial({color:'#465446',emissive:'#6ee68a',emissiveIntensity:0,roughness:.6});
  const led=mesh(new THREE.SphereGeometry(.013,6,4),speakerLED,[.087,.085,.191],bgmSpeaker);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=128;labelCanvas.height=32;const lc=labelCanvas.getContext('2d');lc.fillStyle='#20232f';lc.fillRect(0,0,128,32);lc.fillStyle='#bac1bf';lc.font='18px monospace';lc.fillText('AMBIENCE',20,23);const label=new THREE.CanvasTexture(labelCanvas);label.colorSpace=THREE.SRGBColorSpace;label.magFilter=THREE.NearestFilter;
  plane(.15,.0375,label,0,.135,.182,bgmSpeaker);
  // A compact mug and geometric straw beside the keyboard.
  const cup=group('Desk_mug',null,-.97,1.625,.20);cyl(.086,.074,.22,0,.11,0,mat('#8b8790'),cup,10);cyl(.074,.074,.004,0,.223,0,mat('#251f22'),cup,10);const handle=mesh(new THREE.TorusGeometry(.062,.014,4,10,Math.PI*1.65),ivory,[-.088,.13,0],cup);handle.rotation.z=.55;
  rod([.017,.19,0],[.017,.36,0],.009,ivory,cup,5);rod([.017,.36,0],[-.045,.39,0],.009,ivory,cup,5);
  // The fitted headset is part of the cat model and follows its head rig.
  model.remove(headphones);
  // Portfolio and collections sit inside the fixed composition.
  cam.position.set(2.25,1.77,.18);cam.rotation.y=-.3;cam.scale.setScalar(1.13);
  drawing.position.set(1.03,1.64,.51);drawing.rotation.y=-.12;drawing.scale.setScalar(1.08);
  turn.position.set(2.42,1.70,-.33);turn.scale.setScalar(.8);
  shelf.position.set(.30,3.02,-1.15);shelf.scale.set(1.45,1,1.15);
  graphics.position.set(2.35,2.90,-1.32);graphics.scale.setScalar(.8);
  games.position.set(1.92,3.78,-1.32);games.scale.setScalar(.56);
  videos.position.set(-2.06,.92,-.23);videos.scale.set(.9,.9,.85);
  contact.position.set(-1.29,1.627,.47);contact.rotation.y=.12;
  lamp.position.set(-2.06,1.65,-.65);lamp.scale.setScalar(.86);
  // Real warm lamps, moonlight and monitor spill, with independent switches.
  const circuits=new Map();
  const register=(key,fixtures,lights,materials)=>{fixtures.forEach(o=>o.userData.key=key);circuits.set(key,{fixtures,lights,emissive:materials,on:true,powers:lights.map(l=>l.intensity)});};
  const glow=()=>new THREE.MeshStandardMaterial({color:'#fddb43',emissive:'#fddb43',emissiveIntensity:.65,roughness:.8});
  const spot=(pos,target,power,angle)=>{const l=new THREE.SpotLight('#fddb43',power,5,angle,.65,2);l.position.copy(pos);l.target.position.set(...target);l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.bias=-.0003;l.shadow.normalBias=.009;model.add(l,l.target);return l;};
  model.updateMatrixWorld(true);const taskMat=glow();lamp.traverse(o=>{if(o.isMesh&&o.material.emissive?.getHex())o.material=taskMat;});
  const task=spot(lamp.localToWorld(new THREE.Vector3(.27,.49,.015)),[-1.55,1.62,-.10],2.4,.85);task.shadow.mapSize.set(1024,1024);register('task-light',[lamp],[task],[taskMat]);
  const wall=group('Warm_wall_sconce','wall-light',-.46,3.76,-1.22);box(.10,.18,.05,0,.12,0,metal,wall);rod([0,.12,0],[0,.17,.30],.013,metal,wall);mesh(new THREE.CylinderGeometry(.13,.19,.23,8,1,true),new THREE.MeshStandardMaterial({color:'#505992',roughness:1,side:THREE.DoubleSide,flatShading:true}),[0,.0,.30],wall);const wm=glow();cyl(.17,.17,.012,0,-.12,.3,wm,wall,8);
  const wl=spot(new THREE.Vector3(-.46,3.62,-.92),[-.05,3.04,-1.25],1.4,.9);register('wall-light',[wall],[wl],[wm]);
  const globe=group('Window_accent_lamp','globe-light',-2.8,1.71,-1.1);cyl(.08,.10,.06,0,.025,0,metal,globe,8);const gm=glow();const orb=mesh(new THREE.SphereGeometry(.11,8,5),gm,[0,.15,0],globe);orb.castShadow=false;const gl=new THREE.PointLight('#fddb43',.50,2.2,2);gl.position.set(-2.8,1.9,-1.04);model.add(gl);register('globe-light',[globe],[gl],[gm]);
  const monitorLight=new THREE.PointLight('#c2d4e5',1.58,2.2,2);monitorLight.position.set(.02,2.34,.12);model.add(monitorLight);
  const catRim=new THREE.DirectionalLight('#a091b8',1.20);catRim.position.set(-1.5,3.4,2.3);catRim.target.position.set(-.22,2.08,1.41);model.add(catRim,catRim.target);
  const catFill=new THREE.PointLight('#c2d4e5',.28,1.5,2);catFill.position.set(-.45,2.38,1.8);model.add(catFill);
  function apply(){for(const circuit of circuits.values()){circuit.lights.forEach((l,i)=>l.intensity=circuit.on?circuit.powers[i]:0);circuit.emissive.forEach(m=>m.emissiveIntensity=circuit.on?.65:0);}}
  function applyMood(night){scene.background.set(night?'#050933':'#505992');sky.material.color.set(night?'#050933':'#a091b8');hemi.color.set('#c2d4e5');hemi.groundColor.set('#505992');hemi.intensity=night?.30:.9;sun.color.set('#a091b8');sun.intensity=night?.45:1.4;sun.position.set(-4,5,-.2);sun.shadow.normalBias=.008;fill.color.set('#c2d4e5');fill.intensity=night?.16:.45;fill.position.set(3,3,3);monitorLight.intensity=night?1.58:.60;catRim.intensity=night?1.20:.58;catFill.intensity=night?.28:.16;apply();}
  deskLight.intensity=0;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;applyMood(true);
  return {circuits,keyboard,bgmSpeaker,monitor:laptop,setMusicState(state){const playing=state.status==='playing';bgmSpeaker.userData.playing=playing;speakerLED.color.set(playing?'#8ceaa4':state.available?'#c7aa65':'#465446');speakerLED.emissiveIntensity=playing?1.4:0;},has:key=>circuits.has(key),toggle(key){const c=circuits.get(key);if(c){c.on=!c.on;apply();}},applyMood,update(dt){gameTime+=dt;if(gameTime-gameFrame>.08){gameFrame=gameTime;drawScreen();}},setLanguage(lang){language=lang;drawScreen();},
    frame(camera,controls,width,height,closeup=false){const portrait=width/height<.85;camera.fov=portrait?(closeup?48:54):(closeup?38:40);camera.aspect=width/height;
      if(closeup){camera.position.set(-1.48,2.34,.03);controls.target.set(-.20,1.95,1.02);}
      else{camera.position.set(2.62,2.70,3.20);controls.target.set(-.15,2.42,-.26);}
      if(portrait&&closeup)controls.target.set(-.22,1.96,1.15);
      if(portrait&&!closeup){camera.position.set(1.55,2.52,3.45);controls.target.set(-.45,2.05,-.02);}
      const target=controls.target.clone();if(portrait){const d=camera.position.clone().sub(target);camera.position.copy(target).add(d.multiplyScalar(closeup?1.50:1.35));}
      camera.updateProjectionMatrix();camera.lookAt(target);controls.update();
    }
  };
}
