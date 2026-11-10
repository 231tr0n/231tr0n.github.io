<script lang="ts">
	import Frame from '#lib/components/Frame.svelte';

	const noop = (_fullscreen: boolean) => undefined;

	let {
		onFullscreenChange = noop
	}: {
		onFullscreenChange?: (fullscreen: boolean) => void;
	} = $props();
</script>

<Frame
	caption="Caption"
	contextLabel="Context"
	frameClass="test-frame"
	label="Test frame"
	{onFullscreenChange}>
	{#snippet toolbar({ toggleFullscreen, fullscreen })}
		<button onclick={toggleFullscreen} type="button">
			Toggle {fullscreen === true ? 'off' : 'on'}
		</button>
	{/snippet}
	<p>Frame body</p>
</Frame>
