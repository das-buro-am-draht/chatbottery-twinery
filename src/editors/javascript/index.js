// A component showing a modal dialog where a story's JavaSCript.

import Vue from 'vue';

import ModalDialog from '../../ui/modal-dialog';
import VueCodeMirror from '../../vue/codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/show-hint';

import template from './index.html';

const EditorsJavaScript = Vue.extend({
	template,

	data: () => ({
		storyId: ''
	}),

	computed: {
		updateStory () { return this.$store._actions.updateStory[0] },
		allStories () { return this.$store.getters.allStories },
		source() {
			return this.allStories.find(
				story => story.id === this.storyId
			).script;
		},

		cmOptions: () => ({
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'javascript',
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
			this.updateStory({id: this.storyId, script: text });
		}
	},
	
	components: {
		'modal-dialog': ModalDialog,
		'code-mirror': VueCodeMirror
	},
});

export default EditorsJavaScript;
