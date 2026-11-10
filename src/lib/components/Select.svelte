<script lang="ts">
	import { tick } from 'svelte';
	import { on } from 'svelte/events';
	import { slide } from 'svelte/transition';
	import { selectPaddingOffset } from '#lib/constants/app.constants.js';
	import type { SetSelectedItem } from '#lib/types/index.js';

	let {
		items,
		currentItem,
		colored,
		fixedWidth = false,
		onSetSelectedItem
	}: {
		items: string[];
		currentItem: number;
		colored: boolean;
		fixedWidth?: boolean;
		onSetSelectedItem: SetSelectedItem | null;
	} = $props();

	let open = $state(false);
	let selectContext: HTMLElement;
	let selectRoot: HTMLElement;
	const selectId = $props.id();
	const triggerId = `${selectId}-trigger`;
	const menuId = `${selectId}-listbox`;
	const localItems = $derived(items);
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

	const focusOption = (index: number) => {
		const options = Array.from(selectRoot.querySelectorAll<HTMLElement>('[role="option"]'));
		options.at(index)?.focus();
	};

	const openMenu = async (index = currentItem) => {
		open = true;
		await tick();
		focusOption(index);
	};

	const closeMenu = (restoreFocus = false) => {
		open = false;
		if (restoreFocus) selectContext.focus({ preventScroll: true });
	};

	const toggleSelectionMenu = () => {
		if (open) closeMenu();
		else void openMenu();
	};

	const selectItem = (item: number) => {
		onSetSelectedItem?.(item);
		closeMenu(true);
	};

	const onTriggerKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			void openMenu(currentItem);
		} else if (event.key === 'Escape' && open) {
			event.preventDefault();
			closeMenu(true);
		}
	};

	const onOptionKeydown = (event: KeyboardEvent, index: number) => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusOption((index + 1) % localItems.length);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusOption((index - 1 + localItems.length) % localItems.length);
				break;
			case 'Home':
				event.preventDefault();
				focusOption(0);
				break;
			case 'End':
				event.preventDefault();
				focusOption(localItems.length - 1);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				selectItem(index);
				break;
			case 'Escape':
				event.preventDefault();
				closeMenu(true);
				break;
			case 'Tab':
				closeMenu(true);
				break;
		}
	};

	$effect(() => {
		if (!open) return;
		return on(window, 'pointerdown', (event) => {
			if (event.target instanceof Node && selectRoot.contains(event.target)) return;
			closeMenu();
		});
	});
</script>

<div bind:this={selectRoot} class="select-root" class:fixedWidth>
	<button
		bind:this={selectContext}
		id={triggerId}
		class="select-context"
		class:fixedWidth
		class:zeltron-strong-component={colored}
		aria-controls={open ? menuId : undefined}
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-label="Select item, current: {localItems.at(currentItem) ?? ''}"
		onclick={toggleSelectionMenu}
		onkeydown={onTriggerKeydown}
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
			<div id={menuId} class="content" aria-labelledby={triggerId} role="listbox" tabindex="-1">
				{#each localItems.entries() as [index, item] (index)}
					<button
						aria-selected={index === currentItem}
						onclick={() => {
							selectItem(index);
						}}
						onkeydown={(event) => {
							onOptionKeydown(event, index);
						}}
						role="option"
						tabindex="-1"
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
