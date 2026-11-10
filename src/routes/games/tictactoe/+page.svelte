<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Sandbox from '#lib/components/Sandbox.svelte';
	import SnippetSource from '#lib/components/SnippetSource.svelte';
	import { asset } from '$app/paths';

	const indexHtml = asset('resources/snippets/tictactoe/index.html');
	const snippetBase = indexHtml.slice(0, indexHtml.lastIndexOf('/'));
</script>

<Page scrollspy={true}>
	<h1>TicTacToe</h1>

	<p>
		A local two-player TicTacToe game built with plain HTML, CSS, and JavaScript. The board, marks,
		and controls follow the site's Everforest light and dark themes.
	</p>

	<h2>Rules</h2>
	<ul>
		<li>The game is played on a 3×3 board. X always moves first.</li>
		<li>Players alternate placing their mark in an empty square.</li>
		<li>
			The first player to get three marks in a row horizontally, vertically, or diagonally wins.
		</li>
		<li>If all nine squares are filled without a winner, the game is a tie.</li>
		<li>Restart clears the board and starts a new game with X.</li>
	</ul>

	<SnippetSource basePath={snippetBase} />
	<h2>Output</h2>
	<Sandbox
		allowSameOrigin={true}
		compact={true}
		description="Game"
		src={indexHtml}
		title="tic-tac-toe" />
</Page>
