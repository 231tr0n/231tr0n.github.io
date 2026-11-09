import { describe, expect, it } from 'vitest';
import everforestLight from './ace-everforest-light';
import everforestDark from './ace-everforest-dark';

describe('Ace Everforest themes', () => {
	it('describes the light and dark theme contracts', () => {
		expect(everforestLight.isDark).toBe(false);
		expect(everforestLight.cssClass).toBe('ace-everforest-light');
		expect(everforestDark.isDark).toBe(true);
		expect(everforestDark.cssClass).toBe('ace-everforest-dark');
	});
});
