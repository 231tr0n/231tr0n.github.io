<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Sandbox from '#lib/components/Sandbox.svelte';
	import Loading from '#lib/components/Loading.svelte';
	import { onMount } from 'svelte';
	import { cachedFetch } from '#lib/utils/fetch-cache.js';

	let bundleStats = $state<string | null>(null);
	let bundleStatsError = $state<string | null>(null);

	const responsiveStats = $derived(
		bundleStats === null
			? null
			: bundleStats.replace(
					'</head>',
					`<style>
						.sidebar { height: 24px; margin: 0 6px; }
						.module-filters { flex-direction: row; flex-wrap: nowrap; flex-grow: 1; min-width: 0; }
						.module-filter { flex: 1 1 0; width: auto; min-width: 0; }
						.module-filter label { flex: 0 0 auto; }
						.module-filter input { width: 100%; min-width: 0; }
						.module-filter + .module-filter { margin-left: 0.35rem; margin-top: 0; }
					</style></head>`
				)
	);

	onMount(async () => {
		try {
			const data = await cachedFetch(
				'https://raw.githubusercontent.com/231tr0n/231tr0n.github.io/main/stats.html'
			);
			if (!data) throw new Error('Error loading stats file');
			bundleStats = data;
		} catch (error) {
			console.error('Failed to load bundle stats', error);
			bundleStatsError = error instanceof Error ? error.message : 'Unknown error';
		}
	});
</script>

<Page scrollspy={true}>
	<h1>Website Bundle Statistics</h1>

	<h2>Information</h2>
	<ul>
		<li>The below sandbox shows the bundle report of the website output.</li>
		<li>The report is calculated as of the last push to the code repository.</li>
	</ul>

	<h2>Bundle Report</h2>
	{#if bundleStatsError}
		<div class="zeltron-error">{bundleStatsError}</div>
	{:else if bundleStats}
		<Sandbox description="" srcDoc={responsiveStats ?? bundleStats} title="Bundle Report" />
	{:else}
		<Loading />
	{/if}
</Page>
