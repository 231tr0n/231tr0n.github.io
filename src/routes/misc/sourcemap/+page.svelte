<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Sandbox from '$lib/components/Sandbox.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { onMount } from 'svelte';
	import { cachedFetch } from '$lib/utils/fetch-cache';

	let sourceMap = $state<string | null>(null);
	let sourceMapError = $state<string | null>(null);

	onMount(async () => {
		try {
			const data = await cachedFetch(
				'https://raw.githubusercontent.com/231tr0n/231tr0n.github.io/main/stats.html'
			);
			if (!data) throw new Error('Error loading stats file');
			sourceMap = data;
		} catch (error) {
			console.error('Failed to load sourcemap', error);
			sourceMapError = error instanceof Error ? error.message : 'Unknown error';
		}
	});
</script>

<Page scrollspy={true}>
	<h1>Website Sourcemap</h1>

	<h2>Information</h2>
	<ul>
		<li>The below sandbox shows the source map of the website output bundle.</li>
		<li>The sourcemap is calculated as of the last push to the code repository.</li>
	</ul>

	<h2>Sourcemap</h2>
	{#if sourceMapError}
		<div class="zeltron-error">{sourceMapError}</div>
	{:else if sourceMap}
		<Sandbox description="" srcDoc={sourceMap} title="Source Map" />
	{:else}
		<Loading />
	{/if}
</Page>
