<script>
	import { onMount } from 'svelte';

	let { name = '', url = '', external = false, open = false, children } = $props();
	let details = $state('');
	onMount(() => {
		if (open) {
			details.open = true;
		}
	});
</script>

{#if name}
	<details bind:this={details}>
		<summary>
			<div class="spacer">
				<h2>{name}</h2>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					fill="currentColor"
					class="bi bi-chevron-down component"
					viewBox="0 0 16 16">
					<path
						fill-rule="evenodd"
						d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
				</svg>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					fill="currentColor"
					class="bi bi-chevron-up component"
					viewBox="0 0 16 16">
					<path
						fill-rule="evenodd"
						d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
				</svg>
				{#if url}
					{#if external}
						<a target="_blank" href={url}><button>Open</button></a>
					{:else}
						<a href={url}><button>Open</button></a>
					{/if}
				{/if}
			</div>
		</summary>
		{#if children}
			{@render children()}
		{:else}
			<div class="error">No children to render</div>
		{/if}
	</details>
{/if}

<style>
	svg {
		padding: 3px;
		border: 2px solid transparent;
	}

	svg:hover {
		border: 2px solid var(--color-dark-anchor);
	}

	:global(body.light-mode) svg:hover {
		border: 2px solid var(--color-light-anchor);
	}

	details {
		margin-top: 5px;
	}

	summary {
		list-style: none;
		border-bottom: 1px solid var(--color-dark-foreground);
		margin-bottom: 5px;
	}

	a > button {
		margin-left: 5px;
		padding: 2px;
		font-size: 14px;
	}

	details > summary::-webkit-details-marker {
		display: none;
	}

	:global(body.light-mode) summary {
		border-bottom: 1px solid var(--color-light-foreground);
	}

	details > summary svg.bi-chevron-down {
		display: inline;
	}

	details > summary svg.bi-chevron-up {
		display: none;
	}

	details[open] > summary svg.bi-chevron-down {
		display: none;
	}

	details[open] > summary svg.bi-chevron-up {
		display: inline;
	}

	.spacer {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h2 {
		width: 100%;
		border: 0px;
		margin: 0px;
	}

	:global(body.light-mode) h2 {
		border: 0px;
	}
</style>
