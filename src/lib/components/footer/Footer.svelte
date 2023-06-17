<div>
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
</div>

<style>
  .github {
    content: url("/images/github-light.svg");
  }

  :global(body.light-mode) .github {
    content: url("/images/github-dark.svg");
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

  :global(body.light-mode) div {
    border-top: 1px solid var(--color-light-foreground);
    background-color: var(--color-light-background);
  }

  img {
    padding: 5px;
    width: 30px;
    height: 30px;
  }
</style>
