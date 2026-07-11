let dark = $state(true);

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
