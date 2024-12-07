<script>
	import Page from '$lib/components/page/Page.svelte';
	import Miscpost from './Miscpost.svelte';

	let miscPosts = [];

	let miscPostCreator = (name, badges, description, url) => {
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

<Page>
	<h1>Snippets</h1>

	{#each miscPosts as miscPost}
		<Miscpost {...miscPost} />
	{/each}
</Page>
