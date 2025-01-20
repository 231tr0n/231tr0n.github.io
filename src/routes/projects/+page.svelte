<script>
	import Page from '$lib/components/Page.svelte';
	import Accordion from '../../lib/components/Accordion.svelte';
	import Progress from '../../lib/components/Progress.svelte';

	let progress_length = $state(0);
	let full_completion_length = $state(0);
	let languages_list = {};
	let languages_percentage_list = [];

	let fetch_github_repo_data = async (url) => {
		const temp = await fetch(url);
		const repos = await temp.json();
		if (repos['message']) {
			throw 'Github api rate limit exceeded';
		}

		const non_forked_repos = [];
		for (const repo of repos) {
			if (!repo['fork']) {
				non_forked_repos.push(repo);
				full_completion_length += 1;
			}
		}

		const return_data = [];
		for (const repo of non_forked_repos) {
			const temp = await fetch(repo['languages_url']);
			const languages = await temp.json();
			if (languages['message']) {
				throw 'Github api rate limit exceeded';
			}

			const repo_data = {};
			repo_data.name = repo['name'];
			repo_data.url = repo['html_url'];
			repo_data.description = repo['description'];
			repo_data.badges = [];

			for (const [key, value] of Object.entries(languages)) {
				repo_data.badges.push(key);
				if (languages_list[key]) {
					languages_list[key] += parseInt(value);
				} else {
					languages_list[key] = parseInt(value);
				}
			}

			return_data.push(repo_data);

			progress_length += 1;
		}

		let total = 0;
		for (const value of Object.values(languages_list)) {
			total += value;
		}

		for (const [key, value] of Object.entries(languages_list)) {
			languages_percentage_list.push([key, parseFloat((value / total) * 100).toFixed(2)]);
		}

		languages_percentage_list.sort((a, b) => {
			return b[1] - a[1];
		});

		return return_data;
	};
</script>

{#snippet projectPostSnippet(projectPost)}
	{#if projectPost.name && projectPost.description}
		<Accordion name={projectPost.name} url={projectPost.url} external={true}>
			<div class="center">
				{#each projectPost.badges as badge}
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
	{#await fetch_github_repo_data('https://api.github.com/users/231tr0n/repos')}
		<br />
		<Progress value={progress_length} max={full_completion_length}></Progress>
	{:then res}
		<Accordion name={'Github Language Statistics'} open={true}>
			<div class="center">
				<div class="center"></div>
				{#each languages_percentage_list as value}
					<span class="badge">{value[0] + ' - ' + value[1] + '%'}</span>
				{/each}
			</div>
		</Accordion>
		<br />
		{#each Object.values(res) as repo}
			{@render projectPostSnippet(repo)}
		{/each}
	{:catch error}
		<div class="error">{error}</div>
	{/await}
</Page>
