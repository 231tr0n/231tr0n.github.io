<script>
  import Page from '$lib/components/page/Page.svelte';
  import Blogpost from './Blogpost.svelte';

  let blogPosts = [];

  let blogPostCreator = (name, badges, description, url) => {
    return {
      name,
      badges,
      description,
      url
    };
  };
  blogPosts.push(
    blogPostCreator('Me', ['introduction', 'about', 'me'], 'Introduction of who I am.', '/'),
    blogPostCreator(
      'Neovim configuration',
      ['neovim', 'configuration', 'lua'],
      'Brief introduction about my neovim configuration.',
      '/blog/config'
    )
  );
</script>

<Page>
  <h1>Blogs</h1>

  {#each blogPosts as blogPost}
    <Blogpost {...blogPost} />
  {/each}
</Page>
