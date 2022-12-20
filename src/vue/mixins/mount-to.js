// A mixin that offers a convenience method for mounting a component to a given
// element.

export default {
	methods: {
		$mountTo(el) {
			el.appendChild(this.$mount().$el);

			return this;
		},
	}
};

