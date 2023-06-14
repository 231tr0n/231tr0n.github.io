<script>
  import { fly } from "svelte/transition";
  let start = false;
  let screenheight = 0;
  setTimeout(function () {
    start = true;
  }, 500);
  let duration = 1000;
</script>

<svelte:window bind:innerHeight={screenheight} />

{#if start}
  <div transition:fly={{ duration: duration, y: screenheight }}>231tr0n</div>
{/if}

<style>
  div {
    font-family: HurmitNerdFontMono-Bold;
    font-weight: bold;
    text-decoration: underline;
    font-size: 40px;
    color: green;
  }
</style>
