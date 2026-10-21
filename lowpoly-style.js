import * as THREE from 'three';

// Geometry and material treatment, independent from the desk layout and its actions.
export function stylize({model,scene,chair,laptop,wood,ivory,wallmat,renderer,hemi,sun,fill,deskLight}){
const palette={cream:'#cec6b6',wood:'#493d31',blue:'#064879',rust:'#a14f35',red:'#681f1e',yellow:'#d8c780',green:'#5e6e52'};
const replace={
'ae8b54':palette.wood,'e1decd':palette.cream,'dedacb':'#e0d8c9',
'b79860':'#594938','9a7b4d':'#3d332b','b49563':'#403a30','bc9e70':'#443d32','ad9062':'#3c382f',
'c1ad35':'#d2c9b5','b9a63a':'#c2b8a1','c6b244':'#d0c5ae',
'96382f':palette.red,'a34c39':palette.rust,'c5ad7c':'#b79a74',
'7c8846':'#6a7050','b28660':palette.rust,'936e4e':'#764831',
'3d6537':'#455c3c','557947':palette.green,'597145':'#506143'
};
function grain(color,kind='paint'){const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d');cx.fillStyle=color;cx.fillRect(0,0,128,128);const im=cx.getImageData(0,0,128,128);let seed=7439;for(let y=0;y<128;y++)for(let x=0;x<128;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let rnd=seed/4294967296,shade=.96+(rnd-.5)*.045;if(kind==='wood')shade-=.055*(.5+.5*Math.sin(x*.6+Math.sin(y*.045)*2));if(kind==='paint')shade-=.035*Math.max(0,1-Math.min(x,y,127-x,127-y)/4);let k=(y*128+x)*4;for(let a=0;a<3;a++)im.data[k+a]*=shade;}cx.putImageData(im,0,0);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestMipmapNearestFilter;return tx;}
const converted=new Map();let meshes=0;
model.traverse(o=>{if(!o.isMesh)return;meshes++;
const geo=o.geometry,p=geo.parameters||{};
if(geo.type==='CylinderGeometry'){o.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,p.radiusTop>.25?12:6,1,p.openEnded,p.thetaStart,p.thetaLength);}
else if(geo.type==='SphereGeometry'){o.geometry=new THREE.SphereGeometry(p.radius,6,4);}
else if(geo.type==='TorusGeometry'){o.geometry=new THREE.TorusGeometry(p.radius,p.tube,3,12,p.arc);}
else if(geo.type==='ExtrudeGeometry'&&p.shapes){o.geometry=new THREE.ExtrudeGeometry(p.shapes,{depth:p.options.depth||.05,bevelEnabled:false,curveSegments:3,steps:1});}
const old=Array.isArray(o.material)?o.material:[o.material];const updated=old.map(m=>{
if(converted.has(m))return converted.get(m);
const n=m.clone();n.flatShading=true;n.metalness=0;n.roughness=1;
const hex=m.color?.getHexString();if(replace[hex])n.color.set(replace[hex]);
// Replace woven-rug and pegboard textures with low-resolution, palette-led surfaces.
if(m.map&&m.map.repeat.x===6&&m.map.repeat.y===5){n.map=grain(palette.rust);n.color.set('#ffffff');}
else if(m.map&&m.map.repeat.x===2.5){n.map=grain('#c7bdab');n.color.set('#ffffff');}
else if(!m.map&&!m.transparent&&!m.emissive?.getHex()){n.map=grain('#ffffff',n.color.r>n.color.g*1.10&&n.color.b<n.color.g*.85?'wood':'paint');}
if(n.map){n.map.magFilter=THREE.NearestFilter;n.map.minFilter=THREE.NearestMipmapNearestFilter;}
n.needsUpdate=true;converted.set(m,n);return n;});
o.material=Array.isArray(o.material)?updated:updated[0];
});
// Replace dozens of separate keycaps with one intentionally pixelated key texture.
const keyTexture=document.createElement('canvas');keyTexture.width=128;keyTexture.height=64;const kc=keyTexture.getContext('2d');kc.fillStyle='#232c2b';kc.fillRect(0,0,128,64);kc.fillStyle='#758078';for(let r=0;r<4;r++)for(let c=0;c<11;c++)kc.fillRect(4+c*11,4+r*12,8,8);const kt=new THREE.CanvasTexture(keyTexture);kt.colorSpace=THREE.SRGBColorSpace;kt.magFilter=THREE.NearestFilter;
for(const child of [...laptop.children]){if(child.isMesh&&child.geometry.parameters?.width===.046)laptop.remove(child);if(child.isMesh&&child.geometry.parameters?.width===.7){child.material=new THREE.MeshStandardMaterial({map:kt,roughness:1,flatShading:true});}}
// Broader, angular cobalt upholstery replaces the thin office-chair slats.
const cobalt=new THREE.MeshStandardMaterial({color:palette.blue,map:grain('#ffffff'),flatShading:true,roughness:1});
for(const ch of [...chair.children]){if(!ch.isMesh)continue;if(ch.position.y>1.05&&ch.geometry.parameters?.width===.035){chair.remove(ch);continue;}if(ch.position.y>.8&&ch.geometry.parameters?.width>.4)ch.material=cobalt;}
const vertices=[-.34,1.06,-.29,.34,1.06,-.29,-.39,1.76,-.47,.39,1.76,-.47,-.34,1.06,-.42,.34,1.06,-.42,-.39,1.76,-.60,.39,1.76,-.60];
const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setIndex([0,1,2,1,3,2,5,4,7,4,6,7,4,0,6,0,2,6,1,5,3,5,7,3,2,3,6,3,7,6,4,5,0,5,1,0]);geom.computeVertexNormals();const back=new THREE.Mesh(geom,cobalt);back.castShadow=back.receiveShadow=true;chair.add(back);
// Tiny graphic pins replace the dense evenly spaced board perforations.
// Matte flat faces and broad warm shadows keep the look closer to textured retro models.
renderer.toneMapping=THREE.NoToneMapping;renderer.shadowMap.type=THREE.PCFShadowMap;
sun.shadow.mapSize.set(1024,1024);sun.shadow.radius=1;
function mood(night){scene.background.set(night?'#50483f':'#b4ac9e');hemi.color.set('#fff5e4');hemi.groundColor.set('#565043');hemi.intensity=night?.85:1.9;sun.color.set('#fff0d6');sun.intensity=night?.85:2.3;fill.intensity=.45;deskLight.intensity=night?1.6:.45;}
mood(false);model.name='Ataro_Retro_Lowpoly_Desk';return {applyMood:mood,palette};
}
