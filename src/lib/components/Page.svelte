<script>
	import { onMount } from 'svelte';
	import Select from './Select.svelte';

	let { scrollspy = false, pageSelectStore = '', children } = $props();

	let name = '';
	let sections = $state([]);
	let page = $state(null);
	let currentItem = $state(0);
	let breadcrumb = $state(null);
	let updateBreadcrumb = $state(null);
	let selectionMenuArray = $state([]);

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

		if (pageSelectStore) {
			pageSelectStore.subscribe((value) => {
				if (value >= 0 && value < sections.length) {
					sections[value].scrollIntoView();
					page.scrollBy(0, -breadcrumb.offsetHeight - 2);
				}
			});
		}

		onMount(() => {
			name = document.querySelector('div.page div.content h1');
			sections = document.querySelectorAll('div.page div.content h2');
			sections = Array.from(sections);
			sections.unshift(name);
			for (const section of sections) {
				selectionMenuArray.push(section.innerText);
			}
		});
	}
</script>

{#if scrollspy}
	<div bind:this={page} class="page flex-center" onscroll={updateBreadcrumb}>
		<div class="content justify">
			<h4 bind:this={breadcrumb} class="component center flex-middle">
				<Select
					items={selectionMenuArray}
					transparent={true}
					{currentItem}
					selectedItemStore={pageSelectStore} />
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
	<div class="page flex-center">
		<div class="content justify">
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
	}

	.content {
		z-index: 5;
		margin: 0px;
		padding: 0px;
		padding-bottom: 100px;
		max-width: 85vw;
		width: 900px;
		height: max-content;
		text-align: left;
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
