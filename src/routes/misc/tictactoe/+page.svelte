<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Codeeditor from '$lib/components/Codeeditor.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';

	let fetch_url = async (url: string) => {
		let data = await fetch(url);
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
			mode={javascriptMode}
			langName={'javascript'}
			readOnly={true}
			fileName={'index.js'} />
	{:catch error}
		<div class="error">{error}</div>
	{/await}
	{#await fetch_url('/resources/snippets/tictactoe/style.css')}
		<Loading />
	{:then res}
		<Codeeditor code={res} mode={cssMode} langName={'css'} readOnly={true} fileName={'style.css'} />
	{:catch error}
		<div class="error">{error}</div>
	{/await}
	{#await fetch_url('/resources/snippets/tictactoe/index.html')}
		<Loading />
	{:then res}
		<Codeeditor
			code={res}
			mode={htmlMode}
			langName={'html'}
			readOnly={true}
			fileName={'index.html'} />
	{:catch error}
		<div class="error">{error}</div>
	{/await}

	<h2>Output</h2>
	<Sandbox title="tic-tac-toe" src="/resources/snippets/tictactoe/index.html" />
</Page>
