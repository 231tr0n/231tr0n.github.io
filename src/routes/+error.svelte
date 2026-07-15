<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — 231tr0n</title>
	<meta content="{page.status} — 231tr0n" property="og:title" />
	<meta content={page.url.href} property="og:url" />
	<meta name="twitter:title" content="{page.status} — 231tr0n" />
	<meta content="An error occurred — 231tr0n" property="og:description" />
	<meta name="twitter:description" content="An error occurred — 231tr0n" />
</svelte:head>

<div class="zeltron-error">{page.status} - {page.error?.message ?? 'Unknown error'}</div>
