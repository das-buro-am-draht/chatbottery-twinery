/* Shows a modal dialog asking for a text response from the user. */

import Vue from 'vue';
import locale from "../../locale";
import { thenable } from "../../vue/mixins/thenable";

import ModalDialog from '../../ui/modal-dialog';

import './index.less';
import template from './index.html';

export const prompt = (data) => {
	return new prompter.component({ data })
		.$mountTo(document.body)
		.then((result) => {
			/*
			False results are produced by the close button and the cancel
			button. If the result is false, convert it into a rejection.
			
			Note: this may change in the future, as using rejections for
			negative results is somewhat unidiomatic.
			*/

			if (!result) {
				throw result;
			}

			return result;
		});
};

const prompter = {
	component: Vue.extend({
		template,
		
		data: () => ({
			message: '',
			response: '',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			buttonClass: 'primary',
			modalClass: '',
			isValid: true,
			validationError: '',
			validator: function() {},

			origin: null
		}),

		mounted: function () {
				this.$nextTick(function () {
				this.$els.response.focus();
				this.$els.response.select();
			});
		},

		methods: {
			accept() {
				const validResponse = this.validator(this.response);

				if (typeof validResponse === 'string') {
					this.isValid = false;
					this.validationError = validResponse;
				}
				else {
					this.isValid = true;
					this.$broadcast('close', this.response);
				}
			},

			cancel() {
				this.$broadcast('close', false);
			}
		},

		components: {
			"modal-dialog": ModalDialog,
		},

		mixins: [thenable]
	}),

	/**
	 Creates a prompt modal dialog using the given data, and returns its
	 promise, which rejects if the 'cancel' button was selected.
	*/

	prompt
};

export default prompter;
