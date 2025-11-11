<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';

	const miscPosts: PostData[] = [
		{
			name: 'TicTacToe',
			badges: ['javascript', 'html', 'css'],
			description: 'Creating TicTacToe game in browser with html, css and javascript.',
			url: '/games/tictactoe',
			open: false,
			external: false
		}
	];
</script>

<Page>
	<h1>Games</h1>

	{#each miscPosts as miscPost, _ (_)}
		<Post post={miscPost} />
	{/each}
</Page>
