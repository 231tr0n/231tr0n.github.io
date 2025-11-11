<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="zeltron-error">{page.status}: {page.error?.message}</div>
