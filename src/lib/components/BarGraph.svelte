<script lang="ts">
	import Frame from './Frame.svelte';
	import FullscreenButton from './FullscreenButton.svelte';

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

	const entries = $derived(
		sort
			? Object.entries(data).sort(([, a], [, b]) => (desc ? b - a : a - b))
			: Object.entries(data)
	);
	let table: HTMLTableElement | undefined;
	let fullscreenState = $state(false);

	const onGraphFullscreenChange = (value: boolean) => {
		fullscreenState = value;
	};

	$effect(() => {
		if (table) table.style.height = fullscreenState ? '100%' : `${String(height)}vh`;
	});

	const setBarHeight = (el: HTMLDivElement, value: number) => {
		const apply = (barHeight: number) => {
			el.style.height = `${String(barHeight)}%`;
		};
		apply(value);
		return { update: apply };
	};
</script>

<Frame
	caption={context}
	contextLabel={title}
	frameClass="bar-graph"
	label="Bar Graph"
	onFullscreenChange={onGraphFullscreenChange}>
	{#snippet toolbar({ toggleFullscreen, fullscreen })}
		<FullscreenButton {fullscreen} {toggleFullscreen} />
	{/snippet}
	<div class="bottom">
		<div class="padding overflow">
			<table bind:this={table}>
				<tbody>
					<tr>
						{#each entries as [key, value] (key)}
							<td class="plot">
								<div class="bar zeltron-component" use:setBarHeight={value}></div>
							</td>
						{/each}
					</tr>
					<tr>
						{#each entries as [key, value] (key)}
							<td class="label">
								<span class="zeltron-badge">{key} - {value}%</span>
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
