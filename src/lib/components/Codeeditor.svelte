<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import ace from 'ace-code';
	import solarized_light from 'ace-code/src/theme/solarized_light';
	import solarized_dark from 'ace-code/src/theme/solarized_dark';
	import vim from 'ace-code/src/keyboard/vim';
	import vscode from 'ace-code/src/keyboard/vscode';
	import beautifier from 'ace-code/src/ext/beautify';
	import { lightMode } from '$lib/store.svelte.js';
	import { type Unsubscriber } from 'svelte/store';

	let {
		langName = '',
		mode = null,
		output = '',
		readOnly = false,
		fileName = '',
		codeStore = null,
		vimMode = false,
		code = ''
	} = $props();

	let editorDiv = $state() as HTMLElement;
	let editor: ace.Editor;
	let fullscreen = $state(false);
	let editorElement = $state() as HTMLElement;
	let editorBlock = $state() as HTMLElement;
	let copied = $state(false);
	let storedHeight = '';
	let unsubscriber: Unsubscriber = () => {};

	let copy = () => {
		navigator.clipboard.writeText(editor.session.getValue());
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	};

	let toggleFullscreen = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			editorElement.requestFullscreen();
		}
	};

	let execute = () => {
		if (codeStore) {
			codeStore.set(editor.session.getValue());
		}
	};

	let beautify = () => {
		beautifier.beautify(editor.session);
	};

	let toggleKeybinds = () => {
		if (vimMode && editor) {
			editor.setKeyboardHandler(vscode.handler);
		} else {
			editor.setKeyboardHandler(vim.handler);
		}
		vimMode = !vimMode;
	};

	onMount(() => {
		editor = ace.edit(editorDiv);
		editor.setTheme(solarized_dark);
		if (mode) {
			editor.session.setMode(new mode.Mode());
		}
		if (readOnly) {
			editor.setValue(code, -1);
			editor.setHighlightActiveLine(false);
			editor.setHighlightGutterLine(false);
		} else {
			if (vimMode) {
				editor.setKeyboardHandler(vim.handler);
			} else {
				editor.setKeyboardHandler(vscode.handler);
			}
		}
		editor.setReadOnly(readOnly);
		editor.session.setTabSize(2);
		editor.session.setUseSoftTabs(true);
		editor.setShowPrintMargin(false);
		unsubscriber = lightMode.subscribe((value) => {
			if (value) {
				editor.setTheme(solarized_light);
			} else {
				editor.setTheme(solarized_dark);
			}
		});

		editorElement.onfullscreenchange = () => {
			if (document.fullscreenElement) {
				storedHeight = editorBlock.style.height;
				editorBlock.style.height = '100vh';
				fullscreen = true;
			} else {
				editorBlock.style.height = storedHeight;
				fullscreen = false;
			}
			editor.resize();
		};
	});

	onDestroy(() => {
		unsubscriber?.();
	});
</script>

<div bind:this={editorElement} class="flex-middle">
	<div bind:this={editorBlock} class="editor-block thick-component-border body">
		<div class="filename editor-context component">
			<span>
				{readOnly ? 'Snippet' : 'Editor'}
			</span>
			{#if readOnly && fileName != ''}
				<span>
					{fileName}
				</span>
			{/if}
		</div>
		<div class="editor-context component">
			<span>
				<button onclick={copy} aria-label="Copy">
					{#if !copied}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-clipboard"
							viewBox="0 0 16 16">
							<path
								d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
							<path
								d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-clipboard-check"
							viewBox="0 0 16 16">
							<path
								fill-rule="evenodd"
								d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
							<path
								d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
							<path
								d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
						</svg>
					{/if}
				</button>
				<button onclick={toggleFullscreen} aria-label="Toggle fullscreen">
					{#if !fullscreen}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-fullscreen"
							viewBox="0 0 16 16">
							<path
								d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-fullscreen-exit"
							viewBox="0 0 16 16">
							<path
								d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z" />
						</svg>
					{/if}
				</button>
				{#if !readOnly}
					<button onclick={toggleKeybinds} aria-label="Toggle keybindings">
						{#if vimMode}
							<img class="logo" alt="Vim" src="/images/vim.avif" />
						{:else}
							<img class="logo" alt="Vscode" src="/images/vscode.avif" />
						{/if}
					</button>
					<button onclick={beautify} aria-label="Format">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-code-square"
							viewBox="0 0 16 16">
							<path
								d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
							<path
								d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z" />
						</svg>
					</button>
					<button onclick={execute} aria-label="Run">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							class="bi bi-play-circle"
							viewBox="0 0 16 16">
							<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
							<path
								d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
						</svg>
					</button>
				{/if}
			</span>
			<span>{langName}</span>
		</div>
		<div class="editor-height" bind:this={editorDiv}></div>
	</div>
	{#if readOnly && output}
		<div class="output body component-border">
			<div class="editor-context component"><span>Output</span></div>
			<pre>{output}</pre>
		</div>
	{/if}
</div>

<style>
	.output {
		box-sizing: border-box;
		width: 100%;
	}

	div.flex-middle {
		box-sizing: border-box;
		margin-top: 1em;
		margin-bottom: 1em;
		flex-direction: column;
	}

	.editor-height {
		height: calc(100% - 66px);
	}

	svg {
		width: 16px;
		height: 16px;
	}

	pre {
		margin: 0px;
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
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}

	.filename {
		border-bottom: 1px solid var(--color-dark-component-foreground);
	}

	:global(body.light-mode) .filename {
		border-bottom: 1px solid var(--color-light-component-foreground);
	}

	.editor-block {
		width: 100%;
		box-sizing: border-box;
		overflow: auto;
		height: calc(100vh - 10vh - 50px - 50px);
	}

	.editor-context {
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	:global(.ace_gutter-layer) {
		border-right: 1px solid var(--color-dark-component-background);
		color: var(--color-dark-foreground);
	}

	:global(body.light-mode .ace_gutter-layer) {
		border-right: 1px solid var(--color-light-component-background);
		color: var(--color-light-foreground);
	}

	:global(div.ace_editor) {
		font-family: Roboto-Mono;
		font-size: 15px;
	}
</style>
