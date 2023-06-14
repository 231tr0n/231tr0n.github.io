<script>
  import Theme from "$lib/components/navbar/Theme.svelte";
  import Logo from "$lib/components/navbar/Logo.svelte";
  import Heading from "$lib/components/navbar/Heading.svelte";
  import { fly } from "svelte/transition";
  let start = false;
  let screenheight = 0;
  let duration = 500;
  setTimeout(function () {
    start = true;
  }, 0);
</script>

<svelte:window bind:innerHeight={screenheight} />

{#if start}
  <header transition:fly={{ duration: duration, y: screenheight }}>
    <Logo />
    <Heading />
    <Theme />
  </header>
{/if}

<style>
  header {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    height: 62px;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-content: center;
    vertical-align: baseline;
    z-index: 100;
    border-bottom: 1px solid var(--color-dark-foreground);
    background-color: var(--color-dark-background);
  }

  :global(body.light-mode) header {
    border-bottom: 1px solid var(--color-light-foreground);
    background-color: var(--color-light-background);
  }
</style>
