import Vue from 'vue';

import locale from '../../locale';
import notify from '../../ui/notify';

import StoryFormatItem from './item';
import ModalDialog from '../../ui/modal-dialog';

import './index.less';
import template from './index.html';

const StoryFormat = Vue.extend({
	template,

	data: () => ({
		loadedFormats: [],
		storyId: '',
		/* Determines whether to show the loading spinner. */
		working: true,
	}),

	computed: {
		allStories () { return this.$store.getters.allStories },
		allFormats () { return this.$store.getters.allFormatsSorted },
		loadFormat () { return this.$store._actions.loadFormat[0] },
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		selectedFormat() {
			return this.loadedFormats.find(
				format => format.name === this.story.storyFormat &&
					format.version === this.story.storyFormatVersion
			);
		},
	},

	methods: {
		loadFormats() {
			this.working = true;
			let formats = [];
			this.allFormats.reduce((promise, format) => {
				return promise
					.then(() => this.loadFormat(format.name, format.version))
					.then((format) => {
						if (!format.properties.proofing) {
							formats.push(format);
						}
					})
					.catch(e => {
						notify(
							locale.say(
								'The chatbot format &ldquo;%1$s&rdquo; could not ' +
								'be loaded (%2$s).',
								format.name + ' ' + format.version,
								e.message
							),
							'danger'
						);
					});
			}, Promise.resolve()).finally(() => {
				this.working = false;
				this.loadedFormats = formats;
			});
		},
	},

	mounted: function () {
		this.$nextTick(function () {
			this.loadFormats();
		});
	},

	components: {
		'format-item': StoryFormatItem,
		'modal-dialog': ModalDialog
	}
});

export default StoryFormat;
