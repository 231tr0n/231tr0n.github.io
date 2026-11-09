<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import Codeeditor from '#lib/components/Codeeditor.svelte';
	import Sandbox from '#lib/components/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';
	import { onMount } from 'svelte';
	import { cachedFetch } from '#lib/utils/fetch-cache.js';
	import type { FileState } from '#lib/types/index.js';

	let jsFile = $state<FileState>({ code: null, error: null });
	let cssFile = $state<FileState>({ code: null, error: null });
	let htmlFile = $state<FileState>({ code: null, error: null });

	const editors = $derived([
		{ file: jsFile, fileName: 'index.js', langName: 'javascript', mode: javascriptMode },
		{ file: cssFile, fileName: 'style.css', langName: 'css', mode: cssMode },
		{ file: htmlFile, fileName: 'index.html', langName: 'html', mode: htmlMode }
	]);

	const extractFileState = (result: PromiseSettledResult<string>): FileState => {
		if (result.status === 'fulfilled') {
			return { code: result.value, error: null };
		}
		return {
			code: null,
			error: result.reason instanceof Error ? result.reason.message : 'Failed to load file'
		};
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
	{#each editors as { file, fileName, langName, mode } (fileName)}
		{#if file.error}
			<div class="zeltron-error">{file.error}</div>
		{:else if file.code !== null}
			<Codeeditor code={file.code} {fileName} {langName} {mode} readOnly={true} />
		{:else}
			<Loading />
		{/if}
	{/each}

	<h2>Output</h2>
	<Sandbox description="Game" src="/resources/snippets/tictactoe/index.html" title="tic-tac-toe" />
</Page>
