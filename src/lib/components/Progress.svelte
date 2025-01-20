<script>
	let { value = 0, max = 100, children } = $props();
</script>

<br />
<div>
	<progress {value} {max}>
		{@render children?.()}
	</progress>
</div>
<br />

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
