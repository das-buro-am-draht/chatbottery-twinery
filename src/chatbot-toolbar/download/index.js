/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import save from '../../file/save';
import {publishStoryWithFormat} from '../../data/publish';
import {proofStory} from '../../common/launch-story';
import locale from '../../locale';
import notify from '../../ui/notify';

import './index.less';
import template from './index.html';

const Download = Vue.extend({
	template,

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		active: false,
		proofingFormat: null,
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
			this.loadFormat({
				name: this.story.storyFormat,
				version: this.story.storyFormatVersion
			}).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			})
			.catch(e => {
				notify(
					locale.say(
						'The chatbot &ldquo;%1$s&rdquo; could not ' +
						'be published (%2$s).',
						this.story.name,
						e.message
					),
					'danger'
				);
			});
	},
		proofStory(id) {
			proofStory(this.$store, this.story.id, id);
		},
	},

	mounted: function () {
		this.$nextTick(function () {
			this.$data.proofingFormat = this.$store.state.storyFormat.formats.find(format => format.isStatistic);
		});
	},
});

export default Download;
