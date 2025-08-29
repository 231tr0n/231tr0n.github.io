<script lang="ts">
	let { value = 0, max = 100, children = null } = $props();
</script>

<br />
<div class="flex-middle">
	<progress {value} {max}>
		{@render children?.()}
	</progress>
</div>
<br />
