<script lang="ts">
	import { fade } from 'svelte/transition';

	let { name = '', url = '', external = false, open = false, children } = $props();

	let summaryToggler = () => {
		open = open ? false : true;
	};
</script>

{#if name}
	<div class="details">
		<div
			class="summary"
			aria-label="Accordion summary toggler"
			tabindex="0"
			role="button"
			onclick={summaryToggler}
			onkeypress={summaryToggler}>
			<div class="spacer">
				<h2>{name}</h2>
				<div class="component summary-toggler">
					{#if open}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="15"
							height="15"
							fill="currentColor"
							class="bi bi-chevron-up"
							viewBox="0 0 16 16">
							<path
								fill-rule="evenodd"
								d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="15"
							height="15"
							fill="currentColor"
							class="bi bi-chevron-down"
							viewBox="0 0 16 16">
							<path
								fill-rule="evenodd"
								d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
						</svg>
					{/if}
				</div>
				{#if url}
					{#if external}
						<a target="_blank" href={url}><button>Open</button></a>
					{:else}
						<a href={url}><button>Open</button></a>
					{/if}
				{/if}
			</div>
		</div>
		{#if open}
			<div transition:fade>
				{#if children}
					{@render children()}
				{:else}
					<div class="error">No children to render</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.summary-toggler {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.details {
		margin-top: 5px;
	}

	.summary {
		list-style: none;
		border-bottom: 1px solid var(--color-dark-foreground);
		margin-bottom: 5px;
	}

	a > button {
		margin-left: 5px;
		padding: 2px;
		font-size: 14px;
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
