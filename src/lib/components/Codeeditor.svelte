<script lang="ts">
	import { onMount } from 'svelte';
	import type ace from 'ace-code';
	import aceEverforestLight from '$lib/ace-themes/ace-everforest-light.ts';
	import aceEverforestDark from '$lib/ace-themes/ace-everforest-dark.ts';
	import { darkMode } from '$lib/utils/dark.svelte.ts';
	import {
		editorFontSize,
		editorTabSize,
		editorScrollbarWidth,
		editorScrollbarHeight,
		copyFeedbackTimeout
	} from '$lib/constants/app.constants';
	import Frame from './Frame.svelte';
	import type { AceMode, SetCode } from '$lib/types';

	let {
		langName,
		mode = null,
		output = '',
		readOnly = false,
		fileName,
		setCode = null,
		vimMode = false,
		wrap = false,
		code = ''
	}: {
		langName: string;
		mode?: AceMode | null;
		output?: string;
		readOnly?: boolean;
		fileName: string;
		setCode?: SetCode | null;
		vimMode?: boolean;
		wrap?: boolean;
		code?: string;
	} = $props();

	let editorDiv: HTMLElement;
	let editor: ace.Editor | null = $state(null);
	let copied = $state(false);
	let theme = $derived(darkMode().dark ? aceEverforestDark : aceEverforestLight);

	let vimHandler: { handler: import('ace-code').Ace.KeyboardHandler } | null = null;
	let vscodeHandler: { handler: import('ace-code').Ace.KeyboardHandler } | null = null;
	let beautifyModule: { beautify: (session: import('ace-code').Ace.EditSession) => void } | null =
		null;

	let copyTimeout: ReturnType<typeof setTimeout>;

	const copy = async () => {
		if (!editor) return;
		await navigator.clipboard.writeText(editor.session.getValue());
		copied = true;
		clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => {
			copied = false;
		}, copyFeedbackTimeout);
	};

	const toggleWrap = () => {
		if (!editor) return;
		editor.session.setUseWrapMode(!wrap);
		wrap = !wrap;
	};

	const execute = () => {
		if (!editor) return;
		if (setCode) {
			setCode(editor.session.getValue());
		}
	};

	const beautify = () => {
		if (!editor) return;
		if (beautifyModule !== null) beautifyModule.beautify(editor.session);
	};

	const toggleKeybinds = () => {
		if (!editor) return;
		if (vimHandler === null || vscodeHandler === null) return;
		if (vimMode) {
			editor.setKeyboardHandler(vscodeHandler.handler);
		} else {
			editor.setKeyboardHandler(vimHandler.handler);
		}
		vimMode = !vimMode;
	};

	let destroying = false;

	onMount(() => {
		void (async () => {
			const { default: aceEditor } = await import('ace-code');

			if (!readOnly) {
				const [vimMod, vscodeMod, beautifyMod] = await Promise.all([
					import('ace-code/src/keyboard/vim'),
					import('ace-code/src/keyboard/vscode'),
					import('ace-code/src/ext/beautify')
				]);
				vimHandler = vimMod.default;
				vscodeHandler = vscodeMod.default;
				beautifyModule = beautifyMod.default;
			}

			if (destroying) return;
			editor = aceEditor.edit(editorDiv);
			editor.renderer.scrollBarV['width'] = editorScrollbarWidth;
			editor.renderer.scrollBarH['height'] = editorScrollbarHeight;
			editor.resize(true);
			if (mode) {
				editor.session.setMode(new mode.Mode());
			}
			if (readOnly) {
				editor.setValue(code, -1);
				editor.setHighlightActiveLine(false);
				editor.setHighlightGutterLine(false);
			} else {
				if (vimMode) {
					editor.setKeyboardHandler(vimHandler?.handler ?? null);
				} else {
					editor.setKeyboardHandler(vscodeHandler?.handler ?? null);
				}
			}
			editor.setFontSize(editorFontSize);
			editor.session.setUseWrapMode(wrap);
			editor.setReadOnly(readOnly);
			editor.session.setTabSize(editorTabSize);
			editor.session.setUseSoftTabs(true);
			editor.setShowPrintMargin(false);
		})();

		return () => {
			clearTimeout(copyTimeout);
			destroying = true;
			editor?.destroy();
		};
	});

	$effect(() => {
		editor?.setTheme(theme);
	});

	const onFrameFullscreenChange = () => {
		if (!editor) return;
		editor.resize();
	};
</script>

<Frame
	caption={readOnly && fileName ? fileName : ''}
	contextLabel={langName}
	frameClass="codeeditor-frame"
	label={readOnly ? 'Snippet' : 'Editor'}
	onFullscreenChange={onFrameFullscreenChange}>
	{#snippet toolbar({ toggleFullscreen, fullscreen })}
		<button class="zeltron-inline-flex-middle" aria-label="Copy" onclick={copy} type="button">
			{#if !copied}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
					<path
						d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
				</svg>
			{:else}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"
						fill-rule="evenodd" />
					<path
						d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
					<path
						d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
				</svg>
			{/if}
		</button>
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
		<button class="zeltron-inline-flex-middle" aria-label="Wrap" onclick={toggleWrap} type="button">
			{#if wrap}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<line stroke="currentColor" stroke-width="1" x1="0" x2="16" y1="0" y2="16" />
					<path
						d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h9a2.5 2.5 0 0 1 0 5h-1.293l.647.646a.5.5 0 0 1-.708.708l-1.5-1.5a.5.5 0 0 1 0-.708l1.5-1.5a.5.5 0 0 1 .708.708l-.647.646H11.5a1.5 1.5 0 0 0 0-3h-9a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5H7a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5"
						fill-rule="evenodd" />
				</svg>
			{:else}
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h9a2.5 2.5 0 0 1 0 5h-1.293l.647.646a.5.5 0 0 1-.708.708l-1.5-1.5a.5.5 0 0 1 0-.708l1.5-1.5a.5.5 0 0 1 .708.708l-.647.646H11.5a1.5 1.5 0 0 0 0-3h-9a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5H7a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5"
						fill-rule="evenodd" />
				</svg>
			{/if}
		</button>
		{#if !readOnly}
			<button
				class="zeltron-inline-flex-middle"
				aria-label="Toggle keybindings"
				onclick={toggleKeybinds}
				type="button">
				{#if vimMode}
					<img class="logo" alt="Vim" src="/images/vim.avif" />
				{:else}
					<img class="logo" alt="Vscode" src="/images/vscode.avif" />
				{/if}
			</button>
			<button
				class="zeltron-inline-flex-middle"
				aria-label="Format"
				onclick={beautify}
				type="button">
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path
						d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
					<path
						d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z" />
				</svg>
			</button>
			<button class="zeltron-inline-flex-middle" aria-label="Run" onclick={execute} type="button">
				<svg
					fill="currentColor"
					height="16"
					viewBox="0 0 16 16"
					width="16"
					xmlns="http://www.w3.org/2000/svg">
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
					<path
						d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
				</svg>
			</button>
		{/if}
	{/snippet}
	<div bind:this={editorDiv} class="editor-height"></div>
</Frame>
{#if readOnly && output}
	<div class="zeltron-component-border">
		<div class="zeltron-component"><span>Output</span></div>
		<pre>{output}</pre>
	</div>
{/if}

<style>
	:global(.codeeditor-frame) {
		width: 100%;
		box-sizing: border-box;
		overflow: auto;
		height: calc(100vh - 20vh - var(--codeeditor-frame-offset));
		display: flex;
		flex-direction: column;
	}

	.editor-height {
		flex: 1;
	}

	pre {
		margin: 0;
		padding: 3px;
		height: 100px;
		overflow: auto;
	}

	.logo {
		width: 16px;
		height: 16px;
	}

	button {
		padding: 3px;
	}

	svg {
		width: 16px;
		height: 16px;
	}

	:global(.ace_editor) {
		font-family: Roboto-Mono;
	}

	:global(.ace_scrollbar),
	:global(.ace_scrollbar-h) {
		scrollbar-width: none;
	}

	:global(.ace_scrollbar::-webkit-scrollbar),
	:global(.ace_scrollbar-h::-webkit-scrollbar) {
		display: none;
	}

	:global(.ace-everforest-light .ace_gutter-layer),
	:global(.ace-everforest-dark .ace_gutter-layer) {
		border-right: 2px solid var(--color-component-background);
		color: var(--color-foreground);
	}

	:global(.ace-everforest-light .ace_indent-guide),
	:global(.ace-everforest-light .ace_indent-guide-active),
	:global(.ace-everforest-dark .ace_indent-guide),
	:global(.ace-everforest-dark .ace_indent-guide-active) {
		border-right: 1px solid var(--color-component-background);
	}

	:global(.ace-everforest-dark .ace_fold),
	:global(.ace-everforest-light .ace_fold) {
		background-color: var(--color-visual);
		border: none;
		border-radius: 3px;
	}

	:global(.ace-everforest-dark .ace_fold-widget:hover),
	:global(.ace-everforest-dark .ace_fold:hover),
	:global(.ace-everforest-light .ace_fold-widget:hover),
	:global(.ace-everforest-light .ace_fold:hover) {
		border: 2px solid var(--color-anchor);
	}
</style>
