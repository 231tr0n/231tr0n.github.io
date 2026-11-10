import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Post from './Post.svelte';
import type { PostData } from '#lib/types/index.js';

const post: PostData = {
	name: 'Ludo',
	url: 'https://example.com/ludo',
	description: 'A local multiplayer Ludo game.',
	badges: ['javascript', 'html', 'css'],
	external: true,
	open: true
};

describe('Post', () => {
	it('renders badges, description and an external link', () => {
		render(Post, { props: { post } });
		expect(screen.getByRole('heading', { name: 'Ludo' })).toBeInTheDocument();
		expect(screen.getByText('javascript')).toBeInTheDocument();
		expect(screen.getByText('html')).toBeInTheDocument();
		expect(screen.getByText('css')).toBeInTheDocument();
		expect(screen.getByText('A local multiplayer Ludo game.')).toBeInTheDocument();
		const link = screen.getByRole('link', { name: 'Open' });
		expect(link).toHaveAttribute('href', 'https://example.com/ludo');
		expect(link).toHaveAttribute('rel', 'external');
	});

	it('renders an internal post link', () => {
		render(Post, {
			props: {
				post: { ...post, external: false, url: '/games/ludo', open: false }
			}
		});
		expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/games/ludo');
		expect(screen.queryByText('javascript')).not.toBeInTheDocument();
	});
});
