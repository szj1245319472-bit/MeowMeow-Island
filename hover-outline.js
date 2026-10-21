import * as THREE from 'three';

// Screen-space silhouette of the picked object, with normal scene depth occlusion.
// Selection helpers live outside the model and never enter the GLB export.
export function createHoverOutline(renderer, scene, camera, model) {
  const beauty = new THREE.WebGLRenderTarget(1, 1);
  const mask = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, toneMapped: false });
  const black = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, toneMapped: false });
  const screen = new THREE.Scene();
  const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: {
      image: { value: beauty.texture }, mask: { value: mask.texture },
      texel: { value: new THREE.Vector2(1, 1) },
      color: { value: new THREE.Color('#fddb43') },
      opacity: { value: 0 }, radius: { value: 1 }
    },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader: `
      uniform sampler2D image; uniform sampler2D mask;
      uniform vec2 texel; uniform vec3 color; uniform float opacity;
      uniform float radius; varying vec2 vUv;
      void main(){
        vec4 base=texture2D(image,vUv);
        float center=texture2D(mask,vUv).r;
        float nearby=0.0;
        for(int x=-3;x<=3;x++)for(int y=-3;y<=3;y++){
          if(float(x*x+y*y)<=radius*radius)nearby=max(nearby,texture2D(mask,vUv+vec2(float(x),float(y))*texel).r);
        }
        float edge=max(0.0,nearby-center);
        gl_FragColor=vec4(mix(base.rgb,color,edge*opacity*.8),base.a);
        #include <colorspace_fragment>
      }`
  });
  screen.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  let target = null, renderedTarget = null, opacity = 0, lastFrame = performance.now();
  const size = new THREE.Vector2();
  return {
    get target() { return target; },
    setTarget(value) { target = value; if(value)renderedTarget=value; },
    clear() { target = renderedTarget = null; opacity = 0; },
    render() {
      const now=performance.now(), elapsed=Math.min(100,now-lastFrame);lastFrame=now;
      opacity=THREE.MathUtils.clamp(opacity+(target?elapsed/120:-elapsed/100),0,1);
      if (!target&&opacity===0)renderedTarget=null;
      if (!renderedTarget) { renderer.render(scene, camera); return; }
      renderer.getDrawingBufferSize(size);
      if (beauty.width !== size.x || beauty.height !== size.y) {
        beauty.setSize(size.x, size.y); mask.setSize(size.x, size.y);
        material.uniforms.texel.value.set(1 / size.x, 1 / size.y);
      }
      material.uniforms.opacity.value=opacity;
      material.uniforms.radius.value=Math.min(3,Math.max(1,(innerWidth<760?3:2)*size.x/innerWidth));
      const originalTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(beauty); renderer.render(scene, camera);
      const saved = [], selected = new Set();
      renderedTarget.traverse(o => { if (o.isMesh) selected.add(o); });
      const background = scene.background, shadowUpdate = renderer.shadowMap.autoUpdate;
      try {
        model.traverse(o => {
          if (!o.isMesh) return;
          saved.push([o, o.material]);
          o.material = selected.has(o) ? white : black;
        });
        scene.background = new THREE.Color(0x000000);
        renderer.shadowMap.autoUpdate = false;
        renderer.setRenderTarget(mask); renderer.render(scene, camera);
      } finally {
        for (const [o, m] of saved) o.material = m;
        scene.background = background;
        renderer.shadowMap.autoUpdate = shadowUpdate;
        renderer.setRenderTarget(originalTarget);
      }
      renderer.render(screen, screenCamera);
    }
  };
}
