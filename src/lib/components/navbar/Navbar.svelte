<script>
  import Theme from "$lib/components/navbar/Theme.svelte";
  import Logo from "$lib/components/navbar/Logo.svelte";
  import Heading from "$lib/components/navbar/Heading.svelte";
</script>

<header>
  <Logo />
  <Heading />
  <Theme />
</header>

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
    vertical-align: middle;
    z-index: 100;
    border-bottom: 1px solid var(--color-dark-foreground);
    background-color: var(--color-dark-background);
  }

  :global(body.light-mode) header {
    border-bottom: 1px solid var(--color-light-foreground);
    background-color: var(--color-light-background);
  }
</style>
