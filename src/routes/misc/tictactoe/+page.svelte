<script>
	import Page from '$lib/components/page/Page.svelte';
	import Loading from '$lib/components/page/Loading.svelte';
	import Codeeditor from '$lib/components/page/Codeeditor.svelte';
	import Sandbox from '$lib/components/page/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';

	let fetch_url = async (url) => {
		let data = await fetch(url);
		return await data.text();
	};
</script>

<Page scrollspy="true">
	<h1>TicTacToe</h1>

	<h2>Source Code</h2>
	{#await fetch_url('/resources/snippets/tictactoe/index.js')}
		<Loading />
	{:then res}
		<Codeeditor code={res} mode={javascriptMode} langName={'javascript'} readOnly={true} />
	{:catch error}
		<div class="error">{error}</div>
	{/await}
	{#await fetch_url('/resources/snippets/tictactoe/style.css')}
		<Loading />
	{:then res}
		<Codeeditor code={res} mode={cssMode} langName={'css'} readOnly={true} />
	{:catch error}
		<div class="error">{error}</div>
	{/await}
	{#await fetch_url('/resources/snippets/tictactoe/index.html')}
		<Loading />
	{:then res}
		<Codeeditor code={res} mode={htmlMode} langName={'html'} readOnly={true} />
	{:catch error}
		<div class="error">{error}</div>
	{/await}

	<h2>Output</h2>
	<Sandbox title="tic-tac-toe" src="/resources/snippets/tictactoe/index.html" />
</Page>
