<script>
  import Page from '$lib/components/page/Page.svelte';
</script>

<svelte:head>
  <link rel="preload" as="image" type="image/avif" href="/images/zeltron.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/logo.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/go.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/python.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/nodejs.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/javascript.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/html.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/css.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/c.avif" />
  <link rel="preload" as="image" type="image/svg+xml" href="/images/docker.svg" />
  <link rel="preload" as="image" type="image/avif" href="/images/git.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/php.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/sql.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/sveltekit.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/java.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/bash.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/linux.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/windows.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/webappsec.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/ai.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/linuxmint.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/archlinux.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/ubuntu.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/neovim.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/vim.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/vscode.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/i3.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/cinnamon.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/bspwm.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/fish.avif" />
  <link rel="preload" as="image" type="image/avif" href="/images/lua.svg" />
</svelte:head>

<Page scrollspy="true">
  <h1>Home</h1>

  <div class="center">
    <img src="/images/logo.avif" alt="Logo" class="zeltron" />
    <img src="/images/zeltron.avif" alt="Logo" class="zeltron" />
  </div>

  <h2>Stuff about me</h2>
  <ul>
    <li>
      Hello, my name is <span class="highlightkeyword">Srikar</span>
      also known as <span class="highlightkeyword">231tr0n</span>.
    </li>
    <li>I learn web development and security.</li>
    <li>I enjoy programming in go, python and javascript.</li>
    <li>I am a linux user who enjoys hacking it to the core.</li>
    <li>
      Ex team lead of <a target="_blank" href="https://bi0s.in">Bi0s</a>
      club's pentesting category.
    </li>
  </ul>

  <h2>Stuff I usually do</h2>
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

  <h2>Hacking stuff on my name</h2>
  <ol>
    <li>
      <a target="_blank" href="https://huntr.com/bounties/001d1c29-805a-4035-93bb-71a0e81da3e5">
        CVE-2022-0764
      </a>
    </li>
  </ol>

  <h2>Stuff on my name</h2>
  <ol>
    <li>
      <a target="_blank" href="https://link.springer.com/chapter/10.1007/978-981-19-6088-8_32">
        Robust and Scalable Network Monitoring System using Apache Spark</a
      >
    </li>
  </ol>

  <h2>Stuff I touched in my life</h2>
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
    <a target="_blank" href="https://angular.dev">
      <img class="logo" alt="Angular" src="/images/angular.svg" />
    </a>
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
    </a><br />
    <a target="_blank" href="https://en.wikipedia.org/wiki/Application_security">
      <img class="big-logo" alt="Application security" src="/images/webappsec.avif" />
    </a>
    <a
      target="_blank"
      href="https://cloud.google.com/learn/artificial-intelligence-vs-machine-learning"
    >
      <img class="big-logo" alt="AI/ML" src="/images/ai.avif" />
    </a>
  </div>

  <h2>Stuff in which I do stuff</h2>
  <h3>Operating systems</h3>
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
    <a target="_blank" href="https://i3wm.org">
      <img class="logo" alt="i3" src="/images/i3.avif" />
    </a>
    <a target="_blank" href="https://projects.linuxmint.com/cinnamon">
      <img class="logo" alt="Cinnamon" src="/images/cinnamon.avif" />
    </a>
    <a target="_blank" href="https://github.com/baskerville/bspwm">
      <img class="logo" alt="Bspwm" src="/images/bspwm.avif" />
    </a>
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
    border-radius: 50%;
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
</style>
