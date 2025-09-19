<script lang="ts">
	import { onMount } from 'svelte';

	let {
		data = {},
		sort = false,
		desc = true,
		context = '',
		title = '',
		height = '50vh'
	} = $props();

	if (sort) {
		data = Object.fromEntries(Object.entries(data).sort(([, a], [, b]) => (desc ? b - a : a - b)));
	}

	let chartDiv: HTMLDivElement;
	let table: HTMLTableElement;
	let fullscreen = $state(false);
	let storedHeight = '';
	let storedWidth = '';

	let toggleFullscreen = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
			fullscreen = false;
		} else {
			chartDiv.requestFullscreen();
			fullscreen = true;
		}
	};

	onMount(() => {
		table.style.height = height.toString() + 'vh';
		chartDiv.onfullscreenchange = () => {
			if (document.fullscreenElement) {
				table.style.height = 'calc(100vh - 76px)';
				storedHeight = chartDiv.style.height;
				storedWidth = chartDiv.style.width;
				chartDiv.style.height = '100vh';
				chartDiv.style.width = '100vw';
				fullscreen = true;
			} else {
				table.style.height = height.toString() + 'vh';
				chartDiv.style.height = storedHeight;
				chartDiv.style.width = storedWidth;
				fullscreen = false;
			}
		};
	});
</script>

<div bind:this={chartDiv} class="flex-middle">
	<div class="thick-component-border body overflow">
		<div class="filename context component">
			<span>Bar Graph</span>
			<span>{context}</span>
		</div>
		<div class="context component">
			<button onclick={toggleFullscreen} class="inline-flex-middle" aria-label="Toggle fullscreen">
				{#if !fullscreen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-fullscreen"
						viewBox="0 0 16 16">
						<path
							d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-fullscreen-exit"
						viewBox="0 0 16 16">
						<path
							d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
					</svg>
				{/if}
			</button>
			<span>{title}</span>
		</div>
		<div class="bottom">
			<div class="padding overflow">
				<table bind:this={table}>
					<tbody>
						<tr>
							{#each Object.values(data) as value, _ (_)}
								<td class="plot">
									<div class="bar component" style={'height: ' + value + '%;'}></div>
								</td>
							{/each}
						</tr>
						<tr>
							{#each Object.entries(data) as [key, value], _ (_)}
								<td class="label">
									<span class="badge">{key} - {value + '%'}</span>
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<style>
	div.thick-component-border {
		height: 100%;
	}

	div.bottom {
		height: calc(100% - 65px);
		display: flex;
		align-items: end;
	}

	div.padding {
		padding-top: 5px;
		padding-bottom: 5px;
	}

	div.flex-middle {
		margin-top: 1em;
		margin-bottom: 1em;
	}

	button {
		padding: 3px;
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

	div.overflow {
		overflow: auto;
	}

	span.badge {
		margin: 0px;
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

	div.bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
	}

	table {
		margin-top: 2px;
		margin-left: 2px;
		margin-right: 2px;
	}
</style>
