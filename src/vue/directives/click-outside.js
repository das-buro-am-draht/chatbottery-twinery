const clickOutsideEvent = (event, el, vm, expression) => {
	if (!(el === event.target || el.contains(event.target))) {
		vm[expression](event);
	}
};

export const addTo = function (Vue) {
	Vue.directive("click-outside", {
		bind(el, binding, vnode) {
			document.body.addEventListener("click", (event) =>
				clickOutsideEvent(event, el, vnode.context, binding.expression)
			);
		},
		unbind(el, binding, vnode) {
			document.body.removeEventListener("click", (event) =>
				clickOutsideEvent(event, el, vnode.context, binding.expression)
			);
		},
	});
};
