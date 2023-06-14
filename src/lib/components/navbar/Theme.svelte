<script>
  import { fly } from "svelte/transition";
  let start = false;
  let screenwidth = 0;
  let screenheight = 0;
  let dark = "/images/dark.svg";
  let light = "/images/light.svg";
  let src = dark;
  setTimeout(function () {
    start = true;
  }, 500);
  let duration = 1000;

  function toggletheme() {
    window.document.body.classList.toggle("light-mode");
    src = window.document.body.classList.contains("light-mode") ? light : dark;
  }
</script>

<svelte:head>
  <link rel="preload" href="/images/dark.svg" as="image" crossorigin />
  <link rel="preload" href="/images/light.svg" as="image" crossorigin />
</svelte:head>

<svelte:window bind:innerWidth={screenwidth} bind:innerHeight={screenheight} />

{#if start}
  <button
    transition:fly={{ duration: duration, y: screenheight, x: -screenwidth }}
    on:click={toggletheme}
  >
    <img alt={src == dark ? "Dark Theme" : "Light Theme"} {src} />
  </button>
{/if}

<style>
  button {
    background-color: var(--color-dark-component);
    color: var(--color-dark-foreground);
    height: 50px;
    width: 50px;
    border-radius: 50%;
    border: 0px;
  }

  button:hover {
    border: 2px solid darkcyan;
  }

  :global(body.light-mode) button {
    background-color: var(--color-light-component);
    color: var(--color-light-foreground);
  }
</style>
