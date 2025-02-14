<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="error">{page.status}: {page.error?.message}</div>
