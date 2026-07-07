<script lang="ts">
	import { type Snippet } from 'svelte';
	import { on } from 'svelte/events';

	let {
		label,
		caption = '',
		contextLabel = '',
		frameClass = '',
		children,
		toolbar,
		onFullscreenChange
	}: {
		label: string;
		caption?: string;
		contextLabel?: string;
		frameClass?: string;
		children: Snippet;
		toolbar?: Snippet<[{ toggleFullscreen: () => Promise<void>; fullscreen: boolean }]>;
		onFullscreenChange?: (fullscreen: boolean) => void;
	} = $props();

	let frameDiv: HTMLElement;
	let wrapperDiv: HTMLElement;
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
			if (document.fullscreenElement === frameDiv) {
				wrapperDiv.classList.add('zeltron-body-background');
				fullscreenState = true;
			} else if (!document.fullscreenElement) {
				wrapperDiv.classList.remove('zeltron-body-background');
				fullscreenState = false;
			}
			onFullscreenChange?.(!!document.fullscreenElement);
		});
		return off;
	});
</script>

<div bind:this={wrapperDiv} class="frame-wrapper zeltron-flex-middle">
	<div bind:this={frameDiv} class="zeltron-thick-component-border {frameClass}">
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
	}

	.filename {
		border-bottom: 1px solid var(--color-light-component-foreground);
	}

	:global(body.dark) .filename {
		border-bottom: 1px solid var(--color-dark-component-foreground);
	}

	.context {
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
