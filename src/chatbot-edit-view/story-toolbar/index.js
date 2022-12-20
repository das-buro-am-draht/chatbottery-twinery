// The toolbar at the bottom of the screen with editing controls.

import Vue from 'vue';
import zoomMappings from '../zoom-settings';
import {playStory, testStory} from '../../common/launch-story';
import {updateStory} from '../../data/actions/story';
import StoryMenu from './story-menu';
import StorySearch from './story-search';

import './index.less';
import template from './index.html';

const StoryToolbar = Vue.extend({
	template,

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
		'story-menu': StoryMenu,
		'story-search': StorySearch
	},

	computed: {
		updateStory () { return this.$store._actions.updateStory[0] },
	},

	methods: {
		setZoom(description) {
			this.updateStory({id: this.story.id, zoom: zoomMappings[description]});
		},

		test() {
			testStory(this.$store, this.story.id);
		},

		play() {
			playStory(this.$store, this.story.id);
		},

		addPassage() {
			this.$root.$emit('passage-create');
		}
	},
});

export default StoryToolbar;
