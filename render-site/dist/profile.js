import { createStage } from "./stage.js";

const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");

function mountProfileStage(name,count,duration) {
  const root=document.querySelector(`[data-profile-stage="${name}"]`);
  const viewport=root.querySelector(".profile-viewport");
  const play=root.querySelector("[data-profile-play]");
  const tabs=[...root.querySelectorAll("[data-profile-step]")];
  const panels=[...root.querySelectorAll("[data-profile-panel]")];
  const caption=root.querySelector("[data-profile-caption]");
  let current=-1;

  function showStep(index) {
    if(current===index)return;
    current=index;
    root.dataset.activeStep=String(index);
    tabs.forEach((tab,i)=>{
      tab.setAttribute("aria-selected",String(index===i));
      tab.tabIndex=index===i?0:-1;
    });
    panels.forEach((panel,i)=>{panel.hidden=index!==i;});
    caption.textContent=tabs[index].dataset.caption;
  }

  const stage=createStage(viewport,viewport.querySelector("canvas"),({progress,playing})=>{
    const state=playing?"playing":progress===1?"ended":"idle";
    if(play.dataset.state!==state) {
      play.dataset.state=state;
      play.setAttribute("aria-label",(playing?"Pause ":progress===1?"Replay ":"Play ")+name+" animation");
    }
    showStep(Math.min(count-1,Math.floor(progress*count)));
  });
  stage.load("profile-"+name,duration,.04);
  stage.loop(.002,1/count-.002);
  if(!reducedMotion.matches)stage.play();
  play.addEventListener("click",stage.toggle);
  root.querySelector("[data-profile-reset]").addEventListener("click",stage.resetCamera);
  tabs.forEach((tab,i)=>{
    const select=index=>{
      const playing=viewport.dataset.playing==="true";
      stage.loop(index/count+.002,(index+1)/count-.002);
      stage.seek((index+.35)/count);
      if(playing&&!reducedMotion.matches)stage.play();
    };
    tab.addEventListener("click",()=>select(i));
    tab.addEventListener("keydown",event=>{
      let next;
      if(event.key==="ArrowRight"||event.key==="ArrowDown")next=(i+1)%count;
      if(event.key==="ArrowLeft"||event.key==="ArrowUp")next=(i+count-1)%count;
      if(event.key==="Home")next=0;
      if(event.key==="End")next=count-1;
      if(next===undefined)return;
      event.preventDefault();
      select(next);
      tabs[next].focus();
    });
  });
}

mountProfileStage("skills",6,18000);
mountProfileStage("education",4,14000);
