let dark = $state(true);

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
