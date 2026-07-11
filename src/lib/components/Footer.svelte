<script lang="ts">
	import { cacheKeyPrefix } from '$lib/constants/app.constants';

	const clearCache = () => {
		const keys = Object.keys(localStorage).filter((k) => k.startsWith(cacheKeyPrefix));
		keys.forEach((k) => {
			localStorage.removeItem(k);
		});
	};
</script>

<footer class="zeltron-body-background">
	<div>
		<a href="mailto:zeltronsrikar@gmail.com">
			<img alt="Gmail" src="/images/gmail.svg" />
		</a>
		<a href="https://www.github.com/231tr0n">
			<img class="github" alt="Github" src="/images/github-dark.svg" />
		</a>
		<a href="https://codeberg.org/231tr0n">
			<img alt="Codeberg" src="/images/codeberg.svg" />
		</a>
		<a href="https://www.gitlab.com/231tr0n">
			<img alt="Gitlab" src="/images/gitlab.svg" />
		</a>
		<a href="https://www.linkedin.com/in/231tr0n">
			<img alt="LinkedIn" src="/images/linkedin.svg" />
		</a>
		<a href="https://www.twitter.com/231tr0n">
			<img alt="Twitter" src="/images/twitter.svg" />
		</a>
	</div>
	<button
		class="zeltron-strong-component"
		aria-label="Clear cache"
		onclick={clearCache}
		type="button">
		<svg
			fill="currentColor"
			height="20"
			viewBox="0 0 16 16"
			width="20"
			xmlns="http://www.w3.org/2000/svg">
			<path
				d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
			<path
				d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
		</svg>
	</button>
</footer>

<style>
	.github {
		content: url('/images/github-dark.svg');
	}

	:global(body.dark) .github {
		content: url('/images/github-light.svg');
	}

	footer {
		position: fixed;
		bottom: 0px;
		left: 0px;
		right: 0px;
		height: 45px;
		box-sizing: border-box;
		z-index: 7;
		border-top: 1px solid var(--color-component-background);
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
	}

	img,
	button {
		padding: 1px;
		margin: 0 1px;
		width: 26px;
		height: 26px;
		cursor: pointer;
	}

	button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		border: none;
	}
</style>
