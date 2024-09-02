<script>
  import Navbar from '$lib/components/navbar/Navbar.svelte';
  import Footer from '$lib/components/footer/Footer.svelte';
  import '$lib/css/main.css';
</script>

<svelte:head>
  <link rel="preload" as="font" type="font/woff2" href="/fonts/roboto-mono.woff2" crossorigin />
  <link
    rel="preload"
    as="font"
    type="font/woff2"
    href="/fonts/roboto-condensed.woff2"
    crossorigin
  />
  <link rel="preload" as="image" type="image/avif" href="/images/background.avif" />
</svelte:head>

<Navbar />
<div class="background">
  <div class="opacity" />
</div>
<main>
  <slot />
</main>
<Footer />

<style>
  .opacity {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: var(--color-dark-background);
    opacity: 80%;
    z-index: 2;
  }

  :global(body.light-mode) .opacity {
    background-color: var(--color-light-background);
  }

  .background {
    background-image: url('/images/background.avif');
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(0px);
    position: fixed;
    top: 45px;
    left: 0px;
    right: 0px;
    bottom: 45px;
    z-index: 1;
  }

  main {
    position: fixed;
    top: 45px;
    left: 0px;
    right: 0px;
    bottom: 45px;
    padding: 0px;
    margin: 0px;
    box-sizing: border-box;
    overflow: hidden;
    z-index: 3;
  }
</style>
