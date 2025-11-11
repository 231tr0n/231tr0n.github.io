<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Codeeditor from '$lib/components/Codeeditor.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';

	const fetch_url = async (url: string) => {
		const data = await fetch(url);
		return await data.text();
	};
</script>

<Page scrollspy={true}>
	<h1>TicTacToe</h1>

	<h2>Source Code</h2>
	{#await fetch_url('/resources/snippets/tictactoe/index.js')}
		<Loading />
	{:then res}
		<Codeeditor
			code={res}
			fileName="index.js"
			langName="javascript"
			mode={javascriptMode}
			readOnly={true} />
	{:catch error}
		<div class="zeltron-error">{error}</div>
	{/await}
	{#await fetch_url('/resources/snippets/tictactoe/style.css')}
		<Loading />
	{:then res}
		<Codeeditor code={res} fileName="style.css" langName="css" mode={cssMode} readOnly={true} />
	{:catch error}
		<div class="zeltron-error">{error}</div>
	{/await}
	{#await fetch_url('/resources/snippets/tictactoe/index.html')}
		<Loading />
	{:then res}
		<Codeeditor code={res} fileName="index.html" langName="html" mode={htmlMode} readOnly={true} />
	{:catch error}
		<div class="zeltron-error">{error}</div>
	{/await}

	<h2>Output</h2>
	<Sandbox description="Game" src="/resources/snippets/tictactoe/index.html" title="tic-tac-toe" />
</Page>
