// Functions for moving prefs in and out of local storage.

import uuid from 'tiny-uuid';

module.exports = {
	save(store) {
		// Delete existing prefs in local storage, since we aren't bothering to
		// preserve ids.

		const previouslySerialized = window.localStorage.getItem('twine-prefs');

		if (previouslySerialized) {
			previouslySerialized.split(',').forEach(id => {
				window.localStorage.removeItem('twine-prefs-' + id);
			});
		}

		// Save new ones.

		let ids = [];

		Object.keys(store.state.pref).forEach(name => {
			const id = uuid();

			ids.push(id);
			window.localStorage.setItem(
				'twine-prefs-' + id,
				JSON.stringify({
					id,
					name,
					value: store.state.pref[name]
				})
			);
		});

		window.localStorage.setItem('twine-prefs', ids.join(','));
	},

	load(store) {
		const serialized = window.localStorage.getItem('twine-prefs');

		if (!serialized) {
			return;
		}

		serialized.split(',').forEach(id => {
			try {
				const item = JSON.parse(
					window.localStorage.getItem('twine-prefs-' + id)
				);

				store._actions.setPref({name: item.name, value: item.value});
			}
			catch (e) {
				console.warn(
					`Preference ${id} had corrupt serialized value, skipping`,
					window.localStorage.getItem('twine-prefs-' + id)
				);
			}
		});
	}
};
