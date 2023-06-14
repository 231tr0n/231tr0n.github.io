<script>
  import { fly } from "svelte/transition";
  let start = false;
  let screenwidth = 0;
  let screenheight = 0;
  setTimeout(function () {
    start = true;
  }, 1000);
</script>

<svelte:head>
  <link rel="preload" href="/images/go.png" as="image" crossorigin />
  <link rel="preload" href="/images/python.png" as="image" crossorigin />
  <link rel="preload" href="/images/nodejs.png" as="image" crossorigin />
  <link rel="preload" href="/images/javascript.png" as="image" crossorigin />
  <link rel="preload" href="/images/html.png" as="image" crossorigin />
  <link rel="preload" href="/images/css.png" as="image" crossorigin />
  <link rel="preload" href="/images/c.png" as="image" crossorigin />
  <link rel="preload" href="/images/docker.svg" as="image" crossorigin />
  <link rel="preload" href="/images/git.png" as="image" crossorigin />
  <link rel="preload" href="/images/php.png" as="image" crossorigin />
  <link rel="preload" href="/images/sql.png" as="image" crossorigin />
  <link rel="preload" href="/images/sveltekit.png" as="image" crossorigin />
  <link rel="preload" href="/images/java.png" as="image" crossorigin />
  <link rel="preload" href="/images/bash.png" as="image" crossorigin />
  <link rel="preload" href="/images/linux.png" as="image" crossorigin />
  <link rel="preload" href="/images/windows.png" as="image" crossorigin />
  <link rel="preload" href="/images/archlinux.png" as="image" crossorigin />
  <link rel="preload" href="/images/linuxmint.png" as="image" crossorigin />
  <link rel="preload" href="/images/neovim.png" as="image" crossorigin />
  <link rel="preload" href="/images/vim.png" as="image" crossorigin />
  <link rel="preload" href="/images/vscode.png" as="image" crossorigin />
</svelte:head>

<svelte:window bind:innerWidth={screenwidth} bind:innerHeight={screenheight} />

{#if start}
  <div class="intro" transition:fly={{ duration: 1000, y: screenheight }}>
    <div class="wrap">
      <div class="textwrapper">
        <div class="centeredcontent"><span class="highlight">About</span></div>
      </div>
      <p>
        Hello, my name is <span class="highlightname">Srikar</span>
        also known as <span class="highlightname">231tr0n</span>.
      </p>
      <p>I learn web development and security.</p>
      <p>I enjoy programming in go, python and javascript.</p>
      <p>I am a linux user who enjoys hacking it to the core.</p>
    </div>

    <hr />

    <div class="wrap">
      <div class="textwrapper">
        <div class="centeredcontent">
          <span class="highlight">Hobbies</span>
        </div>
      </div>
      <div class="textwrapper">
        <ol>
          <li>Badminton</li>
          <li>Programming</li>
          <li>Cycling</li>
          <li>Chess</li>
          <li>Gaming</li>
          <li>Listening to music</li>
          <li>Watching movies and anime</li>
        </ol>
      </div>
      <p>Playing video games like CS:GO and LoL is my favourite pastime.</p>
    </div>

    <hr />

    <div class="wrap">
      <div class="textwrapper">
        <div class="centeredcontent">
          <span class="highlight">Skills</span>
        </div>
      </div>
      <div class="textwrapper">
        <div class="centeredcontent">
          <a target="_blank" href="https://go.dev">
            <img alt="Golang" src="/images/go.png" />
          </a>
          <a target="_blank" href="https://www.python.org">
            <img alt="Python" src="/images/python.png" />
          </a>
          <a target="_blank" href="https://nodejs.org/en">
            <img alt="Nodejs" src="/images/nodejs.png" />
          </a>
          <a
            target="_blank"
            href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
          >
            <img alt="Javascript" src="/images/javascript.png" />
          </a>
          <a
            target="_blank"
            href="https://developer.mozilla.org/en-US/docs/Web/HTML"
          >
            <img alt="Html" src="/images/html.png" />
          </a>
          <a
            target="_blank"
            href="https://developer.mozilla.org/en-US/docs/Web/CSS"
          >
            <img alt="Css" src="/images/css.png" />
          </a>
          <a target="_blank" href="https://gcc.gnu.org">
            <img alt="C" src="/images/c.png" />
          </a>
          <a target="_blank" href="https://www.docker.com">
            <img alt="Docker" src="/images/docker.svg" />
          </a>
          <a target="_blank" href="https://git-scm.com">
            <img alt="Git" src="/images/git.png" />
          </a>
          <a target="_blank" href="https://www.php.net">
            <img alt="Php" src="/images/php.png" />
          </a>
          <a target="_blank" href="https://en.wikipedia.org/wiki/SQL">
            <img alt="Sql" src="/images/sql.png" />
          </a>
          <a target="_blank" href="https://kit.svelte.dev">
            <img alt="Sveltekit" src="/images/sveltekit.png" />
          </a>
          <a target="_blank" href="https://openjdk.org">
            <img alt="Java" src="/images/java.png" />
          </a>
          <a target="_blank" href="https://www.gnu.org/software/bash">
            <img alt="Bash" src="/images/bash.png" />
          </a>
          <a target="_blank" href="https://en.wikipedia.org/wiki/Linux">
            <img alt="Linux" src="/images/linux.png" />
          </a>
          <a target="_blank" href="https://www.microsoft.com/en-us/windows">
            <img alt="Windows" src="/images/windows.png" />
          </a>
        </div>
      </div>
      <p>
        I am also confident in web application security, automation for web
        applications and following secure coding practices.
      </p>
    </div>

    <hr />

    <div class="wrap">
      <div class="textwrapper">
        <div class="centeredcontent">
          <span class="highlight">Developer Setup</span>
        </div>
      </div>
      <div class="textwrapper">
        <div class="heading">
          <span class="highlight">Operating systems</span>
        </div>
        <div class="centeredcontent">
          <a target="_blank" href="https://archlinux.org">
            <img alt="Archlinux" src="/images/archlinux.png" />
          </a>
          <a target="_blank" href="https://linuxmint.com">
            <img alt="Linuxmint" src="/images/linuxmint.png" />
          </a>
          <a target="_blank" href="https://www.microsoft.com/en-us/windows">
            <img alt="Windows" src="/images/windows.png" />
          </a>
        </div>
      </div>
      <div class="textwrapper">
        <div class="heading">
          <span class="highlight">Text Editors</span>
        </div>
        <div class="centeredcontent">
          <a target="_blank" href="https://neovim.io">
            <img alt="Neovim" src="/images/neovim.png" />
          </a>
          <a target="_blank" href="https://www.vim.org">
            <img alt="Vim" src="/images/vim.png" />
          </a>
          <a target="_blank" href="https://code.visualstudio.com">
            <img alt="Vscode" src="/images/vscode.png" />
          </a>
        </div>
      </div>
    </div>

    <hr />

    <div class="wrap">
      <div class="textwrapper">
        <div class="centeredcontent">
          <span class="highlight">Projects</span>
        </div>
      </div>
      <div class="textwrapper">
        <ol>
          <li>
            <a target="_blank" href="https://github.com/231tr0n/nodejs-proxy"
              >Proxy Server in Nodejs</a
            >
          </li>
          <li>
            <a target="_blank" href="https://github.com/231tr0n/vault"
              >A simple password vault</a
            >
          </li>
          <li>
            <a target="_blank" href="https://github.com/231tr0n/crypto-project"
              >Cryptography based vulnerabilities</a
            >
          </li>
          <li>
            <a target="_blank" href="https://github.com/231tr0n/pentest-bot"
              >Discord Bot</a
            >
          </li>
          <li>
            <a target="_blank" href="https://231tr0n.github.io"
              >Personal Website</a
            >
          </li>
          <li>
            <a target="_blank" href="https://github.com/231tr0n/config"
              >Dotfiles</a
            >
          </li>
          <li>
            <a
              target="_blank"
              href="https://github.com/231tr0n/custom-go-router"
              >Custom HTTP Router</a
            >
          </li>
          <li>
            <a
              target="_blank"
              href="https://github.com/231tr0n/reinforcement-learning-for-snake-game"
              >Snake Game in Python using Q-Learning</a
            >
          </li>
          <li>
            <a
              target="_blank"
              href="https://github.com/231tr0n/reinforcement-learning-for-pingpong"
              >Ping Pong Game using Q-Learning</a
            >
          </li>
          <li>
            <a target="_blank" href="https://github.com/231tr0n/fyp"
              >Chatbot with Indian Sign Language Recognition System</a
            >
          </li>
          <li>
            <a
              target="_blank"
              href="https://github.com/231tr0n/hamiltonian-path-in-a-graph"
              >Finding Hamiltonian Path in a Graph</a
            >
          </li>
        </ol>
      </div>
    </div>

    <hr />

    <div class="wrap">
      <div class="textwrapper">
        <div class="centeredcontent">
          <span class="highlight">Achievements</span>
        </div>
      </div>
      <div class="textwrapper">
        <ol>
          <li>
            Ex team lead of <a target="_blank" href="https://bi0s.in"> Bi0s </a>
            club's pentesting category.
          </li>
          <li>
            Found a <a
              target="_blank"
              href="https://huntr.dev/bounties/001d1c29-805a-4035-93bb-71a0e81da3e5"
            >
              CVE-2022-0764
            </a> in Strapi CMS.
          </li>
          <li>
            Published a paper on <a
              target="_blank"
              href="https://link.springer.com/chapter/10.1007/978-981-19-6088-8_32"
            >
              Robust and Scalable Network Monitoring System Using Apache Spark</a
            >.
          </li>
        </ol>
      </div>
    </div>
  </div>
{/if}

<style>
  a {
    text-decoration: none;
    color: darkcyan;
  }

  a:hover {
    text-decoration: underline;
  }

  .intro {
    display: grid;
    grid-template-columns: auto;
    grid-auto-rows: max-content;
    justify-items: center;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .wrap {
    max-width: 80%;
    height: max-content;
  }

  .heading {
    padding-bottom: 10px;
    width: 100%;
    text-align: center;
  }

  .centeredcontent {
    width: 100%;
    text-align: center;
  }

  li {
    padding-right: 10px;
  }

  .textwrapper {
    display: block;
    margin-bottom: 1em;
    margin-left: 0;
    margin-right: 0;
    margin-top: 1em;
    text-align: justify;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 5px;
    font-size: 15px;
    background-color: var(--color-dark-component);
    color: var(--color-dark-foreground);
  }

  img {
    padding: 4px;
    height: 40px;
    width: auto;
    border: 0px;
  }

  img:hover {
    border: 2px solid darkcyan;
  }

  hr {
    width: 80%;
  }

  p {
    text-align: justify;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 5px;
    font-size: 15px;
    background-color: var(--color-dark-component);
    color: var(--color-dark-foreground);
  }

  .highlightname {
    color: green;
    font-weight: bold;
  }

  .highlight {
    color: orange;
    font-weight: bold;
  }

  :global(body.light-mode) .highlight {
    color: brown;
  }

  :global(body.light-mode) p {
    background-color: var(--color-light-component);
    color: var(--color-light-foreground);
  }

  :global(body.light-mode) .textwrapper {
    background-color: var(--color-light-component);
    color: var(--color-light-foreground);
  }
</style>
