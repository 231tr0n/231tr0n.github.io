<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Codeeditor from '$lib/components/Codeeditor.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';
	import { onMount } from 'svelte';
	import { cachedFetch } from '$lib/utils/fetch-cache.js';

	let jsCode = $state<string | null>(null);
	let cssCode = $state<string | null>(null);
	let htmlCode = $state<string | null>(null);
	let jsError = $state<string | null>(null);
	let cssError = $state<string | null>(null);
	let htmlError = $state<string | null>(null);

	onMount(async () => {
		const results = await Promise.allSettled([
			cachedFetch('/resources/snippets/tictactoe/index.js'),
			cachedFetch('/resources/snippets/tictactoe/style.css'),
			cachedFetch('/resources/snippets/tictactoe/index.html')
		]);
		if (results[0].status === 'fulfilled') jsCode = results[0].value;
		else jsError = 'Failed to load JS';
		if (results[1].status === 'fulfilled') cssCode = results[1].value;
		else cssError = 'Failed to load CSS';
		if (results[2].status === 'fulfilled') htmlCode = results[2].value;
		else htmlError = 'Failed to load HTML';
	});
</script>

<Page scrollspy={true}>
	<h1>TicTacToe</h1>

	<h2>Source Code</h2>
	{#if jsError}
		<div class="zeltron-error">{jsError}</div>
	{:else if jsCode}
		<Codeeditor
			code={jsCode}
			fileName="index.js"
			langName="javascript"
			mode={javascriptMode}
			readOnly={true} />
	{:else}
		<Loading />
	{/if}
	{#if cssError}
		<div class="zeltron-error">{cssError}</div>
	{:else if cssCode}
		<Codeeditor code={cssCode} fileName="style.css" langName="css" mode={cssMode} readOnly={true} />
	{:else}
		<Loading />
	{/if}
	{#if htmlError}
		<div class="zeltron-error">{htmlError}</div>
	{:else if htmlCode}
		<Codeeditor
			code={htmlCode}
			fileName="index.html"
			langName="html"
			mode={htmlMode}
			readOnly={true} />
	{:else}
		<Loading />
	{/if}

	<h2>Output</h2>
	<Sandbox description="Game" src="/resources/snippets/tictactoe/index.html" title="tic-tac-toe" />
</Page>
