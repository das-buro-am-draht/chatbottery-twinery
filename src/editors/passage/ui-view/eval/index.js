const Vue = require('vue');
const { trim } = require('../../../../utils/common');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
		story: {
			type: Object,
			required: false,
		},
	},

	data: () => ({
		assignment: '',
		userData: {},
	}),

	ready() {
		if (this.story) {
			this.userData = Object.entries(this.story.userData || {})
				.filter(([k, v]) => v.type !== 'function')
				.reduce((prev, data) => {
					prev[data[0]] = data[1].type;
					return prev;
				}, {});
		}
		this.load();
	},

	watch: {
		'task.attributes.eval'() {
			this.load();
		},
	},

	computed: {
		assignments() {
			const assignments = [];
			Object.entries(this.userData).forEach(([name, type]) => {
				switch (type) {
					default:
						assignments.push(`${name} = 'value'`);
						break;
					case 'boolean':
						assignments.push(`${name} = true`);
						assignments.push(`${name} = false`);
						break;
					case 'number':
						assignments.push(`${name} = 1`);
						break;
					case 'date':
						assignments.push(`${name} = Date.now()`);
						break;
				}
			});
			return assignments;
		},
		isValid() {
			return !this.assignment || this.assignment.includes('$');
		},
	},

	methods: {
		load() {
			const assignment = this.task.attributes['eval'] || '';
			if (assignment !== this.assignment) {
				this.assignment = assignment;
			}
		},
		onChange(event) {
			const assignment = this.assignment;
			if (assignment) {
				this.task.attributes['eval'] = assignment;
			} else {
				delete this.task.attributes['eval'];
			}
			this.$dispatch('gui-changed');
		},
	},
});
