<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Codeeditor from '$lib/components/Codeeditor.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';
	import { onMount } from 'svelte';
	import { cachedFetch } from '$lib/utils/fetch-cache';
	import type { FileState } from '$lib/types';

	let jsFile = $state<FileState>({ code: null, error: null });
	let cssFile = $state<FileState>({ code: null, error: null });
	let htmlFile = $state<FileState>({ code: null, error: null });

	const extractFileState = (result: PromiseSettledResult<string>): FileState => {
		if (result.status === 'fulfilled') {
			return { code: result.value, error: null };
		}
		return { code: null, error: 'Failed to load file' };
	};

	onMount(async () => {
		const results = await Promise.allSettled([
			cachedFetch('/resources/snippets/tictactoe/index.js'),
			cachedFetch('/resources/snippets/tictactoe/style.css'),
			cachedFetch('/resources/snippets/tictactoe/index.html')
		]);
		jsFile = extractFileState(results[0]);
		cssFile = extractFileState(results[1]);
		htmlFile = extractFileState(results[2]);
	});
</script>

<Page scrollspy={true}>
	<h1>TicTacToe</h1>

	<h2>Source Code</h2>
	{#if jsFile.error}
		<div class="zeltron-error">{jsFile.error}</div>
	{:else if jsFile.code}
		<Codeeditor
			code={jsFile.code}
			fileName="index.js"
			langName="javascript"
			mode={javascriptMode}
			readOnly={true} />
	{:else}
		<Loading />
	{/if}
	{#if cssFile.error}
		<div class="zeltron-error">{cssFile.error}</div>
	{:else if cssFile.code}
		<Codeeditor
			code={cssFile.code}
			fileName="style.css"
			langName="css"
			mode={cssMode}
			readOnly={true} />
	{:else}
		<Loading />
	{/if}
	{#if htmlFile.error}
		<div class="zeltron-error">{htmlFile.error}</div>
	{:else if htmlFile.code}
		<Codeeditor
			code={htmlFile.code}
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
