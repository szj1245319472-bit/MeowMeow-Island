import * as THREE from 'three';

export function decorate(ctx){
const {model,scene,box,cyl,rod,mesh,mat,plane,group,frame,texText,textures,desk,laptop,drawing,cam,turn,headphones,lamp,chair,standing,bass,shelf,graphics,games,videos,contact,windowGroup,wood,ivory,wallmat,hemi,sun,fill,deskLight}=ctx;
model.name='Ataro_Pegboard_Desk_Studio';model.remove(...model.children.slice(0,3));model.remove(windowGroup,standing);
wood.color.set('#ae8b54');ivory.color.set('#e1decd');wallmat.color.set('#dedacb');
const oak=mat('#b79860'),edge=mat('#9a7b4d'),mustard=mat('#c1ad35'),cream=mat('#ddd7bc'),black=mat('#282e28'),red=mat('#96382f'),silver=mat('#9ba093',.45,.55);
const set=new THREE.Group();set.name='Compact_desk_surroundings';model.add(set);
// Compact stage, limited to the desk and its immediate surroundings.
box(6.9,.1,4.0,.30,-.08,.40,edge,set);for(let i=0;i<22;i++)for(let j=0;j<3;j++)box(.307,.016,1.31,-2.99+i*.312,-.02,-.91+j*1.32,mat(['#b49563','#bc9e70','#ad9062'][i%3]),set);
box(6.9,4.24,.10,.3,2.08,-1.55,wallmat,set);box(6.9,.08,.055,.3,.025,-1.46,edge,set);
// Pale plywood pegboard. Small holes are baked into a repeating surface texture;
// board, pegs, shelves and attached objects are all physical geometry.
let c=document.createElement('canvas');c.width=c.height=256;let g=c.getContext('2d');g.fillStyle='#c6ab79';g.fillRect(0,0,256,256);for(let i=0;i<1600;i++){g.fillStyle=i%2?'#b3936514':'#e5ce9a19';g.fillRect((i*73)%256,(i*119)%256,1,9);}for(let x=16;x<256;x+=32)for(let y=16;y<256;y+=32){g.fillStyle='#574b36';g.beginPath();g.arc(x,y,1.7,0,Math.PI*2);g.fill();g.fillStyle='#e9d8a7';g.fillRect(x-1,y+2,2,1);}
const pegTx=new THREE.CanvasTexture(c);pegTx.colorSpace=THREE.SRGBColorSpace;pegTx.wrapS=pegTx.wrapT=THREE.RepeatWrapping;pegTx.repeat.set(2.5,2.5);const pegmat=new THREE.MeshStandardMaterial({map:pegTx,roughness:1});
box(3.98,3.85,.09,-.80,2.05,-1.42,pegmat,set);box(.12,3.92,.12,-2.85,2.04,-1.40,edge,set);
// Keep the original full-size worktop and all portfolio interactions.
laptop.position.set(-.22,1.65,.18);laptop.scale.setScalar(1.14);cam.position.set(1.06,1.74,.02);drawing.position.set(.53,1.65,.40);drawing.rotation.y=.10;headphones.position.set(1.53,1.69,.34);contact.position.set(-.68,1.65,.39);
lamp.position.set(-1.55,1.64,-.28);lamp.scale.setScalar(1.22);lamp.traverse(o=>{if(o.isMesh&&!o.material.emissive?.getHex())o.material=red;});
chair.position.set(-.22,0,.76);chair.rotation.y=Math.PI;
// Ergonomic headrest and spine support supplement the existing chair geometry.
box(.47,.21,.12,0,1.90,-.35,black,chair);rod([0,1.62,-.39],[0,1.86,-.39],.027,silver,chair);for(let y=1.10;y<1.68;y+=.14)box(.44,.075,.035,0,y,-.38,mat('#40473e'),chair);
// Yellow metal drawer pedestal with handles, label slots and castors.
const drawer=group('Yellow_drawer_pedestal',null,-1.4,0,.04);box(.73,1.33,1.04,0,.75,0,mustard,drawer);for(let i=0;i<5;i++){let y=.22+i*.25;box(.68,.235,.028,0,y,.536,mat(i%2?'#b9a63a':'#c6b244'),drawer);box(.22,.069,.008,0,y+.025,.556,cream,drawer);rod([-.085,y-.038,.582],[.085,y-.038,.582],.014,silver,drawer);}for(let x of [-.26,.26])for(let z of [-.36,.36]){let w=cyl(.045,.045,.035,x,.065,z,black,drawer,10);w.rotation.z=Math.PI/2;}
// Narrow book / VHS storage at the left, sharing the original film click target.
videos.position.set(-2.35,.65,.00);videos.scale.set(.84,1.07,1.3);const leftShelf=group('Book_stack_column','books',-2.35,0,.02);for(let y of [.08,1.28,1.62])box(.68,.045,.7,0,y,0,oak,leftShelf);for(let x of [-.31,.31])box(.05,1.63,.68,x,.82,0,oak,leftShelf);for(let i=0;i<4;i++){let b=box(.52,.055,.51,0,1.35+i*.06,.03,mat(['#ceccb3','#4e6357','#baaa79','#926350'][i]),leftShelf);b.rotation.y=i*.03;}
// Right cubby cabinet, turntable on its surface, and the plant behind it.
const storage=group('Oak_record_and_book_storage','books',2.58,0,-.05);for(let y of [.06,.78,1.52])box(1.38,.075,1.38,0,y,0,oak,storage);for(let x of [-.65,0,.65])box(.065,1.5,1.32,x,.78,0,oak,storage);box(1.32,1.44,.04,0,.78,-.65,edge,storage);
for(let i=0;i<6;i++){let h=.40+(i%3)*.07;box(.061,h,.43,-.52+i*.073,.825+h/2,.22,mat(['#657960','#dfd5b8','#a1aa99','#775b43','#bfaa66','#48716e'][i]),storage);}
box(.49,.39,.57,.33,.30,.23,mat('#7c8846'),storage);box(.20,.06,.014,.33,.38,.523,cream,storage);for(let i=0;i<4;i++)box(.46,.063,.51,.32,.89+i*.07,.22,mat(i%2?'#d7d2bc':'#888c7e'),storage);
turn.position.set(2.63,1.65,.35);turn.scale.setScalar(.83);
// All original floor and wall collectibles are kept close to the work area.
bass.position.set(3.36,.20,.71);bass.scale.setScalar(.78);bass.rotation.z=-.12;
shelf.position.set(.37,3.28,-1.10);shelf.scale.setScalar(.69);
graphics.position.set(.38,2.45,-1.33);graphics.scale.setScalar(.78);
games.position.set(2.39,3.18,-1.43);games.scale.setScalar(.63);
model.children.filter(o=>o.isMesh&&o.userData.key==='music').forEach(o=>{o.position.z+=.49;o.position.x=3.43;o.scale.setScalar(.7);});
// Large clock, additional shallow shelf and a sculptural yellow pencil.
const clock=group('Pegboard_clock',null,-1.84,3.45,-1.29);let rim=cyl(.37,.37,.065,0,0,0,edge,clock,32);rim.rotation.x=Math.PI/2;let face=cyl(.343,.343,.072,0,0,.018,cream,clock,32);face.rotation.x=Math.PI/2;for(let i=0;i<60;i++){let a=i/60*Math.PI*2,r=.306;const tick=box(i%5?.008:.015,i%5?.022:.045,.007,Math.sin(a)*r,Math.cos(a)*r,.059,black,clock);tick.rotation.z=-a;}rod([0,0,.07],[.25,.05,.07],.009,black,clock);rod([0,0,.075],[-.055,.18,.075],.014,black,clock);
box(1.17,.054,.32,-1.19,2.50,-1.14,oak,set);for(let x of [-1.63,-.76]){rod([x,2.48,-1.12],[x,2.26,-1.29],.015,silver,set);}
const pencil=group('Yellow_pencil_sculpture',null,-.92,2.53,-1.1);cyl(.08,.08,.55,0,.275,0,mustard,pencil,6);cyl(0,.08,.17,0,.635,0,mat('#c5ad7c'),pencil,6);cyl(0,.026,.065,0,.722,0,black,pencil,6);
const cup=cyl(.08,.065,.14,-1.48,2.61,-1.12,mat('#dedac7'),set);for(let i=0;i<6;i++)rod([-1.48,2.58,-1.12],[-1.56+i*.027,2.86+(i%2)*.04,-1.12+Math.sin(i)*.04],.008,mat(['#a34c39','#727964','#b79a4b'][i%3]),set);
// Pinned cards on the left edge of the board, with actual pin heads.
for(let i=0;i<6;i++){let x=-2.54,y=3.7-i*.36,tx=texText(['NOTES','STUDIO','LIGHT','ATARO','DESIGN','IDEAS'][i],'ARCHIVE',['#d7ce9f','#59839a','#c4b691'][i%3],'#293d3d');const p=plane(.25,.29,tx,x,y,-1.354,set);p.rotation.z=Math.sin(i)*.07;let pin=mesh(new THREE.SphereGeometry(.019,6,4),mustard,[x,y+.12,-1.331],set);}
// Small stacks of books and papers on the desktop.
for(let i=0;i<4;i++){let b=box(.31,.025,.25,-.94,1.65+i*.027,.31,mat(i%2?'#d8cfb6':'#719083'),set);b.rotation.y=i*.08;}for(let i=0;i<3;i++)box(.3,.015,.23,.66,1.69+i*.018,-.19,cream,set);
// Broad split leaves, terracotta ribbed pot and individual stems.
const plant=group('Philodendron',null,2.52,1.56,-.49);cyl(.18,.13,.28,0,.15,0,mat('#b28660'),plant,14);cyl(.161,.161,.012,0,.296,0,mat('#4d4630'),plant,14);for(let i=0;i<14;i++){let a=i/14*Math.PI*2;rod([Math.cos(a)*.136,.03,Math.sin(a)*.136],[Math.cos(a)*.183,.29,Math.sin(a)*.183],.007,mat('#936e4e'),plant);}
for(let i=0;i<7;i++){let a=i*2.399,h=.62+(i%3)*.19,ex=Math.cos(a)*.4,ez=Math.sin(a)*.38;rod([0,.25,0],[ex,h,ez],.012,mat('#597145'),plant,6);let s=new THREE.Shape();s.moveTo(0,-.20);s.lineTo(-.12,-.10);s.lineTo(-.07,-.035);s.lineTo(-.23,-.015);s.lineTo(-.11,.045);s.lineTo(-.28,.09);s.lineTo(-.10,.105);s.lineTo(-.21,.20);s.lineTo(-.07,.16);s.lineTo(0,.32);s.lineTo(.07,.16);s.lineTo(.21,.20);s.lineTo(.10,.105);s.lineTo(.28,.09);s.lineTo(.11,.045);s.lineTo(.23,-.015);s.lineTo(.07,-.035);s.lineTo(.12,-.10);s.closePath();let leaf=mesh(new THREE.ExtrudeGeometry(s,{depth:.006,bevelEnabled:false}),new THREE.MeshStandardMaterial({color:i%2?'#3d6537':'#557947',roughness:.9,side:THREE.DoubleSide}),[ex,h,ez],plant);leaf.rotation.set(-.7,a,.2);}
// A small woven rug only beneath the chair, no full-room furniture.
let r=document.createElement('canvas');r.width=r.height=128;let rc=r.getContext('2d');rc.fillStyle='#a48e66';rc.fillRect(0,0,128,128);for(let i=0;i<128;i+=4){rc.fillStyle='#cab78d';rc.fillRect(0,i,128,1);rc.fillStyle='#79684a66';rc.fillRect(i,0,1,128);}let rt=new THREE.CanvasTexture(r);rt.colorSpace=THREE.SRGBColorSpace;rt.wrapS=rt.wrapT=THREE.RepeatWrapping;rt.repeat.set(6,5);box(1.95,.02,1.6,.14,.005,1.29,new THREE.MeshStandardMaterial({map:rt,roughness:1}),set);
scene.background.set('#c7c2b3');hemi.color.set('#fff8e5');hemi.groundColor.set('#817864');hemi.intensity=1.8;sun.color.set('#fff0ce');sun.intensity=2.7;sun.position.set(4,7,4);fill.color.set('#e9ece5');fill.intensity=.5;deskLight.position.set(-1.24,2.23,-.25);deskLight.intensity=.35;
return {applyMood(night){scene.background.set(night?'#615b4e':'#c7c2b3');hemi.intensity=night?.7:1.8;sun.intensity=night?.8:2.7;sun.color.set(night?'#f1c181':'#fff0ce');deskLight.intensity=night?2.1:.35;}};
}
