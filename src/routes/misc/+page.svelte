<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Post from '$lib/components/Post.svelte';
	import type { PostData } from '$lib/types';

	let miscPosts: PostData[] = [
		{
			name: 'TicTacToe',
			badges: ['javascript', 'html', 'css'],
			description: 'Creating TicTacToe game in browser with html, css and javascript.',
			url: '/misc/tictactoe'
		},
		{
			name: 'HTML Playground',
			badges: ['html', 'css', 'javascript', 'browser'],
			description: 'A simple playground to play with html, css and javascript.',
			url: '/misc/htmlplayground'
		}
	];
</script>

<Page>
	<h1>Miscellaneous</h1>

	{#each miscPosts as miscPost, _ (_)}
		<Post post={miscPost} />
	{/each}
</Page>
