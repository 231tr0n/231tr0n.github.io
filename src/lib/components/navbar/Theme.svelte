<script>
  import { lightMode } from '$lib/store.js';
  import { browser } from '$app/environment';
  let dark = '/images/dark.svg';
  let light = '/images/light.avif';
  let src = dark;

  let toggletheme = () => {
    window.document.body.classList.toggle('light-mode');
    src = window.document.body.classList.contains('light-mode') ? light : dark;
    if (browser) {
      localStorage.setItem(
        'theme',
        window.document.body.classList.contains('light-mode') ? 'light' : 'dark'
      );
    }
    if (window.document.body.classList.contains('light-mode')) {
      lightMode.set(true);
    } else {
      lightMode.set(false);
    }
  };

  let theme = 'dark';
  if (browser) {
    theme = localStorage.getItem('theme');
  }
  if (theme) {
    if (theme == 'light') {
      lightMode.set(true);
      toggletheme();
    } else {
      lightMode.set(false);
    }
  } else {
    if (browser) {
      localStorage.setItem('theme', 'dark');
    }
  }
</script>

<svelte:head>
  <link rel="preload" as="image" type="image/svg+xml" href="/images/dark.svg" />
  <link rel="preload" as="image" type="image/avif" href="/images/light.avif" />
</svelte:head>

<button on:click={toggletheme}>
  <img alt={src == dark ? 'Dark Theme' : 'Light Theme'} {src} />
</button>

<style>
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    width: 35px;
    border-radius: 50%;
  }

  img {
    height: 20px;
    width: 20px;
  }
</style>
