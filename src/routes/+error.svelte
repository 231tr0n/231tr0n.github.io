<script lang="ts">
	import { page } from '$app/state';

	const canonicalUrl = $derived(`${__SITE_URL__}${page.url.pathname}`);
</script>

<svelte:head>
	<meta content="{page.status} — 231tr0n" property="og:title" />
	<meta content={canonicalUrl} property="og:url" />
	<meta name="twitter:title" content="{page.status} — 231tr0n" />
	<meta
		content="An unexpected error occurred on 231tr0n. Try again later or contact the site owner."
		property="og:description" />
	<meta
		name="twitter:description"
		content="An unexpected error occurred on 231tr0n. Try again later or contact the site owner." />
</svelte:head>

<h1 class="zeltron-error">{page.status} - {page.error?.message ?? 'Unknown error'}</h1>
