<script>
  import { fly } from "svelte/transition";
  import { page } from "$app/stores";
  let start = false;
  let screenheight = 0;
  setTimeout(function () {
    start = true;
  }, 1000);
</script>

<svelte:window bind:innerHeight={screenheight} />

{#if start}
  <div>
    <h1 transition:fly={{ duration: 1000, y: screenheight }}>
      {$page.status}: {$page.error.message}
    </h1>
  </div>
{/if}

<style>
  div {
    position: fixed;
    left: 50%;
    transform: translate(-50%, 0%);
  }

  h1 {
    color: red;
  }

  :global(body.light-mode) h1 {
    color: darkred;
  }
</style>
