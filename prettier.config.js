/**
 * @type {import("prettier").Config}
 */
const config = {
	bracketSameLine: true,
	plugins: ['prettier-plugin-svelte'],
	printWidth: 100,
	singleQuote: true,
	trailingComma: 'none',
	useTabs: true
};

export default config;
