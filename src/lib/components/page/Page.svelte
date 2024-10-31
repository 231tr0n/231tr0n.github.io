<script>
	import { onMount } from 'svelte';
	import '$lib/css/page.css';

	let { scrollspy = false, children } = $props();

	let name = '';
	let sections = $state([]);
	let page = null;
	let selection = null;
	let breadcrumb = null;
	let content = null;
	let scroller = $state(() => {});
	let updateBreadcrumb = $state(() => {});

	if (scrollspy) {
		scroller = () => {
			sections[selection.value].scrollIntoView();
			page.scrollBy(0, -breadcrumb.offsetHeight - 2);
		};

		updateBreadcrumb = () => {
			let prev = null;
			for (const [index, section] of sections.entries()) {
				if (breadcrumb.offsetTop + breadcrumb.offsetHeight + 5 < section.offsetTop) {
					if (prev) {
						selection.value = index - 1;
					} else {
						selection.value = index;
					}
					break;
				} else {
					selection.value = index;
				}
				prev = section;
			}
		};

		$effect(() => {
			sections = document.querySelectorAll('div.page div.content h2');
			sections = Array.from(sections);
			sections.unshift(name);
		});

		onMount(() => {
			content = document.querySelector('div.page div.content');
			name = document.querySelector('div.page div.content h1');
			sections = document.querySelectorAll('div.page div.content h2');
			sections = Array.from(sections);
			sections.unshift(name);
			page = document.querySelector('div.page');
			breadcrumb = document.querySelector('div.page div.content h4');
			selection = document.querySelector('div.page div.content h4 select');
			content.style.paddingBottom = `calc(100vh - ${
				document.querySelector('footer').offsetHeight
			}px - ${document.querySelector('header').offsetHeight}px - ${breadcrumb.offsetHeight}px)`;
		});
	}
</script>

{#if scrollspy}
	<div class="page flex-center" onscroll={updateBreadcrumb}>
		<div class="content justify">
			<h4 class="component center flex-middle">
				<select class="anchor body" onchange={scroller}>
					{#each sections as section, index}
						<option value={index}>{section.innerText}</option>
					{:else}
						<option value=""></option>
					{/each}
				</select>
			</h4>
			{@render children?.()}
		</div>
		<div class="body border"></div>
	</div>
{:else}
	<div class="page flex-center">
		<div class="content justify">
			{@render children?.()}
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
		border-radius: 5px;
	}

	select {
		border-radius: 5px;
	}
</style>
