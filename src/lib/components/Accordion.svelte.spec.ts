import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Accordion from './Accordion.svelte';

const children = createRawSnippet(() => ({
	render: () => '<p>Accordion content</p>'
}));

describe('Accordion', () => {
	it('starts closed and toggles open', async () => {
		render(Accordion, { props: { name: 'Section', children } });
		const toggle = screen.getByRole('button', { name: 'Accordion summary toggler' });
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByText('Accordion content')).not.toBeInTheDocument();

		await toggle.click();
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByText('Accordion content')).toBeInTheDocument();
		const controlled = toggle.getAttribute('aria-controls');
		expect(controlled).toBeTruthy();
		expect(document.getElementById(controlled ?? '')).toBeInTheDocument();

		await toggle.click();
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await vi.waitFor(() => {
			expect(screen.queryByText('Accordion content')).not.toBeInTheDocument();
		});
	});

	it('can start open and render an external link', () => {
		render(Accordion, {
			props: {
				name: 'External',
				children,
				open: true,
				external: true,
				url: 'https://example.com'
			}
		});
		expect(screen.getByText('Accordion content')).toBeInTheDocument();
		const link = screen.getByRole('link', { name: 'Open' });
		expect(link).toHaveAttribute('href', 'https://example.com');
		expect(link).toHaveAttribute('rel', 'external');
	});

	it('resolves internal links through the path helper', () => {
		render(Accordion, {
			props: {
				name: 'Internal',
				children,
				url: '/games/ludo'
			}
		});
		expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/games/ludo');
	});
});
