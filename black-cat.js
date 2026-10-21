import * as THREE from 'three';
import { buildCatModel } from './cat-model-leaf.js?v=art-pass-1';

export function addBlackCat(chair) {
  const cat = new THREE.Group();
  cat.name = 'Black_lowpoly_cat';
  cat.userData.key = 'cat';
  cat.position.set(0, 1.005, .13);
  chair.add(cat);

  const { head, skull, tail, arms, type } = buildCatModel(cat);

  let time = 0, reacting = false, count = 0, trackingCamera = null, reducedReaction = false, isTyping = true;
  let idleTime=0,earWait=8+Math.random()*6,earMotion=0;
  const ears=[head.getObjectByName('Left_solid_ear'),head.getObjectByName('Right_solid_ear')];
  const earRest=ears.map(ear=>ear?.rotation.z||0);
  const rest = head.quaternion.clone(), start = rest.clone();
  const gaze = rest.clone(), tilted = rest.clone();
  const smooth = x => { x = THREE.MathUtils.clamp(x, 0, 1); return x*x*(3-2*x); };
  let phase = 'typing';
  function updateGaze() {
    if (!trackingCamera) { gaze.copy(rest); return; }
    cat.updateWorldMatrix(true,false);
    const local = cat.worldToLocal(trackingCamera.getWorldPosition(new THREE.Vector3())).sub(head.position).normalize();
    const yaw = Math.atan2(local.x,local.z), pitch = -Math.atan2(local.y,Math.hypot(local.x,local.z));
    gaze.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));
  }
  return {
    cat, head, skull, tail, arms, get reactions() { return count; }, get reactionPhase() { return phase; }, get isTyping(){return isTyping;},
    react(reduced = false, camera = null) {
      count++;if(reacting)return;
      time=0;reacting=true;trackingCamera=camera;reducedReaction=reduced;start.copy(head.quaternion);phase='turning';
      updateGaze();
      if(reduced){head.quaternion.copy(gaze);phase='looking';}
    },
    update(dt, reduced = false) {
      // The paws stay on the keyboard while the cat acknowledges the visitor.
      isTyping=type(dt,reduced,reacting);
      if (!reacting) {
        if(!reduced){idleTime+=dt;earWait-=dt;if(earWait<=0){earMotion=.34;earWait=8+Math.random()*6;}if(earMotion>0)earMotion=Math.max(0,earMotion-dt);}
        ears.forEach((ear,i)=>{if(ear)ear.rotation.z=earRest[i]+(reduced?0:Math.sin((.34-earMotion)/.34*Math.PI)*THREE.MathUtils.degToRad(i?3:-3)*(earMotion>0?1:0));});
        tail.rotation.y=reduced?0:Math.sin(idleTime*1.5)*.07;
        return;
      }
      time += dt;updateGaze();
      if(reducedReaction){
        if(time>=1.25){head.quaternion.copy(rest);reacting=false;phase='typing';}
        return;
      }
      const roll=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),THREE.MathUtils.degToRad(10));
      tilted.copy(gaze).multiply(roll);
      if(time<.12){phase='turning';head.quaternion.copy(start);}
      else if(time<.62){phase='turning';head.quaternion.slerpQuaternions(start,gaze,smooth((time-.12)/.50));}
      else if(time<.88){phase='tilting';head.quaternion.slerpQuaternions(gaze,tilted,smooth((time-.62)/.26));}
      else if(time<1.50){phase='looking';head.quaternion.copy(tilted);}
      else if(time<2.10){phase='returning';head.quaternion.slerpQuaternions(tilted,rest,smooth((time-1.50)/.60));}
      else{head.quaternion.copy(rest);reacting=false;phase='typing';}
      tail.rotation.y = reacting ? Math.sin(time*5)*.07 : 0;
    }
  };
}
