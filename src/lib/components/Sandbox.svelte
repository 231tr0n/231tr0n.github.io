<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { UIEventHandler } from 'svelte/elements';
	import { type Unsubscriber } from 'svelte/store';

	let { title = '', src = '', srcDocStore = null } = $props();

	let fullscreen = $state(false);
	let iframeElement = $state() as HTMLElement;
	let iframe = $state() as HTMLIFrameElement;
	let subscriber: Unsubscriber = () => {};
	let resetted = $state(false);

	let refreshIframe = (value: string) => {
		iframe.srcdoc = value;
		// Below line is used for triggering iframe reload by resetting src.
		iframe.src = iframe.src;
	};

	let reset = () => {
		refreshIframe('');
		resetted = true;
		setTimeout(() => {
			resetted = false;
		}, 2000);
	};

	let toggleFullscreen = () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			iframeElement.requestFullscreen();
		}
	};

	let resized: UIEventHandler<HTMLIFrameElement> = (element) => {
		element.currentTarget.style.height = '100%';
	};

	onMount(() => {
		if (title) {
			iframeElement.onfullscreenchange = () => {
				if (document.fullscreenElement) {
					fullscreen = true;
				} else {
					fullscreen = false;
				}
			};
		}

		if (srcDocStore) {
			subscriber = srcDocStore.subscribe((value: string) => {
				refreshIframe(value);
			});
		}
	});

	onDestroy(() => {
		subscriber?.();
	});
</script>

{#if title}
	<div class="flex-middle">
		<div bind:this={iframeElement} class="iframe thick-component-border body">
			<div class="filename iframe-context component">
				{title}
			</div>
			<div class="iframe-context component">
				<span>
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
					{#if srcDocStore}
						<button onclick={reset} aria-label="Reset">
							{#if !resetted}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									class="bi bi-bootstrap-reboot"
									viewBox="0 0 16 16">
									<path
										d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.8 6.8 0 0 0 1.16 8z" />
									<path
										d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324z" />
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									class="bi bi-check2"
									viewBox="0 0 16 16">
									<path
										d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
								</svg>
							{/if}
						</button>
					{/if}
				</span>
				<span>sandbox</span>
			</div>
			<iframe
				bind:this={iframe}
				onresize={resized}
				{title}
				allowfullscreen
				sandbox="allow-forms allow-modals allow-popups allow-scripts allow-downloads"
				{src}>
			</iframe>
		</div>
	</div>
{/if}

<style>
	.filename {
		border-bottom: 1px solid var(--color-dark-component-foreground);
	}

	:global(body.light-mode) .filename {
		border-bottom: 1px solid var(--color-light-component-foreground);
	}

	.iframe-context {
		padding: 5px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	svg {
		width: 16px;
		height: 16px;
	}

	.iframe {
		width: 100%;
		max-width: 85vw;
		margin-top: 1em;
		margin-bottom: 1em;
		box-sizing: border-box;
		height: calc(100vh - 10vh - 45px - 45px);
	}

	iframe {
		border: 0px;
		overflow: auto;
		width: 100%;
		height: calc(100% - 34px - 31px);
	}

	button {
		padding: 3px;
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}
</style>
