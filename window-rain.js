import * as THREE from 'three';

export function createWindowRain(model){
  const group=new THREE.Group();group.name='Rain_outside_window';model.add(group);
  // The room wall and opaque mullions naturally occlude the outdoor rain.
  const count=360,positions=new Float32Array(count*6),drops=[];
  let seed=719;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++)drops.push({x:-6+random()*6,y:random()*6,z:-1.65-random()*1.6,speed:2.1+random()*2.2,len:.06+random()*.14});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  const rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#a4badc',transparent:true,opacity:.35,depthWrite:false}));rain.frustumCulled=false;rain.raycast=()=>{};rain.name='Outdoor_rain_streaks';group.add(rain);
  // Slow narrow runnels on the window glass, behind its frame.
  const trails=[],vertices=new Float32Array(30*6);
  for(let i=0;i<30;i++)trails.push({x:-4.29+random()*3.48,y:1.43+random()*2.83,speed:.035+random()*.12,len:.025+random()*.15});
  const glassGeometry=new THREE.BufferGeometry();glassGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3).setUsage(THREE.DynamicDrawUsage));
  const glass=new THREE.LineSegments(glassGeometry,new THREE.LineBasicMaterial({color:'#c2d4e5',transparent:true,opacity:.31,depthWrite:false}));glass.frustumCulled=false;glass.raycast=()=>{};glass.name='Glass_water_trails';group.add(glass);
  function update(dt,reduced=false){
    const step=reduced?0:dt;
    drops.forEach((d,i)=>{d.y-=step*d.speed;if(d.y<0)d.y+=6;positions.set([d.x,d.y,d.z,d.x+.025,d.y+d.len,d.z],i*6);});
    trails.forEach((d,i)=>{d.y-=step*d.speed;if(d.y<1.43)d.y=4.26;vertices.set([d.x,d.y,-1.395,d.x+.003,Math.min(4.26,d.y+d.len),-1.395],i*6);});
    geometry.attributes.position.needsUpdate=true;glassGeometry.attributes.position.needsUpdate=true;
  }
  update(0);return {group,update};
}
