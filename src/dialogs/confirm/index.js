/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
import Vue from 'vue';

import locale from '../../locale';
import { thenable } from '../../vue/mixins/thenable';
import ModalDialog from '../../ui/modal-dialog';

import './index.less';
import template from './index.html';

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {Object} options Object with optional parameters:
						 message (HTML source of the message)
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
**/

export const confirm = (data) => {
	return new confirmation.component(
		{ data }
	).$mountTo(document.body).then(
		result => {
			// False results are produced by the close button and the
			// cancel button. If the result is false, convert it into a
			// rejection.
			//
			// Note: this may change in the future, as using rejections for
			// negative results is somewhat unidiomatic.

			if (!result) {
				throw result;
			}

			return result;
		}
	);
};

const confirmation = {
	component: Vue.extend({
		template,

		data: () => ({
			message: '',
			coda: '',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			modalClass: '',
			buttonClass: 'primary'
		}),

		methods: {
			accept() {
				this.$root.$emit('close', true);
			},

			cancel() {
				this.$root.$emit('close', false);
			},
		},

		components: {
			'modal-dialog': ModalDialog,
		},

		mixins: [thenable]
	}),

	/**
	 Creates a <confirm-modal> dialog using the given data, and returns
	 its promise, which rejects if the 'cancel' button was selected.

	 @return {Promise} the modal's promise.
	*/

	confirm(data) {
		return new confirmation.component(
			{ data }
		).$mountTo(document.body).then(
			result => {
				// False results are produced by the close button and the
				// cancel button. If the result is false, convert it into a
				// rejection.
				//
				// Note: this may change in the future, as using rejections for
				// negative results is somewhat unidiomatic.

				if (!result) {
					throw result;
				}

				return result;
			}
		);
	}
};

export default confirmation;
