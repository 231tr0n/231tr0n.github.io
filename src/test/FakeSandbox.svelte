<script lang="ts">
	let {
		title = '',
		src = '',
		srcDoc = '',
		allowSameOrigin = false
	}: { title?: string; src?: string; srcDoc?: string; allowSameOrigin?: boolean } = $props();
</script>

<div data-allow-same-origin={allowSameOrigin} data-testid="fake-sandbox">
	{title}:{srcDoc}:{src}
</div>
