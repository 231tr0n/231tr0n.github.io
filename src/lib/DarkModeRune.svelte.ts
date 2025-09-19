let dark = $state(false);

export function darkMode() {
	return {
		get dark() {
			return dark;
		},
		set dark(value) {
			dark = value;
		}
	};
}
