const clickOutsideEvent = (event, el, vm, expression) => {
	if (!(el === event.target || el.contains(event.target))) {
		vm[expression](event);
	}
};

module.exports = {
	addTo(Vue) {
		Vue.directive("click-outside", {
			bind() {
				const { el, expression, vm } = this;

				document.body.addEventListener("click", (event) =>
					clickOutsideEvent(event, el, vm, expression)
				);
			},
			unbind() {
				const { el, expression, vm } = this;

				document.body.removeEventListener("click", (event) =>
					clickOutsideEvent(event, el, vm, expression)
				);
			},
		});
	},
};
