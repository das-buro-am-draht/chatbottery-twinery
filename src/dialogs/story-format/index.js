import Vue from 'vue';
import { mapActions } from 'vuex';

import locale from '../../locale';
import notify from '../../ui/notify';
import semverUtils from 'semver-utils';

import StoryFormatItem from './item';
import ModalDialog from '../../ui/modal-dialog';

import './index.less';
import template from './index.html';

const StoryFormat = Vue.extend({
	template,

	data: () => ({
		loadIndex: 0,
		loadedFormats: [],
		storyId: '',
	}),

	computed: {
		allStories () { return this.$store.getters.allStories },
		allFormats () { return this.$store.getters.allFormatsSorted },
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		selectedFormat() {
			return this.loadedFormats.find(
				format => format.name === this.story.storyFormat &&
					format.version === this.story.storyFormatVersion
			);
		},

		working() {
			return this.loadIndex < this.allFormats.length;
		}
	},

	methods: {
		...mapActions([
			'loadFormat'
		]),
		loadNext() {
			if (!this.working) {
				return;
			}

			const nextFormat = this.allFormats[this.loadIndex];

			this.loadFormat(nextFormat.name, nextFormat.version)
			.then(format => {
				if (!format.properties.proofing) {
					this.loadedFormats.push(format);
				}

				this.loadIndex++;
				this.loadNext();
			})
			.catch(e => {
				notify(
					locale.say(
						'The chatbot format &ldquo;%1$s&rdquo; could not ' +
						'be loaded (%2$s).',
						nextFormat.name + ' ' + nextFormat.version,
						e.message
					),
					'danger'
				);
				this.loadIndex++;
				this.loadNext();
			});
		}
	},

	mounted: function () {
		this.$nextTick(function () {
			this.loadNext();
		});
	},

	components: {
		'format-item': StoryFormatItem,
		'modal-dialog': ModalDialog
	}
});

export default StoryFormat;
