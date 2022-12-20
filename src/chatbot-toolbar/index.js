// The toolbar at the bottom of the screen with editing controls.

import Vue from 'vue';
import JavaScriptEditor from '../editors/javascript';
import StylesheetEditor from '../editors/stylesheet';
import zoomMappings from '../chatbot-edit-view/zoom-settings';
import {playStory} from '../common/launch-story';
import StorySearch from './story-search';
import DropdownFile from './dropdown-file';
import DropdownDownload from './dropdown-download';

import './index.less';
import template from './index.html';

const ChatbotToolbar = Vue.extend({
	template,

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
		'story-search': StorySearch,
		'dropdown-file': DropdownFile,
		'dropdown-download': DropdownDownload,
	},

	computed: {
		updateStory () { return this.$store._actions.updateStory[0] },
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
			this.updateStory({id: this.story.id, zoom: zoomMappings[this.descriptions[this.sliderVal]]});
		},
	},

	mounted: function () {
		this.$nextTick(function () {
			this.sliderVal = this.descriptions.indexOf(this.zoomDesc);
		});
	},
});

export default ChatbotToolbar;
