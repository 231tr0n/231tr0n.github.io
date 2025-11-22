/**
 * @type {import("prettier").Config}
 */
const config = {
	bracketSameLine: true,
	plugins: ['prettier-plugin-svelte'],
	printWidth: 100,
	singleQuote: true,
	trailingComma: 'none',
	useTabs: true,
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte'
			}
		}
	]
};

export default config;
