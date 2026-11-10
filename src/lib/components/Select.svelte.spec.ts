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
		screen.getByRole('option', { name: 'Three' }).click();
		expect(onSelect).toHaveBeenCalledWith(2);
		await vi.waitFor(() => {
			expect(screen.queryByRole('option', { name: 'Three' })).not.toBeInTheDocument();
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
			expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument();
		});
		screen.getByRole('option', { name: 'One' }).click();
		await vi.waitFor(() => {
			expect(screen.queryByRole('option', { name: 'One' })).not.toBeInTheDocument();
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
	it('supports keyboard navigation and selection', async () => {
		const onSelect = vi.fn();
		render(Select, {
			props: {
				items: ['One', 'Two', 'Three'],
				currentItem: 1,
				colored: false,
				fixedWidth: true,
				onSetSelectedItem: onSelect
			}
		});
		const trigger = screen.getByRole('button', { name: /Select item, current: Two/ });
		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await vi.waitFor(() => {
			expect(screen.getByRole('option', { name: 'Two' })).toHaveFocus();
		});
		const two = screen.getByRole('option', { name: 'Two' });
		two.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		expect(screen.getByRole('option', { name: 'Three' })).toHaveFocus();
		screen
			.getByRole('option', { name: 'Three' })
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(onSelect).toHaveBeenCalledWith(2);
		await vi.waitFor(() => {
			expect(screen.queryByRole('option', { name: 'Three' })).not.toBeInTheDocument();
		});
		expect(trigger).toHaveFocus();
	});

	it('closes on Escape and outside pointer input', async () => {
		render(Select, {
			props: {
				items: ['One', 'Two'],
				currentItem: 0,
				colored: false,
				fixedWidth: true,
				onSetSelectedItem: vi.fn()
			}
		});
		const trigger = screen.getByRole('button', { name: /Select item/ });
		trigger.click();
		await vi.waitFor(() => {
			expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument();
		});
		screen
			.getByRole('option', { name: 'One' })
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await vi.waitFor(() => {
			expect(screen.queryByRole('option', { name: 'One' })).not.toBeInTheDocument();
		});

		trigger.click();
		await vi.waitFor(() => {
			expect(screen.getByRole('option', { name: 'One' })).toBeInTheDocument();
		});
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await vi.waitFor(() => {
			expect(screen.queryByRole('option', { name: 'One' })).not.toBeInTheDocument();
		});
	});
	it('supports Home, End, Space, and Tab focus restore', async () => {
		const onSelect = vi.fn();
		render(Select, {
			props: {
				items: ['One', 'Two', 'Three'],
				currentItem: 0,
				colored: false,
				fixedWidth: true,
				onSetSelectedItem: onSelect
			}
		});
		const trigger = screen.getByRole('button', { name: /Select item, current: One/ });
		expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
		expect(trigger).not.toHaveAttribute('aria-controls');
		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		await vi.waitFor(() => {
			expect(screen.getByRole('option', { name: 'One' })).toHaveFocus();
		});
		expect(trigger).toHaveAttribute('aria-controls');
		const listbox = screen.getByRole('listbox');
		expect(listbox).toHaveAttribute('aria-labelledby', trigger.id);

		const end = () => screen.getByRole('option', { name: 'Three' });
		const home = () => screen.getByRole('option', { name: 'One' });
		home().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		expect(end()).toHaveFocus();
		end().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		expect(home()).toHaveFocus();
		home().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		expect(onSelect).toHaveBeenCalledWith(0);
		await vi.waitFor(() => {
			expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
		});
		expect(trigger).toHaveFocus();

		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await vi.waitFor(() => {
			expect(screen.getByRole('listbox')).toBeInTheDocument();
		});
		screen
			.getByRole('option', { name: 'One' })
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		await vi.waitFor(() => {
			expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
		});
		expect(trigger).toHaveFocus();
	});
});
