const Vue = require('vue');
const { label, types } = require('../../../../utils/task');

module.exports = Vue.extend({

	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: false,
		},
	},

	computed: {
		types() {
			const items = {};
			Object.entries(types).forEach(([key, value]) => {
				switch (key) {
					case 'chat':
						if (!(this.story && this.story.plugins && this.story.plugins.chat)) {
							break;
						}
					default:
						items[key] = value;
				}
			});
			return items;
		}
	},

	methods: {
		label: (type) => label(type),

		addNew(type) {
			this.$dispatch('gui-append', type);
		}
	},

	components: {
		'drop-down': require('../../../../ui/drop-down'),
	}
});