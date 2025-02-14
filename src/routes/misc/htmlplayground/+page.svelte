<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Codeeditor from '$lib/components/Codeeditor.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import { htmlPlayground } from '$lib/store.svelte.js';
</script>

<Page scrollspy={true}>
	<h1>HTML Playground</h1>

	<h2>Editor</h2>
	<Codeeditor langName={'html'} mode={htmlMode} codeStore={htmlPlayground} />

	<h2>Output</h2>
	<Sandbox title="Output" srcDocStore={htmlPlayground} />
</Page>
