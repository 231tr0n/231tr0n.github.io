<script lang="ts">
	import { cacheKeyPrefix } from '#lib/constants/app.constants.js';

	const clearCache = () => {
		const keys = Object.keys(localStorage).filter((k) => k.startsWith(cacheKeyPrefix));
		keys.forEach((k) => {
			localStorage.removeItem(k);
		});
	};
</script>

<footer class="zeltron-body-background">
	<div class="links">
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
			class="delete-icon"
			fill="currentColor"
			viewBox="0 0 16 16"
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
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--layout-footer-height);
		box-sizing: border-box;
		z-index: var(--z-index-footer);
		border-top: 1px solid var(--color-component-background);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: clamp(2px, 1vw, 8px);
		padding: 0 clamp(2px, 2vw, 12px);
	}

	.links {
		display: flex;
		align-items: center;
		gap: clamp(0px, 0.5vw, 2px);
		flex-shrink: 0;
	}

	img,
	button {
		display: block;
		box-sizing: border-box;
		width: clamp(18px, 8vw, 26px);
		height: clamp(18px, 8vw, 26px);
		padding: 0;
		margin: 0;
		flex-shrink: 0;
		cursor: pointer;
	}

	.delete-icon {
		width: 100%;
		height: 100%;
	}
</style>
