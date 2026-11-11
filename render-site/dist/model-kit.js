import * as THREE from "./vendor/three.module.min.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";

export const clamp = value => Math.max(0, Math.min(1, value));
export const between = (time, start, end) => clamp((time - start) / (end - start));
export const smooth = value => value * value * (3 - 2 * value);
export const beat = (time, start, end) => smooth(between(time, start, end));
export const lerp = (from, to, amount) => from + (to - from) * amount;
export const v3 = ([x, y, z]) => new THREE.Vector3(x, y, z);

const basic = {
  box: new THREE.BoxGeometry(1, 1, 1),
  soft: new RoundedBoxGeometry(1, 1, 1, 2, .12),
  cylinder: new THREE.CylinderGeometry(.5, .5, 1, 24),
  ball: new THREE.SphereGeometry(.5, 18, 12),
  panel: new THREE.PlaneGeometry(1, 1),
};
const up = new THREE.Vector3(0, 1, 0);

export function createModelKit(scene) {
  const owned = new Set();
  const materials = new Map();
  const labels = [];

  function mat(color, mode = "solid") {
    const key = color + mode;
    if (materials.has(key)) return materials.get(key);
    const surface = mode === "glow" ? new THREE.MeshBasicMaterial({color}) :
      new THREE.MeshStandardMaterial({
        color,
        roughness: mode === "metal" ? .34 : .65,
        metalness: mode === "metal" ? .58 : .04,
        ...(mode === "glass" ? {transparent: true, opacity: .28, depthWrite: false, side: THREE.DoubleSide} : {}),
      });
    materials.set(key, surface);
    owned.add(surface);
    return surface;
  }

  function group(parent, position = [0, 0, 0]) {
    const object = new THREE.Group();
    object.position.set(...position);
    parent.add(object);
    return object;
  }

  function mesh(parent, shape, position, scale, color, mode = "solid", shadow = true) {
    const material = typeof color === "string" ? mat(color, mode) : color;
    const object = new THREE.Mesh(basic[shape], material);
    object.position.set(...position);
    object.scale.set(...scale);
    object.userData.shape = shape;
    object.castShadow = shadow && mode !== "glow" && mode !== "glass";
    object.receiveShadow = mode !== "glow" && mode !== "glass";
    parent.add(object);
    return object;
  }

  function box(parent, position, size, color, mode, shadow) {
    return mesh(parent, "soft", position, size, color, mode, shadow);
  }

  function disk(parent, position, diameter, height, color, mode) {
    return mesh(parent, "cylinder", position, [diameter, height, diameter], color, mode);
  }

  function dot(parent, position, diameter, color, mode = "glow") {
    return mesh(parent, "ball", position, [diameter, diameter, diameter], color, mode);
  }

  function rods(parent, segments, radius, color, mode = "solid") {
    const body = new THREE.InstancedMesh(basic.cylinder, mat(color, mode), segments.length);
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const direction = new THREE.Vector3();
    segments.forEach(([from, to], index) => {
      const a = v3(from);
      const b = v3(to);
      direction.subVectors(b, a);
      const height = direction.length();
      rotation.setFromUnitVectors(up, direction.normalize());
      matrix.compose(a.lerp(b, .5), rotation, new THREE.Vector3(radius * 2, height, radius * 2));
      body.setMatrixAt(index, matrix);
    });
    body.instanceMatrix.needsUpdate = true;
    owned.add(body);
    body.castShadow = mode !== "glow";
    body.receiveShadow = true;
    parent.add(body);
    return body;
  }

  function ring(parent, position, radius, color, width = .025) {
    const geometry = new THREE.TorusGeometry(radius, width, 6, 48);
    owned.add(geometry);
    const object = new THREE.Mesh(geometry, mat(color, "glow"));
    object.position.set(...position);
    object.rotation.x = -Math.PI / 2;
    object.userData.path = Array.from({length:33},(_,index)=>{
      const angle = index/32*2*Math.PI;
      return [radius*Math.cos(angle),radius*Math.sin(angle),0];
    });
    object.userData.weight = width*2;
    parent.add(object);
    return object;
  }

  function route(parent, points, color, thickness = .025) {
    const curve = new THREE.CatmullRomCurve3(points.map(v3), false, "centripetal");
    const geometry = new THREE.TubeGeometry(curve, Math.max(12, points.length * 10), thickness, 6, false);
    owned.add(geometry);
    const object = new THREE.Mesh(geometry, mat(color, "glow"));
    object.userData.path = curve.getPoints(Math.max(14,points.length*7)).map(point=>point.toArray());
    object.userData.weight = thickness*2;
    parent.add(object);
    return { object, curve };
  }

  function screen(parent, position, dimensions, draw) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({map: texture, toneMapped: false});
    owned.add(texture);
    owned.add(material);
    mesh(parent, "panel", position, [...dimensions, 1], material, "glow", false);
    let lastState;
    return state => {
      if (state === lastState) return;
      lastState = state;
      draw(context, state);
      texture.needsUpdate = true;
    };
  }

  function tag(parent, position, text, color = "#dffa86") {
    const anchor = group(parent, position);
    labels.push({anchor, text, color});
    return anchor;
  }

  function floor(width, depth, color, gridColor) {
    const platform = group(scene);
    box(platform, [0, -.28, 0], [width, .44, depth], "#242c36", "solid", false).userData.layer = -4;
    box(platform, [0, -.07, 0], [width-.045, .16, depth-.045], color, "solid", false).userData.layer = -3;
    const coordinates = [];
    for (let x = Math.ceil(-width / 2); x < width / 2; x++) {
      coordinates.push(x, .018, -depth/2+.17, x, .018, depth/2-.17);
    }
    for (let z = Math.ceil(-depth / 2); z < depth / 2; z++) {
      coordinates.push(-width/2+.17, .018, z, width/2-.17, .018, z);
    }
    const grid = new THREE.BufferGeometry();
    grid.setAttribute("position", new THREE.Float32BufferAttribute(coordinates, 3));
    const gridMaterial = new THREE.LineBasicMaterial({color: gridColor, transparent: true, opacity: .45});
    platform.add(new THREE.LineSegments(grid, gridMaterial));
    owned.add(grid);
    owned.add(gridMaterial);
    return platform;
  }

  function dispose() {
    owned.forEach(resource => resource.dispose());
  }

  return {group, mesh, box, disk, dot, rods, ring, route, screen, tag, floor, labels, mat, dispose};
}

export function placePulse(object, path, progress) {
  path.curve.getPointAt(clamp(progress), object.position);
}
