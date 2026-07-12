export interface PostData {
	name: string;
	url: string;
	description: string;
	badges: string[];
	external: boolean;
	open: boolean;
}

export type SetCode = (code: string) => void;

export interface AceMode {
	Mode: new () => import('ace-code/src/edit_session').SyntaxMode;
}

export type OnSetSelectedItem = (item: number) => void;

export type GithubLanguages = Map<string, number>;

export interface FileState {
	code: string | null;
	error: string | null;
}
