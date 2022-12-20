/*
Preference-related actions.
*/

module.exports = {
	setPref({ commit }, props) {
		commit('UPDATE_PREF', props);
	}
};