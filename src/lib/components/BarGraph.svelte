<script lang="ts">
	import { onMount } from 'svelte';
	import Frame from './Frame.svelte';

	let {
		data,
		sort,
		desc = true,
		context,
		title,
		height
	}: {
		sort: boolean;
		desc?: boolean;
		context: string;
		title: string;
		height: number;
		data: Record<string, number>;
	} = $props();

	const sortedData: Record<string, number> = $derived(
		sort
			? Object.fromEntries(Object.entries(data).sort(([, a], [, b]) => (desc ? b - a : a - b)))
			: data
	);

	let table: HTMLTableElement;
	const bars: Map<string, HTMLDivElement> = $state(new Map<string, HTMLDivElement>());

	const setBarRef = (el: HTMLDivElement, key: string) => {
		bars.set(key, el);
		return { destroy: () => bars.delete(key) };
	};

	const onGraphFullscreenChange = (fullscreen: boolean) => {
		table.style.height = fullscreen ? '100%' : String(height) + 'vh';
	};

	onMount(() => {
		for (const [key, value] of Object.entries(sortedData)) {
			const bar = bars.get(key);
			if (bar) bar.style.height = String(value) + '%';
		}
		table.style.height = String(height) + 'vh';
	});
</script>

<Frame
	caption={context}
	contextLabel={title}
	frameClass="bar-graph"
	label="Bar Graph"
	onFullscreenChange={onGraphFullscreenChange}>
	{#snippet toolbar({ toggleFullscreen, fullscreen })}
		<button
			class="zeltron-inline-flex-middle"
			aria-label="Toggle fullscreen"
			onclick={toggleFullscreen}
			type="button">
			{#if fullscreen === false}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
				</svg>
			{:else}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
				</svg>
			{/if}
		</button>
	{/snippet}
	<div class="bottom">
		<div class="padding overflow">
			<table bind:this={table}>
				<tbody>
					<tr>
						{#each Object.keys(sortedData) as key, _ (_)}
							<td class="plot">
								<div class="bar zeltron-component" use:setBarRef={key}></div>
							</td>
						{/each}
					</tr>
					<tr>
						{#each Object.entries(sortedData) as [key, value], _ (_)}
							<td class="label">
								<span class="zeltron-badge">{key} - {String(value) + '%'}</span>
							</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</Frame>

<style>
	:global(.bar-graph) {
		display: flex;
		flex-direction: column;
		min-height: 0;
		width: 100%;
		box-sizing: border-box;
	}

	.bottom {
		flex: 1;
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.padding {
		padding-top: 5px;
	}

	@supports (-moz-appearance: none) {
		.padding {
			padding-bottom: 10px;
		}
	}

	.overflow {
		flex: 1;
		min-height: 0;
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
	}

	button {
		padding: 3px;
	}

	svg {
		width: 16px;
		height: 16px;
	}

	span.zeltron-badge {
		margin: 0;
		display: inline;
	}

	td.label {
		white-space: nowrap;
		height: 35px;
	}

	td.plot {
		position: relative;
		height: inherit;
	}

	.bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
	}

	table {
		margin: 2px 4px;
	}
</style>
