import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PageHarness from '../../test/PageHarness.svelte';

const originalScrollBy = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollBy');

afterEach(() => {
	if (originalScrollBy) Object.defineProperty(HTMLElement.prototype, 'scrollBy', originalScrollBy);
	else Reflect.deleteProperty(HTMLElement.prototype, 'scrollBy');
	vi.restoreAllMocks();
});

describe('Page', () => {
	it('renders its content and background', () => {
		const { container } = render(PageHarness);
		expect(screen.getByRole('heading', { name: 'Page title' })).toBeInTheDocument();
		expect(screen.getByText('Page body')).toBeInTheDocument();
		expect(container.querySelector('.zeltron-body-background.zeltron-border')).toBeInTheDocument();
	});

	it('renders a scrollspy and scrolls to a selected section', async () => {
		const scrollBy = vi.fn();
		Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
			configurable: true,
			value: scrollBy
		});
		render(PageHarness, { props: { scrollspy: true } });

		const section = document.querySelectorAll('h2')[1];
		if (!section) throw new Error('Missing section');
		section.getBoundingClientRect = () =>
			({
				top: 120,
				bottom: 120,
				left: 0,
				right: 0,
				width: 0,
				height: 0,
				x: 0,
				y: 0,
				toJSON: () => ({})
			}) as DOMRect;

		const context = await screen.findByRole('button', {
			name: /Select item, current: Page title/
		});
		context.click();
		const second = await screen.findByRole('button', { name: 'Second section' });
		second.click();

		await vi.waitFor(() => {
			expect(scrollBy).toHaveBeenCalledWith(0, 105);
		});
	});

	it('updates the scrollspy section on scroll', async () => {
		render(PageHarness, { props: { scrollspy: true } });
		await screen.findByRole('button', { name: /Select item, current: Page title/ });
		const page = document.querySelector('.page');
		if (!(page instanceof HTMLElement)) throw new Error('Missing page scroller');

		const headings = document.querySelectorAll('h1, h2');
		headings.forEach((heading, index) => {
			const top = index === 0 ? 0 : index === 1 ? 10 : 1000;
			heading.getBoundingClientRect = () =>
				({
					top,
					bottom: top,
					left: 0,
					right: 0,
					width: 0,
					height: 0,
					x: 0,
					y: top,
					toJSON: () => ({})
				}) as DOMRect;
		});

		page.dispatchEvent(new Event('scroll'));
		await vi.waitFor(() => {
			expect(screen.getByRole('button')).toHaveAccessibleName(
				'Select item, current: First section'
			);
		});
	});
});
