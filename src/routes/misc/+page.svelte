<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Accordion from '$lib/components/Accordion.svelte';

	interface post {
		name: string;
		badges: string[];
		description: string;
		url: string;
	}

	let miscPosts = [];

	let miscPostCreator = (
		name: string,
		badges: string[],
		description: string,
		url: string
	): post => {
		return {
			name,
			badges,
			description,
			url
		};
	};
	miscPosts.push(
		miscPostCreator(
			'TicTacToe',
			['javascript', 'html', 'css'],
			'Creating TicTacToe game in browser with html, css and javascript.',
			'/misc/tictactoe'
		),
		miscPostCreator(
			'HTML Playground',
			['html', 'css', 'javascript', 'browser'],
			'A simple playground to play with html, css and javascript.',
			'/misc/htmlplayground'
		)
	);
</script>

{#snippet miscPostSnippet(miscPost: post)}
	{#if miscPost.name && miscPost.description}
		<Accordion name={miscPost.name} url={miscPost.url}>
			<div class="center">
				{#each miscPost.badges as badge}
					<span class="badge">{badge}</span>
				{/each}
				<div class="center">
					{miscPost.description}
				</div>
			</div>
		</Accordion>
	{:else}
		<div class="error">Misc post data is not accurate</div>
	{/if}
{/snippet}

<Page>
	<h1>Miscellaneous</h1>

	{#each miscPosts as miscPost}
		{@render miscPostSnippet(miscPost)}
	{/each}
</Page>
