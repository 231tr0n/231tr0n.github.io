<script>
	import Page from '$lib/components/page/Page.svelte';
	import Loading from '$lib/components/page/Loading.svelte';
	import Accordion from '../../lib/components/page/Accordion.svelte';

	let fetch_url_data = async (url) => {
		let temp = await fetch(url);
		return await temp.json();
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
	{#await fetch_url_data('https://api.github.com/users/231tr0n/repos')}
		<Loading />
	{:then res}
		{#if res['message']}
			<div class="error">Github api rate limit exceeded</div>
		{:else}
			{#each Object.values(res) as repo}
				{#if !repo['fork']}
					{#await fetch_url_data(repo['languages_url'])}
						<Loading />
					{:then res}
						{#if res['message']}
							<div class="error">Github api rate limit exceeded</div>
						{:else}
							{@render projectPostSnippet({
								name: repo['name'],
								badges: Object.keys(res),
								description: repo['description'],
								url: repo['html_url']
							})}
						{/if}
					{:catch error}
						<div class="error">{error}</div>
					{/await}
				{/if}
			{/each}
		{/if}
	{:catch error}
		<div class="error">{error}</div>
	{/await}
</Page>

<style>
	div.center {
		margin-top: 1em;
	}
</style>
