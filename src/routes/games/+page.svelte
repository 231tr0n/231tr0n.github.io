<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';

	const games: PostData[] = [
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

	{#each games as game (game.url)}
		<Post post={game} />
	{/each}
</Page>
