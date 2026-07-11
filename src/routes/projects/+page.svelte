<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Progress from '$lib/components/Progress.svelte';
	import BarGraph from '$lib/components/BarGraph.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';
	import { animationDuration } from '$lib/constants/animation.constants';
	import { onMount } from 'svelte';
	import { cachedFetch } from '$lib/utils/fetch-cache.js';

	type githubLanguages = Record<string, number>;

	let progressLength = $state(0);
	let fullCompletionLength = $state(0);
	let reposData = $state<PostData[] | null>(null);
	let languagesPercentageList = $state<Record<string, number> | null>(null);
	let fetchError = $state<string | null>(null);

	const isRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null;

	const fetchGithubRepoData = async (url: string) => {
		const languagesList: Record<string, number> = {};
		const langPctList: Record<string, number> = {};

		const repos: unknown = JSON.parse(await cachedFetch(url));
		if (!isRecord(repos)) throw new Error('Invalid API response');
		if ('message' in repos) throw new Error('Github api rate limit exceeded');
		if (!Array.isArray(repos)) throw new Error('Invalid API response');

		const nonForkedRepoList: {
			languages_url: string;
			html_url: string;
			name: string;
			description: string;
		}[] = [];
		for (const repo of repos) {
			if (!isRecord(repo)) continue;
			if (repo['fork'] === true) continue;
			nonForkedRepoList.push({
				languages_url: typeof repo['languages_url'] === 'string' ? repo['languages_url'] : '',
				html_url: typeof repo['html_url'] === 'string' ? repo['html_url'] : '',
				name: typeof repo['name'] === 'string' ? repo['name'] : '',
				description: typeof repo['description'] === 'string' ? repo['description'] : ''
			});
			fullCompletionLength += 1;
		}

		const reposDataList: PostData[] = [];
		for (const repo of nonForkedRepoList) {
			const rawLanguages: unknown = JSON.parse(await cachedFetch(repo.languages_url));
			if (!isRecord(rawLanguages)) throw new Error('Invalid API response');
			if ('message' in rawLanguages) throw new Error('Github api rate limit exceeded');

			const languages: githubLanguages = {};
			for (const [key, value] of Object.entries(rawLanguages)) {
				languages[key] = Number(value);
			}

			const repoData: PostData = {
				name: repo.name,
				url: repo.html_url,
				description: repo.description,
				badges: [],
				open: false,
				external: true
			};

			for (const key of Object.keys(languages)) {
				repoData.badges.push(key);
				const value = languages[key] ?? 0;
				languagesList[key] = (languagesList[key] ?? 0) + value;
			}

			reposDataList.push(repoData);

			progressLength += 1;
		}

		let total = 0;
		for (const value of Object.values(languagesList)) {
			total += value;
		}

		for (const [key, value] of Object.entries(languagesList)) {
			langPctList[key] = parseFloat(((value / total) * 100).toFixed(2));
		}

		await new Promise((f) => setTimeout(f, animationDuration));

		return { reposData: reposDataList, languagesPercentageList: langPctList };
	};

	onMount(async () => {
		try {
			const result = await fetchGithubRepoData('https://api.github.com/users/231tr0n/repos');
			reposData = result.reposData;
			languagesPercentageList = result.languagesPercentageList;
		} catch (e) {
			fetchError = e instanceof Error ? e.message : 'Unknown error';
		}
	});
</script>

<Page>
	<h1>Projects</h1>

	{#if fetchError}
		<div class="zeltron-error">{fetchError}</div>
	{:else if reposData && languagesPercentageList}
		<Accordion name="Github Language Statistics" open={true}>
			<BarGraph
				context="Github"
				data={languagesPercentageList}
				height={10}
				sort={true}
				title="Language Statistics"></BarGraph>
		</Accordion>
		<br />
		{#each reposData as repo (repo.name)}
			<Post post={repo} />
		{/each}
	{:else}
		<br />
		<Progress max={fullCompletionLength} value={progressLength}></Progress>
	{/if}
</Page>
