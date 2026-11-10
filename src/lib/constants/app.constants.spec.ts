import { describe, expect, it } from 'vitest';
import { sandboxPolicy, trustedSandboxPolicy } from './app.constants';

describe('sandbox policy', () => {
	it('allows scripts and forms without granting same-origin access', () => {
		expect(sandboxPolicy).toContain('allow-scripts');
		expect(sandboxPolicy).toContain('allow-forms');
		expect(sandboxPolicy).not.toContain('allow-same-origin');
	});

	it('grants storage access only to the trusted game policy', () => {
		expect(trustedSandboxPolicy.startsWith(sandboxPolicy)).toBe(true);
		expect(trustedSandboxPolicy).toContain('allow-same-origin');
	});
});
