<script>
	import Page from '$lib/components/page/Page.svelte';
	import { lightMode } from '$lib/store.svelte.js';
	import { onMount } from 'svelte';
	let statsImg = $state('');
	let darkStats =
		'https://github-readme-stats.vercel.app/api/top-langs/?username=231tr0n&layout=compact&&langs_count=100&theme=solarized-dark&hide_border=true&border_radius=0&disable_animations=true';
	let lightStats =
		'https://github-readme-stats.vercel.app/api/top-langs/?username=231tr0n&layout=compact&&langs_count=100&theme=solarized-light&hide_border=true&border_radius=0&disable_animations=true';
	statsImg = window.document.body.classList.contains('light-mode') ? lightStats : darkStats;
	onMount(() => {
		lightMode.subscribe((value) => {
			if (value) {
				statsImg.src = lightStats;
			} else {
				statsImg.src = darkStats;
			}
		});
	});
</script>

<Page scrollspy="true">
	<h1>Home</h1>

	<div class="center">
		<img src="/images/logo.avif" alt="Logo" class="zeltron" />
		<img src="/images/zeltron.avif" alt="Logo" class="zeltron" />
	</div>

	<h2>Introduction</h2>
	<ul>
		<li>
			Hello, my name is <span class="highlightkeyword">Srikar</span>
			also known as
			<span class="highlightkeyword">231tr0n</span>
			.
		</li>
		<li>I learn web development and security.</li>
		<li>I enjoy programming in go, java, python and javascript.</li>
		<li>I am a linux user who enjoys hacking it to the core.</li>
		<li>
			Ex team lead of <a target="_blank" href="https://bi0s.in">Bi0s</a>
			team's pentesting category.
		</li>
	</ul>

	<h2>Work Experience</h2>
	<ul>
		<li>
			<a target="_blank" href="https://www.opentext.com/">Opentext</a>
			<ul>
				<li>
					<span class="highlightkeyword">Associate Software Engineer</span>
					<br />
					Sep 2023 - Present
				</li>
				<li>
					<span class="highlightkeyword">Software Engineering Intern</span>
					<br />
					Feb 2023 - Aug 2023
				</li>
			</ul>
		</li>
	</ul>
	<ul>
		<li>
			<a target="_blank" href="https://bi0s.in/">bi0s</a>
			<ul>
				<li>
					<span class="highlightkeyword">Application Security Researcher</span>
					<br />
					Apr 2019 - Feb 2023
				</li>
			</ul>
		</li>
	</ul>
	<ul>
		<li>
			<a target="_blank" href="https://www.amrita.edu/center/create/">AmritaCREATE</a>
			<ul>
				<li>
					<span class="highlightkeyword">Machine Learning Intern</span>
					<br />
					May 2022 - Jun 2022
				</li>
			</ul>
		</li>
	</ul>

	<h2>Education</h2>
	<ul>
		<li>
			<a target="_blank" href="https://www.amrita.edu/campus/amritapuri/">
				Amrita Vishwa Vidyapeetam
			</a>
			<ul>
				<li>
					<span class="highlightkeyword">
						Bachelor of Technology in Computer Science and Engineering (Artificial Intelligence)
					</span>
					<br />
					Jul 2019 - May 2023
				</li>
			</ul>
		</li>
	</ul>

	<h2>Achievements</h2>
	<ol>
		<li>
			<a target="_blank" href="https://huntr.com/bounties/001d1c29-805a-4035-93bb-71a0e81da3e5">
				CVE-2022-0764
			</a>
		</li>
		<li>
			<a target="_blank" href="https://link.springer.com/chapter/10.1007/978-981-19-6088-8_32">
				Robust and Scalable Network Monitoring System using Apache Spark
			</a>
		</li>
	</ol>

	<h2>Tech Stack</h2>
	<div class="center">
		<a target="_blank" href="https://openjdk.org">
			<img class="logo" alt="Java" src="/images/java.avif" />
		</a>
		<a target="_blank" href="https://go.dev">
			<img class="logo" alt="Golang" src="/images/go.avif" />
		</a>
		<a target="_blank" href="https://www.python.org">
			<img class="logo" alt="Python" src="/images/python.avif" />
		</a>
		<a target="_blank" href="https://nodejs.org/en">
			<img class="logo" alt="Nodejs" src="/images/nodejs.avif" />
		</a>
		<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
			<img class="logo" alt="Javascript" src="/images/javascript.avif" />
		</a>
		<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML">
			<img class="logo" alt="Html" src="/images/html.avif" />
		</a>
		<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS">
			<img class="logo" alt="Css" src="/images/css.avif" />
		</a>
		<!-- <a target="_blank" href="https://gcc.gnu.org"> -->
		<!--   <img class="logo" alt="C" src="/images/c.avif" /> -->
		<!-- </a> -->
		<a target="_blank" href="https://www.docker.com">
			<img class="logo" alt="Docker" src="/images/docker.svg" />
		</a>
		<a target="_blank" href="https://git-scm.com">
			<img class="logo" alt="Git" src="/images/git.avif" />
		</a>
		<!-- <a target="_blank" href="https://www.php.net"> -->
		<!--   <img class="logo" alt="Php" src="/images/php.avif" /> -->
		<!-- </a> -->
		<a target="_blank" href="https://en.wikipedia.org/wiki/SQL">
			<img class="logo" alt="Sql" src="/images/sql.avif" />
		</a>
		<a target="_blank" href="https://kit.svelte.dev">
			<img class="logo" alt="Sveltekit" src="/images/sveltekit.avif" />
		</a>
		<!-- <a target="_blank" href="https://angular.dev"> -->
		<!-- 	<img class="logo" alt="Angular" src="/images/angular.svg" /> -->
		<!-- </a> -->
		<a target="_blank" href="https://www.gnu.org/software/bash">
			<img class="logo" alt="Bash" src="/images/bash.avif" />
		</a>
		<a target="_blank" href="https://en.wikipedia.org/wiki/Linux">
			<img class="logo" alt="Linux" src="/images/linux.avif" />
		</a>
		<a target="_blank" href="https://vimdoc.sourceforge.net/htmldoc">
			<img class="logo" alt="Vim" src="/images/vim.avif" />
		</a>
		<a target="_blank" href="https://www.lua.org">
			<img class="logo" alt="Lua" src="/images/lua.svg" />
		</a>
		<a target="_blank" href="https://www.microsoft.com/en-us/windows">
			<img class="logo" alt="Windows" src="/images/windows.avif" />
		</a>
		<br />
		<a target="_blank" href="https://en.wikipedia.org/wiki/Application_security">
			<img class="big-logo" alt="Application security" src="/images/webappsec.avif" />
		</a>
		<a
			target="_blank"
			href="https://cloud.google.com/learn/artificial-intelligence-vs-machine-learning">
			<img class="big-logo" alt="AI/ML" src="/images/ai.avif" />
		</a>
	</div>

	<h2>Github Language Statistics</h2>
	<div class="center flex-center">
		<a target="_blank" href="https://github.com/231tr0n">
			<img alt="Github stats" class="stats-img border-img" bind:this={statsImg} />
		</a>
	</div>

	<h2>Hobbies</h2>
	<div class="center">
		<div class="badge">Badminton</div>
		<div class="badge">Programming</div>
		<div class="badge">Cycling</div>
		<div class="badge">Chess</div>
		<div class="badge">Gaming</div>
		<div class="badge">Listening to music</div>
		<div class="badge">Watching movies and anime</div>
		<div class="badge">Solving rubik's cubes</div>
	</div>

	<h2>Developer Tools</h2>
	<h3>Operating Systems</h3>
	<div class="center">
		<a target="_blank" href="https://archlinux.org">
			<img class="logo" alt="Archlinux" src="/images/archlinux.avif" />
		</a>
		<a target="_blank" href="https://linuxmint.com">
			<img class="logo" alt="Linuxmint" src="/images/linuxmint.avif" />
		</a>
		<a target="_blank" href="https://ubuntu.com/download/desktop">
			<img class="logo" alt="Ubuntu" src="/images/ubuntu.avif" />
		</a>
		<a target="_blank" href="https://www.microsoft.com/en-us/windows">
			<img class="logo" alt="Windows" src="/images/windows.avif" />
		</a>
	</div>
	<h3>Text Editors</h3>
	<div class="center">
		<a target="_blank" href="https://neovim.io">
			<img class="logo" alt="Neovim" src="/images/neovim.avif" />
		</a>
		<a target="_blank" href="https://www.vim.org">
			<img class="logo" alt="Vim" src="/images/vim.avif" />
		</a>
		<a target="_blank" href="https://code.visualstudio.com">
			<img class="logo" alt="Vscode" src="/images/vscode.avif" />
		</a>
	</div>
	<h3>Desktop Environments and Window Managers</h3>
	<div class="center">
		<!-- <a target="_blank" href="https://i3wm.org"> -->
		<!-- 	<img class="logo" alt="i3" src="/images/i3.avif" /> -->
		<!-- </a> -->
		<a target="_blank" href="https://projects.linuxmint.com/cinnamon">
			<img class="logo" alt="Cinnamon" src="/images/cinnamon.avif" />
		</a>
		<!-- <a target="_blank" href="https://github.com/baskerville/bspwm"> -->
		<!-- 	<img class="logo" alt="Bspwm" src="/images/bspwm.avif" /> -->
		<!-- </a> -->
		<a target="_blank" href="https://github.com/swaywm/sway">
			<img class="logo" alt="Sway" src="/images/sway.svg" />
		</a>
		<a target="_blank" href="https://www.gnome.org">
			<img class="logo" alt="Gnome" src="/images/gnome.svg" />
		</a>
	</div>
	<h3>Shells</h3>
	<div class="center">
		<a target="_blank" href="https://www.gnu.org/software/bash">
			<img class="logo" alt="Bash" src="/images/bash.avif" />
		</a>
		<a target="_blank" href="https://fishshell.com">
			<img class="logo" alt="Fish" src="/images/fish.avif" />
		</a>
	</div>
</Page>

<style>
	.zeltron {
		height: 100px;
		width: 100px;
		margin-bottom: 1em;
	}

	.logo {
		padding: 2px;
		height: 40px;
		width: auto;
	}

	.big-logo {
		padding: 2px;
		height: 80px;
		width: auto;
	}

	.stats-img {
		background-color: var(--color-solarized-base03);
	}

	:global(body.light-mode) .stats-img {
		background-color: var(--color-solarized-base3);
	}
</style>
