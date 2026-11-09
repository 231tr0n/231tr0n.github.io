import { describe, expect, it } from 'vitest';
import { sandboxPolicy } from './app.constants';

describe('sandbox policy', () => {
	it('allows scripts and forms without granting same-origin access', () => {
		expect(sandboxPolicy).toContain('allow-scripts');
		expect(sandboxPolicy).toContain('allow-forms');
		expect(sandboxPolicy).not.toContain('allow-same-origin');
	});
});
