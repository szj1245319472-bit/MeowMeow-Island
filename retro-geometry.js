import * as THREE from 'three';

// Apply the polygon budget after the final room and cat have been built.
export function applyRetroGeometry(root) {
  const replaced = new Map();
  root.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry;
    let reduced = replaced.get(geometry);
    if (!reduced) {
      const p = geometry.parameters || {};
      if (geometry.type === 'CylinderGeometry' && p.radialSegments > 8)
        reduced = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 8, p.heightSegments, p.openEnded, p.thetaStart, p.thetaLength);
      else if (geometry.type === 'SphereGeometry' && (p.widthSegments > 8 || p.heightSegments > 6))
        reduced = new THREE.SphereGeometry(p.radius, Math.min(p.widthSegments, 8), Math.min(p.heightSegments, 6), p.phiStart, p.phiLength, p.thetaStart, p.thetaLength);
      else if (geometry.type === 'TorusGeometry' && p.tubularSegments > 10)
        reduced = new THREE.TorusGeometry(p.radius, p.tube, Math.min(p.radialSegments, 3), 10, p.arc);
      else if (geometry.type === 'TubeGeometry' && (p.tubularSegments > 8 || p.radialSegments > 4))
        reduced = new THREE.TubeGeometry(p.path, Math.min(p.tubularSegments, 8), p.radius, Math.min(p.radialSegments, 4), p.closed);
      if (reduced) { replaced.set(geometry, reduced); object.geometry = reduced; }
    } else object.geometry = reduced;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material?.isMeshStandardMaterial || material.flatShading) continue;
      material.flatShading = true;
      material.needsUpdate = true;
    }
  });
}
