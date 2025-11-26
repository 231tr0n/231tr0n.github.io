<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import Loading from '$lib/components/Loading.svelte';

	const fetchSourceMap = async () => {
		const fetchedUrl = await fetch(
			'https://raw.githubusercontent.com/231tr0n/231tr0n.github.io/main/stats.html'
		);
		if (!fetchedUrl.ok) {
			throw new Error('Error loading stats file');
		}
		return await fetchedUrl.text();
	};
</script>

<Page scrollspy={true}>
	<h1>Website Sourcemap</h1>

	<h2>Information</h2>
	<ul>
		<li>The below sandbox shows the source map of the website output bundle.</li>
		<li>The sourcemap is calculated as of the last push to the code repository.</li>
	</ul>

	<h2>Sourcemap</h2>
	{#await fetchSourceMap()}
		<Loading />
	{:then sourceMap}
		<Sandbox description="" srcDoc={sourceMap} title="Source Map" />
	{/await}
</Page>
