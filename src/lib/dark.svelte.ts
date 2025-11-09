let dark = $state(false);

export const darkMode = () => {
	return {
		get dark() {
			return dark;
		},
		set dark(value) {
			dark = value;
		}
	};
};
