<script>
  import Page from '$lib/components/page/Page.svelte';
  import Codehighlighter from '$lib/components/page/Codehighlighter.svelte';
  import Sandbox from '$lib/components/page/Sandbox.svelte';
  import highlightJs from 'highlight.js/lib/languages/javascript';
  import highlightCss from 'highlight.js/lib/languages/css';
  import highlightXml from 'highlight.js/lib/languages/xml';

  let fetch_url = async (url) => {
    let data = await fetch(url);
    return await data.text();
  };
</script>

<svelte:head>
  <link
    rel="preload"
    src="/resources/snippets/tictactoe/index.html"
    as="document"
    type="text/html"
  />
  <link
    rel="preload"
    src="/resources/snippets/tictactoe/index.js"
    as="script"
    type="text/javascript"
  />
  <link rel="preload" src="/resources/snippets/tictactoe/style.css" as="style" type="text/css" />
</svelte:head>

<Page scrollspy="true">
  <h1>TicTacToe</h1>

  <h2>Source Code</h2>
  {#await fetch_url('/resources/snippets/tictactoe/index.js') then res}
    <Codehighlighter
      code={res}
      langDef={highlightJs}
      langName={'javascript'}
      fileName={'index.js'}
    />
  {:catch error}
    <div class="error">{error}</div>
  {/await}
  {#await fetch_url('/resources/snippets/tictactoe/style.css') then res}
    <Codehighlighter code={res} langDef={highlightCss} langName={'css'} fileName={'style.css'} />
  {:catch error}
    <div class="error">{error}</div>
  {/await}
  {#await fetch_url('/resources/snippets/tictactoe/index.html') then res}
    <Codehighlighter code={res} langDef={highlightXml} langName={'html'} fileName={'index.html'} />
  {:catch error}
    <div class="error">{error}</div>
  {/await}

  <h2>Output</h2>
  <Sandbox title="tic-tac-toe" src="/resources/snippets/tictactoe/index.html" />
</Page>
