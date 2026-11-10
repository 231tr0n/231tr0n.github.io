<script lang="ts">
	let {
		fileName = '',
		setCode = null
	}: {
		fileName?: string;
		setCode?: ((code: string) => void) | null;
	} = $props();
</script>

<div data-testid="fake-codeeditor">
	<span>{fileName}</span>
	{#if setCode}
		<button onclick={() => setCode('new html')} type="button">Fake run</button>
	{/if}
</div>
