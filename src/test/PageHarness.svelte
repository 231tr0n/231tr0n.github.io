<script lang="ts">
	import Page from '#lib/components/Page.svelte';

	let { scrollspy = false }: { scrollspy?: boolean } = $props();
</script>

<Page {scrollspy}>
	<div>
		<h1>Page title</h1>
		<h2>First section</h2>
		<h2>Second section</h2>
		<p>Page body</p>
	</div>
</Page>
