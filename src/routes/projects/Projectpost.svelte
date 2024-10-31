<script>
	import Accordion from '$lib/components/page/Accordion.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {string} [name]
	 * @property {string} [url]
	 * @property {any} [badges]
	 * @property {string} [description]
	 */

	/** @type {Props} */
	let { name = '', url = '', badges = [], description = '' } = $props();

	let external = true;
</script>

{#if name && description}
	<Accordion {name} {url} {external}>
		<div class="center">
			{#each badges as badge}
				<span class="badge">{badge}</span>
			{/each}
			<div class="center">
				{description}
			</div>
		</div>
	</Accordion>
{/if}

<style>
	div.center {
		margin-top: 1em;
	}
</style>
