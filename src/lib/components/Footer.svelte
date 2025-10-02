<footer class="flex-middle blur">
	<a target="_blank" href="mailto:zeltronsrikar@gmail.com">
		<img alt="Gmail" src="/images/gmail.svg" />
	</a>
	<a target="_blank" href="https://www.github.com/231tr0n">
		<img alt="Github" class="github" src="/images/github-dark.svg" />
	</a>
	<a target="_blank" href="https://www.gitlab.com/231tr0n">
		<img alt="Gitlab" src="/images/gitlab.svg" />
	</a>
	<a target="_blank" href="https://www.linkedin.com/in/231tr0n">
		<img alt="LinkedIn" src="/images/linkedin.svg" />
	</a>
	<a target="_blank" href="https://www.twitter.com/231tr0n">
		<img alt="Twitter" src="/images/twitter.svg" />
	</a>
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
		border-top: 1px solid var(--color-light-foreground);
	}

	:global(body.dark) footer {
		border-top: 1px solid var(--color-dark-foreground);
	}

	img {
		padding: 2px;
		margin-left: 2px;
		margin-right: 2px;
		width: 30px;
		height: 30px;
	}
</style>
