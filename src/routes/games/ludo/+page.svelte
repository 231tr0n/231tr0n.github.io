<script lang="ts">
	import Page from '#lib/components/Page.svelte';
	import Sandbox from '#lib/components/Sandbox.svelte';
	import SnippetSource from '#lib/components/SnippetSource.svelte';
	import { asset } from '$app/paths';

	const indexHtml = asset('resources/snippets/ludo/index.html');
	const snippetBase = indexHtml.slice(0, indexHtml.lastIndexOf('/'));
</script>

<Page scrollspy={true}>
	<h1>Ludo</h1>

	<p>
		A local multiplayer Ludo game for two to four players on a classic 15×15 board. The board uses
		the standard 52-square outer ring, and each home lane starts two squares before its spawn
		square. Every token travels exactly 57 steps from its start square to the center: 50 ring steps,
		5 home-lane steps, 1 center-approach step, and 1 finish step. The four corner yards, colored
		home lanes, and central triangles follow the classic Ludo layout. Token colors, the board, and
		controls follow the site's Everforest light and dark themes.
	</p>

	<h2>Rules</h2>
	<ul>
		<li>
			At the start, every player rolls once. The highest roll goes first and play then moves
			clockwise. Players tied for the highest roll roll again.
		</li>
		<li>Each player has four tokens and must roll a 6 to move one out of the yard.</li>
		<li>A 6 earns another roll. Three 6s in a row forfeit the turn without moving.</li>
		<li>
			Landing exactly on a single opponent token on a non-safe square captures it and earns another
			roll. The captured token returns to its yard.
		</li>
		<li>
			Start squares and star squares are safe. Tokens there cannot be captured, and several players
			may share them.
		</li>
		<li>
			Two or more tokens of the same player on one square form a blockade. Opponents cannot pass
			through or land on it. A blockade on a safe square still blocks movement; safe squares only
			prevent captures.
		</li>
		<li>
			After 50 ring steps (two squares before its spawn), a token enters its own five-square home
			lane. Only that player may enter it, and an exact roll is needed to reach home.
		</li>
		<li>The first player to bring all four tokens home wins.</li>
	</ul>

	<SnippetSource basePath={snippetBase} />
	<h2>Output</h2>
	<Sandbox compact={true} description="Game" src={indexHtml} title="ludo" />
</Page>
