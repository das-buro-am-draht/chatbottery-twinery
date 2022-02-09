// The toolbar at the bottom of the screen with editing controls.

const Vue = require('vue');
// const zoomMappings = require('../zoom-settings');
// const {playStory, testStory} = require('../../common/launch-story');
// const {updateStory} = require('../../data/actions/story');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	methods: {
		addPassage() {
			this.$dispatch('passage-create');
		}
	},
});
