<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/css/main.css';

	let { children } = $props();
</script>

<Navbar />
<div class="background">
	<div class="body opacity"></div>
</div>
<main>
	{#if children}
		{@render children()}
	{:else}
		<div class="error">No children to render</div>
	{/if}
</main>
<Footer />

<style>
	.opacity {
		position: fixed;
		width: 100%;
		height: 100%;
		opacity: 80%;
		z-index: 2;
	}

	.background {
		background-image: url('/images/background.avif');
		background-position: center;
		background-repeat: no-repeat;
		filter: blur(0px);
		position: fixed;
		top: 45px;
		left: 0px;
		right: 0px;
		bottom: 45px;
		z-index: 1;
	}

	main {
		position: fixed;
		top: 45px;
		left: 0px;
		right: 0px;
		bottom: 45px;
		padding: 0px;
		margin: 0px;
		box-sizing: border-box;
		overflow: hidden;
		z-index: 3;
	}
</style>
