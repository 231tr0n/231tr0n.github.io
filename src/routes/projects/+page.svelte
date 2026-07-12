<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Progress from '$lib/components/Progress.svelte';
	import BarGraph from '$lib/components/BarGraph.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData, GithubLanguages } from '$lib/types';
	import {
		animationDuration,
		percentageScale,
		decimalPrecision
	} from '$lib/constants/app.constants';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { cachedFetch } from '$lib/utils/fetch-cache.ts';

	let processedRepos = $state(0);
	let totalRepos = $state(0);
	let repoList = $state<PostData[] | null>(null);
	let languagePercentages = $state<Record<string, number> | null>(null);
	let fetchError = $state<string | null>(null);

	const isRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null;

	const fetchGithubRepoData = async (url: string) => {
		const languageBytes = new SvelteMap<string, number>();
		const repos: unknown = JSON.parse(await cachedFetch(url));
		if (!isRecord(repos)) throw new Error('Invalid API response');
		if ('message' in repos) throw new Error('Github api rate limit exceeded');
		if (!Array.isArray(repos)) throw new Error('Invalid API response');

		const filteredRepos: {
			languagesUrl: string;
			htmlUrl: string;
			name: string;
			description: string;
		}[] = [];
		for (const repo of repos) {
			if (!isRecord(repo) || repo['fork'] === true) continue;
			filteredRepos.push({
				languagesUrl: typeof repo['languages_url'] === 'string' ? repo['languages_url'] : '',
				htmlUrl: typeof repo['html_url'] === 'string' ? repo['html_url'] : '',
				name: typeof repo['name'] === 'string' ? repo['name'] : '',
				description: typeof repo['description'] === 'string' ? repo['description'] : ''
			});
			totalRepos += 1;
		}

		const repoDataList: PostData[] = [];
		for (const repo of filteredRepos) {
			const raw: unknown = JSON.parse(await cachedFetch(repo.languagesUrl));
			if (!isRecord(raw)) throw new Error('Invalid API response');
			if ('message' in raw) throw new Error('Github api rate limit exceeded');

			const languages: GithubLanguages = new SvelteMap<string, number>();
			for (const [key, value] of Object.entries(raw)) languages.set(key, Number(value));

			const repoData: PostData = {
				name: repo.name,
				url: repo.htmlUrl,
				description: repo.description,
				badges: [...languages.keys()],
				open: false,
				external: true
			};

			for (const key of languages.keys()) {
				const prev = languageBytes.get(key) ?? 0;
				const lang = languages.get(key) ?? 0;
				languageBytes.set(key, prev + lang);
			}

			repoDataList.push(repoData);
			processedRepos += 1;
		}

		let totalBytes = 0;
		for (const byteCount of languageBytes.values()) totalBytes += byteCount;

		const percentages = new SvelteMap<string, number>();
		for (const [key, byteCount] of languageBytes.entries()) {
			percentages.set(
				key,
				parseFloat(((byteCount / totalBytes) * percentageScale).toFixed(decimalPrecision))
			);
		}

		await new Promise((resolve) => setTimeout(resolve, animationDuration));

		return { repoData: repoDataList, languagePercentages: Object.fromEntries(percentages) };
	};

	onMount(async () => {
		try {
			const result = await fetchGithubRepoData('https://api.github.com/users/231tr0n/repos');
			repoList = result.repoData;
			languagePercentages = result.languagePercentages;
		} catch (error) {
			console.error('Failed to fetch projects', error);
			fetchError = error instanceof Error ? error.message : 'Unknown error';
		}
	});
</script>

<Page>
	<h1>Projects</h1>

	{#if fetchError}
		<div class="zeltron-error">{fetchError}</div>
	{:else if repoList && languagePercentages}
		<Accordion name="Github Language Statistics" open={true}>
			<BarGraph
				context="Github"
				data={languagePercentages}
				height={10}
				sort={true}
				title="Language Statistics" />
		</Accordion>
		<br />
		{#each repoList as repo (repo.name)}
			<Post post={repo} />
		{/each}
	{:else}
		<br />
		<Progress max={totalRepos} value={processedRepos} />
	{/if}
</Page>
