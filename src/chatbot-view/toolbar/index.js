// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
const JavaScriptEditor = require('../../editors/javascript');
const StylesheetEditor = require('../../editors/stylesheet');
const zoomMappings = require('../zoom-settings');
const OpenaiDialog = require('../../dialogs/openai');
const {playStory} = require('../../common/launch-story');
const {updateStory} = require('../../data/actions/story');
const zoomSettings = require('../zoom-settings');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		storyId: {
			type: String,
			required: true
		},
	},

	data: () => ({
		descriptions: ["small", "medium", "big"],
		sliderVal: '',
	}),

	ready: function () {
		this.setSliderVal();
	},

	watch: {
		'story.zoom'() {
			this.setSliderVal();
		},
	},

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},
	},

	watch: {
		'story.zoom'() {
			this.setSliderVal();
		},
	},

	methods: {
		setSliderVal() {
			const zoomDesc = Object.keys(zoomSettings).find(
				key => zoomSettings[key] === this.story.zoom
			);
			this.sliderVal = this.descriptions.indexOf(zoomDesc);
		},

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
		
		openai(e) {
			new OpenaiDialog({
				data: {origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},
	},

	components: {
		'story-search': require('./search'),
		'dropdown-file': require('./file'),
		'dropdown-download': require('./download'),
	},

	vuex: {
		actions: {
			updateStory,
		},
		getters: {
			allStories: state => state.story.stories,
		}
	},
});
