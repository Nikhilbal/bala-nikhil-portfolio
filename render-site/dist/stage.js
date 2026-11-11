import * as THREE from "./vendor/three.module.min.js";
import { createModelKit, clamp, v3 } from "./model-kit.js";
import { models } from "./models.js";
import { createSoftwareRenderer } from "./software-renderer.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function studioLighting(scene) {
  scene.add(new THREE.HemisphereLight("#e9f4ff", "#5d665b", 2.12));
  const key = new THREE.DirectionalLight("#fff0d0", 2.9);
  key.position.set(-3.8, 8.5, 5.3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera, {left:-7.3, right:7.3, top:6, bottom:-6, near:.5, far:24});
  key.shadow.normalBias = .022;
  key.shadow.bias = -.0003;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#a8cdfd", 1.54);
  rim.position.set(5,5,-6);
  scene.add(rim);
  return () => key.shadow.dispose();
}

export function createStage(viewport, canvas, onChange) {
  const labelLayer = viewport.querySelector(".scene-labels");
  const attributes = {antialias:true, alpha:true, powerPreference:"low-power"};
  const context = canvas.getContext("webgl2",attributes);
  let renderer;
  let software;
  if (context) {
    try {
      renderer = new THREE.WebGLRenderer({canvas,context,...attributes});
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch {
      const replacement = canvas.cloneNode();
      canvas.replaceWith(replacement);
      canvas = replacement;
    }
  }
  if (!renderer) software = createSoftwareRenderer(canvas);
  viewport.dataset.renderer = renderer ? "webgl" : "software";

  const camera = new THREE.OrthographicCamera(-7,7,4,-4,.1,40);
  const marker = new THREE.Vector3();
  let model;
  let scene;
  let kit;
  let releaseLights;
  let labelElements = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 0;
  let orbit = 0;
  let tilt = 0;
  let progress = 0;
  let duration = 11000;
  let visible = false;
  let active = true;
  let playing = false;
  let frame = 0;
  let previousFrame = 0;
  let loopRange = null;

  function paint() {
    if (!active || !model) return;
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.65);
    if (w !== width || h !== height || dpr !== pixelRatio) {
      width = w;
      height = h;
      pixelRatio = dpr;
      if (renderer) {
        renderer.setPixelRatio(dpr);
        renderer.setSize(w,h,false);
      } else software.setSize(w,h,dpr);
      const aspect = w/h;
      const vertical = Math.max(model.height, model.width/aspect);
      Object.assign(camera,{left:-vertical*aspect/2,right:vertical*aspect/2,top:vertical/2,bottom:-vertical/2});
      camera.updateProjectionMatrix();
    }
    const yaw = model.yaw + orbit + (prefersReducedMotion.matches ? 0 : .12*Math.sin(progress*Math.PI));
    const polar = Math.max(.52, Math.min(1.26, model.polar+tilt));
    const target = v3(model.target);
    camera.position.setFromSphericalCoords(15,polar,yaw).add(target);
    camera.lookAt(target);
    model.animate(progress);
    if (renderer) renderer.render(scene,camera);
    else software.render(scene,camera);
    kit.labels.forEach(({anchor,text,color},i)=>{
      const label = labelElements[i];
      let parent = anchor;
      while (parent?.visible) parent = parent.parent;
      anchor.getWorldPosition(marker).project(camera);
      const inFrame = Math.abs(marker.x)<.97 && Math.abs(marker.y)<.92 && marker.z<1 && marker.z>-1;
      label.hidden = Boolean(parent) || !inFrame;
      if (label.hidden) return;
      label.style.left = ((marker.x+1)*.5*w).toFixed(1)+"px";
      label.style.top = ((1-marker.y)*.5*h).toFixed(1)+"px";
      const message = typeof text === "function" ? text(progress) : text;
      const tone = typeof color === "function" ? color(progress) : color;
      if (label.textContent !== message) label.textContent = message;
      if (label.style.getPropertyValue("--tag-color") !== tone) label.style.setProperty("--tag-color",tone);
    });
  }

  function report() {
    viewport.dataset.progress = progress.toFixed(3);
    viewport.dataset.playing = String(playing);
    onChange({progress,playing,duration});
  }

  function drawFrame(now) {
    frame = 0;
    if (!playing || !visible || !active || document.hidden) {
      previousFrame = 0;
      return;
    }
    if (previousFrame) {
      progress = clamp(progress + (now-previousFrame)/duration);
      if (loopRange && progress >= loopRange[1]) {
        progress = loopRange[0] + (progress-loopRange[0]) % (loopRange[1]-loopRange[0]);
      }
    }
    previousFrame = now;
    if (progress === 1) playing = false;
    paint();
    report();
    schedule();
  }

  function schedule() {
    if (playing && visible && active && !document.hidden && !frame) frame = requestAnimationFrame(drawFrame);
  }

  function setPlaying(value) {
    if (value && progress === 1) progress = 0;
    playing = value;
    previousFrame = 0;
    if (!playing && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    paint();
    report();
    schedule();
  }

  function seek(value) {
    progress = clamp(value);
    setPlaying(false);
  }

  function load(key, length, start = 0) {
    setPlaying(false);
    progress = clamp(start);
    loopRange = null;
    duration = length;
    orbit = 0;
    tilt = 0;
    width = 0;
    kit?.dispose();
    releaseLights?.();
    scene = new THREE.Scene();
    if (renderer) releaseLights = studioLighting(scene);
    kit = createModelKit(scene);
    model = models[key](kit,scene);
    labelElements = kit.labels.map(()=>{
      const label = document.createElement("span");
      label.className = "model-label";
      return label;
    });
    labelLayer.replaceChildren(...labelElements);
    paint();
    report();
  }

  function setActive(value) {
    active = value;
    if (value) paint();
    else setPlaying(false);
  }

  function resetCamera() {
    orbit = 0;
    tilt = 0;
    paint();
  }

  let drag = null;
  canvas.addEventListener("pointerdown", event=>{
    if (event.button !== 0) return;
    drag = [event.clientX,event.clientY];
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event=>{
    if (!drag) return;
    orbit = Math.max(-1.23,Math.min(1.23,orbit+(event.clientX-drag[0])*.009));
    tilt = Math.max(-.35,Math.min(.35,tilt+(event.clientY-drag[1])*.006));
    drag = [event.clientX,event.clientY];
    paint();
  });
  canvas.addEventListener("lostpointercapture", ()=>{drag=null;});
  canvas.addEventListener("keydown", event=>{
    if (event.key === "Home") {
      event.preventDefault();
      resetCamera();
      return;
    }
    const directions = {ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]};
    if (!directions[event.key]) return;
    event.preventDefault();
    orbit = Math.max(-1.23,Math.min(1.23,orbit+directions[event.key][0]));
    tilt = Math.max(-.35,Math.min(.35,tilt+directions[event.key][1]));
    paint();
  });
  canvas.addEventListener("webglcontextrestored",paint);
  new ResizeObserver(paint).observe(viewport);
  new IntersectionObserver(([entry])=>{
    visible = entry.isIntersecting;
    previousFrame = 0;
    schedule();
  },{threshold:.12}).observe(viewport);
  document.addEventListener("visibilitychange",()=>{
    previousFrame = 0;
    schedule();
  });
  prefersReducedMotion.addEventListener("change",event=>{
    if (event.matches) setPlaying(false);
  });

  function loop(start,end) {
    loopRange = [clamp(start),clamp(end)];
    if (loopRange[1] <= loopRange[0]) loopRange = null;
  }

  return {load,seek,setActive,resetCamera,loop,toggle:()=>setPlaying(!playing),play:()=>setPlaying(true)};
}
