document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initUnifiedContactForm();
});

/* =========================
   Navigation
========================= */

function toggleMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.classList.toggle("open");
}

function initNavigation() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.classList.remove("open");
    }
  });
}

/* =========================
   Unified Contact Form
========================= */

function initUnifiedContactForm() {
  const contactForm = document.getElementById("unified-contact-form");
  const formResult = document.getElementById("form-result");
  const submitBtn = document.getElementById("submit-btn");
  const newsletterCheckbox = document.getElementById(
    "newsletter_optin_checkbox"
  );
  const hiddenNewsletterField = document.querySelector(
    'input[name="newsletter_optin"]'
  );
  const newsletterFollowup = document.getElementById("newsletter-followup");

  if (
    !contactForm ||
    !formResult ||
    !submitBtn ||
    !newsletterCheckbox ||
    !hiddenNewsletterField ||
    !newsletterFollowup
  ) {
    return;
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    hiddenNewsletterField.value = newsletterCheckbox.checked ? "Yes" : "No";

    submitBtn.disabled = true;
    formResult.style.display = "block";
    formResult.style.color = "inherit";
    formResult.textContent = "Sending your message...";

    const formData = new FormData(contactForm);
    const formObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formObject),
      });

      const data = await response.json();

      if (response.ok) {
        formResult.textContent = "Your message has been sent.";

        if (newsletterCheckbox.checked) {
          newsletterFollowup.style.display = "block";
          newsletterFollowup.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          window.location.href = "https://novawrightstudios.com/thanks.html";
        }
      } else {
        formResult.textContent =
          data.message || "Something went wrong. Please try again.";
        formResult.style.color = "red";
        submitBtn.disabled = false;
      }
    } catch (error) {
      formResult.textContent = "Connection error. Please try again later.";
      formResult.style.color = "red";
      submitBtn.disabled = false;
    }
  });
}