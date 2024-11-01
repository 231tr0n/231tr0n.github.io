<script>
	import { onDestroy, onMount } from 'svelte';
	import highlightjs from 'highlight.js/lib/core';
	import 'highlight.js/styles/base16/solarized-dark.css';

	let {
		code = '',
		langDef = '',
		langName = '',
		filePath = '.',
		fileName = '',
		output = ''
	} = $props();

	let codeHTML = $state('');
	let codeElement = $state('');
	let fullscreen = $state(false);
	let copied = $state(false);
	let anchor = $state('');
	let fileUrl = '';
	let lineNumber = $state('');

	let toggleFullscreen = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			codeElement.requestFullscreen();
		}
	};

	let copy = () => {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	};

	onMount(() => {
		codeElement.onfullscreenchange = () => {
			if (document.fullscreenElement) {
				fullscreen = true;
			} else {
				fullscreen = false;
			}
		};

		if (code && langName && langDef) {
			highlightjs.registerLanguage(langName, langDef);
			codeHTML = highlightjs.highlight(code, {
				language: langName
			}).value;
		}

		let n = code.trim().split('\n').length;

		for (let i = 0; i < n; i++) {
			lineNumber.innerText += (i + 1).toString() + '\n';
		}

		if (fileName) {
			const blob = new Blob([code], { type: 'text/plain' });
			fileUrl = URL.createObjectURL(blob);
			anchor.href = fileUrl;
			anchor.download = fileName;
		}
	});

	onDestroy(() => {
		URL.revokeObjectURL(fileUrl);
	});
</script>

{#if code && langDef && langName}
	<div class="flex-middle">
		<div bind:this={codeElement} class="code-block body">
			{#if fileName}
				<div class="filename code-context component">
					<span>{filePath[filePath.length - 1] === '/' ? filePath : filePath + '/'}{fileName}</span>
				</div>
			{/if}
			<div class="code-context component">
				<span>
					<button onclick={copy} aria-label="Copy">
						{#if !copied}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								class="bi bi-clipboard"
								viewBox="0 0 16 16"
							>
								<path
									d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
								/>
								<path
									d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								class="bi bi-clipboard-check"
								viewBox="0 0 16 16"
							>
								<path
									fill-rule="evenodd"
									d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"
								/>
								<path
									d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
								/>
								<path
									d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
								/>
							</svg>
						{/if}
					</button><button onclick={toggleFullscreen} aria-label="Toggle fullscreen">
						{#if !fullscreen}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								class="bi bi-fullscreen"
								viewBox="0 0 16 16"
							>
								<path
									d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								class="bi bi-fullscreen-exit"
								viewBox="0 0 16 16"
							>
								<path
									d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"
								/>
							</svg>
						{/if}
					</button>{#if fileName}<a href="/favicon.ico" bind:this={anchor}
							><button aria-label="Download">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									class="bi bi-download"
									viewBox="0 0 16 16"
								>
									<path
										d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
									/>
									<path
										d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"
									/>
								</svg>
							</button></a
						>
					{/if}
				</span>
				<span>{langName}</span>
			</div>
			<div class="main-block">
				<div bind:this={lineNumber} class="line-number body"></div>
				<pre><code>{@html codeHTML}</code></pre>
			</div>
			{#if output}
				<div class="code-context component"><span>Output</span></div>
				<pre>{output}</pre>
			{/if}
		</div>
	</div>
{/if}

<style>
	.main-block {
		display: flex;
		border-bottom: 1px solid var(--color-dark-component-background);
	}

	:global(body.light-mode) .main-block {
		border-bottom: 1px solid var(--color-light-component-background);
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

	.code-block {
		margin-top: 1em;
		margin-bottom: 1em;
		border-radius: 5px;
		width: 100%;
		max-width: 85vw;
		box-sizing: border-box;
		border-top: 2px solid var(--color-dark-component-background);
		border-left: 2px solid var(--color-dark-component-background);
		border-right: 2px solid var(--color-dark-component-background);
		border-bottom: 1px solid var(--color-dark-component-background);
		overflow: auto;
	}

	:global(body.light-mode) .code-block {
		border-top: 2px solid var(--color-light-component-background);
		border-left: 2px solid var(--color-light-component-background);
		border-right: 2px solid var(--color-light-component-background);
		border-bottom: 1px solid var(--color-light-component-background);
	}

	pre {
		padding-left: 5px;
		margin: 0px;
		font-size: 12px;
		tab-size: 2;
		box-sizing: border-box;
		overflow: auto;
	}

	.code-context {
		position: sticky;
		left: 0px;
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.line-number {
		word-break: normal;
		position: sticky;
		left: 0px;
		font-size: 12px;
		border-right: 1px solid var(--color-dark-component-background);
		text-align: right;
		padding-left: 10px;
		padding-right: 10px;
		font-family: Roboto-Mono;
	}

	:global(body.light-mode) .line-number {
		border-right: 1px solid var(--color-light-component-background);
	}
</style>
