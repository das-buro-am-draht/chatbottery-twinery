// A drop-down menu with miscellaneous editing options for a story.

import escape from 'lodash.escape';
import Vue from 'vue';
import FormatDialog from '../../../dialogs/story-format';
// import FormatsDialog from '../../../dialogs/formats';
import JavaScriptEditor from '../../../editors/javascript';
import StatsDialog from '../../../dialogs/story-stats';
import StylesheetEditor from '../../../editors/stylesheet';
import locale from '../../../locale';
import {proofStory} from '../../../common/launch-story';
import {prompt} from '../../../dialogs/prompt';
import {publishStoryWithFormat} from '../../../data/publish';
import save from '../../../file/save';
import DropDown from '../../../ui/drop-down';

import template from './index.html';

const StoryMenu = Vue.extend({
	template,

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	computed: {
		loadFormat () { return this.$store._actions.loadFormat[0] },
		selectPassages () { return this.$store._actions.selectPassages[0] },
		updateStory () { return this.$store._actions.updateStory[0] },
		allFormats () { return this.$store.getters.allFormats },
		appInfo () { return this.$store.getters.appInfo },
		defaultFormatName () { return this.$store.getters.defaultFormatName },
	},

	methods: {
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

		renameStory(e) {
			prompt({
				message: locale.say(
					'What should &ldquo;%s&rdquo; be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.'),
				origin: e.target
			}).then(text => this.updateStory({id: this.story.id, name: text}));
		},

		selectAll() {
			this.selectPassages({storyId: this.story.id, filter: () => true});
		},

		proofStory() {
			proofStory(this.$store, this.story.id);
		},

		publishStory() {
			this.loadFormat(
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			});
		},

		storyStats(e) {
			new StatsDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},

		changeFormat(e) {
			new FormatDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
			// new FormatsDialog({
			// 	store: this.$store,
			// 	data: {origin: e.target}
			// }).$mountTo(document.body);
		},

		toggleSnap() {
			this.updateStory({
				id: this.story.id,
				snapToGrid: !this.story.snapToGrid
			});
		}
	},

	components: {
		'drop-down': DropDown
	},
});

export default StoryMenu;
