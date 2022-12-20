/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import save from '../../file/save';
import {publishStoryWithFormat} from '../../data/publish';
import {proofStory} from '../../common/launch-story';

import './index.less';
import template from './index.html';

const DropdownDownload = Vue.extend({
	template,

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		active: false,
	}),

	computed: {
		loadFormat () { return this.$store._actions.loadFormat[0] },
		appInfo () { return this.$store.getters.appInfo }
	},

	methods: {
		toggleDropdown() {
			this.active = !this.active;
		},
		closeDropdown() {
			this.active = false;
		},
		publishStory() {
			this.loadFormat(
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			});
		},
		proofStory() {
			proofStory(this.$store, this.story.id);
		},
	},
});

export default DropdownDownload;
