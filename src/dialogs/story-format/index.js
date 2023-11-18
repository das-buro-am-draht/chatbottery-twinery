const Vue = require('vue');
const { loadFormat } = require('../../data/actions/story-format');
const locale = require('../../locale');
const notify = require('../../ui/notify');
const semverUtils = require('semver-utils');
const escape = require('lodash.escape');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		loadedFormats: [],
		storyId: '',
		/* Determines whether to show the loading spinner. */
		working: true,
	}),

	computed: {
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
								'The chatbot format &ldquo;%1$s&rdquo; could not be loaded (%2$s).',
								escape(format.name + ' ' + format.version),
								escape(e.message)
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

	ready() {
		this.loadFormats();
	},

	vuex: {
		actions: {
			loadFormat,
		},

		getters: {
			allStories: state => state.story.stories,
			allFormats: state => {
				var result = state.storyFormat.formats.map(
					format => ({ name: format.name, version: format.version })
				);
				
				result.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					
					if (a.name > b.name) {
						return +1;
					}

					const aVersion = semverUtils.parse(a.version);
					const bVersion = semverUtils.parse(b.version);

					if (+aVersion.major > +bVersion.major) {
						return -1;
					} else if (+aVersion.major < +bVersion.major) {
						return +1;
					} else if (+aVersion.minor > +bVersion.minor) {
						return -1;
					} else if (+aVersion.minor < +bVersion.minor) {
						return +1;
					} else if (+aVersion.patch > +bVersion.patch) {
						return -1;
					} else if (+aVersion.patch < +bVersion.patch) {
						return +1;
					} else {
						return 0;
					}
				});

				return result;
			}
		}
	},

	components: {
		'format-item': require('./item'),
		'modal-dialog': require('../../ui/modal-dialog')
	}
});
