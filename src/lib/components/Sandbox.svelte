<script lang="ts">
	import Frame from './Frame.svelte';
	import FullscreenButton from './FullscreenButton.svelte';
	import { sandboxPolicy } from '#lib/constants/app.constants.js';
	import { darkMode } from '#lib/utils/dark.svelte.js';

	let {
		title,
		description,
		src = '',
		srcDoc = '',
		compact = false
	}: {
		title: string;
		description: string;
		src?: string;
		srcDoc?: string;
		compact?: boolean;
	} = $props();

	let iframe: HTMLIFrameElement | undefined;

	const syncTheme = (dark: boolean) => {
		if (!iframe?.contentWindow) return;
		iframe.contentWindow.postMessage({ type: 'theme', dark }, '*');
	};

	$effect(() => {
		// Keep the sandboxed document in sync with the site theme.
		syncTheme(darkMode().dark);
	});

	$effect(() => {
		if (!iframe) return;
		if (!srcDoc) {
			iframe.removeAttribute('srcdoc');
			return;
		}
		const hasBodyBg =
			/<body\b[^>]*\bbackground\s*[=:]/i.test(srcDoc) ||
			/<html\b[^>]*\bbackground\s*[=:]/i.test(srcDoc) ||
			/(?:body|html)\s*\{[^}]*\bbackground\b/i.test(srcDoc);
		if (hasBodyBg) {
			iframe.srcdoc = srcDoc;
			return;
		}
		const { dark } = darkMode();
		const bg =
			getComputedStyle(document.body).getPropertyValue('--color-background').trim() || 'Canvas';
		const style = `<style>html { background: ${bg}; color-scheme: ${dark ? 'dark' : 'light'}; }</style>`;
		if (/<head\b[^>]*>/i.test(srcDoc)) {
			iframe.srcdoc = srcDoc.replace(/<head\b[^>]*>/i, (head) => `${head}${style}`);
		} else if (/<html\b[^>]*>/i.test(srcDoc)) {
			iframe.srcdoc = srcDoc.replace(/<html\b[^>]*>/i, (html) => `${html}<head>${style}</head>`);
		} else if (/<body\b[^>]*>/i.test(srcDoc)) {
			iframe.srcdoc = `<html><head>${style}</head>${srcDoc}</html>`;
		} else {
			iframe.srcdoc = `<html><head>${style}</head><body>${srcDoc}</body></html>`;
		}
	});
</script>

<Frame
	caption={title}
	{compact}
	contextLabel={description}
	frameClass={compact ? 'iframe compact' : 'iframe'}
	label="Sandbox">
	{#snippet toolbar({ toggleFullscreen, fullscreen })}
		<FullscreenButton {fullscreen} {toggleFullscreen} />
	{/snippet}
	<iframe
		bind:this={iframe}
		allowfullscreen
		onload={() => {
			syncTheme(document.body.classList.contains('dark'));
		}}
		sandbox={sandboxPolicy}
		{src}
		{title}>
	</iframe>
</Frame>

<style>
	:global(.iframe) {
		width: 100%;
		max-width: var(--layout-content-max-width);
		box-sizing: border-box;
		height: calc(100vh - 10vh - var(--layout-header-height) - var(--layout-footer-height));
	}

	:global(.iframe.compact) {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--layout-header-height) - var(--layout-footer-height));
		min-height: 360px;
		max-width: 100%;
	}

	:global(.iframe.compact iframe) {
		flex: 1 1 auto;
		height: auto;
		min-height: 0;
	}

	:global(.iframe:fullscreen) {
		display: flex;
		flex-direction: column;
		height: 100vh;
		max-width: none;
	}

	:global(.iframe:fullscreen iframe) {
		flex: 1 1 auto;
		height: auto;
		min-height: 0;
	}

	iframe {
		border: 0;
		overflow: auto;
		width: 100%;
		height: calc(100% - var(--sandbox-iframe-offset));
	}
</style>
