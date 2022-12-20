/*
A Vuex module for working with stories. This is meant to be incorporated by
index.js.
*/

import uuid from 'tiny-uuid';
import locale from '../../locale';
import idFor from '../id';
import ui from '../../ui';

/*
A shorthand function for finding a particular story in the state, or a
particular passage in a story.
*/

function getStoryById(state, id) {
	let story = state.story.stories.find(story => story.id === id);

	if (!story) {
		throw new Error(`No chatbot exists with id ${id}`);
	}

	return story;
}

function getPassageInStory(story, id) {
	let passage = story.passages.find(passage => passage.id === id);

	if (!passage) {
		throw new Error(`No passage exists in this chatbot with id ${id}`);
	}

	return passage;
}

/* Defaults for newly-created objects. */

export const storyDefaults = {
	name: locale.say('Untitled Story'),
	startPassage: -1,
	zoom: 1,
	snapToGrid: false,
	stylesheet: '',
	script: '',
	storyFormat: '',
	storyFormatVersion: ''
};

export const passageDefaults = {
	story: -1,
	top: 0,
	left: 0,
	width: 150,
	height: 100,
	tags: [],
	name: locale.say('Untitled Passage'),
	selected: false,

	text: ui.hasPrimaryTouchUI()
		? locale.say('Tap this passage, then the pencil icon to edit it.')
		: locale.say('Double-click this passage to edit it.')
};

const storyStore = {
	// state: {
	// 	stories: []
	// },

	mutations: {
		CREATE_STORY(state, props) {
			let story = Object.assign(
				{
					id: idFor(props.name),
					lastUpdate: new Date(),
					ifid: uuid().toUpperCase(),
					tagColors: {},
					passages: [],
					settings: {},
					plugins: {},
					userData: {},
				},
				storyDefaults,
				props
			);

			if (story.passages) {
				story.passages.forEach(passage => (passage.story = story.id));
			}

			state.story.stories.push(story);
		},

		UPDATE_STORY(state, props) {
			let story = getStoryById(state, props.id);

			Object.assign(story, props);
			story.lastUpdate = new Date();
		},

		DUPLICATE_STORY(state, {id, name}) {
			const original = getStoryById(state, id);

			let story = Object.assign({}, original, {
				id: idFor(name),
				ifid: uuid().toUpperCase(),
				name
			});

			/* We need to do a deep copy of the passages. */

			story.passages = [];

			original.passages.forEach(originalPassage => {
				const passage = Object.assign({}, originalPassage, {
					id: idFor(name + originalPassage.name),
					story: story.id
				});

				if (passage.tags) {
					passage.tags = passage.tags.slice(0);
				}

				if (original.startPassage === originalPassage.id) {
					story.startPassage = passage.id;
				}

				story.passages.push(passage);
			});

			state.stories.push(story);
		},

		IMPORT_STORY(state, toImport) {
			/*
			See data/import.js for how the object that we receive is
			structured.

			Assign IDs to to everything, link passages to their story,
			and set the story's startPassage property appropriately.
			*/

			toImport.id = idFor(toImport.name);

			toImport.passages.forEach(p => {
				p.id = idFor(toImport.name + p.name);
				p.story = toImport.id;

				if (p.pid === toImport.startPassagePid) {
					toImport.startPassage = p.id;
				}

				delete p.pid;
			});

			delete toImport.startPassagePid;
			state.story.stories.push(toImport);
		},

		DELETE_STORY(state, id) {
			state.stories = state.story.stories.filter(story => story.id !== id);
		},

		CREATE_PASSAGE_IN_STORY(state, props) {
			/*
			uuid is used here as a salt so that passages always contain unique
			IDs in Electron (which otherwise uses deterministic IDs based on
			name provided), even if you rename one to a name a previous one used
			to have.
			*/
			
			let story = getStoryById(state, props.id);
			let newPassage = Object.assign(
				{
					id: idFor(story.name + uuid())
				},
				passageDefaults,
				props
			);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
		},

		UPDATE_PASSAGE_IN_STORY(state, props) {
			let story;

			try {
				story = getStoryById(state, props.storyId);
			} catch (e) {
				return;
			}

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			let passage;

			try {
				passage = getPassageInStory(story, props.passageId);
			} catch (e) {
				return;
			}

			Object.assign(passage, props);
			story.lastUpdate = new Date();
		},

		DELETE_PASSAGE_IN_STORY(state, {storyId, passageId}) {
			let story = getStoryById(state, storyId);

			story.passages = story.passages.filter(
				passage => passage.id !== passageId
			);
			story.lastUpdate = new Date();
		}
	}
};

export default storyStore;
