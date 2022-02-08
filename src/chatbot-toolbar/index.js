// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
const JavaScriptEditor = require('../editors/javascript');
const StylesheetEditor = require('../editors/stylesheet');
const zoomMappings = require('../chatbot-edit-view/zoom-settings');
const {playStory} = require('../common/launch-story');
const {updateStory} = require('../data/actions/story');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		descriptions: ["small", "medium", "big"],
		sliderVal: "",
	}),

	props: {
		story: {
			type: Object,
			required: true
		},

		zoomDesc: {
			type: String,
			required: true
		}
	},

	components: {
		'story-search': require('./story-search'),
		'dropdown-file': require('./dropdown-file'),
		'dropdown-download': require('./dropdown-download'),
	},

	methods: {
		play() {
			playStory(this.$store, this.story.id);
		},
		editScript(e) {
			/*
			We have to manually inject the Vuex store, since the editors are
			mounted outside the app scope.
			*/

			new JavaScriptEditor({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},
		editStyle(e) {
			new StylesheetEditor({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},
		changeZoom() {
			this.updateStory(this.story.id, {zoom: zoomMappings[this.descriptions[this.sliderVal]]});
		},
	},

	ready: function () {
		this.sliderVal = this.descriptions.indexOf(this.zoomDesc);
	},

	vuex: {
		actions: {
			updateStory,
		},
	}
});
