<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { selectPaddingOffset } from '$lib/constants/app.constants';
	import type { OnSetSelectedItem } from '$lib/types';

	let {
		items,
		emptyItem = false,
		currentItem,
		colored,
		onSetSelectedItem
	}: {
		items: string[];
		emptyItem?: boolean;
		currentItem: number;
		colored: boolean;
		onSetSelectedItem: OnSetSelectedItem | null;
	} = $props();

	let open = $state(false);
	let selectContext: HTMLElement;
	const localItems = $derived(emptyItem ? ['', ...items] : [...items]);

	const selectItem = (item: number) => {
		currentItem = item;
		onSetSelectedItem?.(currentItem);
		toggleSelectionMenu();
	};

	const toggleSelectionMenu = () => {
		open = !open;
	};

	onMount(() => {
		if (colored) selectContext.classList.add('zeltron-strong-component');
	});

	$effect(() => {
		let largest = '';
		for (const item of localItems) {
			if (largest.length < item.length) largest = item;
		}
		const btn = document.createElement('button');
		btn.innerText = largest;
		document.body.appendChild(btn);
		selectContext.style.width = String(Math.ceil(btn.clientWidth) + selectPaddingOffset) + 'px';
		document.body.removeChild(btn);
	});
</script>

<div>
	<button
		bind:this={selectContext}
		class="select-context"
		aria-label="Select menu toggler"
		onclick={toggleSelectionMenu}
		type="button">
		{localItems.at(currentItem)}
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
	{#if open}
		<div
			class="select-menu zeltron-flex-middle zeltron-component zeltron-thick-component-border"
			transition:slide>
			<div class="content">
				{#each localItems.entries() as [index, item] (index)}
					<button
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
	svg {
		width: 10px;
		height: 10px;
		margin-left: 10px;
	}

	.select-context {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
	}

	.select-menu {
		position: absolute;
		left: 50%;
		transform: translate(-50%, 0%);
	}

	.content {
		width: fit-content;
		display: flex;
		flex-direction: column;
		max-height: 250px;
		overflow: auto;
	}

	div.select-menu button {
		width: 100%;
	}
</style>
