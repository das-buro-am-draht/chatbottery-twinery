'use strict';
import Vue from 'vue';
import locale from '../../locale';
import { confirm } from '../confirm';

import './item.less';
import template from './item.html';

const FormatsItem = Vue.extend({
	template,

	props: {
		// A format that this component represents.
		format: Object
	},

	computed: {
		deleteFormat () { return this.$store._actions.deleteFormat[0] },
		setPref () { return this.$store._actions.setPref[0] },
		defaultFormatPref () { return this.$store.getters.defaultFormatPref },
		proofingFormatPref () { return this.$store.getters.proofingFormatPref },

		isDefault() {
			if (this.format.properties.proofing) {
				return this.proofingFormatPref.name === this.format.name &&
					this.proofingFormatPref.version === this.format.version;
			}

			return this.defaultFormatPref.name === this.format.name &&
				this.defaultFormatPref.version === this.format.version;
		},

		author() {
			if (this.format.properties.author) {
				/* L10n: %s is the name of an author. */
				return locale.say('by %s', this.format.properties.author);
			}
			
			return '';
		},

		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');
			
			return path + '/' + this.format.properties.image;
		}
	},

	methods: {
		removeFormat() {
			if (this.isDefault) {
				confirm({
					message:
						locale.say('You may not remove the default chatbot format. Please choose another one first.'),
					buttonLabel:
						'<i class="fa fa-lg fa-check"></i> ' + locale.say('OK')
				});

				return;
			}

			confirm({
				message:
					locale.say('Are you sure?'),
				buttonLabel:
					'<i class="fa fa-lg fa-trash-o"></i> ' + locale.say('Remove'),
				buttonClass:
					'danger',
			})
			.then(() => this.deleteFormat(this.format.id))
			.then(() => this.$dispatch('refresh')); // TODO: check dispatch
		},

		setDefaultFormat() {
			if (this.format.properties.proofing) {
				this.setPref({
					name: 'proofingFormat',
					value: { name: this.format.name, version: this.format.version }
				});
			}
			else {
				this.setPref({
					name: 'defaultFormat',
					value: { name: this.format.name, version: this.format.version }
				});
			}
		},
	},
});

export default FormatsItem;
