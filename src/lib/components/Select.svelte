<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		items = [],
		emptyItem = false,
		currentItem = 0,
		transparent = false,
		selectedItemStore = ''
	} = $props();

	let open = $state(false);
	let selectContext = $state('');

	if (emptyItem) {
		items.unshift('');
	}

	let selectItem = (item) => {
		currentItem = item;
		if (selectedItemStore) {
			selectedItemStore.set(currentItem);
		}
		toggleSelectionMenu();
	};

	let toggleSelectionMenu = () => {
		open = open ? false : true;
	};

	onMount(() => {
		if (transparent) {
			selectContext.classList.add('body');
		}
	});

	$effect(() => {
		let largestItem = '';
		for (const item of items) {
			if (largestItem.length < item.length) {
				largestItem = item;
			}
		}

		let button = document.createElement('button');
		button.innerText = largestItem;
		document.body.appendChild(button);
		selectContext.style.width = Math.ceil(button.clientWidth) + 30 + 'px';
		document.body.removeChild(button);
	});
</script>

<div>
	<button
		bind:this={selectContext}
		class="select-context"
		aria-label="Select menu toggler"
		onclick={toggleSelectionMenu}>
		{items[currentItem]}
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
	</button>
	{#if open}
		<div class="select-menu component thick-component-border" transition:fade>
			{#each items.entries() as [index, item]}
				<button onclick={() => selectItem(index)} class="items">
					{item}
				</button>
			{/each}
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
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: fit-content;
		position: absolute;
		left: 50%;
		transform: translate(-50%, 0%);
	}

	div.select-menu button {
		width: 100%;
	}
</style>
