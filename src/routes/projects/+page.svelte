<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import Accordion from '#lib/components/Accordion.svelte';
	import Progress from '#lib/components/Progress.svelte';
	import BarGraph from '#lib/components/BarGraph.svelte';
	import Post from '#lib/components/Post.svelte';
	import type { PostData, GitHubLanguages } from '#lib/types/index.js';
	import { percentageScale, decimalPrecision } from '#lib/constants/app.constants.js';
	import { onMount } from 'svelte';
	import { cachedFetch, HttpError } from '#lib/utils/fetch-cache.js';

	let processedRepos = $state(0);
	let totalRepos = $state(0);
	let repoList = $state<PostData[] | null>(null);
	let languagePercentages = $state<Record<string, number> | null>(null);
	let fetchError = $state<string | null>(null);

	const isRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null;

	const fetchJson = async (url: string): Promise<unknown> => {
		try {
			return JSON.parse(await cachedFetch(url)) as unknown;
		} catch (error) {
			if (error instanceof HttpError && (error.status === 403 || error.status === 429)) {
				throw new Error('GitHub API rate limit exceeded', { cause: error });
			}
			throw error;
		}
	};

	const fetchGitHubRepoData = async (
		url: string,
		onProgress: (processed: number, total: number) => void
	) => {
		const repos = await fetchJson(url);
		if (!Array.isArray(repos)) throw new Error('Invalid API response');

		const languageBytes = new SvelteMap<string, number>();
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
		}

		const total = filteredRepos.length;
		let processed = 0;
		onProgress(processed, total);

		const repoData = await Promise.all(
			filteredRepos.map(async (repo) => {
				const raw = await fetchJson(repo.languagesUrl);
				if (!isRecord(raw)) throw new Error('Invalid API response');

				const languages: GitHubLanguages = new SvelteMap<string, number>();
				for (const [key, value] of Object.entries(raw)) languages.set(key, Number(value));

				const data: PostData = {
					name: repo.name,
					url: repo.htmlUrl,
					description: repo.description,
					badges: [...languages.keys()],
					open: false,
					external: true
				};

				for (const key of languages.keys()) {
					const previousBytes = languageBytes.get(key) ?? 0;
					const repoBytes = languages.get(key) ?? 0;
					languageBytes.set(key, previousBytes + repoBytes);
				}

				processed += 1;
				onProgress(processed, total);
				return data;
			})
		);

		let totalBytes = 0;
		for (const byteCount of languageBytes.values()) totalBytes += byteCount;

		const percentages = new SvelteMap<string, number>();
		if (totalBytes > 0) {
			for (const [key, byteCount] of languageBytes.entries()) {
				percentages.set(
					key,
					parseFloat(((byteCount / totalBytes) * percentageScale).toFixed(decimalPrecision))
				);
			}
		}

		return { repoData, languagePercentages: Object.fromEntries(percentages) };
	};

	onMount(async () => {
		try {
			const { repoData, languagePercentages: percentages } = await fetchGitHubRepoData(
				'https://api.github.com/users/231tr0n/repos?per_page=100',
				(processed, total) => {
					processedRepos = processed;
					totalRepos = total;
				}
			);
			repoList = repoData;
			languagePercentages = percentages;
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
		<Accordion name="GitHub Language Statistics" open={true}>
			<BarGraph
				context="GitHub"
				data={languagePercentages}
				height={30}
				sort={true}
				title="Language Statistics" />
		</Accordion>
		<br />
		{#each repoList as repo (repo.name)}
			<Post post={repo} />
		{/each}
	{:else}
		<br />
		<Progress max={Math.max(totalRepos, 1)} value={processedRepos} />
	{/if}
</Page>
