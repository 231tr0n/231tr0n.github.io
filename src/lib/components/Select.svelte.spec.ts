import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { selectPaddingOffset } from '#lib/constants/app.constants.js';
import Select from './Select.svelte';

describe('Select', () => {
	it('opens, selects an item and closes', async () => {
		const onSelect = vi.fn();
		render(Select, {
			props: {
				items: ['One', 'Two', 'Three'],
				currentItem: 1,
				colored: true,
				fixedWidth: true,
				onSetSelectedItem: onSelect
			}
		});
		const context = screen.getByRole('button', { name: /Select item, current: Two/ });
		expect(context).toHaveClass('zeltron-strong-component');

		context.click();
		await vi.waitFor(() => {
			expect(context).toHaveAttribute('aria-expanded', 'true');
		});
		screen.getByRole('button', { name: 'Three' }).click();
		expect(onSelect).toHaveBeenCalledWith(2);
		await vi.waitFor(() => {
			expect(screen.queryByRole('button', { name: 'Three' })).not.toBeInTheDocument();
		});
	});

	it('supports an empty item and a null callback', async () => {
		render(Select, {
			props: {
				items: ['One'],
				emptyItem: true,
				currentItem: 0,
				colored: false,
				fixedWidth: true,
				onSetSelectedItem: null
			}
		});
		const context = screen.getByRole('button', { name: /Select item, current:/ });
		context.click();
		await vi.waitFor(() => {
			expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
		});
		screen.getByRole('button', { name: 'One' }).click();
		await vi.waitFor(() => {
			expect(screen.queryByRole('button', { name: 'One' })).not.toBeInTheDocument();
		});
	});

	it('renders a width measurement when not fixed width', () => {
		render(Select, {
			props: {
				items: ['Longer item', 'Short'],
				currentItem: 0,
				colored: false,
				fixedWidth: false,
				onSetSelectedItem: vi.fn()
			}
		});
		const measure = document.querySelector<HTMLElement>('.measure');
		expect(measure).toBeInTheDocument();
		expect(measure?.textContent).toBe('Longer item');
		expect(screen.getByRole('button', { name: /Select item/ })).toHaveStyle({
			width: `${String(Math.ceil(measure?.clientWidth ?? 0) + selectPaddingOffset)}px`
		});
	});
});
