<svelte:head>
  <link rel="preload" as="image" type="image/svg+xml" href="/images/gmail.svg" />
  <link rel="preload" as="image" type="image/svg+xml" href="/images/github-dark.svg" />
  <link rel="preload" as="image" type="image/svg+xml" href="/images/github-light.svg" />
  <link rel="preload" as="image" type="image/svg+xml" href="/images/gitlab.svg" />
  <link rel="preload" as="image" type="image/svg+xml" href="/images/linkedin.svg" />
  <link rel="preload" as="image" type="image/svg+xml" href="/images/twitter.svg" />
</svelte:head>

<footer class="flex-middle">
  <a target="_blank" href="mailto:zeltronsrikar@gmail.com">
    <img alt="Gmail" src="/images/gmail.svg" />
  </a>
  <a href="https://www.github.com/231tr0n">
    <img alt="Github" class="github" src="/images/github-dark.svg" />
  </a>
  <a target="_blank" href="https://www.gitlab.com/231tr0n">
    <img alt="Gitlab" src="/images/gitlab.svg" />
  </a>
  <a target="_blank" href="https://www.linkedin.com/in/231tr0n">
    <img alt="LinkedIn" src="/images/linkedin.svg" />
  </a>
  <a target="_blank" href="https://www.twitter.com/231tr0n">
    <img alt="Twitter" src="/images/twitter.svg" />
  </a>
</footer>

<style>
  .github {
    content: url('/images/github-light.svg');
  }

  :global(body.light-mode) .github {
    content: url('/images/github-dark.svg');
  }

  footer {
    position: fixed;
    bottom: 0px;
    left: 0px;
    right: 0px;
    height: 45px;
    box-sizing: border-box;
    z-index: 100;
    border-top: 1px solid var(--color-dark-foreground);
    background-color: var(--color-dark-strong-background);
  }

  :global(body.light-mode) footer {
    border-top: 1px solid var(--color-light-foreground);
    background-color: var(--color-light-strong-background);
  }

  img {
    padding: 2px;
    margin-left: 2px;
    margin-right: 2px;
    width: 30px;
    height: 30px;
  }
</style>
