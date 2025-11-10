<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	type onSetSelectedItemType = (item: number) => void;

	let {
		items = [],
		emptyItem = false,
		currentItem = 0,
		colored = false,
		onSetSelectedItem = null
	}: {
		items: string[];
		emptyItem?: boolean;
		currentItem: number;
		colored: boolean;
		onSetSelectedItem: onSetSelectedItemType | null;
	} = $props();

	let open = $state(false);
	let selectContext: HTMLElement;

	if (emptyItem) {
		items.unshift('');
	}

	const selectItem = (item: number) => {
		currentItem = item;
		onSetSelectedItem?.(currentItem);
		toggleSelectionMenu();
	};

	const toggleSelectionMenu = () => {
		open = open ? false : true;
	};

	onMount(() => {
		if (colored) {
			selectContext.classList.add('zeltron-strong-component');
		}
	});

	$effect(() => {
		let largestItem = '';
		for (const item of items) {
			if (largestItem.length < item.length) {
				largestItem = item;
			}
		}

		const button = document.createElement('button');
		button.innerText = largestItem;
		document.body.appendChild(button);
		selectContext.style.width = (Math.ceil(button.clientWidth) + 30).toString() + 'px';
		document.body.removeChild(button);
	});
</script>

<div>
	<button
		bind:this={selectContext}
		class="select-context"
		aria-label="Select menu toggler"
		onclick={toggleSelectionMenu}
		type="button">
		{items[currentItem]}
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
				{#each items.entries() as [index, item] (index)}
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
