import Vue from 'vue';

import ModalDialog from '../../ui/modal-dialog';

import './index.less';
import template from './index.html';

const About = Vue.extend({
	template,

	data: () => ({
		origin: null
	}),

	computed: {
		appInfo () { return this.$store.getters.appInfo }, // TODO: do we need it
	},

	components: {
		'modal-dialog': ModalDialog,
	},
});

export default About;
