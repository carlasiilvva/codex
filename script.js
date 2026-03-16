const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const accordionTriggers = document.querySelectorAll(".accordion-trigger");
const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

accordionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".accordion-item");
    const panel = item?.querySelector(".accordion-panel");
    const isOpen = panel?.classList.contains("open");

    accordionTriggers.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button
        .closest(".accordion-item")
        ?.querySelector(".accordion-panel")
        ?.classList.remove("open");
    });

    if (!isOpen && panel) {
      trigger.setAttribute("aria-expanded", "true");
      panel.classList.add("open");
    }
  });
});
