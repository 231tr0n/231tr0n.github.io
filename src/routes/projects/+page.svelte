<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Progress from '$lib/components/Progress.svelte';
	import BarGraph from '$lib/components/BarGraph.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';
	import { animationDuration } from '$lib/animation.constants';

	interface githubError {
		message: string;
	}

	interface githubRepo {
		fork: boolean;
		languages_url: string;
		name: string;
		html_url: string;
		description: string;
	}

	type githubLanguages = Record<string, number>;

	let progressLength = $state(0);
	let fullCompletionLength = $state(0);

	const fetchGithubRepoData = async (url: string) => {
		const languagesList: Record<string, number> = {};
		const languagesPercentageList: Record<string, number> = {};

		const temp = await fetch(url);
		const repos = (await temp.json()) as githubRepo[] | githubError;
		if ((repos as githubError).message) {
			throw new Error('Github api rate limit exceeded');
		}

		const nonForkedRepos = [];
		for (const repo of repos as githubRepo[]) {
			if (!repo.fork) {
				nonForkedRepos.push(repo);
				fullCompletionLength += 1;
			}
		}

		const reposData = [];
		for (const repo of nonForkedRepos) {
			const temp = await fetch(repo.languages_url);
			const languages: githubLanguages | githubError = (await temp.json()) as
				| githubLanguages
				| githubError;
			if ((languages as githubError).message) {
				throw new Error('Github api rate limit exceeded');
			}

			const repoData: PostData = {
				name: repo.name,
				url: repo.html_url,
				description: repo.description,
				badges: [],
				open: false,
				external: true
			};

			for (const [key, value] of Object.entries(languages as githubLanguages)) {
				repoData.badges.push(key);
				if (languagesList[key]) {
					languagesList[key] += value;
				} else {
					languagesList[key] = value;
				}
			}

			reposData.push(repoData);

			progressLength += 1;
		}

		let total = 0;
		for (const value of Object.values(languagesList)) {
			total += value;
		}

		for (const [key, value] of Object.entries(languagesList)) {
			languagesPercentageList[key] = parseFloat(((value / total) * 100).toFixed(2));
		}

		await new Promise((f) => setTimeout(f, animationDuration));

		return { reposData, languagesPercentageList };
	};
</script>

<Page>
	<h1>Projects</h1>

	{#await fetchGithubRepoData('https://api.github.com/users/231tr0n/repos')}
		<br />
		<Progress max={fullCompletionLength} value={progressLength}></Progress>
	{:then res}
		<Accordion name="Github Language Statistics" open={true}>
			<BarGraph
				context="Github"
				data={res.languagesPercentageList}
				height="10"
				sort={true}
				title="Language Statistics"></BarGraph>
		</Accordion>
		<br />
		{#each Object.values(res.reposData) as repo, _ (_)}
			<Post post={repo} />
		{/each}
	{:catch error}
		<div class="zeltron-error">{error}</div>
	{/await}
</Page>
