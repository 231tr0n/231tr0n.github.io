<script>
	import Page from '$lib/components/page/Page.svelte';
	import Projectpost from './Projectpost.svelte';

	let fetch_url_data = async (url) => {
		let temp = await fetch(url);
		return await temp.json();
	};
</script>

<Page>
	<h1>Projects</h1>
	{#await fetch_url_data('https://api.github.com/users/231tr0n/repos') then res}
		{#each Object.values(res) as repo}
			{#if !repo['fork']}
				{#await fetch_url_data(repo['languages_url']) then res}
					<Projectpost
						name={repo['name']}
						badges={Object.keys(res)}
						description={repo['description']}
						url={repo['html_url']}
					/>
				{:catch error}
					<div class="error">{error}</div>
				{/await}
			{/if}
		{/each}
	{:catch error}
		<div class="error">{error}</div>
	{/await}
</Page>
