import Vue from 'vue';
import without from 'lodash.without';
import DropDown from '../../../../ui/drop-down';

import './index.less';
import template from './index.html';

const PassageTagMenu = Vue.extend({
	props: {
		tag: {
			type: String,
			required: true
		},
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

	computed: {
		updatePassage () { return this.$store._actions.updatePassage[0] },
		setTagColorInStory () { return this.$store._actions.setTagColorInStory[0] },
	},

	methods: {
		remove() {
			this.updatePassage({
				storyId: this.storyId,
				passageId: this.passage.id,
				tags: without(this.passage.tags, this.tag)
			});
		},
		setColor(color) {
			this.setTagColorInStory(this.storyId, this.tag, color);
		}
	},

	components: {
		'drop-down': DropDown
	}
});

export default PassageTagMenu;
