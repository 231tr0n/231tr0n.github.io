<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Select from './Select.svelte';
	import { animationDelay, animationDuration } from '$lib/animation.constants.js';

	let {
		scrollspy = false,
		children
	}: {
		scrollspy?: boolean;
		children?: Snippet;
	} = $props();

	let name: HTMLElement;
	let sections: HTMLElement[] = [];
	let currentItem = $state(0);
	let breadcrumb: HTMLHeadingElement | undefined = $state();
	const selectionMenuArray: string[] = $state([]);
	let pageDiv: HTMLDivElement;

	let selectedItem = $state(0);
	const onSetSelectedItem = (value: number) => {
		selectedItem = value;
	};

	if ((() => scrollspy)()) {
		onSetSelectedItem(0);

		$effect(() => {
			if (selectedItem >= 0 && selectedItem < sections.length) {
				const currentDiv = sections[selectedItem];
				const currentDivBoundingClientRect = currentDiv.getBoundingClientRect();
				pageDiv.scrollBy(
					0,
					currentDivBoundingClientRect.top -
						currentDivBoundingClientRect.height -
						(breadcrumb as HTMLHeadingElement).offsetHeight -
						15
				);
			}
		});

		onMount(() => {
			pageDiv.onscroll = () => {
				let prev = null;
				for (const [index, section] of sections.entries()) {
					if (
						(breadcrumb as HTMLHeadingElement).offsetTop +
							(breadcrumb as HTMLHeadingElement).offsetHeight +
							5 <
						section.offsetTop
					) {
						if (prev) {
							currentItem = index - 1;
						} else {
							currentItem = index;
						}
						break;
					} else {
						currentItem = index;
					}
					prev = section;
				}
			};

			setTimeout(() => {
				name = document.querySelector('div.page div.content h1') ?? document.createElement('div');
				sections = Array.from(document.querySelectorAll('div.page div.content h2'));
				sections = Array.from(sections);
				sections.unshift(name);
				for (const section of sections) {
					selectionMenuArray.push(section.innerText);
				}
			}, animationDelay + animationDuration);
		});
	}
</script>

<div bind:this={pageDiv} class="page">
	<div class="content">
		{#if scrollspy}
			<h4 bind:this={breadcrumb} class="zeltron-component zeltron-flex-middle">
				<Select colored={true} {currentItem} items={selectionMenuArray} {onSetSelectedItem} />
			</h4>
		{/if}
		{@render children?.()}
	</div>
	<div class="zeltron-body-background zeltron-blur zeltron-border"></div>
</div>

<style>
	.page {
		width: 100%;
		height: 100%;
		overflow: auto;
		box-sizing: border-box;
		padding: 0px;
		margin: 0px;
		display: flex;
		justify-content: center;
		scroll-behavior: smooth;
	}

	h4 {
		display: flex;
	}

	.content {
		z-index: 5;
		margin: 0px;
		padding: 0px;
		padding-bottom: 100px;
		max-width: 85vw;
		width: 900px;
		height: max-content;
		text-align: justify;
	}

	div.zeltron-body-background {
		background-color: unset;
		position: fixed;
		top: 44px;
		bottom: 44px;
		z-index: 4;
		width: 950px;
		max-width: 90vw;
	}

	h4 {
		z-index: 6;
		padding: 5px;
		position: sticky;
		top: 0px;
	}
</style>
