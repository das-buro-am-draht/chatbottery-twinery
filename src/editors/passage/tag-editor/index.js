/* An editor for adding and removing tags from a passage. */

import Vue from 'vue';
import uniq from 'lodash.uniq';
import TagMenu from './tag-menu';

import template from './index.html';

const PassageTagEditor = Vue.extend({
	data: () => ({
		newVisible: false
	}),

	computed: {
		tagColors() {
			return this.allStories.find(s => s.id === this.storyId).tagColors;
		},
		updatePassage () { return this.$store._actions.updatePassage[0] },
		allStories () { return this.$store.getters.allStories },

	},

	props: {
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	template,

	methods: {
		showNew() {
			this.newVisible = true;
			this.$nextTick(() => this.$refs.newName.focus());
		},

		hideNew() {
			this.newVisible = false;
		},

		addNew() {
			const newName = this.$refs.newName.value.replace(/\s/g, '-');

			/* Clear the newName element while it's transitioning out. */

			this.$refs.newName.value = '';

			this.updatePassage({
				storyId: this.storyId,
				passageId: this.passage.id,
				tags: uniq([].concat(this.passage.tags, newName))
			});

			this.hideNew();
		}
	},

	components: {
		'tag-menu': TagMenu
	}
});

export default PassageTagEditor;
