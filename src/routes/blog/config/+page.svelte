<script lang="ts">
	import Page from '$lib/components/Page.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Codeeditor from '$lib/components/Codeeditor.svelte';
	import luaMode from 'ace-code/src/mode/lua';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { cachedFetch } from '$lib/utils/fetch-cache.ts';

	let configData = $state<string | null>(null);
	let configError = $state<string | null>(null);

	onMount(async () => {
		try {
			configData = await cachedFetch(
				'https://raw.githubusercontent.com/231tr0n/config/main/nvim/init.lua'
			);
		} catch (error) {
			console.error('Failed to load config', error);
			configError = error instanceof Error ? error.message : 'Unknown error';
		}
	});

	const getSectionsInConfig = (data: string) => {
		const contents = data.split('\n\n');
		const map = new SvelteMap<string, string>();
		for (const block of contents) {
			const lines = block.split('\n');
			const heading = lines[0]?.substring(3);
			if (heading === undefined) continue;
			map.set(heading, lines.slice(1).join('\n'));
		}
		return map;
	};

	const getPluginsInConfig = (data: string) => {
		const plugins: string[] = [];
		const addRegex = /vim\.pack\.add\s*\(/g;
		let match;
		while ((match = addRegex.exec(data)) !== null) {
			let depth = 1;
			let pos = match.index + match[0].length;
			while (depth > 0 && pos < data.length) {
				if (data.at(pos) === '(') depth++;
				else if (data.at(pos) === ')') depth--;
				if (depth > 0) pos++;
			}
			const body = data.slice(match.index + match[0].length, pos);
			let braceDepth = 0;
			let lastKey: string | null = null;
			for (let i = 0; i < body.length; i++) {
				const ch = body.at(i);
				if (ch === undefined) continue;
				if (ch === '{' || ch === '}') {
					braceDepth += ch === '{' ? 1 : -1;
					lastKey = null;
				} else if (ch === ',') {
					lastKey = null;
				} else if (ch === '"') {
					const end = body.indexOf('"', i + 1);
					if (end === -1) break;
					const str = body.slice(i + 1, end);
					if (braceDepth === 0 || (braceDepth >= 1 && (lastKey === null || lastKey === 'src'))) {
						plugins.push(str);
					}
					i = end;
					lastKey = null;
				} else if (/[a-zA-Z_]/.test(ch)) {
					const start = i;
					while (i < body.length && /[\w]/.test(body.at(i) ?? '')) i++;
					lastKey = body.slice(start, i);
					i--;
				}
			}
		}
		return plugins;
	};
</script>

<Page scrollspy={true}>
	<h1>Neovim configuration</h1>
	<h2>Introduction</h2>
	<ul>
		<li>
			I was fascinated by <span class="zeltron-highlightkeyword">vim</span> from the time I was introduced
			to it by one of my professors in my university during my first year of bachelors.
		</li>
		<li>
			From not being able to <span class="zeltron-highlightkeyword">quit vim</span>
			during my first time resulting in me closing the terminal directly to becoming good at
			<span class="zeltron-highlightkeyword">vim keybinds</span>, it was quite a journey for me
			where I learnt a lot about how text editors generally work.
		</li>
		<li>
			Getting used to <span class="zeltron-highlightkeyword">vim keybinds</span>
			took me around one month of time and by the time I got good at it, I became interested in creating
			my own workflow using custom <span class="zeltron-highlightkeyword">vim script</span>
			and <span class="zeltron-highlightkeyword">vim keybinds</span>
			and wrote my first <span class="zeltron-highlightkeyword">vim configuration</span>
			using the
			<a href="https://github.com/231tr0n/config/blob/main/nvim/init.vim">.vimrc</a>
			in vimscript.
		</li>
		<li>
			I made sure my entire configuration is stuffed in just a single file so that I have the
			<span class="zeltron-highlightkeyword">flexibility to curl or wget</span> it anywhere.
		</li>
		<li>
			A while after that, I found out <span class="zeltron-highlightkeyword">neovim</span>
			which was gaining more attraction since it was multi-threaded unlike my current editor which was
			single threaded.
		</li>
		<li>
			<span class="zeltron-highlightkeyword">Neovim</span> also supported
			<span class="zeltron-highlightkeyword">lua</span> for configuring itself although I was a bit
			hesitant to learn a new language again after going through the pain of learning
			<span class="zeltron-highlightkeyword">vim script</span> which I felt was cryptic than your
			regular languages at that time and hence migrated my
			<span class="zeltron-highlightkeyword">.vimrc</span>
			to
			<span class="zeltron-highlightkeyword">init.vim</span>
			and did not use
			<span class="zeltron-highlightkeyword">lua</span>
			to configure it.
		</li>
		<li>
			Till then, I was using a basic <span class="zeltron-highlightkeyword">LSP</span>
			based auto completion setup with
			<a href="https://github.com/dense-analysis/ale">ALE</a>
			and later switched to
			<a href="https://github.com/prabirshrestha/vim-lsp">vim-lsp</a>.
		</li>
		<li>
			Once I secured my first job via campus placements and started working at an enterprise level,
			I quickly realised that my current auto completion setup was very slow since it was in <span
				class="zeltron-highlightkeyword">vim script</span>
			and the plugins which I was using were also in it.
		</li>
		<li>
			Additionally I also needed debuggers to debug stuff unlike before when I used to make do with
			print statements. Although there was a plugin for it like <a
				href="https://github.com/puremourning/vimspector">Vimspector</a>
			, I felt like dabbling anymore with
			<span class="zeltron-highlightkeyword">vim script</span>
			is not going to meet my needs.
		</li>
		<li>
			Hence, I made the decision to learn
			<span class="zeltron-highlightkeyword">lua</span>
			and wrote my first configuration using it with
			<span class="zeltron-highlightkeyword">LSP</span>
			and <span class="zeltron-highlightkeyword">DAP</span> integration.
		</li>
		<li>
			Since then, I became fairly decent at <span class="zeltron-highlightkeyword">lua</span>
			and wrote a basic configuration using the around 80+ plugins for supporting
			<span class="zeltron-highlightkeyword">LSP</span>
			and <span class="zeltron-highlightkeyword">DAP</span>
			and especially <span class="zeltron-highlightkeyword">Java</span>
			which was a pain to setup initially.
		</li>
		<li>
			Now came the <span class="zeltron-highlightkeyword">problem of performance</span>
			. On one hand I had 80+ plugins making my editor start with a delay of around one second since I
			did not do lazy loading as I wrote my initial configuration using the plugin manager
			<a href="https://github.com/savq/paq-nvim">Paq</a>
			for simplicity and it did not support lazy loading. On the other hand I had to deal with java files
			whose source code was more than 50000+ lines and the file sizes crossed 2MB making treesitter and
			plugins which depend on it very slow. Also most utility plugins I use were full of bloat which I
			never used.
		</li>
		<li>
			Then comes <a href="https://github.com/echasnovski/mini.nvim">mini.nvim</a>
			to save me from all this trouble. It provided many
			<span class="zeltron-highlightkeyword">utilities</span>
			which were not bloated and were pretty good at doing just the single thing they were meant to do.
		</li>
		<li>
			I slowly replaced many of my <span class="zeltron-highlightkeyword">utility plugins</span>
			with alternatives of it provided my
			<a href="https://github.com/echasnovski/mini.nvim">mini.nvim</a>
			. One of my biggest migrations was to integrate the plugin manager provided by it and lazy load
			configuration when possible reducing the editor's startup time.
		</li>
		<li>
			Finally I fixed all issues related to my configuration being <span
				class="zeltron-highlightkeyword">performant on very big files</span>
			. I did this by opening sqlite.c file from the sqlite3 source code which was a amalgamated file
			with 200000+ lines of code and the size of the file was 8MB+. Most of the issues I faced came from
			treesitter and completion plugins.
		</li>
		<li>
			After all these iterations of changing my editor's configuration, I ended up with around 50+
			plugins most of which are from <a href="https://github.com/echasnovski/mini.nvim"
				>mini.nvim</a>
			. The startup time of my configuration is less than 150ms and it works on files as big as 8MB without
			any delays thus achieving the <span class="zeltron-highlightkeyword">ideal state</span>
			which I always dreamt of.
		</li>
		<li>
			Since I have achieved my ideal state, <span class="zeltron-highlightkeyword"
				>I promised myself not to touch my editor's configuration unless necessary</span>
			. You can look at my github configuration commits to verify this claim.
		</li>
	</ul>
	<h2>Acknowledgement</h2>
	<p>
		I am really grateful to all <span class="zeltron-highlightkeyword"
			>neovim contributors, maintainers and plugin authors</span>
		who do such a great job of patching neovim, developing features in it and creating such high quality
		plugins.
	</p>
	<h2>Configuration</h2>
	{#if configError}
		<div class="zeltron-error">{configError}</div>
	{:else if configData}
		<h3>Plugins used in the configuration</h3>
		<ol>
			{#each getPluginsInConfig(configData) as plugin (plugin)}
				<li>
					<a
						href={/^https:\/\//.exec(plugin) ? plugin : `https://github.com/${plugin}`}
						rel="external">
						{plugin}
					</a>
				</li>
			{/each}
		</ol>
		<h3>Configuration split into meaningful chunks</h3>
		<ol>
			{#each getSectionsInConfig(configData) as [heading, block] (heading)}
				<li>{heading}</li>
				<Codeeditor
					code={block}
					fileName="init.lua"
					langName="lua"
					mode={luaMode}
					readOnly={true} />
			{/each}
		</ol>
	{:else}
		<Loading />
	{/if}
</Page>
