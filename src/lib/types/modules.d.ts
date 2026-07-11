declare module 'ace-code/src/keyboard/vim' {
	import type { KeyboardHandler } from 'ace-code/src/keyboard/keybinding';
	interface VimModule {
		handler: KeyboardHandler;
	}
	const vim: VimModule;
	export default vim;
}

declare module 'ace-code/src/keyboard/vscode' {
	import type { KeyboardHandler } from 'ace-code/src/keyboard/keybinding';
	interface VscodeModule {
		handler: KeyboardHandler;
	}
	const vscode: VscodeModule;
	export default vscode;
}
