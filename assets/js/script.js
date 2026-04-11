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