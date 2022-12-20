// The toolbar at the bottom of the screen with editing controls.

import Vue from 'vue';
// const zoomMappings = require('../zoom-settings');
// const {playStory, testStory} = require('../../common/launch-story');
// const {updateStory} = require('../../data/actions/story');

import './index.less';
import template from './index.html';

const CreateChatbotButton = Vue.extend({
	template,

	methods: {
		addPassage() {
			this.$root.$emit('passage-create');
		}
	},
});

export default CreateChatbotButton;
