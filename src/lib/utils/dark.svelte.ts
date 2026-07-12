import { themeStorageKey, themeLight } from '$lib/constants/app.constants';

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(themeStorageKey) : null;
let dark = $state(stored !== themeLight);

const instance = {
	get dark() {
		return dark;
	},
	set dark(value) {
		dark = value;
	}
};

export const darkMode = () => instance;
