<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Progress from '$lib/components/Progress.svelte';
	import BarGraph from '$lib/components/BarGraph.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';

	interface githubError {
		message: string;
	}

	type languages = Record<string, number>;

	let progressLength = $state(0);
	let fullCompletionLength = $state(0);

	let fetchGithubRepoData = async (url: string) => {
		let languagesList: Record<string, number> = {};
		let languagesPercentageList: Record<string, number> = {};

		const temp = await fetch(url);
		const repos = await temp.json();
		if (repos['message']) {
			throw 'Github api rate limit exceeded';
		}

		const nonForkedRepos = [];
		for (const repo of repos) {
			if (!repo['fork']) {
				nonForkedRepos.push(repo);
				fullCompletionLength += 1;
			}
		}

		const reposData = [];
		for (const repo of nonForkedRepos) {
			const temp = await fetch(repo['languages_url']);
			const languages: languages | githubError = await temp.json();
			if (languages['message']) {
				throw 'Github api rate limit exceeded';
			}

			const repoData: PostData = {
				name: repo['name'],
				url: repo['html_url'],
				description: repo['description'],
				badges: []
			};

			for (const [key, value] of Object.entries(languages)) {
				repoData.badges.push(key);
				if (languagesList[key]) {
					languagesList[key] += parseInt(value);
				} else {
					languagesList[key] = parseInt(value);
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

		return { reposData, languagesPercentageList };
	};
</script>

<Page>
	<h1>Projects</h1>

	{#await fetchGithubRepoData('https://api.github.com/users/231tr0n/repos')}
		<br />
		<Progress value={progressLength} max={fullCompletionLength}></Progress>
	{:then res}
		<Accordion name="Github Language Statistics" open={true}>
			<BarGraph
				data={res.languagesPercentageList}
				sort={true}
				height="10"
				context="Github"
				title="Language Statistics"></BarGraph>
		</Accordion>
		<br />
		{#each Object.values(res.reposData) as repo, _ (_)}
			<Post post={repo} />
		{/each}
	{:catch error}
		<div class="error">{error}</div>
	{/await}
</Page>
