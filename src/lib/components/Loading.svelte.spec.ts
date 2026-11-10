import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Loading from './Loading.svelte';

describe('Loading', () => {
	it('renders a labelled loading status with animated bars', () => {
		const { container } = render(Loading);
		expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
		expect(container.querySelectorAll('.bar')).toHaveLength(5);
	});
});
