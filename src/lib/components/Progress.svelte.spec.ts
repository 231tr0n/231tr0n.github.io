import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Progress from './Progress.svelte';

describe('Progress', () => {
	it('renders a labelled progress element', () => {
		render(Progress, { props: { value: 25, max: 100, label: 'Loading data' } });
		const progress = screen.getByRole('progressbar');
		expect(progress).toHaveAttribute('aria-label', 'Loading data');
		expect(progress).toHaveAttribute('max', '100');
		expect(Number(progress.getAttribute('value'))).toBe(25);
	});

	it('uses the default label and renders children', () => {
		const children = createRawSnippet(() => ({
			render: () => '<span>Loading fallback</span>'
		}));
		render(Progress, { props: { value: 1, max: 2, children } });
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Progress');
		expect(screen.getByText('Loading fallback')).toBeInTheDocument();
	});

	it('animates to an updated value', async () => {
		const { rerender } = render(Progress, { props: { value: 10, max: 100 } });
		const progress = screen.getByRole('progressbar');
		await vi.waitFor(() => {
			expect(Number(progress.getAttribute('value'))).toBe(10);
		});

		await rerender({ value: 75, max: 100 });
		await vi.waitFor(() => {
			expect(Number(progress.getAttribute('value'))).toBe(75);
		});
	});
});
