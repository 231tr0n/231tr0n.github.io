<script>
  let dark = "/images/dark.svg";
  let light = "/images/light.svg";
  let src = dark;

  function toggletheme() {
    window.document.body.classList.toggle("light-mode");
    src = window.document.body.classList.contains("light-mode") ? light : dark;
    localStorage.setItem(
      "theme",
      window.document.body.classList.contains("light-mode") ? "light" : "dark"
    );
  }

  let theme = localStorage.getItem("theme");
  if (theme) {
    if (theme == "light") {
      toggletheme();
    }
  } else {
    localStorage.setItem("theme", "dark");
  }
</script>

<button on:click={toggletheme}>
  <img alt={src == dark ? "Dark Theme" : "Light Theme"} {src} />
</button>

<style>
  button {
    background-color: var(--color-dark-component);
    height: 50px;
    width: 50px;
    border-radius: 50%;
  }

  :global(body.light-mode) button {
    background-color: var(--color-light-component);
  }
</style>
