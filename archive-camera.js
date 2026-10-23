import * as THREE from 'three';

// Each shot approaches the actual object from the open side of the desk.
const shots = {
  ai: [[1.45, 2.75, 1.65], [.02, 2.22, -.25]],
  drawing: [[1.25, 3.45, 1.8], [1.03, 1.66, .51]],
  photo: [[2.85, 2.5, 1.85], [2.25, 1.78, .2]],
  graphic: [[2.62, 3.12, 1.12], [2.35, 2.9, -1.27]],
  books: [[.85, 3.65, 1.35], [.30, 3.28, -1.15]],
  games: [[2.5, 4.05, 1.25], [1.92, 3.78, -1.3]],
  films: [[-.75, 1.7, 2.15], [-2.06, 1.0, -.23]],
  music: [[3.35, 3.25, 1.6], [2.42, 1.8, -.33]],
  about: [[-1.12, 3.1, 1.9], [-1.29, 1.65, .47]],
  contact: [[-1.12, 3.1, 1.9], [-1.29, 1.65, .47]],
  all: [[2.62, 2.85, 3.25], [.35, 2.38, -.3]],
};

export function createArchiveCamera(camera, controls, reduced) {
  let origin = null, motion = null, key = null, phase = 'idle';
  const snapshot = () => ({ position: camera.position.clone(), target: controls.target.clone(), fov: camera.fov });
  function apply(pose) {
    camera.position.copy(pose.position); controls.target.copy(pose.target); camera.fov = pose.fov;
    camera.updateProjectionMatrix(); camera.lookAt(controls.target); controls.update();
  }
  function destination(name) {
    const [p, t] = shots[name] || shots.all;
    const position = new THREE.Vector3(...p), target = new THREE.Vector3(...t);
    const portrait = innerWidth < 760, fov = portrait ? 48 : 42;
    const direction = position.clone().sub(target), distance = direction.length();
    if (portrait) {
      position.copy(target).add(direction.multiplyScalar(1.35));
      // Keep the object above the bottom sheet on small screens.
      const forward = target.clone().sub(position).normalize();
      const right = forward.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
      const up = right.clone().cross(forward).normalize();
      const shift = up.multiplyScalar(-distance * 1.35 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * .56);
      position.add(shift); target.add(shift);
    } else {
      // Leave the focused object in the visible left third beside the archive.
      const right = target.clone().sub(position).cross(new THREE.Vector3(0, 1, 0)).normalize();
      const shift = right.multiplyScalar(distance * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camera.aspect * .64);
      position.add(shift); target.add(shift);
    }
    return {position, target, fov};
  }
  function stop() { if (motion) { const pending = motion; motion = null; pending.resolve(false); } }
  function move(to, duration, nextPhase) {
    stop();
    if (reduced) { apply(to); phase = nextPhase; return Promise.resolve(true); }
    return new Promise(resolve => { motion = {from:snapshot(), to, elapsed:0, duration, nextPhase, resolve}; });
  }
  return {
    get phase() { return phase; }, get key() { return key; },
    get busy() { return phase !== 'idle'; },
    async focus(name) {
      const switching=Boolean(origin);
      if (!origin) origin = snapshot();
      key = name; phase = 'approaching';
      return move(destination(name), switching?.32:.62, 'open');
    },
    async restore() {
      key = null;
      if (!origin) { stop(); phase = 'idle'; return; }
      phase = 'returning';
      const restored = await move(origin, .42, 'idle');
      if (restored) origin = null;
    },
    cancel() { stop(); origin = null; key = null; phase = 'idle'; },
    // Called after the ordinary fixed-camera layout has adapted to a resize.
    resize() {
      if (!origin) return;
      origin = snapshot();
      if (key) {
        const to = destination(key);
        if (motion) { motion.from = snapshot(); motion.to = to; motion.elapsed = 0; }
        else apply(to);
      } else if (motion) motion.to = origin;
    },
    update(dt) {
      if (!motion) return;
      const m = motion; m.elapsed += dt;
      const t = Math.min(1, m.elapsed / m.duration), ease = t*t*t*(t*(6*t-15)+10);
      apply({position:m.from.position.clone().lerp(m.to.position,ease),
        target:m.from.target.clone().lerp(m.to.target,ease), fov:THREE.MathUtils.lerp(m.from.fov,m.to.fov,ease)});
      if (t === 1) { motion = null; phase = m.nextPhase; m.resolve(true); }
    },
  };
}
