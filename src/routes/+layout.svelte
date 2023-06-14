<script>
  import Navbar from "$lib/components/navbar/Navbar.svelte";
  import Footer from "$lib/components/footer/Footer.svelte";
  import "$lib/css/main.css";
</script>

<svelte:head>
  <link
    rel="preload"
    href="/fonts/HurmitNerdFontMono-Regular.otf"
    as="font"
    type="font/otf"
    crossorigin
  />
  <link
    rel="preload"
    href="/fonts/HurmitNerdFontMono-Bold.otf"
    as="font"
    type="font/otf"
    crossorigin
  />
  <link
    rel="preload"
    href="/fonts/HurmitNerdFontMono-BoldItalic.otf"
    as="font"
    type="font/otf"
    crossorigin
  />
  <link
    rel="preload"
    href="/fonts/HurmitNerdFontMono-LightItalic.otf"
    as="font"
    type="font/otf"
    crossorigin
  />
  <link
    rel="preload"
    href="/fonts/HurmitNerdFontMono-Light.otf"
    as="font"
    type="font/otf"
    crossorigin
  />
  <link
    rel="preload"
    href="/fonts/HurmitNerdFontMono-Regular.otf"
    as="font"
    type="font/otf"
    crossorigin
  />
  <link rel="preload" href="/images/background.png" as="image" crossorigin />
</svelte:head>

<div class="body">
  <Navbar />
  <div class="background">
    <div class="opacity" />
  </div>
  <main class="main">
    <slot />
  </main>
  <Footer />
</div>

<style>
  .opacity {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: var(--color-dark-background);
    opacity: 85%;
  }

  .background {
    background-image: url("/images/background.png");
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(3px);
    position: fixed;
    top: 62px;
    left: 0px;
    right: 0px;
    bottom: 62px;
  }

  .main {
    position: fixed;
    top: 62px;
    left: 0px;
    right: 0px;
    bottom: 62px;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
    /* background-color: var(--color-dark-background); */
    color: var(--color-dark-foreground);
  }

  .body {
    overflow: hidden;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: var(--color-dark-background);
    color: var(--color-dark-foreground);
    font-family: HurmitNerdFontMono-Regular;
  }

  :global(body.light-mode) .body {
    background-color: var(--color-light-background);
    color: var(--color-light-foreground);
  }

  :global(body.light-mode) .opacity {
    background-color: var(--color-light-background);
  }

  :global(body.light-mode) .main {
    /* background-color: var(--color-light-background); */
    color: var(--color-light-foreground);
  }
</style>
