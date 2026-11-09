import { afterEach, describe, expect, it } from 'vitest';
import { flushMutations } from '../../test/helpers.js';
import { setupExternalLinks } from './anchor';

const byId = (id: string): HTMLAnchorElement => {
	const element = document.getElementById(id);
	if (!(element instanceof HTMLAnchorElement)) throw new Error(`Missing anchor ${id}`);
	return element;
};

describe('setupExternalLinks', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('marks external, protocol-relative and mailto links', () => {
		document.body.innerHTML = `
			<a id="http" href="https://example.com">http</a>
			<a id="protocol" href="//cdn.example.com/file">protocol</a>
			<a id="mail" href="mailto:test@example.com">mail</a>
			<a id="internal" href="/about">internal</a>
		`;
		const destroy = setupExternalLinks();

		for (const id of ['http', 'protocol', 'mail']) {
			const anchor = byId(id);
			expect(anchor.target).toBe('_blank');
			expect(anchor.rel.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
		}
		expect(byId('internal').target).toBe('');
		expect(byId('internal').rel).toBe('');
		destroy();
	});

	it('keeps existing target and merges existing rel values', () => {
		document.body.innerHTML = `
			<a id="target" href="https://example.com" target="_self">target</a>
			<a id="rel" href="https://example.com" rel="nofollow">rel</a>
		`;
		const destroy = setupExternalLinks();

		expect(byId('target').target).toBe('_self');
		expect(byId('target').rel.split(' ')).toEqual(
			expect.arrayContaining(['noopener', 'noreferrer'])
		);
		expect(byId('rel').rel).toBe('nofollow noopener noreferrer');
		destroy();
	});

	it('updates target and rel when an existing href changes', async () => {
		document.body.innerHTML = '<a id="link" href="/about">link</a>';
		const destroy = setupExternalLinks();
		const link = byId('link');
		expect(link.target).toBe('');

		link.setAttribute('href', 'https://example.com');
		await flushMutations();
		expect(link.target).toBe('_blank');
		expect(link.rel.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));

		link.setAttribute('href', '/about');
		await flushMutations();
		expect(link.target).toBe('');
		expect(link.rel).toBe('');
		destroy();
	});

	it('keeps pre-existing rel tokens when an external href becomes internal', async () => {
		document.body.innerHTML =
			'<a id="link" href="https://example.com" rel="nofollow noopener">link</a>';
		const destroy = setupExternalLinks();
		const link = byId('link');
		expect(link.rel.split(' ')).toEqual(expect.arrayContaining(['nofollow']));

		link.setAttribute('href', '/about');
		await flushMutations();
		expect(link.rel).toBe('nofollow noopener');
		destroy();
	});

	it('applies to links added after setup and stops after destroy', async () => {
		const destroy = setupExternalLinks();

		const added = document.createElement('a');
		added.href = 'https://example.com/added';
		document.body.appendChild(added);
		await flushMutations();
		expect(added.target).toBe('_blank');

		destroy();
		const afterDestroy = document.createElement('a');
		afterDestroy.href = 'https://example.com/after';
		document.body.appendChild(afterDestroy);
		await flushMutations();
		expect(afterDestroy.target).toBe('');
	});

	it('ignores links without an href', () => {
		document.body.innerHTML = '<a id="empty">empty</a>';
		const destroy = setupExternalLinks();
		expect(byId('empty').target).toBe('');
		destroy();
	});
});
