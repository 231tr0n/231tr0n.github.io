<script>
  import Accordion from '$lib/components/page/Accordion.svelte';

  export let name = '';
  export let url = '';
  export let badges = [];
  export let description = '';
</script>

{#if name && description}
  <Accordion {name} {url}>
    <div class="center">
      {#each badges as badge}
        <span class="badge">{badge}</span>
      {/each}
      <div class="center">
        {description}
      </div>
    </div>
  </Accordion>
{/if}

<style>
  div.center {
    margin-top: 1em;
  }
</style>
