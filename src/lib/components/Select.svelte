<script lang="ts">
	import { slide } from 'svelte/transition';
	import { selectPaddingOffset } from '#lib/constants/app.constants.js';
	import type { SetSelectedItem } from '#lib/types/index.js';

	let {
		items,
		emptyItem = false,
		currentItem,
		colored,
		fixedWidth = false,
		onSetSelectedItem
	}: {
		items: string[];
		emptyItem?: boolean;
		currentItem: number;
		colored: boolean;
		fixedWidth?: boolean;
		onSetSelectedItem: SetSelectedItem | null;
	} = $props();

	let open = $state(false);
	let selectContext: HTMLElement;
	const localItems = $derived(emptyItem ? ['', ...items] : [...items]);
	const largest = $derived.by(() => {
		let longest = '';
		for (const item of localItems) {
			if (longest.length < item.length) longest = item;
		}
		return longest;
	});

	const setWidth = (node: HTMLSpanElement, initial: string) => {
		node.textContent = initial;
		selectContext.style.width = `${String(Math.ceil(node.clientWidth) + selectPaddingOffset)}px`;
		return {
			update(largestVal: string) {
				node.textContent = largestVal;
				selectContext.style.width = `${String(Math.ceil(node.clientWidth) + selectPaddingOffset)}px`;
			}
		};
	};

	const toggleSelectionMenu = () => {
		open = !open;
	};

	const selectItem = (item: number) => {
		onSetSelectedItem?.(item);
		toggleSelectionMenu();
	};
</script>

<div class="select-root" class:fixedWidth>
	<button
		bind:this={selectContext}
		class="select-context"
		class:fixedWidth
		class:zeltron-strong-component={colored}
		aria-expanded={open}
		aria-label="Select item, current: {localItems.at(currentItem) ?? ''}"
		onclick={toggleSelectionMenu}
		type="button">
		<span class="select-label">{localItems.at(currentItem)}</span>
		{#if open}
			<svg
				fill="currentColor"
				height="15"
				viewBox="0 0 16 16"
				width="15"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
					fill-rule="evenodd" />
			</svg>
		{:else}
			<svg
				fill="currentColor"
				height="15"
				viewBox="0 0 16 16"
				width="15"
				xmlns="http://www.w3.org/2000/svg">
				<path
					d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
					fill-rule="evenodd" />
			</svg>
		{/if}
	</button>
	{#if !fixedWidth}
		<span class="measure" aria-hidden="true" use:setWidth={largest}></span>
	{/if}
	{#if open}
		<div
			class="select-menu zeltron-flex-middle zeltron-component zeltron-thick-component-border"
			transition:slide>
			<div class="content">
				{#each localItems.entries() as [index, item] (index)}
					<button
						aria-current={index === currentItem ? 'true' : undefined}
						onclick={() => {
							selectItem(index);
						}}
						type="button">
						{item}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.measure {
		visibility: hidden;
		position: absolute;
		pointer-events: none;
	}

	svg {
		width: 15px;
		height: 15px;
		flex: 0 0 auto;
		margin-left: 10px;
	}

	.select-root {
		position: relative;
		width: fit-content;
	}

	.select-root.fixedWidth {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.select-context {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		min-height: 24px;
		white-space: nowrap;
	}

	.select-context.fixedWidth {
		width: max-content;
		max-width: 100%;
	}

	.select-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.select-menu {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translate(-50%, 0%);
		min-width: 100%;
	}

	.content {
		width: fit-content;
		flex: 1;
		display: flex;
		flex-direction: column;
		max-height: min(250px, calc(100vh - 150px));
		overflow: auto;
	}

	div.select-menu button {
		width: 100%;
		min-height: 24px;
		white-space: nowrap;
	}
</style>
