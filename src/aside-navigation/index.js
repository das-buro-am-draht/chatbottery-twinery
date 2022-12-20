// The side toolbar of a story list.

import Vue from 'vue';
import FormatsDialog from "../dialogs/formats";
import QuotaGauge from '../ui/quota-gauge';
import CheckLocalState from './check-local-state';
import CheckChrome from './check-chrome';

import './index.less';
import template from './index.html';

const AsideNavigation = Vue.extend({
	template,

	data: () => ({
		storiesLength: null
	}),
 
	props: {
		activeNavItem: {
			type: String,
			default: 'home'
		},
	},

	computed: {
		setPref () { return this.$store._actions.setPref[0] },
		stories () { return this.$store.getters.stories },
		appInfo () { return this.$store.getters.appInfo }
	},

	methods: {
		openRedirect(url) {
			window.open(url, "_blank") || window.location.replace(url);
		},
		openFormats(e) {
			new FormatsDialog({
				store: this.$store,
				data: { origin: e.target },
			}).$mountTo(document.body);
		}
	},

	activate: function (done) {
		const storiesLength = this.stories.length;

		this.storiesLength = storiesLength;

		done();
	},

	components: {
		'quota-gauge': QuotaGauge,
		'check-local-state': CheckLocalState,
		'check-chrome': CheckChrome
	}
});

export default AsideNavigation;
