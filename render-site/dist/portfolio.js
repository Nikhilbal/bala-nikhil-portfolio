import { projects } from "./projects.js";
import { createStage } from "./stage.js";

const find = selector => document.querySelector(selector);
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const defaultProject = "smart-cart";
const projectNav = [...document.querySelectorAll(".project-index [data-open-project]")];
const modeTabs = [...document.querySelectorAll("[data-mode]")];
const output = find("#output-content");
const details = find("#case-details");
const imageDialog = find("#image-dialog");
const motionPanel = find("#project-motion");
const outputPanel = find("#project-output");
const chapterList = find("#chapter-list");
const chapterText = find("#chapter-description");
const timeline = find("#timeline");
const timeDisplay = find("#time-display");
const workPlay = find("#work-play");
const heroPlay = find("#hero-play");

let activeProject = defaultProject;
let mode = "output";
let workStage;
let workStageKey;
let chapter = -1;
let activeImage = 0;
let imageTrigger;

function element(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text != null) item.textContent = text;
  return item;
}

function makeIcon(name) {
  const icon = element("span","icon icon-"+name);
  icon.setAttribute("aria-hidden","true");
  return icon;
}

function formatTime(milliseconds) {
  return "0:" + String(Math.floor(milliseconds/1000)).padStart(2,"0");
}

function playControl(button, progress, playing, label) {
  const state = playing ? "playing" : progress === 1 ? "ended" : "idle";
  const action = playing ? "Pause " : progress === 1 ? "Replay " : "Play ";
  if (button.dataset.state !== state) button.dataset.state = state;
  if (button.getAttribute("aria-label") !== action+label) button.setAttribute("aria-label",action+label);
}

function activeChapter(steps,progress) {
  return Math.max(0,steps.findLastIndex(([start])=>start<=progress));
}

const heroProject = projects[defaultProject];
const heroStage = createStage(find("#hero-viewport"),find("#hero-canvas"),({progress,playing})=>{
  playControl(heroPlay,progress,playing,"Smart Cart preview");
  const name = heroProject.steps[activeChapter(heroProject.steps,progress)][2];
  if (find("#hero-beat").textContent !== name) find("#hero-beat").textContent = name;
});
heroStage.load(defaultProject,heroProject.duration,0);
if (!reduce.matches) heroStage.play();
heroPlay.addEventListener("click",heroStage.toggle);

function updateWorkState({progress,playing,duration}) {
  const item = projects[activeProject];
  playControl(workPlay,progress,playing,"walkthrough");
  timeline.value = Math.round(progress*1000);
  const time = formatTime(progress*duration)+" / "+formatTime(duration);
  if (timeDisplay.textContent !== time) {
    timeDisplay.textContent = time;
    timeline.setAttribute("aria-valuetext",time);
  }
  const next = activeChapter(item.steps,progress);
  if (chapter !== next) {
    chapter = next;
    chapterText.textContent = item.steps[next][3];
    [...chapterList.children].forEach((button,index)=>button.setAttribute("aria-pressed",String(index===next)));
  }
}

function openImage(image, trigger) {
  imageTrigger = trigger;
  find("#image-title").textContent = image.title;
  const full = find("#full-output-image");
  full.src = image.src;
  full.alt = image.alt;
  find("#image-note").textContent = image.caption;
  find("#download-output").href = image.src;
  imageDialog.showModal();
}

function renderOutput() {
  const item = projects[activeProject];
  output.replaceChildren();
  if (!item.images.length) {
    const note = element("div","output-notice");
    note.append(element("h4",null,"Recorded local demo checks"),
      element("p",null,"An original screenshot for this local prototype is currently unavailable."),
      element("pre",null,item.checks));
    output.append(note);
    return;
  }

  if (item.images.length > 1) {
    const list = element("ul","output-selector");
    item.images.forEach((image,index)=>{
      const li = element("li");
      const option = element("button",null,image.title);
      option.type = "button";
      option.setAttribute("aria-pressed",String(index===activeImage));
      option.addEventListener("click",()=>{
        activeImage = index;
        renderOutput();
        output.querySelectorAll(".output-selector button")[index].focus({preventScroll:true});
      });
      li.append(option);
      list.append(li);
    });
    output.append(list);
  }

  const image = item.images[activeImage];
  const figure = element("figure","output-frame");
  const bar = element("div","output-toolbar");
  const open = element("button",null,"View full image");
  open.append(makeIcon("out"));
  open.type = "button";
  open.addEventListener("click",()=>openImage(image,open));
  bar.append(element("p","eyebrow",image.title),open);
  const picture = element("div","output-picture");
  const img = element("img");
  img.src = image.src;
  img.alt = image.alt;
  img.decoding = "async";
  picture.append(img);
  figure.append(bar,picture,element("figcaption","output-caption",image.caption));
  output.append(figure);
}

function caseSection(heading, text, className) {
  const section = element("section",className);
  section.append(element("h5",null,heading),element("p",null,text));
  return section;
}

function renderDetails(item) {
  const study = item.caseStudy;
  const purpose = caseSection("Purpose",study.purpose,"case-card");
  const audience = caseSection("Who uses it and when",study.audience,"case-card");

  const workflow = element("section","case-wide");
  const steps = element("ol","case-steps");
  steps.setAttribute("role","list");
  study.workflow.forEach(([title,description],index)=>{
    const step = element("li","case-step");
    const number = element("span","case-step-number",String(index+1).padStart(2,"0"));
    number.setAttribute("aria-hidden","true");
    const copy = element("div");
    copy.append(element("strong",null,title),element("p",null,description));
    step.append(number,copy);
    steps.append(step);
  });
  workflow.append(element("h5",null,"How it works"),steps);

  const example = caseSection("Example in practice",study.example,"case-example case-wide");
  const benefits = element("section","case-wide");
  const reasons = element("ul","case-benefits");
  study.benefits.forEach(reason=>reasons.append(element("li",null,reason)));
  benefits.append(element("h5",null,"Why it’s helpful"),reasons);

  const contribution = caseSection("My contribution",study.contribution,"case-card");
  const evidence = caseSection("Evidence and current scope",study.evidence,"case-card");

  const links = element("div","case-links");
  item.tech.forEach(name=>links.append(element("span","tech-tag",name)));
  item.links.forEach(({title,href})=>{
    const anchor = element("a","source-link",title);
    anchor.append(makeIcon("out"));
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    links.append(anchor);
  });
  details.replaceChildren(purpose,audience,workflow,example,benefits,contribution,evidence,links);
}

function showMode(next, autoplay = true) {
  mode = next;
  modeTabs.forEach(button=>{
    const selected = button.dataset.mode === mode;
    button.setAttribute("aria-selected",String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  outputPanel.hidden = mode !== "output";
  motionPanel.hidden = mode !== "motion";
  if (mode === "output") {
    workStage?.setActive(false);
    return;
  }
  if (!workStage) workStage = createStage(find("#work-viewport"),find("#work-canvas"),updateWorkState);
  const item = projects[activeProject];
  const changed = workStageKey !== activeProject;
  workStage.setActive(true);
  if (changed) {
    workStageKey = activeProject;
    chapter = -1;
    chapterList.replaceChildren(...item.steps.map(([,focus,title],index)=>{
      const button = element("button");
      button.type = "button";
      button.append(element("span",null,"0"+(index+1)),document.createTextNode(title));
      button.addEventListener("click",()=>workStage.seek(focus));
      return button;
    }));
    find("#work-canvas").setAttribute("aria-label",item.title+" 3D walkthrough. Drag or use arrow keys to rotate.");
    workStage.load(activeProject,item.duration);
    if (autoplay && !reduce.matches) workStage.play();
  }
}

function showProject(id, shouldScroll = false, focusTitle = false) {
  const item = projects[id];
  activeProject = id;
  activeImage = 0;
  find("#project-title").textContent = item.title;
  find("#case-study-title").textContent = item.title+" case study";
  find("#project-status").textContent = item.status;
  find("#project-summary").textContent = item.summary;
  find("#project-category").textContent = item.category;
  projectNav.forEach(anchor=>{
    if (anchor.dataset.openProject === id) anchor.setAttribute("aria-current","true");
    else anchor.removeAttribute("aria-current");
  });
  showMode("output");
  renderOutput();
  renderDetails(item);
  if (shouldScroll) find("#project-panel").scrollIntoView({block:"start"});
  if (focusTitle) find("#project-title").focus({preventScroll:true});
}

document.querySelectorAll("[data-open-project]").forEach(anchor=>{
  anchor.addEventListener("click",event=>{
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.location.hash !== anchor.hash) window.history.pushState(null,"",anchor.hash);
    showProject(anchor.dataset.openProject,true,true);
  });
});

function readRoute(scroll) {
  const requested = window.location.hash.slice("#project-".length);
  const valid = window.location.hash.startsWith("#project-") && Object.hasOwn(projects,requested);
  if (valid) showProject(requested,scroll);
  return valid;
}

find("#read-case-study").addEventListener("click",()=>{
  find("#case-study").scrollIntoView({block:"start"});
  find("#case-study-title").focus({preventScroll:true});
});

window.addEventListener("hashchange",()=>readRoute(true));
modeTabs.forEach(button=>{
  button.addEventListener("click",()=>showMode(button.dataset.mode));
  button.addEventListener("keydown",event=>{
    const other = modeTabs.find(tab=>tab!==button);
    const next = {ArrowLeft:other,ArrowRight:other,Home:modeTabs[0],End:modeTabs.at(-1)}[event.key];
    if (!next) return;
    event.preventDefault();
    next.focus();
    showMode(next.dataset.mode);
  });
});
workPlay.addEventListener("click",()=>workStage?.toggle());
timeline.addEventListener("input",()=>workStage?.seek(Number(timeline.value)/1000));
find("#reset-camera").addEventListener("click",()=>workStage?.resetCamera());
find("#close-image").addEventListener("click",()=>imageDialog.close());
imageDialog.addEventListener("click",event=>{
  if (event.target === imageDialog) imageDialog.close();
});
imageDialog.addEventListener("close",()=>imageTrigger?.focus({preventScroll:true}));

if (!readRoute(true)) showProject(defaultProject);
