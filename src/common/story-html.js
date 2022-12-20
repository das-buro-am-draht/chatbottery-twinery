/*
Top-level functions for publishing stories. Unlike the publish methods under
data/, these are Vuex-aware, work with IDs instead of direct data, and are
asynchronous.
*/

import {loadFormat} from '../data/actions/story-format';
import locale from '../locale';
import {publishStoryWithFormat} from '../data/publish';

export const getStoryPlayHtml = (store, storyId) => {
	const story = store.state.story.stories.find(
		story => story.id === storyId
	);

	if (!story) {
		throw new Error(
			locale.say('There is no chatbot with ID %s.', storyId)
		);
	}

	return loadFormat(
		store,
		{name: story.storyFormat, version: story.storyFormatVersion}
	).then(format =>
		publishStoryWithFormat(store.state.appInfo, story, format)
	);
};

export const getStoryProofingHtml = (store, storyId, formatId = null) => {
	const story = store.state.story.stories.find(
		story => story.id === storyId
	);

	if (!story) {
		throw new Error(
			locale.say('There is no chatbot with ID %s.', storyId)
		);
	}

	let format = store.state.pref.proofingFormat;
	if (formatId) {
		for (const item of store.state.storyFormat.formats) {
			if (item.id === formatId) {
				format = item;
				break;
			}
		}
	}

	return loadFormat(
		store,
		{name: format.name, version: format.version}
	).then(format =>
		publishStoryWithFormat(store.state.appInfo, story, format)
	);
};

export const getStoryTestHtml = (store, storyId, startPassageId) => {
	const story = store.state.story.stories.find(
		story => story.id === storyId
	);

	if (!story) {
		throw new Error(
			locale.say('There is no chatbot with ID %s.', storyId)
		);
	}

	return loadFormat(
		store,
		{name: story.storyFormat, version: story.storyFormatVersion}
	).then(format =>
		publishStoryWithFormat(
			store.state.appInfo,
			story,
			format,
			['debug'],
			startPassageId
		)
	);
};
