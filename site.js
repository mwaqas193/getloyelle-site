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
  showSaving(monthlyOrders, total);
}

// What the comparison app charges for the plan that unlocks the same features, from its public price list.
const finder = document.querySelector(".plan-finder");
const compare = {
  name: finder.dataset.compareName,
  price: Number(finder.dataset.comparePrice),
  orders: Number(finder.dataset.compareOrders),
  overagePer100: Number(finder.dataset.compareOverage),
};
const finderSaving = document.getElementById("finder-saving");

function showSaving(monthlyOrders, loyelleMonthly) {
  const compareMonthly = compare.price + Math.ceil(Math.max(0, monthlyOrders - compare.orders) / 100) * compare.overagePer100;
  const yearlySaving = (compareMonthly - loyelleMonthly) * 12;
  finderSaving.hidden = yearlySaving <= 0;
  if (yearlySaving <= 0) return;
  finderSaving.innerHTML = "";
  const amount = document.createElement("strong");
  amount.textContent = `about $${yearlySaving.toLocaleString("en-US")} a year`;
  finderSaving.append(`VIP tiers and checkout redemption cost $${compareMonthly.toLocaleString("en-US")} a month on ${compare.name}. You would save `, amount, ".");
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

// Early access form. There is no server behind this site, so the form writes the email for the visitor.
const accessForm = document.getElementById("access-form");
const accessStatus = document.getElementById("access-status");

function setFieldError(input, hasError) {
  input.setAttribute("aria-invalid", String(hasError));
  document.getElementById(`${input.id}-error`).hidden = !hasError;
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const { store, email, orders, current } = accessForm.elements;
  const storeIsValid = /^[^\s@]+\.[^\s@]{2,}$/.test(store.value.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""));
  const emailIsValid = email.validity.valid && email.value.trim() !== "";
  setFieldError(store, !storeIsValid);
  setFieldError(email, !emailIsValid);
  if (!storeIsValid || !emailIsValid) {
    (storeIsValid ? email : store).focus();
    return;
  }
  const lines = [
    `Store: ${store.value.trim()}`,
    `Email: ${email.value.trim()}`,
    `Orders a month: ${orders.value || "Not given"}`,
    `Current loyalty app: ${current.value || "Not given"}`,
  ];
  window.location.href = `mailto:hello@getloyelle.com?subject=${encodeURIComponent("Loyelle early access")}&body=${encodeURIComponent(lines.join("\n"))}`;
  accessStatus.textContent = "Your email app should now be open with your details filled in. Press send and we will reply by email. If nothing opened, write to hello@getloyelle.com.";
  accessStatus.classList.add("is-success");
});

for (const input of [accessForm.elements.store, accessForm.elements.email]) {
  input.addEventListener("input", () => setFieldError(input, false));
}

// Phone-only bar: shown once the hero buttons scroll away, hidden again while the form is on screen.
const stickyCta = document.getElementById("sticky-cta");
const heroButtons = document.querySelector(".hero .cta-row");
const onScreen = new Map();
const stickyObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) onScreen.set(entry.target, entry.isIntersecting);
  const shouldShow = !onScreen.get(heroButtons) && !onScreen.get(accessForm);
  stickyCta.hidden = !shouldShow;
  document.body.classList.toggle("has-sticky-cta", shouldShow);
});
stickyObserver.observe(heroButtons);
stickyObserver.observe(accessForm);
