import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { selectPaddingOffset } from '#lib/constants/app.constants.js';
import Select from './Select.svelte';

const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');

afterEach(() => {
	if (originalClientWidth)
		Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth);
	else Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
});

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
		expect(document.querySelector('.measure')).toBeNull();
		expect(context.querySelector('.select-label')).toHaveTextContent('Two');

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

	it('supports an empty item and reports its shifted index', async () => {
		const onSelect = vi.fn();
		render(Select, {
			props: {
				items: ['One'],
				emptyItem: true,
				currentItem: 0,
				colored: false,
				fixedWidth: true,
				onSetSelectedItem: onSelect
			}
		});
		const context = screen.getByRole('button', { name: /Select item, current:/ });
		context.click();
		await vi.waitFor(() => {
			expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
		});
		screen.getByRole('button', { name: 'One' }).click();
		expect(onSelect).toHaveBeenCalledWith(1);
		await vi.waitFor(() => {
			expect(screen.queryByRole('button', { name: 'One' })).not.toBeInTheDocument();
		});
	});

	it('allows a null selection callback', async () => {
		render(Select, {
			props: {
				items: ['One'],
				currentItem: 0,
				colored: false,
				fixedWidth: true,
				onSetSelectedItem: null
			}
		});
		const context = screen.getByRole('button', { name: /Select item, current: One/ });
		context.click();
		await vi.waitFor(() => {
			expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
		});
		screen.getByRole('button', { name: 'One' }).click();
		await vi.waitFor(() => {
			expect(screen.queryByRole('button', { name: 'One' })).not.toBeInTheDocument();
		});
	});

	it('measures and updates the width for the longest item', async () => {
		const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
		Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
			configurable: true,
			get(this: HTMLElement) {
				return (this.textContent?.length ?? 0) * 8;
			}
		});
		const props = {
			items: ['Longer item', 'Short'],
			currentItem: 0,
			colored: false,
			fixedWidth: false,
			onSetSelectedItem: vi.fn()
		};
		const { rerender } = render(Select, { props });
		const measure = document.querySelector<HTMLElement>('.measure');
		expect(measure?.textContent).toBe('Longer item');
		const context = screen.getByRole('button', { name: /Select item/ });
		expect(context).toHaveStyle({ width: `${String(11 * 8 + selectPaddingOffset)}px` });

		await rerender({ ...props, items: ['A much longer item', 'Short'] });
		await vi.waitFor(() => {
			expect(context).toHaveStyle({ width: `${String(18 * 8 + selectPaddingOffset)}px` });
		});
		if (original) Object.defineProperty(HTMLElement.prototype, 'clientWidth', original);
		else Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
	});
});
