const links = Array.from(document.querySelectorAll(".part"));
const panes = Array.from(document.querySelectorAll(".pane"));
const screen = document.querySelector("#screen-body");
const screenFrame = document.querySelector(".screen");
const title = document.querySelector("#screen-title");
const home = document.querySelector(".home-button");
const phone = window.matchMedia("(max-width: 810px)");
const clock = document.querySelector("time");
const board = document.querySelector(".board");
const boardReadout = document.querySelector("#board-readout");
let activeSection = null;

function showSection(moveFocus = false) {
  const requested = window.location.hash.slice(1);
  const active = links.find(link => link.dataset.section === requested);
  const section = active?.dataset.section ?? "about";
  const phoneApp = Boolean(active) && phone.matches;
  const selectedLink = links.find(link => link.dataset.section === section);

  document.body.classList.toggle("app-open", phoneApp);
  for (const link of links) {
    if (link === selectedLink && (!phone.matches || phoneApp)) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  const pane = panes.find(item => item.id === section);
  for (const item of panes) item.hidden = item !== pane;
  title.textContent = selectedLink.querySelector(".app-label").textContent;
  boardReadout.textContent = selectedLink.querySelector(".part-label b").textContent + " / " + title.textContent;

  if (activeSection !== section || moveFocus) {
    pane.classList.remove("enter");
    requestAnimationFrame(() => pane.classList.add("enter"));
    if (!phone.matches) {
      board.classList.remove("is-routing");
      if (activeSection !== null) {
        void board.offsetWidth;
        board.classList.add("is-routing");
      }
    }
    screen.scrollTop = 0;
    if (phone.matches) window.scrollTo(0, 0);
  }
  if (moveFocus && (!phone.matches || phoneApp)) screen.focus({ preventScroll: true });
  if (moveFocus && phone.matches && !phoneApp) {
    links.find(link => link.dataset.section === activeSection)?.focus({ preventScroll: true });
  }
  activeSection = section;
}

function showHome() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  showSection(true);
}

document.addEventListener("click", event => {
  const anchor = event.target.closest("a[href^='#']");
  if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (phone.matches && !document.body.classList.contains("app-open")) {
    const rect = anchor.getBoundingClientRect();
    screenFrame.style.setProperty("--launch-x", (rect.left + rect.width / 2) / window.innerWidth * 100 + "%");
    screenFrame.style.setProperty("--launch-y", (rect.top + rect.height / 2) / window.innerHeight * 100 + "%");
  }
  const hash = anchor.getAttribute("href");
  if (window.location.hash !== hash) history.pushState(null, "", hash);
  showSection(!anchor.classList.contains("part") || phone.matches);
});
window.addEventListener("popstate", () => showSection());
window.addEventListener("hashchange", () => showSection());
phone.addEventListener("change", () => showSection());
home.addEventListener("click", showHome);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.body.classList.contains("app-open")) showHome();
});

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
function updateClock() {
  const date = new Date();
  clock.dateTime = date.toISOString();
  clock.textContent = timeFormat.format(date);
}
updateClock();
setInterval(updateClock, 15000);
document.querySelector("#year").textContent = new Date().getFullYear();
showSection();
