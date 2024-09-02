<script>
  import { onMount } from 'svelte';
  import Theme from './Theme.svelte';

  let div = '';
  let toggled = false;
  let toggleDiv = () => {};

  onMount(() => {
    div.style.display = 'none';
    toggled = false;
    toggleDiv = () => {
      if (div.style.display === 'none') {
        div.style.display = 'flex';
        toggled = true;
      } else {
        div.style.display = 'none';
        toggled = false;
      }
    };
  });
</script>

<header>
  <div bind:this={div} class="body border">
    <a href="/"><button>Home</button></a>
    <a href="/blog"><button>Blog</button></a>
    <a href="/projects"><button>Projects</button></a>
    <a href="/snippets"><button>Snippets</button></a>
    <a href="/utilities"><button>Utilities</button></a>
  </div>
  <button on:click={toggleDiv} class="toggler" aria-label="Menu">
    {#if !toggled}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        class="bi bi-list"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        class="bi bi-x-lg"
        viewBox="0 0 16 16"
      >
        <path
          d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"
        />
      </svg>
    {/if}
  </button>
  <strong class="keyword">231tr0n</strong>
  <Theme />
</header>

<style>
  div {
    position: fixed;
    left: -1px;
    top: 44px;
    bottom: 44px;
    display: none;
    flex-direction: column;
    padding: 10px;
    overflow: auto;
  }

  strong {
    vertical-align: middle;
    font-size: 25px;
    text-decoration: underline;
    font-weight: bolder;
    color: var(--color-dark-heading);
  }

  :global(body.light-mode) strong {
    color: var(--color-light-heading);
  }

  button.toggler {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    width: 35px;
    height: 35px;
  }

  a button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    border-radius: 5px;
  }

  a {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  a:hover {
    text-decoration: none;
  }

  :global(body.light-mode) a:hover {
    text-decoration: none;
  }

  header {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    height: 45px;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 7px;
    padding-right: 7px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    border-bottom: 1px solid var(--color-dark-foreground);
    background-color: var(--color-dark-strong-background);
  }

  :global(body.light-mode) header {
    border-bottom: 1px solid var(--color-light-foreground);
    background-color: var(--color-light-strong-background);
  }
</style>
