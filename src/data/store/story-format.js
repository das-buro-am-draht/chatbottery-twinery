// A Vuex module for working with story formats.

import uuid from 'tiny-uuid';
import locale from '../../locale';

const formatDefaults = {
	name: locale.say('Untitled Chatbot Format'),
	version: '',
	url: '',
	userAdded: true,
	isReview: false,
	isStatistic: false,
	properties: {}
};

const storyFormat = {
	// state: {
	// 	formats: []
	// },

	mutations: {
		CREATE_FORMAT(state, props) {
			let newFormat = Object.assign({}, formatDefaults, props);

			newFormat.id = props.id || uuid();
			newFormat.loaded = false;
			state.storyFormat.formats.push(newFormat);
		},

		UPDATE_FORMAT(state, id, props) {
			let format = state.storyFormat.formats.find(format => format.id === id);

			Object.assign(format, props);
		},

		DELETE_FORMAT(state, id) {
			state.formats = state.storyFormat.formats.filter(format => format.id !== id);
		},

		LOAD_FORMAT(state, id, props) {
			let format = state.storyFormat.formats.find(format => format.id === id);

			format.properties = props;
			format.loaded = true;

			if (format.properties.setup) {
				format.properties.setup.call(format);
			}
		}
	}
};

export default storyFormat;
