import * as THREE from 'three';

// Leaf-ear head derived from the latest supplied reference.
// Reference: codex-clipboard-be1d3b1c-317b-42f3-a7af-95f1d7ba50ea.png.
// The earlier selected model is preserved in cat-model-selected.js.
export function buildCatModel(cat) {
  let seed = 7223;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function texture(face = false) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const c = canvas.getContext('2d');
    c.fillStyle = '#292b2e'; c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 5600; i++) {
      const x = random() * 128, y = random() * 128, v = 25 + Math.floor(random() * 29);
      c.fillStyle = `rgb(${v},${v + 1},${v + 3})`;
      c.fillRect(x, y, 1, 1 + random() * 2);
    }
    if (face) {
      for (const x of [50, 78]) {
        const g = c.createRadialGradient(x, 96, 1, x, 96, 17);
        g.addColorStop(0, '#777975'); g.addColorStop(1, 'rgba(65,69,70,0)');
        c.fillStyle = g; c.fillRect(x - 19, 77, 38, 38);
      }
      for (const x of [39, 89]) {
        // Round black pupils sit high in amber irises, leaving a wider gold lower rim.
        // The UV aspect correction keeps both the iris and pupil circular on the mesh.
        c.fillStyle = '#101215'; c.beginPath(); c.ellipse(x, 65, 12, 15, 0, 0, Math.PI * 2); c.fill();
        const iris = c.createLinearGradient(x, 51, x, 79);
        iris.addColorStop(0, '#ce8b29'); iris.addColorStop(.6, '#efb63b'); iris.addColorStop(1, '#ffd06a');
        c.fillStyle = iris; c.beginPath(); c.ellipse(x, 65, 11, 14, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#080a0b'; c.beginPath(); c.ellipse(x + .5, 62.1, 8.1, 10.7, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff9e9'; c.beginPath(); c.ellipse(x - 3, 55.8, 1.8, 2.3, 0, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = '#4d4548'; c.beginPath(); c.moveTo(57, 92); c.lineTo(71, 92); c.lineTo(64, 98); c.fill();
      c.strokeStyle = '#16191b'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(64, 97); c.lineTo(64, 103); c.lineTo(57, 105); c.moveTo(64, 103); c.lineTo(71, 105); c.stroke();
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestMipmapNearestFilter;
    return t;
  }
  const fur = new THREE.MeshStandardMaterial({ map: texture(), roughness: 1, flatShading: true });
  // Fine curved strands follow the face vertically; only the eyes emit light.
  function headTexture(eyes = false, emission = false) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const c = canvas.getContext('2d');
    c.fillStyle = emission ? '#000000' : '#262326'; c.fillRect(0,0,256,256);
    if (!emission) {
      for (let x = -8; x < 265; x += 2.6) {
        for (let y = -8; y < 265; y += 17 + random()*12) {
          const bend = Math.sin(y*.024+x*.031)*2.4;
          const v = 45 + Math.floor(random()*37);
          c.strokeStyle = `rgb(${v},${Math.round(v*.81)},${Math.round(v*.70)})`;
          c.lineWidth = .65 + random()*.65;
          c.beginPath(); c.moveTo(x+bend,y);
          c.bezierCurveTo(x+bend+2,y+6,x+bend-2,y+14,x+bend+random()*2,y+23); c.stroke();
        }
      }
    }
    if (eyes) {
      for (const x of [88,168]) {
        const g=c.createLinearGradient(x,127,x,181);
        g.addColorStop(0,'#fff886');g.addColorStop(.52,'#ffe950');g.addColorStop(1,'#ffbf27');
        c.fillStyle=g;c.beginPath();c.ellipse(x,154,12,25,0,0,Math.PI*2);c.fill();
        c.fillStyle='#fffde3';c.beginPath();c.ellipse(x-3,144,3,7,.18,0,Math.PI*2);c.fill();
      }
    }
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
    t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapNearestFilter;return t;
  }
  const faceMaterial = new THREE.MeshStandardMaterial({map:headTexture(true),roughness:1,
    emissiveMap:headTexture(true,true),emissive:'#fff0ba',emissiveIntensity:.55});
  const earMaterial = new THREE.MeshStandardMaterial({map:headTexture(),roughness:1});
  function mesh(geometry, material, position, parent = cat, name = '') {
    const o = new THREE.Mesh(geometry, material);
    o.position.set(...position); o.castShadow = o.receiveShadow = true; o.name = name; parent.add(o); return o;
  }
  function oval(position, scale, parent = cat, name = '') {
    const o = mesh(new THREE.SphereGeometry(1, 8, 6), fur, position, parent, name); o.scale.set(...scale); return o;
  }
  oval([0, .41, -.015], [.175, .335, .19], cat, 'Seated_torso');
  mesh(new THREE.CylinderGeometry(.12, .105, .18, 8), fur, [0, .755, -.015], cat, 'Connected_neck');
  oval([0, .28, .065], [.19, .215, .205], cat, 'Round_belly');
  oval([0, .13, -.055], [.205, .135, .18], cat, 'Seated_haunches');
  for (const sign of [-1, 1]) oval([sign * .125, .055, .125], [.087, .055, .12], cat, 'Hind_paw');

  const arms = [-1, 1].map(sign => {
    const shoulder = new THREE.Vector3(sign * .145, .65, .065);
    const elbow = new THREE.Vector3(sign * .175, .667, .255);
    const upper = mesh(new THREE.CylinderGeometry(.052, .061, 1, 7), fur, [0, 0, 0]);
    const forearm = mesh(new THREE.CylinderGeometry(.045, .052, 1, 7), fur, [0, 0, 0]);
    const joint = oval(elbow.toArray(), [.054, .053, .054]);
    const paw = oval([sign * .14, .728, .455], [.065, .036, .083], cat, sign < 0 ? 'Typing_left_paw' : 'Typing_right_paw');
    return { shoulder, elbow, upper, forearm, joint, paw, sign };
  });
  const up = new THREE.Vector3(0, 1, 0);
  function segment(part, a, b) {
    part.position.copy(a).add(b).multiplyScalar(.5);
    part.scale.y = a.distanceTo(b);
    part.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
  }
  let typingTime = 0, burstRemaining = 5 + Math.random() * 4, pauseRemaining = 0;
  let typingSpeed = 9 + Math.random() * 3.5;
  function type(dt, reduced, paused = false) {
    if (!paused) {
      if (pauseRemaining > 0) {
        pauseRemaining -= dt;
        if (pauseRemaining <= 0) { burstRemaining = 5 + Math.random() * 4; typingSpeed = 9 + Math.random() * 3.5; }
      } else {
        burstRemaining -= dt;
        if (burstRemaining <= 0) pauseRemaining = .6 + Math.random() * .4;
      }
    }
    const active = !paused && pauseRemaining <= 0;
    if (active) typingTime += dt * typingSpeed;
    for (const arm of arms) {
      const lift = reduced || !active ? 0 : Math.max(0, Math.sin(typingTime + (arm.sign > 0 ? Math.PI : 0))) * .028;
      arm.paw.position.y = .728 + lift;
      const elbow = arm.elbow.clone(); elbow.y += lift * .3;
      arm.joint.position.copy(elbow);
      segment(arm.upper, arm.shoulder, elbow); segment(arm.forearm, elbow, arm.paw.position);
    }
    return active;
  }
  type(0, true);

  const head = new THREE.Group();
  head.name = 'Closed_lowpoly_cat_head'; head.position.set(0, .96, 0); head.rotation.z = -.10; cat.add(head);
  // Crown, broad cheek and almost level chin landmarks, excluding the ears.
  // Remove the reference's eye-line tilt before fitting the head to its rig.
  const referenceOutline=[[139,136],[155,117],[178,97],[209,86],[233,87],[264,98],
    [283,115],[306,142],[315,169],[315,200],[303,229],[280,241],[248,247],
    [213,246],[180,239],[153,228],[140,209],[132,185],[131,161]];
  const angle=Math.atan2(10,71);
  const outline=referenceOutline.map(([x,y])=>{
    const dx=x-222,dy=y-171;
    return [(Math.cos(angle)*dx+Math.sin(angle)*dy)*.003,
      (Math.sin(angle)*dx-Math.cos(angle)*dy)*.003];
  }).reverse();
  const positions=[],uvs=[],indices=[],n=outline.length;
  const addVertex=(p,uv)=>{const i=positions.length/3;positions.push(...p);uvs.push(...uv);return i;};
  const faceUV=(x,y)=>[(x+.34)/.68,(y+.25)/.52];
  const frontRings=[];
  for(const [scale,depth] of [[1,.07],[.80,.184],[.44,.237]]){
    frontRings.push(outline.map(([x,y])=>{
      x*=scale;y*=scale;
      return addVertex([x,y,depth+(y<0?.012:0)*(1-scale)],faceUV(x,y));
    }));
  }
  for(let r=0;r<frontRings.length-1;r++)for(let i=0;i<n;i++){
    const j=(i+1)%n,a=frontRings[r][i],b=frontRings[r][j],c=frontRings[r+1][i],d=frontRings[r+1][j];
    indices.push(a,b,c,b,d,c);
  }
  const frontCenter=addVertex([0,0,.257],faceUV(0,0));
  for(let i=0;i<n;i++)indices.push(frontCenter,frontRings.at(-1)[i],frontRings.at(-1)[(i+1)%n]);
  const faceIndexCount=indices.length;
  const sideRings=[];
  const profiles=[[1,.07],[.99,0],[.93,-.105],[.70,-.19],[.35,-.237]];
  for(let r=0;r<profiles.length;r++){
    const [scale,z]=profiles[r],ring=[];
    for(let i=0;i<=n;i++){
      const [x,y]=outline[i%n];ring.push(addVertex([x*scale,y*scale,z],[i/n,1-r*.215]));
    }
    sideRings.push(ring);
  }
  for(let r=0;r<sideRings.length-1;r++)for(let i=0;i<n;i++){
    const a=sideRings[r][i],b=sideRings[r][i+1],c=sideRings[r+1][i],d=sideRings[r+1][i+1];
    indices.push(a,c,b,b,c,d);
  }
  const backRing=sideRings.at(-1).map(i=>{
    const p=positions.slice(i*3,i*3+3);return addVertex(p,[(p[0]+.25)/.5,(p[1]+.20)/.42]);
  });
  const backCenter=addVertex([0,0,-.251],[.5,.5]);
  for(let i=0;i<n;i++)indices.push(backCenter,backRing[i+1],backRing[i]);
  const skullGeometry = new THREE.BufferGeometry();
  skullGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  skullGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); skullGeometry.setIndex(indices);
  skullGeometry.addGroup(0, faceIndexCount, 1); skullGeometry.addGroup(faceIndexCount, indices.length - faceIndexCount, 0);
  skullGeometry.computeVertexNormals();
  // Average the duplicate UV-seam normals so cheeks flow into the sides and chin.
  const normals=skullGeometry.attributes.normal, normalGroups=new Map();
  for(let i=0;i<positions.length/3;i++){
    const key=positions.slice(i*3,i*3+3).map(v=>(Math.abs(v)<1e-6?0:v).toFixed(6)).join(',');
    if(!normalGroups.has(key))normalGroups.set(key,[]);normalGroups.get(key).push(i);
  }
  for(const ids of normalGroups.values()){
    const normal=new THREE.Vector3();ids.forEach(i=>normal.add(new THREE.Vector3().fromBufferAttribute(normals,i)));normal.normalize();
    ids.forEach(i=>normals.setXYZ(i,normal.x,normal.y,normal.z));
  }
  const headFur=new THREE.MeshStandardMaterial({map:headTexture(),roughness:1});
  const skull = mesh(skullGeometry, [headFur, faceMaterial], [0, 0, 0], head, 'Watertight_textured_skull');
  skull.userData.auditClosed = true;

  // The two curved ear boundaries follow the photo rather than generic triangles.
  const referenceEars=[
    [[141,135],[129,111],[122,85],[118,58],[118,41],[122,35],[130,35],[153,47],[177,65],[197,88],[180,117]],
    [[268,104],[286,88],[312,73],[336,62],[348,60],[354,64],[354,77],[348,103],[333,130],[313,151],[289,130]]
  ];
  for (let side=0;side<referenceEars.length;side++) {
    const points=referenceEars[side].map(([x,y])=>{
      const dx=x-222,dy=y-171;
      return [(Math.cos(angle)*dx+Math.sin(angle)*dy)*.003,
        (Math.sin(angle)*dx-Math.cos(angle)*dy)*.003,-.005];
    });
    const count=points.length,center=new THREE.Vector3();
    points.forEach(p=>center.add(new THREE.Vector3(...p)));center.multiplyScalar(1/count);
    points.push([center.x,center.y,.065],[center.x,center.y,-.07]);
    const faces=[];
    for(let i=0;i<count;i++){
      const j=(i+1)%count;faces.push([i,j,count],[j,i,count+1]);
    }
    const index=[];
    for(const tri of faces){
      const [a,b,c]=tri.map(i=>new THREE.Vector3(...points[i]));
      const normal=b.clone().sub(a).cross(c.clone().sub(a));
      const outward=a.clone().add(b).add(c).multiplyScalar(1/3).sub(center);
      index.push(...(normal.dot(outward)>0?tri:[tri[0],tri[2],tri[1]]));
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(points.flatMap(([x,y])=>[(Math.abs(x)-.08)/.28,(y-.12)/.36]),2));
    g.setIndex(index);g.computeVertexNormals();
    const ear=mesh(g,earMaterial,[0,0,0],head,side===0?'Left_solid_ear':'Right_solid_ear');ear.userData.auditClosed=true;
  }
  const whiskerMat=new THREE.MeshStandardMaterial({color:'#292626',roughness:1});
  for(const sign of [-1,1])for(let i=0;i<3;i++){
    const points=[[sign*.239,-.108-i*.025,.136],[sign*.31,-.104-i*.034,.13],[sign*(.373-i*.008),-.094-i*.047,.115]];
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),3,.004,4),
      whiskerMat,[0,0,0],head,'Cheek_whisker');
  }
  const tail = new THREE.Group(); tail.name = 'Upright_curled_tail'; cat.add(tail);
  const tailPoints = [[.12,.12,-.11],[.245,.18,-.225],[.285,.31,-.245],[.265,.435,-.19],[.23,.455,-.145]].map(p => new THREE.Vector3(...p));
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPoints), 9, .033, 6), fur, [0,0,0], tail);
  oval(tailPoints.at(-1).toArray(), [.033,.033,.033], tail, 'Tail_tip');

  const headset=new THREE.Group();headset.name='Cat_headphones';head.add(headset);
  const hpMat=new THREE.MeshStandardMaterial({color:'#242939',roughness:.85,flatShading:true});
  const bandPoints=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI;bandPoints.push(new THREE.Vector3(Math.cos(a)*.319,Math.sin(a)*.267-.005,-.142));}
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bandPoints),12,.029,6),hpMat,[0,0,0],headset);
  for(const x of [-.304,.304]){const pad=mesh(new THREE.SphereGeometry(1,8,5),hpMat,[x,-.025,-.098],headset);pad.scale.set(.057,.126,.09);}
  return {head,skull,tail,arms,type};
}
