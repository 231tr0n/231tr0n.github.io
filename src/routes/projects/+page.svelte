<script>
	import Page from '$lib/components/page/Page.svelte';
	import Loading from '$lib/components/page/Loading.svelte';
	import Projectpost from './Projectpost.svelte';

	let fetch_url_data = async (url) => {
		let temp = await fetch(url);
		return await temp.json();
	};
</script>

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
							<Projectpost
								name={repo['name']}
								badges={Object.keys(res)}
								description={repo['description']}
								url={repo['html_url']} />
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
