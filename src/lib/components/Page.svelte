<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Select from './Select.svelte';
	import { scrollspyOffset, scrollspyThreshold } from '#lib/constants/app.constants.js';

	let {
		scrollspy = false,
		children
	}: {
		scrollspy?: boolean;
		children?: Snippet;
	} = $props();

	let sections = $state<HTMLElement[]>([]);
	let currentItem = $state(0);
	let breadcrumb: HTMLHeadingElement | undefined = $state();
	const items: string[] = $state([]);
	let pageDiv: HTMLDivElement;

	const getSpyBottom = () => (breadcrumb?.getBoundingClientRect().bottom ?? 0) + scrollspyOffset;

	const onSetSelectedItem = (value: number) => {
		if (!scrollspy || !breadcrumb) return;
		const div = sections.at(value);
		if (!div) return;
		currentItem = value;
		pageDiv.scrollBy(0, div.getBoundingClientRect().top - getSpyBottom());
	};

	let scrollRafId = 0;

	onMount(() => {
		if (!scrollspy) return;
		if (!breadcrumb) return;
		pageDiv.onscroll = () => {
			cancelAnimationFrame(scrollRafId);
			scrollRafId = requestAnimationFrame(() => {
				const threshold = getSpyBottom() + scrollspyThreshold;
				let nextItem = 0;
				for (const [i, section] of sections.entries()) {
					if (section.getBoundingClientRect().top < threshold) nextItem = i;
					else break;
				}
				currentItem = nextItem;
			});
		};
		const heading = pageDiv.querySelector<HTMLElement>('div.content h1');
		const subheadings = Array.from(pageDiv.querySelectorAll<HTMLElement>('div.content h2'));
		sections = heading ? [heading, ...subheadings] : subheadings;
		for (const section of sections) items.push(section.innerText);

		return () => {
			pageDiv.onscroll = null;
			cancelAnimationFrame(scrollRafId);
		};
	});
</script>

<div bind:this={pageDiv} class="page">
	<div class="content">
		{#if scrollspy}
			<h4 bind:this={breadcrumb} class="zeltron-component zeltron-flex-middle">
				<Select colored={true} {currentItem} fixedWidth={true} {items} {onSetSelectedItem} />
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
