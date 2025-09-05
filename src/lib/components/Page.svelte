<script lang="ts">
	import { onMount } from 'svelte';
	import Select from './Select.svelte';
	import { animationDelay, animationDuration } from '$lib/animation.constants.js';

	let { scrollspy = false, children } = $props();

	let name: HTMLElement;
	let sections: HTMLElement[] = [];
	let currentItem = $state(0);
	let breadcrumb = $state() as HTMLElement;
	let updateBreadcrumb = $state(() => {});
	let selectionMenuArray: string[] = $state([]);
	let pageDiv = $state() as HTMLElement;

	let selectedItem = $state(0);
	function setSelectedItem(value: number) {
		selectedItem = value;
	}

	if (scrollspy) {
		updateBreadcrumb = () => {
			let prev = null;
			for (const [index, section] of sections.entries()) {
				if (breadcrumb.offsetTop + breadcrumb.offsetHeight + 5 < section.offsetTop) {
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

		if (setSelectedItem) {
			setSelectedItem(0);
		}

		$effect(() => {
			if (selectedItem >= 0 && selectedItem < sections.length) {
				let currentDiv = sections[selectedItem];
				let currentDivBoundingClientRect = currentDiv.getBoundingClientRect();
				pageDiv.scrollBy(
					0,
					currentDivBoundingClientRect.top -
						currentDivBoundingClientRect.height -
						breadcrumb.offsetHeight -
						15
				);
			}
		});

		onMount(() => {
			setTimeout(() => {
				name = document.querySelector('div.page div.content h1') || document.createElement('div');
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

{#if scrollspy}
	<div bind:this={pageDiv} class="page" onscroll={updateBreadcrumb}>
		<div class="content">
			<h4 bind:this={breadcrumb} class="component flex-middle">
				<Select items={selectionMenuArray} transparent={true} {currentItem} {setSelectedItem} />
			</h4>
			{#if children}
				{@render children()}
			{:else}
				<div class="error">No children to render</div>
			{/if}
		</div>
		<div class="body border"></div>
	</div>
{:else}
	<div class="page">
		<div class="content">
			{#if children}
				{@render children()}
			{:else}
				<div class="error">No children to render</div>
			{/if}
		</div>
		<div class="body border"></div>
	</div>
{/if}

<style>
	.page {
		width: 100%;
		height: 100%;
		overflow: auto;
		box-sizing: border-box;
		padding: 0px;
		margin: 0px;
		scroll-behavior: smooth;
		display: flex;
		justify-content: center;
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

	div.body {
		filter: blur(0px);
		opacity: 85%;
		position: fixed;
		top: 0px;
		bottom: 0px;
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
