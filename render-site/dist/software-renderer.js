import * as THREE from "./vendor/three.module.min.js";

const cube = [
  [-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],
  [-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],
];
const sides = [[1,0,3,2],[4,5,6,7],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]];
const disc = Array.from({length:16},(_,i)=>{
  const angle = i/16*2*Math.PI;
  return [.5*Math.cos(angle),.5*Math.sin(angle)];
});
const light = new THREE.Vector3(-.43,.81,.39).normalize();
const normal = new THREE.Vector3();
const edge = new THREE.Vector3();

function color(material, intensity = 1) {
  const hex = material.color.getHex(THREE.SRGBColorSpace);
  const channels = [hex >> 16, (hex >> 8) & 255, hex & 255];
  const toned = channels.map(channel=>Math.max(0,Math.min(255,Math.round(channel*intensity))));
  return "rgb("+toned.join(",")+")";
}

export function createSoftwareRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  const view = new THREE.Matrix4();
  const instance = new THREE.Matrix4();
  const world = new THREE.Matrix4();
  const queue = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let scale = 1;

  function setSize(w,h,pixelRatio) {
    width = w;
    height = h;
    dpr = pixelRatio;
    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(h*dpr);
  }

  function screen(worldPoint) {
    const point = worldPoint.clone().applyMatrix4(view);
    return [(point.x+1)*width/2,(1-point.y)*height/2,point.z];
  }

  function projected(point,matrix) {
    return screen(new THREE.Vector3(...point).applyMatrix4(matrix));
  }

  function enqueue(depth,paint,layer=0) {
    queue.push({depth,paint,layer});
  }

  function polygon(points, fill, stroke, alpha = 1) {
    ctx.beginPath();
    ctx.moveTo(points[0][0],points[0][1]);
    for (const [x,y] of points.slice(1)) ctx.lineTo(x,y);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = .48;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function face(points,material,layer) {
    const display = points.map(screen);
    const [a,b,c] = display;
    const area = (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    if (area >= 0) return;
    normal.subVectors(points[1],points[0]).cross(edge.subVectors(points[2],points[0])).normalize();
    const intensity = material.isMeshBasicMaterial ? 1 : .70+.43*Math.max(0,normal.dot(light));
    const fill = color(material,intensity);
    const line = material.transparent ? null : color(material,intensity*.88);
    const depth = display.reduce((sum,point)=>sum+point[2],0)/display.length;
    enqueue(depth,()=>polygon(display,fill,line,material.opacity),layer);
  }

  function line(from,to,stroke,weight,layer=0,alpha=1) {
    enqueue((from[2]+to[2])/2,()=>{
      ctx.beginPath();
      ctx.moveTo(from[0],from[1]);
      ctx.lineTo(to[0],to[1]);
      ctx.lineWidth = weight;
      ctx.strokeStyle = stroke;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    },layer);
  }

  function sphere(mesh) {
    const [x,y,depth] = projected([0,0,0],mesh.matrixWorld);
    const radius = Math.max(1,mesh.matrixWorld.getMaxScaleOnAxis()*scale/2);
    const surface = color(mesh.material,1.03);
    const shadow = color(mesh.material,.58);
    enqueue(depth,()=>{
      const gradient = ctx.createRadialGradient(x-radius*.3,y-radius*.36,0,x,y,radius);
      gradient.addColorStop(0,mesh.material.isMeshBasicMaterial?"#f9fff0":color(mesh.material,1.37));
      gradient.addColorStop(.61,surface);
      gradient.addColorStop(1,shadow);
      ctx.beginPath();
      ctx.arc(x,y,radius,0,Math.PI*2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }

  function texturedPlane(mesh) {
    const top = projected([-.5,.5,0],mesh.matrixWorld);
    const right = projected([.5,.5,0],mesh.matrixWorld);
    const bottom = projected([-.5,-.5,0],mesh.matrixWorld);
    const texture = mesh.material.map.image;
    const across = [right[0]-top[0],right[1]-top[1]];
    const down = [bottom[0]-top[0],bottom[1]-top[1]];
    if (across[0]*down[1]-across[1]*down[0]<=0) return;
    enqueue((top[2]+right[2]+bottom[2])/3,()=>{
      ctx.save();
      ctx.transform(across[0]/texture.width,across[1]/texture.width,down[0]/texture.height,down[1]/texture.height,top[0],top[1]);
      ctx.drawImage(texture,0,0);
      ctx.restore();
    });
  }

  function floorShadow(mesh) {
    const [x,y,z] = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld).toArray();
    const size = mesh.matrixWorld.getMaxScaleOnAxis();
    if (mesh.userData.layer || !mesh.castShadow || y>.61 || y<0 || size<.56) return;
    const center = screen(new THREE.Vector3(x+.13,.024,z-.17));
    const radius = size*scale*.49;
    enqueue(center[2],()=>{
      ctx.save();
      ctx.translate(center[0],center[1]);
      ctx.scale(1,.49);
      const shadow = ctx.createRadialGradient(0,0,1,0,0,Math.max(2,radius));
      shadow.addColorStop(0,"#11171d66");
      shadow.addColorStop(1,"#11171d00");
      ctx.fillStyle = shadow;
      ctx.fillRect(-radius,-radius,radius*2,radius*2);
      ctx.restore();
    },-1);
  }

  function drawObject(object) {
    if (object.isLineSegments) {
      const coordinates = object.geometry.getAttribute("position");
      const stroke = color(object.material);
      for (let i=0;i<coordinates.count;i+=2) {
        const read = n=>projected([coordinates.getX(n),coordinates.getY(n),coordinates.getZ(n)],object.matrixWorld);
        line(read(i),read(i+1),stroke,.7,-2,object.material.opacity);
      }
      return;
    }
    if (!object.isMesh) return;
    const {shape, path, weight, layer = 0} = object.userData;
    const matrix = object.matrixWorld;
    const material = object.material;
    if (object.isInstancedMesh) {
      const stroke = color(material,1.12);
      for (let i=0;i<object.count;i++) {
        object.getMatrixAt(i,instance);
        world.multiplyMatrices(matrix,instance);
        const thickness = new THREE.Vector3().setFromMatrixColumn(world,0).length();
        line(projected([0,-.5,0],world),projected([0,.5,0],world),stroke,Math.max(.72,thickness*scale));
      }
      return;
    }
    if (path) {
      const points = path.map(point=>projected(point,matrix));
      const stroke = color(material);
      for (let i=1;i<points.length;i++) line(points[i-1],points[i],stroke,Math.max(1,weight*scale));
      return;
    }
    if (shape === "ball") {
      sphere(object);
      return;
    }
    if (shape === "panel") {
      texturedPlane(object);
      return;
    }
    floorShadow(object);
    if (shape === "cylinder") {
      const bottom = disc.map(([x,z])=>new THREE.Vector3(x,-.5,z).applyMatrix4(matrix));
      const top = disc.map(([x,z])=>new THREE.Vector3(x,.5,z).applyMatrix4(matrix));
      face(top.slice().reverse(),material,layer);
      face(bottom,material,layer);
      top.forEach((point,index)=>{
        const next = (index+1)%top.length;
        face([bottom[index],point,top[next],bottom[next]],material,layer);
      });
      return;
    }
    const corners = cube.map(point=>new THREE.Vector3(...point).applyMatrix4(matrix));
    sides.forEach(indices=>face(indices.map(index=>corners[index]),material,layer));
  }

  function render(scene,camera) {
    if (!ctx) return;
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();
    view.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    scale = height/(camera.top-camera.bottom);
    queue.length = 0;
    scene.traverseVisible(drawObject);
    queue.sort((a,b)=>a.layer-b.layer || b.depth-a.depth);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const {paint} of queue) paint();
  }

  return {setSize,render};
}
