<script>
	import Page from '$lib/components/page/Page.svelte';
	import Snippetpost from './Snippetpost.svelte';

	let snippetPosts = [];

	let snippetPostCreator = (name, badges, description, url) => {
		return {
			name,
			badges,
			description,
			url
		};
	};
	snippetPosts.push(
		snippetPostCreator(
			'TicTacToe',
			['javascript', 'html', 'css', 'browser'],
			'Creating TicTacToe game in browser with html, css and javascript.',
			'/snippets/tictactoe'
		)
	);
</script>

<Page>
	<h1>Snippets</h1>

	{#each snippetPosts as snippetPost}
		<Snippetpost {...snippetPost} />
	{/each}
</Page>
