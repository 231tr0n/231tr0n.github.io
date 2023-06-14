<script>
  import { fly } from "svelte/transition";
  let start = false;
  let screenwidth = 0;
  let screenheight = 0;
  let logo = "/images/zeltron.png";
  setTimeout(function () {
    start = true;
  }, 500);
  let duration = 1000;
</script>

<svelte:head>
  <link rel="preload" href="/images/zeltron.png" as="image" crossorigin />
</svelte:head>

<svelte:window bind:innerWidth={screenwidth} bind:innerHeight={screenheight} />

{#if start}
  <a
    transition:fly={{ duration: duration, y: screenheight, x: screenwidth }}
    href="https://231tr0n.github.io"
    target="_blank"
  >
    <img alt="Zeltron" src={logo} />
  </a>
{/if}

<style>
  img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    background-color: var(--color-dark-component);
    color: var(--color-dark-foreground);
  }

  a {
    text-decoration: none;
  }

  img:hover {
    border: 2px solid darkcyan;
  }

  :global(body.light-mode) img {
    background-color: var(--color-light-component);
    color: var(--color-light-foreground);
  }
</style>
