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
		if (!scrollspy || !breadcrumb) return;
		const div = sections[selectedItem];
		if (!div) return;
		const rect = div.getBoundingClientRect();
		pageDiv.scrollBy(0, rect.top - rect.height - breadcrumb.offsetHeight - scrollspyOffset);
	});

	onMount(() => {
		if (!scrollspy) return;
		const el = breadcrumb;
		if (!el) return;
		pageDiv.onscroll = () => {
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
		};
		setTimeout(() => {
			const name =
				document.querySelector<HTMLElement>('div.page div.content h1') ??
				document.createElement('div');
			sections = Array.from(document.querySelectorAll<HTMLElement>('div.page div.content h2'));
			sections.unshift(name);
			for (const section of sections) items.push(section.innerText);
		}, animationDelay + animationDuration);
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
		z-index: 5;
		padding-bottom: 100px;
		max-width: 85vw;
		width: 900px;
		height: max-content;
		text-align: justify;
	}

	div.zeltron-body-background {
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
		display: flex;
	}
</style>
