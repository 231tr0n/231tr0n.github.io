let dark = $state(true);

const instance = {
	get dark() {
		return dark;
	},
	set dark(value) {
		dark = value;
	}
};

export const darkMode = () => instance;
