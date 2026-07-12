<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Select from './Select.svelte';
	import {
		animationDelay,
		animationDuration,
		scrollspyOffset,
		scrollspyThreshold
	} from '$lib/constants/app.constants.ts';

	let {
		scrollspy = false,
		children
	}: {
		scrollspy?: boolean;
		children?: Snippet;
	} = $props();

	let sections: HTMLElement[] = [];
	let currentItem = $state(0);
	let breadcrumb: HTMLHeadingElement | undefined = $state();
	const items: string[] = $state([]);
	let pageDiv: HTMLDivElement;
	let selectedItem = $state(0);

	const onSetSelectedItem = (value: number) => {
		selectedItem = value;
	};

	$effect(() => {
		const idx = selectedItem;
		if (!scrollspy || !breadcrumb) return;
		const div = sections.at(idx);
		if (!div) return;
		const rect = div.getBoundingClientRect();
		pageDiv.scrollBy(0, rect.top - rect.height - breadcrumb.offsetHeight - scrollspyOffset);
	});

	let scrollRafId = 0;

	onMount(() => {
		if (!scrollspy) return;
		const el = breadcrumb;
		if (!el) return;
		pageDiv.onscroll = () => {
			cancelAnimationFrame(scrollRafId);
			scrollRafId = requestAnimationFrame(() => {
				let prev: HTMLElement | null = null;
				for (const [i, section] of sections.entries()) {
					if (el.offsetTop + el.offsetHeight + scrollspyThreshold < section.offsetTop) {
						currentItem = prev ? i - 1 : i;
						break;
					} else {
						currentItem = i;
					}
					prev = section;
				}
			});
		};
		const initTimeout = setTimeout(() => {
			const name =
				document.querySelector<HTMLElement>('div.page div.content h1') ??
				document.createElement('div');
			sections = Array.from(document.querySelectorAll<HTMLElement>('div.page div.content h2'));
			sections.unshift(name);
			for (const section of sections) items.push(section.innerText);
		}, animationDelay + animationDuration);

		return () => {
			pageDiv.onscroll = null;
			cancelAnimationFrame(scrollRafId);
			clearTimeout(initTimeout);
		};
	});
</script>

<div bind:this={pageDiv} class="page">
	<div class="content">
		{#if scrollspy}
			<h4 bind:this={breadcrumb} class="zeltron-component zeltron-flex-middle">
				<Select colored={true} {currentItem} {items} {onSetSelectedItem} />
			</h4>
		{/if}
		{@render children?.()}
	</div>
	<div class="zeltron-body-background zeltron-border"></div>
</div>

<style>
	.page {
		height: 100%;
		overflow: auto;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		scroll-behavior: smooth;
	}

	.content {
		padding-bottom: 100px;
		max-width: var(--layout-content-max-width);
		width: var(--layout-content-width);
		height: max-content;
		text-align: justify;
		z-index: var(--z-index-content);
	}

	div.zeltron-body-background {
		position: fixed;
		top: var(--layout-page-bg-offset);
		bottom: var(--layout-page-bg-offset);
		width: var(--layout-background-width);
		max-width: 90vw;
		z-index: var(--z-index-page-background);
	}

	h4 {
		padding: 5px;
		position: sticky;
		top: 0;
		display: flex;
		z-index: var(--z-index-scrollspy);
	}
</style>
