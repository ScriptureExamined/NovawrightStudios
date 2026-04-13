function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) {
    menu.classList.toggle("open");
  }
}

document.addEventListener("keydown", function (event) {
  const menu = document.getElementById("menu");
  if (!menu) return;

  if (event.key === "Escape") {
    menu.classList.remove("open");
  }
});

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact-form");
    const btn = document.getElementById("submitBtn");
    const panel = document.getElementById("newsletter-after-submit");

    if (!form || !btn || !panel) return;

    panel.style.display = "none";

    form.addEventListener("submit", function (e) {
      // show newsletter panel
      panel.style.display = "block";

      // OPTIONAL: delay form submit slightly so user sees it
      e.preventDefault();

      setTimeout(() => {
        form.submit();
      }, 1500); // 1.5 seconds
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById("newsletter_optin");
    const panel = document.getElementById("newsletter-signup-panel");

    function toggleNewsletterPanel() {
      if (!checkbox || !panel) return;

      if (checkbox.checked) {
        panel.style.display = "block";
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        panel.style.display = "none";
      }
    }

    toggleNewsletterPanel();
    checkbox.addEventListener("change", toggleNewsletterPanel);
  });