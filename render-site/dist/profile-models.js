import { placePulse } from "./model-kit.js";

const colors = ["#a1e5b7", "#8dc3ff", "#c8b5ff", "#ffc27a", "#7ae8d3", "#dffa86"];
const steel = "#a8bec9";
const ink = "#304456";

function chip(k, parent, color) {
  k.box(parent, [0,.45,0], [1.08,.18,.97], "#427368");
  k.box(parent, [0,.59,0], [.59,.16,.57], ink, "metal");
  k.box(parent, [0,.7,0], [.35,.04,.33], color, "glow");
  const pins = [];
  for (let i=0;i<5;i++) {
    const p = -.36+i*.18;
    pins.push([[-.43,.47,p],[-.66,.47,p]], [[.43,.47,p],[.66,.47,p]],
      [[p,.47,-.4],[p,.47,-.59]], [[p,.47,.4],[p,.47,.59]]);
  }
  k.rods(parent,pins,.022,steel,"metal");
}

function monitor(k, parent, color) {
  k.box(parent, [0,.29,0], [.98,.12,.69], steel, "metal");
  k.box(parent, [0,.64,-.12], [.12,.69,.14], steel, "metal");
  k.box(parent, [0,.95,-.1], [1.21,.84,.15], ink);
  k.box(parent, [0,.97,-.014], [1.04,.66,.025], "#1e2c39");
  const segments = [[[-.34,1.08,.012],[-.45,.99,.012]],[[-.45,.99,.012],[-.34,.9,.012]],
    [[.34,1.08,.012],[.45,.99,.012]],[[.45,.99,.012],[.34,.9,.012]],
    [[.1,1.15,.012],[-.1,.83,.012]]];
  k.rods(parent,segments,.025,color,"glow");
}

function shield(k, parent, color) {
  const outline = [[-.5,1.3,.08],[0,1.46,.08],[.5,1.3,.08],[.43,.78,.08],[0,.42,.08],[-.43,.78,.08],[-.5,1.3,.08]];
  k.rods(parent,outline.slice(1).map((point,i)=>[outline[i],point]),.055,color,"glow");
  k.box(parent,[0,.93,0],[.45,.56,.16],ink,"metal");
  const arch = k.ring(parent,[0,1.2,.03],.16,steel,.03);
  arch.rotation.x=0;
  k.dot(parent,[0,.98,.1],.085,color);
}

function network(k, parent, color) {
  const nodes = [[-.48,.38,.1],[0,.94,-.19],[.48,.38,.1]];
  k.rods(parent,[[nodes[0],nodes[1]],[nodes[1],nodes[2]],[nodes[0],nodes[2]]],.025,color,"glow");
  nodes.forEach(point=>{
    k.box(parent,point,[.28,.24,.25],ink,"metal");
    k.dot(parent,[point[0],point[1]+.15,point[2]],.1,color);
  });
}

function phone(k, parent, color) {
  const device=k.group(parent,[-.21,.82,-.03]);
  device.rotation.y=-.2;
  k.box(device,[0,0,0],[.68,1.21,.13],steel,"metal");
  k.box(device,[0,0,.08],[.57,1.07,.025],ink);
  k.box(device,[0,.25,.1],[.4,.31,.025],color,"glow");
  for(let i=0;i<3;i++)k.box(device,[-.06,-.07-i*.14,.1],[.29,.035,.025],"#a4bdc3");
  k.box(device,[0,-.44,.1],[.18,.035,.025],color,"glow");
  const board=k.group(parent,[.4,.05,.27]);
  board.scale.setScalar(.51);
  chip(k,board,color);
}

function data(k, parent, color) {
  [ .43,.75,1.04 ].forEach((height,i)=>{
    k.box(parent,[-.4+i*.4,.25+height/2,0],[.26,height,.5],i===2?color:"#597d89","metal");
  });
  k.box(parent,[0,.18,0],[1.3,.12,.86],ink);
}

function delivery(k,parent,color) {
  for(let layer=0;layer<2;layer++)for(let i=0;i<3-layer;i++) {
    const x=(i-(2-layer)/2)*.43;
    k.box(parent,[x,.37+layer*.4,0],[.38,.35,.62],layer?"#88a68a":ink,"metal");
    for(let n=0;n<3;n++)k.box(parent,[x-.11+n*.11,.37+layer*.4,.322],[.025,.24,.018],color,"glow");
  }
}

function cap(k,parent,color) {
  k.disk(parent,[0,.65,0],.74,.46,"#405a64","metal");
  const top=k.box(parent,[0,.94,0],[1.18,.095,1.18],color);
  top.rotation.y=Math.PI/4;
  k.dot(parent,[0,1.01,0],.11,steel,"solid");
  k.rods(parent,[[[0,1.02,0],[.69,1.02,.1]],[[.69,1.02,.1],[.69,.56,.1]]],.021,"#ffc27a");
  k.box(parent,[.69,.51,.1],[.09,.18,.09],"#ffc27a");
}

export function skillsModel(k,scene) {
  k.floor(10.5,6.3,"#34464a","#628279");
  const center=k.group(scene);
  k.disk(center,[0,.16,0],1.66,.27,"#657e80","metal");
  k.disk(center,[0,.33,0],1.36,.13,ink,"metal");
  const core=k.box(center,[0,.76,0],[.7,.7,.7],"#b7d599","metal");
  core.rotation.y=.55;
  k.box(center,[0,1.15,0],[.32,.035,.32],"#dffa86","glow");
  const halo=k.ring(center,[0,.27,0],1.02,"#dffa86",.027);
  const positions=[[-3.15,1.37],[-3.1,-1.45],[0,-2.1],[3.1,-1.45],[3.15,1.37],[0,2.16]];
  const icons=[shield,network,monitor,phone,data,delivery];
  const names=["CLOUD & IAM","SECURITY & NETWORKS","BACKEND & WEB","MOBILE & IOT","DATA & ANALYTICS","DELIVERY & TOOLS"];
  const modules=positions.map(([x,z],i)=>{
    const root=k.group(scene,[x,.04,z]);
    k.disk(root,[0,.12,0],1.91,.19,ink,"metal");
    const ring=k.ring(root,[0,.24,0],.86,colors[i],.028);
    const body=k.group(root);
    icons[i](k,body,colors[i]);
    const label=k.tag(root,[0,1.88,0],names[i],colors[i]);
    const path=k.route(scene,[[0,.22,0],[x*.48,.22,z*.42],[x,.22,z]],colors[i],.018);
    const pulse=k.dot(scene,[0,.22,0],.16,colors[i]);
    return {root,body,ring,label,path,pulse};
  });
  return {yaw:-.24,polar:.8,width:11.3,height:7.1,target:[0,.55,0],animate(t){
    const current=Math.min(5,Math.floor(t*6));
    core.rotation.y=.55+t*Math.PI*2;
    halo.scale.setScalar(1+.065*Math.sin(t*Math.PI*12));
    modules.forEach((module,i)=>{
      const selected=i===current;
      module.body.position.y=selected?.12+Math.sin(t*Math.PI*12)*.045:0;
      module.ring.visible=selected;
      module.label.visible=selected;
      module.pulse.visible=selected;
      placePulse(module.pulse,module.path,(t*6)%1);
    });
  }};
}

export function educationModel(k,scene) {
  k.floor(10.5,3.65,"#3b4947","#6c8279");
  const xs=[-3.72,-1.24,1.24,3.72];
  const tones=[colors[3],colors[2],colors[0],colors[5]];
  const icons=[chip,monitor,cap,shield];
  const labels=["2022 · ECE","2025 · INTERNSHIP","2026 · B.TECH","NOW · SECURITY"];
  const modules=xs.map((x,i)=>{
    const root=k.group(scene,[x,.02,0]);
    k.box(root,[0,.17,0],[1.93,.31,1.85],ink,"metal");
    k.box(root,[0,.34,0],[1.74,.045,1.64],tones[i],"glow");
    const body=k.group(root,[0,.26,0]);
    icons[i](k,body,tones[i]);
    const ring=k.ring(root,[0,.37,0],.88,tones[i],.035);
    const label=k.tag(root,[0,1.99,0],labels[i],tones[i]);
    return {body,ring,label};
  });
  const route=k.route(scene,[[-3.72,.12,.97],[-2.48,.12,1.18],[-1.24,.12,.97],[0,.12,1.18],[1.24,.12,.97],[2.48,.12,1.18],[3.72,.12,.97]],"#dffa86",.023);
  const packet=k.dot(scene,[0,0,0],.2,"#dffa86");
  return {yaw:-.3,polar:1.01,width:11.5,height:5.4,target:[0,.88,0],animate(t){
    const current=Math.min(3,Math.floor(t*4));
    modules.forEach((module,i)=>{
      const selected=i===current;
      module.body.position.y=.26+(selected?.13:0);
      module.ring.visible=selected;
      module.label.scale.setScalar(selected?1.06:.94);
    });
    placePulse(packet,route,t);
  }};
}
