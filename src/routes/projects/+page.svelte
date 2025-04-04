<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Progress from '$lib/components/Progress.svelte';

	interface post {
		name: string;
		badges: string[];
		description: string;
		url: string;
	}

	interface repo {
		name: string;
		url: string;
		description: string;
		badges: string[];
	}

	interface githubError {
		message: string;
	}

	type languages = Record<string, number>;

	let progressLength = $state(0);
	let fullCompletionLength = $state(0);
	let languagesList: Record<string, number> = {};
	let languagesPercentageList: Array<[string, number]> = [];

	let fetchGithubRepoData = async (url: string) => {
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

		const returnData = [];
		for (const repo of nonForkedRepos) {
			const temp = await fetch(repo['languages_url']);
			const languages: languages | githubError = await temp.json();
			if (languages['message']) {
				throw 'Github api rate limit exceeded';
			}

			const repoData: repo = {
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

			returnData.push(repoData);

			progressLength += 1;
		}

		let total = 0;
		for (const value of Object.values(languagesList)) {
			total += value;
		}

		for (const [key, value] of Object.entries(languagesList)) {
			languagesPercentageList.push([key, parseFloat(((value / total) * 100).toFixed(2))]);
		}

		languagesPercentageList.sort((a, b) => {
			return b[1] - a[1];
		});

		return returnData;
	};
</script>

{#snippet projectPostSnippet(projectPost: post)}
	{#if projectPost.name && projectPost.description}
		<Accordion name={projectPost.name} url={projectPost.url} external={true}>
			<div class="center">
				{#each projectPost.badges as badge, _ (_)}
					<span class="badge">{badge}</span>
				{/each}
				<div class="center">
					{projectPost.description}
				</div>
			</div>
		</Accordion>
	{:else}
		<div class="error">Project post data is not accurate</div>
	{/if}
{/snippet}

<Page>
	<h1>Projects</h1>
	{#await fetchGithubRepoData('https://api.github.com/users/231tr0n/repos')}
		<br />
		<Progress value={progressLength} max={fullCompletionLength}></Progress>
	{:then res}
		<Accordion name="Github Language Statistics" open={true}>
			<div class="center">
				<div class="center"></div>
				{#each languagesPercentageList as value, _ (_)}
					<span class="badge">{value[0] + ' - ' + value[1] + '%'}</span>
				{/each}
			</div>
		</Accordion>
		<br />
		{#each Object.values(res) as repo, _ (_)}
			{@render projectPostSnippet(repo)}
		{/each}
	{:catch error}
		<div class="error">{error}</div>
	{/await}
</Page>
