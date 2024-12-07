<script>
	import Page from '$lib/components/page/Page.svelte';
	import Codeeditor from '$lib/components/page/Codeeditor.svelte';
	import Sandbox from '$lib/components/page/Sandbox.svelte';
	import htmlMode from 'ace-code/src/mode/html';
	import { htmlPlayground } from '$lib/store.svelte.js';
</script>

<Page scrollspy="true">
	<h1>HTML Playground</h1>

	<h2>Editor</h2>
	<Codeeditor langName={'html'} mode={htmlMode} codeStore={htmlPlayground} />

	<h2>Output</h2>
	<Sandbox title="Output" srcdocStore={htmlPlayground} />
</Page>
