let dark = $state(
	typeof document === 'undefined' ? true : document.body.classList.contains('dark')
);

const instance = {
	get dark() {
		return dark;
	},
	set dark(value) {
		dark = value;
	}
};

export const darkMode = () => instance;
