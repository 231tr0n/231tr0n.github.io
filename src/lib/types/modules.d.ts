declare module 'ace-code/src/keyboard/vim' {
	const vim: { handler: import('ace-code').Ace.KeyboardHandler };
	export default vim;
}

declare module 'ace-code/src/keyboard/vscode' {
	const vscode: { handler: import('ace-code').Ace.KeyboardHandler };
	export default vscode;
}

declare module 'ace-code/src/ext/beautify' {
	const beautify: { beautify: (session: import('ace-code').Ace.EditSession) => void };
	export default beautify;
}
