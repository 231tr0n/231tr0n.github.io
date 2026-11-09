<script lang="ts">
	import Loading from './Loading.svelte';
	import Codeeditor from './Codeeditor.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import cssMode from 'ace-code/src/mode/css';
	import javascriptMode from 'ace-code/src/mode/javascript';
	import { onMount } from 'svelte';
	import { loadSnippetFiles } from '#lib/utils/snippet-files.js';
	import type { FileState } from '#lib/types/index.js';

	let { basePath }: { basePath: string } = $props();

	let jsFile = $state<FileState>({ code: null, error: null });
	let cssFile = $state<FileState>({ code: null, error: null });
	let htmlFile = $state<FileState>({ code: null, error: null });

	const editors = $derived([
		{ file: jsFile, fileName: 'index.js', langName: 'javascript', mode: javascriptMode },
		{ file: cssFile, fileName: 'style.css', langName: 'css', mode: cssMode },
		{ file: htmlFile, fileName: 'index.html', langName: 'html', mode: htmlMode }
	]);

	onMount(async () => {
		const files = await loadSnippetFiles(basePath);
		jsFile = files.js;
		cssFile = files.css;
		htmlFile = files.html;
	});
</script>

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
