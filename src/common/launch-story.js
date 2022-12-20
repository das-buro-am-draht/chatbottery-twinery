/*
In a web context, opens or re-uses a browser window/tab to display a playable
version of a story. In Electron, this publishes the content, then sends it to be
viewed in a browser using a temp file.

These are a single entrypoint so that individual UI parts don't have to worry
about which context they're in to dispatch a play or test.
*/

const windows = {};

function openWindow(url) {
	if (windows[url]) {
		try {
			windows[url].focus();
			windows[url].location.reload();
			return;
		} catch (e) {
			/*
			Fall through: try opening the window as usual. The problem probably
			is that the window has since been closed by the user.
			*/
		}
	}

	windows[url] = window.open(url, url.replace(/\s/g, '_'));
}

export const playStory = (store, {storyId}) => {
	openWindow(`#chatbots/${storyId}/play`);
};

export const proofStory = (store, {storyId, formatId = null}) => {
	if (formatId) {
		openWindow(`#chatbots/${storyId}/proof/${formatId}`);
	}
	else {
		openWindow(`#chatbots/${storyId}/proof`);
	}	
};

export const testStory = (store, {storyId, startPassageId}) => {
	if (startPassageId) {
		openWindow(`#chatbots/${storyId}/test/${startPassageId}`);
	} else {
		openWindow(`#chatbots/${storyId}/test`);
	}
};
