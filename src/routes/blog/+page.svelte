<script>
	import Page from '$lib/components/page/Page.svelte';
	import Accordion from '../../lib/components/page/Accordion.svelte';

	let blogPosts = [];

	let blogPostCreator = (name, badges, description, url) => {
		return {
			name,
			badges,
			description,
			url
		};
	};
	blogPosts.push(
		blogPostCreator(
			'Neovim configuration',
			['neovim', 'configuration', 'lua'],
			'Brief introduction about my neovim configuration.',
			'/blog/config'
		)
	);
</script>

{#snippet blogPostSnippet(blogPost)}
	{#if blogPost.name && blogPost.description}
		<Accordion name={blogPost.name} url={blogPost.url}>
			<div class="center">
				{#each blogPost.badges as badge}
					<span class="badge">{badge}</span>
				{/each}
				<div class="center">
					{blogPost.description}
				</div>
			</div>
		</Accordion>
	{:else}
		<div class="error">Blog post data is not accurate</div>
	{/if}
{/snippet}

<Page>
	<h1>Blogs</h1>

	{#each blogPosts as blogPost}
		{@render blogPostSnippet(blogPost)}
	{/each}
</Page>

<style>
	div.center {
		margin-top: 1em;
	}
</style>
