import { beat, between, lerp, placePulse } from "./model-kit.js";
import { skillsModel, educationModel } from "./profile-models.js";

const lime = "#dffa86";
const green = "#a1e5b7";
const teal = "#7ae8d3";
const blue = "#8dc3ff";
const lilac = "#c8b5ff";
const amber = "#ffc27a";
const red = "#ff8b88";
const light = "#d9e2e8";
const dark = "#29384a";

function lightBars(ctx, rows, color, left = 54, top = 129) {
  ctx.fillStyle = color;
  rows.forEach((width, index) => ctx.fillRect(left, top + index*39, width, 7));
}

function cartModel(k, scene) {
  k.floor(10.35, 5.25, "#414c4c", "#718078");
  const cart = k.group(scene, [-1.92, .04, .5]);
  const steel = "#bfcbd0";
  const frame = [];
  const top = [[-1.25, 2.1, -.64], [1.31, 2.1, -.64], [1.31, 2.1, .64], [-1.25, 2.1, .64]];
  const base = [[-1.02, 1.13, -.5], [1.14, 1.13, -.5], [1.14, 1.13, .5], [-1.02, 1.13, .5]];
  const mix = (a, b, t) => a.map((x, i) => lerp(x, b[i], t));
  for (let i = 0; i < 4; i++) {
    const j = (i+1)%4;
    frame.push([top[i], top[j]], [base[i], base[j]]);
    const count = i%2 ? 6 : 11;
    for (let n = 0; n < count; n++) frame.push([mix(top[i], top[j], n/count), mix(base[i], base[j], n/count)]);
    for (let n = 1; n < 5; n++) frame.push([mix(top[i], base[i], n/5), mix(top[j], base[j], n/5)]);
  }
  for (const z of [-.49, .49]) {
    frame.push([[-1.05,.38,z],[1.1,.38,z]], [[1.1,.38,z],[1.19,1.21,z]],
      [[-1.1,.33,z],[-.88,1.16,z]], [[-1.24,2.08,z],[-1.58,2.4,z]]);
  }
  k.rods(cart, frame, .017, steel, "metal");
  k.rods(cart, [[[-1.58,2.4,-.55],[-1.58,2.4,.55]]], .058, "#ad5542");
  k.box(cart, [.05,1.16,0], [2.1,.07,.99], "#788888", "metal");
  for (const x of [-1.08,1.08]) for (const z of [-.53,.53]) {
    const wheel = k.disk(cart, [x,.22,z], .4, .12, "#24282f");
    wheel.rotation.x = Math.PI/2;
    const cap = k.disk(cart, [x,.22,z+(z>0?.075:-.075)], .2, .028, "#a3b6b6", "metal");
    cap.rotation.x = Math.PI/2;
  }
  const first = k.group(cart, [-.16,1.48,-.17]);
  k.box(first, [0,0,0], [.62,.68,.57], "#b88e5f");
  k.box(first, [0,.07,.291], [.55,.23,.02], "#eee1b7");
  const second = k.group(cart, [.62,3.58,.16]);
  k.box(second, [0,0,0], [.51,.69,.5], "#678e75");
  k.box(second, [0,.08,.253], [.44,.25,.017], "#e3ead0");
  k.dot(cart, [-.59,1.39,.29], .38, "#d19b53", "solid");
  k.box(cart, [-1.43,2.22,.47], [.43,.2,.28], "#2f6558");
  k.dot(cart, [-1.41,2.33,.49], .076, green);
  const scan = k.mesh(cart, "box", [.62,3.25,.16], [1,.017,.83], "#74ffc1", "glass", false);
  const scanRing = k.ring(cart, [.62,2.17,.16], .58, green, .02);
  const kiosk = k.group(scene, [2.85,.03,-.55]);
  k.box(kiosk, [0,.1,0], [1.8,.19,1.16], "#637176");
  k.box(kiosk, [0,.78,0], [.6,1.36,.6], "#839093", "metal");
  k.box(kiosk, [0,1.7,0], [1.66,1.17,.22], "#343d43", "metal");
  const setBill = k.screen(kiosk, [0,1.7,.117], [1.47,.97], (ctx,state) => {
    ctx.fillStyle = "#eef3df";
    ctx.fillRect(0,0,512,320);
    ctx.fillStyle = "#293a34";
    ctx.fillRect(0,0,512,64);
    ctx.fillStyle = "#e8f5d1";
    ctx.font = "bold 34px system-ui";
    ctx.fillText(state === 2 ? "BILL READY" : "LIVE BILL", 35, 45);
    lightBars(ctx, state ? [258,215,305] : [202], "#748d7a", 38, 105);
    ctx.fillStyle = state === 2 ? "#83b18d" : "#c8d4b6";
    ctx.fillRect(34,245,444,44);
    ctx.fillStyle = "#2b473b";
    ctx.font = "bold 23px system-ui";
    ctx.fillText(state === 2 ? "REVIEW TOTAL" : state === 1 ? "UPDATING…" : "WAITING FOR SCAN", 51,276);
  });
  const receipt = k.group(kiosk, [.21,1.08,.2]);
  const paper = k.box(receipt, [0,-.37,0], [.58,.74,.038], "#e7e6d0");
  paper.castShadow = false;
  for (let i=0;i<4;i++) k.box(receipt, [0,-.15-i*.13,.023], [.43-(i%2)*.08,.027,.02], "#828e7d");
  const track = k.route(scene, [[-3.17,2.25,.91],[-2.47,2.75,1.18],[-.68,2.64,1.17],[1.38,2.13,.85],[2.85,1.71,-.42]], green, .028);
  const packet = k.dot(scene, [0,0,0], .18, lime);
  const shelves = k.group(scene, [0,.04,-2.15]);
  for (const x of [-3.78,-1.89,.02]) {
    k.box(shelves,[x,.8,0],[1.74,1.54,.46],"#56605e","solid",false);
    for (let row=0;row<2;row++) {
      k.box(shelves,[x,.48+row*.64,.21],[1.76,.08,.47],"#98a098","solid",false);
      for (let i=0;i<4;i++) k.box(shelves,[x-.61+i*.4,.68+row*.64,.27],[.26,.31+(i%2)*.10,.24],["#a2a879","#b08d74","#768d83","#a39b80"][i],"solid",false);
    }
  }
  k.tag(cart, [0,2.64,.54], t => t < .34 ? "SCAN ITEM" : "CART EVENT", amber);
  k.tag(kiosk, [0,2.48,.07], t => t >= .7 ? "BILL READY" : "BILLING KIOSK", lime);
  return {
    yaw: -.50, polar: 1.04, width: 11.2, height: 6.55, target: [.04,1.03,0],
    animate(t) {
      const scanned = beat(t,.10,.36);
      cart.position.x = lerp(-2.16,-1.92,beat(t,0,.2));
      second.position.y = lerp(3.48,1.53,scanned);
      second.rotation.y = lerp(.46,-.18,scanned);
      second.rotation.z = lerp(-.23,0,scanned);
      scan.visible = t > .04 && t < .34;
      scan.position.y = lerp(3.36,2.10,between(t,.05,.34));
      scanRing.visible = t > .14 && t < .38;
      scanRing.scale.setScalar(lerp(.62,1.13,between(t,.14,.38)));
      track.object.visible = t >= .37;
      packet.visible = t >= .37 && t < .7;
      placePulse(packet,track,between(t,.37,.7));
      setBill(t >= .69 ? 2 : t >= .4 ? 1 : 0);
      receipt.visible = t > .73;
      receipt.scale.y = Math.max(.015,beat(t,.73,.98));
    },
  };
}

function hardwareNode(k, scene, position, color, stacks = 1) {
  const root = k.group(scene, position);
  k.box(root,[0,.14,0],[1.54,.25,1.25],"#283a46");
  k.box(root,[0,.29,0],[1.33,.065,1.07],color,"glow");
  for (let i=0;i<stacks;i++) {
    k.box(root,[0,.51+i*.25,0],[1.1,.21,.91],"#557583","metal");
    k.box(root,[.26,.53+i*.25,.462],[.27,.036,.02],color,"glow");
  }
  return root;
}

function containmentModel(k, scene) {
  k.floor(10.45,5.35,"#384750","#62808a");
  const session = hardwareNode(k,scene,[-3.98,0,1.04],blue,3);
  const policy = hardwareNode(k,scene,[-.35,0,1.18],green,3);
  const alternate = hardwareNode(k,scene,[-.45,0,-1.51],amber,3);
  const resource = k.group(scene,[3.76,0,-.1]);
  k.box(resource,[0,.15,0],[1.64,.27,1.44],dark);
  k.disk(resource,[0,.66,0],1.08,.81,"#7498b3","metal");
  k.disk(resource,[0,1.095,0],1.11,.11,"#a3c4d4");
  k.disk(resource,[0,1.164,0],.87,.03,blue,"glow");
  k.tag(session,[0,1.52,0],"SESSION",blue);
  k.tag(policy,[0,1.51,.1], t => t >= .36 ? "POLICY REVOKED" : "DIRECT POLICY", t => t >= .36 ? red : green);
  k.tag(alternate,[0,1.51,0],"ALTERNATE ROLE",amber);
  k.tag(resource,[0,1.57,0],"S3 BUCKET",blue);
  const directPoints = [[-3.94,.35,1.04],[-2.55,.35,1.1],[-.32,.35,1.18],[2.14,.35,.92],[3.76,.35,-.12]];
  const direct = k.route(scene,directPoints,green);
  const cut = k.route(scene,directPoints,red);
  const alternatePath = k.route(scene,[[-3.95,.38,1.03],[-3.45,.38,-1.25],[-.45,.38,-1.51],[2.77,.38,-1.34],[3.76,.38,-.12]],amber);
  const pulse = k.dot(scene,[0,0,0],.21,lime);
  const cross = k.group(scene,[1.55,.45,.99]);
  k.rods(cross,[[[-.22,-.04,-.22],[.22,.04,.22]], [[-.22,-.04,.22],[.22,.04,-.22]]],.042,red,"glow");
  const residue = k.ring(resource,[0,.3,0],.77,amber);
  return {yaw:-.47,polar:.91,width:11.25,height:5.65,target:[0,.55,0],animate(t) {
    const blocked = t >= .36;
    direct.object.visible = !blocked;
    cut.object.visible = blocked;
    cross.visible = blocked;
    alternatePath.object.visible = t >= .63;
    residue.visible = t >= .82;
    residue.scale.setScalar(lerp(.85,1.27,beat(t,.82,1)));
    pulse.visible = t < .36 || t >= .63;
    const flow = t < .36 ? direct : alternatePath;
    placePulse(pulse,flow,t < .36 ? between(t,.01,.35) : between(t,.63,.96));
  }};
}

function synthshieldModel(k, scene) {
  k.floor(10.5,5.48,"#424456","#787894");
  const sources = [
    [-3.93,-1.51,"CALENDAR",blue],
    [-3.75,.11,"TRAVEL",lilac],
    [-3.57,1.76,"FINANCE",amber],
  ];
  const inputs = sources.map(([x,z,title,color]) => {
    const node = hardwareNode(k,scene,[x,0,z],color,2);
    k.tag(node,[0,1.34,.14],title,color);
    const path = k.route(scene,[[x,.35,z],[-2.26,.35,z],[-.94,.35,.2],[.54,.35,.19]],color,.023);
    const pulse = k.dot(scene,[x,.35,z],.19,color);
    return {path,pulse};
  });
  const gate = k.group(scene,[.5,.02,.18]);
  k.box(gate,[0,.12,0],[1.75,.22,1.24],"#3f496a");
  const wings = [-.49,.49].map(x=>k.box(gate,[x,1,0],[.29,1.65,.62],"#7471a0","metal"));
  k.box(gate,[0,1.91,0],[1.31,.25,.62],"#8183ad","metal");
  const shutter = k.box(gate,[0,1.47,.04],[.76,1.19,.15],"#a45063","metal");
  k.rods(gate,[[[-.17,1.04,.132],[.17,.71,.132]],[[-.17,.71,.132],[.17,1.04,.132]]],.035,red,"glow");
  const tool = hardwareNode(k,scene,[3.83,0,.04],teal,3);
  const outbound = k.route(scene,[[.49,.35,.18],[2.05,.35,.15],[3.83,.35,.04]],teal,.024);
  k.tag(gate,[0,2.4,0], t=>t >= .72 ? "COMBINATION BLOCKED" : "POLICY GATE", t=>t >= .72 ? red : green);
  k.tag(tool,[0,1.51,0],"PROTECTED TOOL",teal);
  return {yaw:-.38,polar:.91,width:11.18,height:5.9,target:[0,.69,0],animate(t) {
    inputs.forEach(({path,pulse},i)=>{
      const start = .04 + i*.23;
      path.object.visible = t >= start;
      pulse.visible = t >= start && t <= start+.23;
      placePulse(pulse,path,between(t,start,start+.23));
    });
    const blocked = beat(t,.68,.79);
    shutter.position.y = lerp(2.56,.85,blocked);
    shutter.visible = t >= .65;
    wings.forEach((wing,i)=>{ wing.rotation.z = lerp(i ? -.035 : .035,0,blocked); });
    outbound.object.visible = t < .7;
  }};
}

function carBody(k, root, color) {
  k.box(root,[0,.28,0],[1.63,.37,.84],color,"metal");
  k.box(root,[-.12,.54,0],[.88,.27,.71],"#a6c2ce","metal");
  k.box(root,[-.11,.66,0],[.62,.08,.57],color);
  for (const x of [-.49,.49]) for (const z of [-.4,.4]) {
    k.disk(root,[x,.175,z],.32,.095,"#232a32").rotation.x = Math.PI/2;
    k.disk(root,[x,.176,z+Math.sign(z)*.06],.15,.025,"#a8b5bb","metal").rotation.x = Math.PI/2;
  }
  for (const z of [-.25,.25]) k.box(root,[.82,.29,z],[.034,.09,.17],"#f3efc1","glow");
}

function poolgoModel(k, scene) {
  k.floor(10.3,6,"#516253","#788977");
  k.box(scene,[0,.045,.75],[10.08,.075,1.72],"#343b45");
  k.box(scene,[1.52,.054,0],[1.72,.082,5.73],"#343b45");
  for (let x=-4.65;x<4.9;x+=.72) if (Math.abs(x-1.52)>.89) {
    k.box(scene,[x,.099,.75],[.29,.011,.039],"#aeb1a3","solid",false);
  }
  for (let z=-2.62;z<2.68;z+=.72) if (Math.abs(z-.75)>.89) {
    k.box(scene,[1.52,.101,z],[.041,.011,.29],"#aeb1a3","solid",false);
  }
  const streets = [[-4.15,-1.53,.82],[-2.7,-1.53,1.08],[-1.23,-1.72,.66],[.13,-1.66,.91],[3.02,-1.69,.95],[4.24,-1.72,1.09],[-3.65,2.26,.63],[-2.25,2.33,.79],[3.53,2.34,.64]];
  streets.forEach(([x,z,h],i)=>{
    k.box(scene,[x,h/2,z],[1.03,h,.89],["#a2b8a4","#a1a998","#8aafb4"][i%3]);
    for(let y=.29;y<h-.08;y+=.27) k.box(scene,[x,y,z+.452],[.73,.059,.023],"#4d666b","solid",false);
    k.box(scene,[x,h+.055,z],[.41,.11,.42],"#d6d7bf","solid",false);
  });
  for (const [x,z] of [[-4.53,1.94],[-.73,2.3],[.4,-2.42],[2.85,2.46],[4.65,1.86]]) {
    k.box(scene,[x,.22,z],[.09,.38,.09],"#86765c");
    k.dot(scene,[x,.55,z],.44,"#789c70","solid");
  }
  const pickup = k.ring(scene,[1.22,.12,.68],.45,lime);
  const drive = k.route(scene,[[-4.5,.13,.44],[-2.66,.13,.44],[-.25,.13,.44],[1.22,.13,.44]],teal);
  const onward = k.route(scene,[[1.22,.13,.44],[1.46,.13,-.27],[1.44,.13,-1.48],[1.44,.13,-2.57]],teal);
  const walk = k.route(scene,[[.37,.14,2.79],[.49,.14,1.86],[.89,.14,1.09],[1.22,.14,.62]],amber);
  const car = k.group(scene,[-4.4,.11,.45]);
  carBody(k,car,"#83c9ae");
  const rider = k.group(scene,[.37,.12,2.79]);
  k.rods(rider,[[[0,0,0],[0,.62,0]]],.036,amber,"glow");
  k.dot(rider,[0,.66,0],.22,amber);
  k.tag(scene,[1.22,1.24,.56],t=>t >= .71 ? "BOOKING CONFIRMED" : "PICKUP",lime);
  return {yaw:-.54,polar:.86,width:11.1,height:6.1,target:[0,.38,0],animate(t) {
    const depart = t >= .71;
    placePulse(car,depart?onward:drive,depart?beat(t,.71,1):beat(t,0,.7));
    car.rotation.y = depart ? Math.PI/2*beat(t,.71,.83) : 0;
    placePulse(rider,walk,beat(t,.25,.7));
    rider.visible = !depart;
    onward.object.visible = depart;
    pickup.scale.setScalar(.92 + .12*Math.sin(t*13));
  }};
}

const centers = [[-2.98,1.11,.71],[.03,2.96,-.98],[2.96,1.23,.27]];
const segments = [blue,lilac,green];
function analyticsModel(k, scene) {
  k.floor(9.8,5.43,"#404352","#727b92");
  const origin = [-4.2,.13,2.22];
  k.rods(scene,[[origin,[4.58,.13,2.22]],[origin,[-4.2,3.67,2.22]],[origin,[-4.2,.13,-2.38]]],.026,"#90a5b7","glow");
  const points = Array.from({length: 63},(_,i)=>{
    const a = Math.sin(i*2.332);
    const b = Math.cos(i*2.079);
    const c = Math.sin(i*1.578);
    const group = i%3;
    return {
      object:k.dot(scene,[0,0,0],.129,"#a7b7c7","solid"), group,
      from:[a*4.04,1.84+b*1.51,c*2.29],
      to:centers[group].map((x,idx)=>x+[a*1.08,b*.73,c*.77][idx]),
    };
  });
  const halos = centers.map((point,index)=>{
    const node = k.group(scene,point);
    k.dot(node,[0,0,0],.24,segments[index]);
    k.ring(node,[0,-.23,0],.91,segments[index],.019);
    k.tag(node,[0,.97,0],()=>"SEGMENT "+(index+1),segments[index]);
    return node;
  });
  return {yaw:-.48,polar:1.03,width:10.8,height:6.6,target:[0,1.36,0],animate(t) {
    const clustered = beat(t,.27,.72);
    points.forEach(({object,group,from,to})=>{
      object.position.set(...from.map((x,i)=>lerp(x,to[i],clustered)));
      object.material = k.mat(t >= .36 ? segments[group] : "#a7b7c7", "solid");
    });
    halos.forEach((node,index)=>{
      node.visible = t >= .72;
      node.scale.setScalar(lerp(.46,1,beat(t,.72+index*.02,.91+index*.02)));
    });
  }};
}

function talkModel(k, scene) {
  k.floor(10.15,5.25,"#3b4d5a","#66828a");
  const phone = k.group(scene,[-3.3,.16,.33]);
  k.box(phone,[0,.08,0],[2.55,.16,1.65],"#3b5264");
  const display = k.group(phone,[0,.21,0]);
  k.box(display,[0,1.46,0],[1.64,2.94,.2],"#526a86","metal");
  const setPhone = k.screen(display,[0,1.46,.106],[1.46,2.66],(ctx,state)=>{
    ctx.fillStyle = "#ebecfb";
    ctx.fillRect(0,0,512,320);
    ctx.fillStyle = "#514c81";
    ctx.fillRect(0,0,512,62);
    ctx.fillStyle = "#f0edff";
    ctx.font = "bold 42px system-ui";
    ctx.fillText("TalkConnect",33,45);
    ctx.fillStyle = "#292b4b";
    ctx.font = "bold 50px system-ui";
    ctx.fillText(state===2?"0 coins":state===1?"••••":"Enter OTP",37,157);
    ctx.fillStyle = state===2 ? "#a8ceb9" : "#c2b7ee";
    ctx.fillRect(37,219,437,55);
    ctx.fillStyle = "#373653";
    ctx.font = "bold 34px system-ui";
    ctx.fillText(state===2?"WALLET":state===1?"VERIFYING":"CONTINUE",65,258);
  });
  const api = hardwareNode(k,scene,[.38,0,-.71],blue,4);
  const wallet = k.group(scene,[3.64,0,.63]);
  k.box(wallet,[0,.13,0],[1.74,.25,1.41],"#284b49");
  k.box(wallet,[0,.62,0],[1.35,.78,.79],"#537d78","metal");
  const walletDoor = k.box(wallet,[0,.72,.44],[1.27,.64,.12],"#80b4a8");
  k.dot(wallet,[.38,.72,.525],.13,green);
  const packet = k.dot(scene,[0,0,0],.2,teal);
  const request = k.route(scene,[[-2.65,1.22,.44],[-1.48,.71,.04],[.39,.51,-.71]],blue);
  const result = k.route(scene,[[.39,.51,-.71],[1.88,.4,-.46],[3.62,.48,.64]],green);
  k.tag(phone,[0,3.72,0],"MOBILE APP",lilac);
  k.tag(api,[0,1.61,0],t=>t >= .4 ? "OTP VERIFIED" : "AUTH API",blue);
  k.tag(wallet,[0,1.5,0],t=>t >= .71 ? "WALLET · 0 COINS" : "WALLET",green);
  return {yaw:-.38,polar:1.11,width:10.8,height:5.9,target:[0,1.17,0],animate(t) {
    setPhone(t >= .73 ? 2 : t >= .27 ? 1 : 0);
    display.rotation.y = -.16 + .16*beat(t,0,.38);
    result.object.visible = t >= .59;
    packet.visible = t <= .48 || t >= .59;
    placePulse(packet,t >= .59?result:request,t >= .59?between(t,.59,.95):between(t,0,.48));
    walletDoor.position.y = lerp(.72,1.02,beat(t,.72,.95));
  }};
}

function approvalsModel(k, scene) {
  k.floor(10.32,5.4,"#3b4c59","#66838b");
  const cards = [[-3.92,1.27,"REGULAR USER",blue],[-3.24,-1.51,"ADMIN",green]].map(([x,z,name,color])=>{
    const root = k.group(scene,[x,.03,z]);
    k.box(root,[0,.13,0],[1.43,.23,1.16],"#344855");
    const badge = k.group(root,[0,.2,0]);
    k.box(badge,[0,.75,0],[1.16,1.42,.18],"#587992","metal");
    k.dot(badge,[0,1.06,.107],.31,color);
    k.box(badge,[0,.62,.11],[.61,.09,.02],color,"glow");
    k.box(badge,[0,.42,.11],[.44,.06,.02],"#a2bcc9","glow");
    k.tag(root,[0,1.94,.2],name,color);
    return {badge,path:k.route(scene,[[x,.39,z],[x+1.3,.39,z],[.19,.39,-.14]],color)};
  });
  const gate = k.group(scene,[.16,.02,-.14]);
  k.box(gate,[0,.12,0],[1.29,.23,1.31],"#324755");
  k.box(gate,[0,.93,0],[.95,1.53,.53],"#617e86","metal");
  const indicator = k.dot(gate,[0,1.02,.28],.29,blue);
  k.tag(gate,[0,1.98,0],t=>t >= .67 ? "ADMIN ALLOWED" : t >= .32 ? "USER DENIED" : "ROLE CHECK",t=>t >= .67?green:t >= .32?red:blue);
  const terminal = k.group(scene,[3.5,.03,.24]);
  k.box(terminal,[0,.13,0],[2.02,.24,1.24],"#3f5663");
  k.box(terminal,[0,.92,0],[1.95,1.38,.24],"#7f9aa7","metal");
  const setApproval = k.screen(terminal,[0,.94,.128],[1.73,1.13],(ctx,state)=>{
    ctx.fillStyle="#263a46";ctx.fillRect(0,0,512,320);
    ctx.fillStyle="#d1e7e6";ctx.font="bold 34px system-ui";ctx.fillText("IPO APPROVAL",39,67);
    lightBars(ctx,[270,213],"#83a5ae",39,114);
    ctx.fillStyle=state?"#98d9ad":"#6f8791";ctx.fillRect(37,211,438,57);
    ctx.fillStyle="#233d38";ctx.font="bold 29px system-ui";ctx.fillText(state?"PERMITTED":"AWAITING ROLE",59,250);
  });
  k.tag(terminal,[0,1.87,0],"ADMIN ACTION",teal);
  const pass = k.route(scene,[[.16,.43,-.14],[1.64,.43,-.08],[3.5,.46,.24]],green);
  const packet = k.dot(scene,[0,0,0],.22,lime);
  return {yaw:-.48,polar:1.03,width:11.05,height:5.85,target:[0,.72,0],animate(t) {
    cards[0].badge.rotation.y = -.25 + .28*beat(t,0,.32);
    cards[1].badge.rotation.y = -.22 + .25*beat(t,.56,.79);
    const approved = t >= .69;
    indicator.material = k.mat(approved?green:t >= .32?red:blue,"glow");
    pass.object.visible = approved;
    setApproval(t>=.83 ? 1 : 0);
    const path=t>=.69?pass:t>=.5?cards[1].path:cards[0].path;
    packet.visible=t<=.32||t>=.5;
    placePulse(packet,path,t>=.69?between(t,.69,.97):t>=.5?between(t,.5,.69):between(t,0,.32));
  }};
}

export const models = {
  "profile-skills":skillsModel,
  "profile-education":educationModel,
  "smart-cart":cartModel,
  revocascope:containmentModel,
  synthshield:synthshieldModel,
  poolgo:poolgoModel,
  "customer-360":analyticsModel,
  talkconnect:talkModel,
  bluestock:approvalsModel,
};
