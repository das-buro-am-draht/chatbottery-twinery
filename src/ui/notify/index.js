import NotificationList from "./list";
let notifications;

const notify = function(html, className = '') {
	if (!notifications) {
		let container = document.createElement('div');

		document.querySelector('body').appendChild(container);
		notifications = new NotificationList({ el: container });
	}

	notifications.add(html, className);
};

export default notify;
