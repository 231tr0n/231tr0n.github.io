const HEADING_PREFIX = '-- ';

interface NeovimConfigSection {
	heading: string;
	block: string;
}

const normalizeNewlines = (data: string): string => data.replace(/\r\n/g, '\n');

const pushSection = (sections: NeovimConfigSection[], heading: string, lines: string[]): void => {
	const block = lines.join('\n').trim();
	if (heading.length > 0 && block.length > 0) sections.push({ heading, block });
};

export const getSectionsInConfig = (data: string): NeovimConfigSection[] => {
	const sections: NeovimConfigSection[] = [];
	let heading: string | null = null;
	let lines: string[] = [];

	for (const line of normalizeNewlines(data).split('\n')) {
		if (line.startsWith(HEADING_PREFIX)) {
			if (heading !== null) pushSection(sections, heading, lines);
			heading = line.slice(HEADING_PREFIX.length).trim();
			lines = [];
		} else if (heading !== null) {
			lines.push(line);
		}
	}

	if (heading !== null) pushSection(sections, heading, lines);
	return sections;
};

/**
 * Extracts plugin names from the subset of `vim.pack.add` used by the site
 * config. This is intentionally a lightweight parser, not a Lua interpreter.
 */
export const getPluginsInConfig = (data: string): string[] => {
	const plugins: string[] = [];
	const source = normalizeNewlines(data);
	const addRegex = /vim\.pack\.add\s*\(/g;
	let match: RegExpExecArray | null;

	while ((match = addRegex.exec(source)) !== null) {
		let depth = 1;
		let pos = match.index + match[0].length;
		while (depth > 0 && pos < source.length) {
			const character = source.at(pos);
			if (character === '(') depth++;
			else if (character === ')') depth--;
			if (depth > 0) pos++;
		}

		const body = source.slice(match.index + match[0].length, pos);
		let braceDepth = 0;
		let lastKey: string | null = null;

		for (let index = 0; index < body.length; index++) {
			const character = body.at(index);
			if (character === undefined) continue;
			if (character === '{' || character === '}') {
				braceDepth += character === '{' ? 1 : -1;
				lastKey = null;
			} else if (character === ',') {
				lastKey = null;
			} else if (character === '"') {
				let end = index + 1;
				while (end < body.length) {
					if (body.at(end) === '\\') {
						end += 2;
						continue;
					}
					if (body.at(end) === '"') break;
					end++;
				}
				if (end >= body.length) break;
				const value = body.slice(index + 1, end);
				if (braceDepth === 0 || lastKey === 'src' || (braceDepth === 1 && lastKey === null)) {
					plugins.push(value);
				}
				index = end;
				lastKey = null;
			} else if (/[a-zA-Z_]/.test(character)) {
				const start = index;
				while (index < body.length && /[\w]/.test(body.at(index) ?? '')) index++;
				lastKey = body.slice(start, index);
				index--;
			}
		}
	}

	return [...new Set(plugins)];
};
