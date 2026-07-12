<script lang="ts">
	import Frame from './Frame.svelte';
	import { sandboxPolicy } from '$lib/constants/app.constants';
	import { darkMode } from '$lib/utils/dark.svelte.ts';

	let {
		title,
		description,
		src = '',
		srcDoc = ''
	}: {
		title: string;
		description: string;
		src?: string;
		srcDoc?: string;
	} = $props();

	let iframe: HTMLIFrameElement | undefined;

	$effect(() => {
		void darkMode().dark;
		if (!iframe || !srcDoc) return;
		const bg = getComputedStyle(document.body).getPropertyValue('--color-background').trim();
		if (/<body/i.test(srcDoc)) {
			iframe.srcdoc = srcDoc.replace(/<html/i, `<html style="background:${bg}"`);
		} else {
			iframe.srcdoc = `<html style="background:${bg}"><body>${srcDoc}</body></html>`;
		}
	});
</script>

<Frame caption={title} contextLabel={description} frameClass="iframe" label="Sandbox">
	{#snippet toolbar({ toggleFullscreen, fullscreen })}
		<button
			class="zeltron-inline-flex-middle"
			aria-label="Toggle fullscreen"
			onclick={toggleFullscreen}
			type="button">
			{#if fullscreen === false}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
				</svg>
			{:else}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
				</svg>
			{/if}
		</button>
	{/snippet}
	<iframe bind:this={iframe} allowfullscreen sandbox={sandboxPolicy} {src} {title}> </iframe>
</Frame>

<style>
	:global(.iframe) {
		width: 100%;
		max-width: 85vw;
		box-sizing: border-box;
		height: calc(100vh - 10vh - 45px - 45px);
	}

	iframe {
		border: 0px;
		overflow: auto;
		width: 100%;
		height: calc(100% - 65px);
	}

	button {
		padding: 3px;
	}

	svg {
		width: 16px;
		height: 16px;
	}
</style>
