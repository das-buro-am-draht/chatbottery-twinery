/*
A component showing a modal dialog where a story's stylesheet can be edited.
*/

import Vue from 'vue';

import 'codemirror/mode/css/css';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/show-hint';
import ModalDialog from '../../ui/modal-dialog';
import VueCodeMirror from '../../vue/codemirror';

import template from './index.html';

const EditorsStylesheet = Vue.extend({
	template,

	data: () => ({
		storyId: '',
		origin: null
	}),

	computed: {
		allStories () { return this.$store.getters.allStories },
		updateStory () { return this.$store._actions.updateStory[0] },
		source() {
			return this.allStories.find(
				story => story.id === this.storyId
			).stylesheet;
		},

		cmOptions: () => ({
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 4,
			indentWithTabs: true,
			mode: 'css',
			extraKeys: {
				'Ctrl-Space'(cm) {
					cm.showHint();
				}
			}
		})
	},

	methods: {
		resetCm() {
			this.$refs.codemirror.reset();
		},

		save(text) {
			this.updateStory({id: this.storyId, stylesheet: text }); // TODO: check stylesheet
		}
	},
	
	components: {
		'modal-dialog': ModalDialog,
		'code-mirror': VueCodeMirror
	},
});

export default EditorsStylesheet;
