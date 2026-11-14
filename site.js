// Mobile navigation toggle and footer year. No tracking, no dependencies.
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

function setNavOpen(isOpen) {
  nav.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
}

toggle.addEventListener("click", () => setNavOpen(!nav.classList.contains("is-open")));
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setNavOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("is-open")) {
    setNavOpen(false);
    toggle.focus();
  }
});

document.getElementById("year").textContent = String(new Date().getFullYear());

// Plan finder: reads allowances and prices from the plan cards so the page has one copy of the numbers.
const plans = [...document.querySelectorAll(".plan")].map((card) => ({
  card,
  name: card.querySelector("h3").textContent,
  price: Number(card.dataset.price),
  orders: Number(card.dataset.orders),
  overagePer100: Number(card.dataset.overage || 0),
  overageCap: Number(card.dataset.overageCap || 0),
}));
const ordersRange = document.getElementById("orders-range");
const ordersInput = document.getElementById("orders-input");
const finderResult = document.getElementById("finder-result");

function showPlanFor(monthlyOrders) {
  const plan = plans.find((candidate) => candidate.overagePer100 > 0 || monthlyOrders <= candidate.orders) || plans[plans.length - 1];
  const extraOrders = Math.max(0, monthlyOrders - plan.orders);
  const overage = Math.min(plan.overageCap, Math.ceil(extraOrders / 100) * plan.overagePer100);
  for (const candidate of plans) {
    const isMatch = candidate === plan;
    candidate.card.classList.toggle("is-match", isMatch);
    candidate.card.querySelector(".plan-flag").hidden = !isMatch;
  }
  const total = plan.price + overage;
  const cost = total === 0 ? "free" : `$${total.toLocaleString("en-US")} every 30 days`;
  const detail = overage > 0 ? `, including $${overage.toLocaleString("en-US")} for ${extraOrders.toLocaleString("en-US")} extra orders` : "";
  finderResult.innerHTML = "";
  const planName = document.createElement("strong");
  planName.textContent = plan.name;
  finderResult.append("At ", `${monthlyOrders.toLocaleString("en-US")} orders a month you would be on `, planName, `: ${cost}${detail}, with every feature included.`);
}

function onOrdersChange(source) {
  const monthlyOrders = Math.max(0, Math.floor(Number(source.value) || 0));
  if (source === ordersRange) ordersInput.value = String(monthlyOrders);
  else ordersRange.value = String(Math.min(monthlyOrders, Number(ordersRange.max)));
  showPlanFor(monthlyOrders);
}

ordersRange.addEventListener("input", () => onOrdersChange(ordersRange));
ordersInput.addEventListener("input", () => onOrdersChange(ordersInput));
showPlanFor(Number(ordersInput.value));

// Scrolling integrations bar: a visible stop control, as well as pausing on hover and focus.
const marquee = document.querySelector(".marquee");
const marqueeToggle = document.querySelector(".marquee-toggle");
marqueeToggle.addEventListener("click", () => {
  const isPaused = marquee.classList.toggle("is-paused");
  marqueeToggle.setAttribute("aria-pressed", String(isPaused));
  marqueeToggle.textContent = isPaused ? "Play" : "Pause";
});
