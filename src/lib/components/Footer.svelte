<footer class="zeltron-flex-middle zeltron-blur">
	<a href="mailto:zeltronsrikar@gmail.com" rel="noopener noreferrer" target="_blank">
		<img alt="Gmail" src="/images/gmail.svg" />
	</a>
	<a href="https://www.github.com/231tr0n" rel="noopener noreferrer" target="_blank">
		<img class="github" alt="Github" src="/images/github-dark.svg" />
	</a>
	<a href="https://www.gitlab.com/231tr0n" rel="noopener noreferrer" target="_blank">
		<img alt="Gitlab" src="/images/gitlab.svg" />
	</a>
	<a href="https://www.linkedin.com/in/231tr0n" rel="noopener noreferrer" target="_blank">
		<img alt="LinkedIn" src="/images/linkedin.svg" />
	</a>
	<a href="https://www.twitter.com/231tr0n" rel="noopener noreferrer" target="_blank">
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
