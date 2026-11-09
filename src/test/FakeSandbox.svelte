<script lang="ts">
	let {
		title = '',
		src = '',
		srcDoc = ''
	}: { title?: string; src?: string; srcDoc?: string } = $props();
</script>

<div data-testid="fake-sandbox">{title}:{srcDoc}:{src}</div>
