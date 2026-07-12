<script lang="ts">
	import { type Snippet } from 'svelte';
	import { on } from 'svelte/events';

	let {
		label,
		caption = '',
		contextLabel = '',
		frameClass = '',
		noBackground = false,
		children,
		toolbar,
		onFullscreenChange
	}: {
		label: string;
		caption?: string;
		contextLabel?: string;
		frameClass?: string;
		noBackground?: boolean;
		children: Snippet;
		toolbar?: Snippet<[{ toggleFullscreen: () => Promise<void>; fullscreen: boolean }]>;
		onFullscreenChange?: (fullscreen: boolean) => void;
	} = $props();

	let frameDiv: HTMLElement;
	let fullscreenState = $state(false);

	const toggleFullscreen = async () => {
		if (document.fullscreenElement) {
			await document.exitFullscreen();
		} else {
			await frameDiv.requestFullscreen();
		}
	};

	$effect(() => {
		const off = on(document, 'fullscreenchange', () => {
			fullscreenState = document.fullscreenElement === frameDiv;
			onFullscreenChange?.(fullscreenState);
		});
		return off;
	});
</script>

<div class="frame-wrapper zeltron-flex-middle" class:zeltron-body-background={!noBackground}>
	<div
		bind:this={frameDiv}
		class="zeltron-thick-component-border {frameClass}"
		class:zeltron-body-background={fullscreenState}>
		<div class="filename context zeltron-component">
			<span>{label}</span>
			{#if caption}
				<span>{caption}</span>
			{/if}
		</div>
		<div class="context zeltron-component">
			<span>
				{#if toolbar}
					{@render toolbar({ toggleFullscreen, fullscreen: fullscreenState })}
				{/if}
			</span>
			<span>{contextLabel}</span>
		</div>
		{@render children()}
	</div>
</div>

<style>
	.frame-wrapper {
		flex-direction: column;
		margin-top: 1em;
		margin-bottom: 1em;
	}

	.filename {
		border-bottom: 1px solid var(--color-component-foreground);
	}

	.context {
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.context :global(button) {
		line-height: 0;
		font-size: 0;
	}
</style>
