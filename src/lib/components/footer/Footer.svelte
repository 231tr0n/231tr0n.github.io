<script>
  import { fly } from "svelte/transition";
  let start = false;
  let screenheight = 0;
  setTimeout(function () {
    start = true;
  }, 1000);
  let duration = 500;
</script>

<svelte:head>
  <link rel="preload" href="/images/gmail.svg" as="image" crossorigin />
  <link rel="preload" href="/images/github-dark.svg" as="image" crossorigin />
  <link rel="preload" href="/images/github-light.svg" as="image" crossorigin />
  <link rel="preload" href="/images/gitlab.svg" as="image" crossorigin />
  <link rel="preload" href="/images/linkedin.svg" as="image" crossorigin />
  <link rel="preload" href="/images/twitter.svg" as="image" crossorigin />
</svelte:head>

<svelte:window bind:innerHeight={screenheight} />

{#if start}
  <div transition:fly={{ duration: duration, y: -screenheight }}>
    <a target="_blank" href="mailto:zeltronsrikar@gmail.com">
      <img
        alt="Gmail"
        src="/images/gmail.svg"
        transition:fly={{ duration: duration + 1000, y: -screenheight }}
      />
    </a>
    <a href="https://www.github.com/231tr0n">
      <img
        alt="Github"
        class="github"
        src="/images/github-dark.svg"
        transition:fly={{ duration: duration + 2000, y: -screenheight }}
      />
    </a>
    <a target="_blank" href="https://www.gitlab.com/231tr0n">
      <img
        alt="Gitlab"
        src="/images/gitlab.svg"
        transition:fly={{ duration: duration + 3000, y: -screenheight }}
      />
    </a>
    <a target="_blank" href="https://www.linkedin.com/in/231tr0n">
      <img
        alt="LinkedIn"
        src="/images/linkedin.svg"
        transition:fly={{ duration: duration + 4000, y: -screenheight }}
      />
    </a>
    <a target="_blank" href="https://www.twitter.com/231tr0n">
      <img
        alt="Twitter"
        src="/images/twitter.svg"
        transition:fly={{ duration: duration + 5000, y: -screenheight }}
      />
    </a>
  </div>
{/if}

<style>
  a {
    text-decoration: none;
    color: var(--color-dark-foreground);
  }

  .github {
    content: url("/images/github-light.svg");
  }

  div {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    bottom: 0px;
    left: 0px;
    right: 0px;
    height: 62px;
    padding: 5px;
    box-sizing: border-box;
    z-index: 100;
    border-top: 1px solid var(--color-dark-foreground);
    background-color: var(--color-dark-background);
  }

  img {
    padding: 5px;
    width: 30px;
    height: 30px;
    border: 0px;
  }

  img:hover {
    border: 2px solid darkcyan;
  }

  :global(body.light-mode) div {
    border-top: 1px solid var(--color-light-foreground);
    background-color: var(--color-light-background);
  }

  :global(body.light-mode) a {
    color: var(--color-light-foreground);
  }

  :global(body.light-mode) .github {
    content: url("/images/github-dark.svg");
  }
</style>
