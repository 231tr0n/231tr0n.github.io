<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Post from '#lib/components/Post.svelte';
	import type { PostData } from '#lib/types/index.js';

	const games: PostData[] = [
		{
			name: 'Ludo',
			badges: ['javascript', 'html', 'css'],
			description: 'Classic Ludo for 2 to 4 players on a 15×15 board with Everforest colors.',
			url: '/games/ludo',
			open: false,
			external: false
		},
		{
			name: 'TicTacToe',
			badges: ['javascript', 'html', 'css'],
			description: 'Local two-player TicTacToe built with plain HTML, CSS, and JavaScript.',
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
