import { describe, expect, it } from 'vitest';
import { getPluginsInConfig, getSectionsInConfig } from './neovim-config';

describe('getSectionsInConfig', () => {
	it('keeps blank lines inside a section', () => {
		const sections = getSectionsInConfig(
			'-- Core options\nvim.opt.number = true\n\nvim.opt.relativenumber = true\n\n-- Plugins\nvim.pack.add({})'
		);
		expect(sections).toEqual([
			{
				heading: 'Core options',
				block: 'vim.opt.number = true\n\nvim.opt.relativenumber = true'
			},
			{ heading: 'Plugins', block: 'vim.pack.add({})' }
		]);
	});

	it('normalizes CRLF and ignores content before the first heading', () => {
		const sections = getSectionsInConfig(
			'local ignored = true\r\n-- First\r\nline one\r\n\r\nline two\r\n-- Second\r\nline three'
		);
		expect(sections).toEqual([
			{ heading: 'First', block: 'line one\n\nline two' },
			{ heading: 'Second', block: 'line three' }
		]);
	});

	it('returns no sections for content without headings', () => {
		expect(getSectionsInConfig('local a = 1\nlocal b = 2')).toEqual([]);
	});

	it('skips empty headings and trims blocks', () => {
		expect(getSectionsInConfig('-- \nvalue\n\n\n-- Real\n  value  ')).toEqual([
			{ heading: 'Real', block: 'value' }
		]);
	});

	it('drops annotation-only sections', () => {
		expect(
			getSectionsInConfig('-- luacheck: globals vim\n-- Globals declaration\n-- Real\nvalue')
		).toEqual([{ heading: 'Real', block: 'value' }]);
	});
});

describe('getPluginsInConfig', () => {
	it('extracts strings, src entries and deduplicates them', () => {
		const plugins = getPluginsInConfig(`
			vim.pack.add({
				"https://github.com/example/alpha",
				{ src = "https://github.com/example/beta" },
				"short-name",
				"short-name",
			})
		`);
		expect(plugins).toEqual([
			'https://github.com/example/alpha',
			'https://github.com/example/beta',
			'short-name'
		]);
	});

	it('handles escaped quotes and nested tables', () => {
		const plugins = getPluginsInConfig(`
			vim.pack.add({
				{ src = "https://github.com/example/a\\"b", name = "ignored-name" },
				{ nested = { "ignored-nested" } },
			})
		`);
		expect(plugins).toEqual(['https://github.com/example/a\\"b']);
	});

	it('supports multiple vim.pack.add calls', () => {
		const plugins = getPluginsInConfig(`
			vim.pack.add({ "one" })
			vim.pack.add({ "two" })
		`);
		expect(plugins).toEqual(['one', 'two']);
	});

	it('returns an empty list when there are no pack calls', () => {
		expect(getPluginsInConfig('local a = 1')).toEqual([]);
	});
});
