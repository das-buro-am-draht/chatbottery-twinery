/* A contextual menu that appears when the user points at a passage. */

import Vue from 'vue';
import {testStory} from '../../../common/launch-story';
import DropDown from '../../../ui/drop-down';

import './index.less';
import template from './index.html';

const PassageMenu = Vue.extend({
	template,

	props: {
		passage: {
			type: Object,
			required: true
		},

		parentStory: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		expanded: false
	}),

	computed: {
		updatePassage () { return this.$store._actions.updatePassage[0] },
		updateStory () { return this.$store._actions.updateStory[0] },

		isStart() {
			return this.parentStory.startPassage === this.passage.id;
		},

		size() {
			if (this.passage.width === 100 && this.passage.height === 100) {
				return 'small';
			}

			if (this.passage.width === 200 && this.passage.height === 100) {
				return 'wide';
			}

			if (this.passage.width === 100 && this.passage.height === 200) {
				return 'tall';
			}

			if (this.passage.width === 200 && this.passage.height === 200) {
				return 'large';
			}
		}
	},

	watch: {
		expanded() {
			this.$root.$emit('drop-down-reposition');
		}
	},

	methods: {
		edit() {
			this.$root.$emit('passage-edit');
		},

		deletePassage(e) {
			this.$root.$emit('passage-delete', e.shiftKey);
		},

		test() {
			testStory(this.$store, this.parentStory.id, this.passage.id);
		},

		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		setAsStart() {
			this.updateStory({
				id: this.parentStory.id,
				startPassage: this.passage.id
			});
		},

		setSize(value) {
			switch (value) {
				case 'small':
					this.updatePassage({
						storyId: this.parentStory.id,
						passageId: this.passage.id,
						width: 150,
						height: 100
					});
					break;

				case 'wide':
					this.updatePassage({
						storyId: this.parentStory.id,
						passageId: this.passage.id,
						width: 200,
						height: 100
					});
					break;

				case 'tall':
					this.updatePassage({
						storyId: this.parentStory.id,
						passageId: this.passage.id,
						width: 150,
						height: 200
					});
					break;

				case 'large':
					this.updatePassage({
						storyId: this.parentStory.id,
						passageId: this.passage.id,
						width: 200,
						height: 200
					});
					break;

				default:
					throw new Error(`Don't know how to set size ${value}`);
			}

			this.$root.$emit('passage-position', this.passage, {});
		}
	},

	events: {
		'drop-down-opened'() {
			this.expanded = false;
		}
	},

	components: {
		'drop-down': DropDown
	},
});

export default PassageMenu;
