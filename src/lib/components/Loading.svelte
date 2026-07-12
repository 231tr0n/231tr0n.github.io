<br />
<div class="zeltron-flex-middle">
	<svg
		fill="currentColor"
		height="24"
		viewBox="0 0 24 24"
		width="24"
		xmlns="http://www.w3.org/2000/svg">
		<rect class="bar" height="12" width="2.8" x="1" y="6" />
		<rect class="bar bar-1" height="12" width="2.8" x="5.8" y="6" />
		<rect class="bar bar-2" height="12" width="2.8" x="10.6" y="6" />
		<rect class="bar bar-3" height="12" width="2.8" x="15.4" y="6" />
		<rect class="bar bar-4" height="12" width="2.8" x="20.2" y="6" />
	</svg>
</div>
<br />

<style>
	.bar {
		animation: spin 0.9s linear infinite;
		animation-delay: -0.9s;
	}
	.bar-1 {
		animation-delay: -0.8s;
	}
	.bar-2 {
		animation-delay: -0.7s;
	}
	.bar-3 {
		animation-delay: -0.6s;
	}
	.bar-4 {
		animation-delay: -0.5s;
	}
	@keyframes spin {
		0%,
		66.66% {
			animation-timing-function: cubic-bezier(0.36, 0.61, 0.3, 0.98);
			y: 6px;
			height: 12px;
		}
		33.33% {
			animation-timing-function: cubic-bezier(0.36, 0.61, 0.3, 0.98);
			y: 1px;
			height: 22px;
		}
	}
</style>
