/* The main view where story editing takes place. */

const values = require('lodash.values');
import Vue from 'vue';
import { confirm } from '../dialogs/confirm';
import domEvents from '../vue/mixins/dom-events';
import locale from '../locale';
import { passageDefaults } from '../data/store/story';
import zoomSettings from './zoom-settings';

import LinkArrows from './link-arrows';
import PassageItem from './passage-item';
import StoryToolbar from './story-toolbar';
import MarqueeSelector from './marquee-selector';
import ChatbotToolbar from '../chatbot-toolbar';
import CreateChatbotButton from '../create-chatbot-button';

import './index.less';
import template from './index.html';

/*
A memoized, sorted array of zoom levels used when zooming in or out.
*/

const zoomLevels = values(zoomSettings).sort();

const ChatbotEditView = Vue.extend({
	template,

	/* The id of the story we're editing is provided by the router. */

	props: {
		storyId: {
			type: String,
			required: true
		}
	},

	data: () => ({
		/*
		The window's width and height. Our resize() method keeps this in sync
		with the DOM.
		*/

		winWidth: window.innerWidth,
		winHeight: window.innerHeight,

		/*
		The calculated width and height we maintain to allow the user to
		always have space below and to the right of passages in the story
		map.
		*/

		width: 0,
		height: 0,

		/*
		The regular expression that matching passages should highlight.
		If null, none should highlight.
		*/

		highlightRegexp: null,

		/*
		The offset that selected passages should be displayed at
		temporarily, to show feedback as the user drags passages around.
		*/

		screenDragOffsetX: 0,
		screenDragOffsetY: 0,
		passagePositions: {}
	}),

	computed: {
		createPassage () { return this.$store._actions.createPassage[0] },
		deletePassage () { return this.$store._actions.deletePassage[0] },
		loadFormat () { return this.$store._actions.loadFormat[0] },
		positionPassage () { return this.$store._actions.positionPassage[0] },
		updatePassage () { return this.$store._actions.updatePassage[0] },
		updateStory () { return this.$store._actions.updateStory[0] },
		allFormats () { return this.$store.getters.allFormats },
		allStories () { return this.$store.getters.allStories },
		defaultFormatName () { return this.$store.getters.defaultFormatName },

		/*
		Sets our width and height to:
		* the size of the browser window
		* the minimum amount of space needed to enclose all existing
		passages
		
		... whichever is bigger, plus 50% of the browser window's
		width and height, so that there's always room for the story to
		expand.
		*/

		cssDimensions() {
			let width = this.winWidth;
			let height = this.winHeight;
			let passagesWidth = 0;
			let passagesHeight = 0;

			this.story.passages.forEach(p => {
				const right = p.left + p.width;
				const bottom = p.top + p.height;

				if (right > passagesWidth) {
					passagesWidth = right;
				}

				if (bottom > passagesHeight) {
					passagesHeight = bottom;
				}
			});

			width = Math.max(passagesWidth * this.story.zoom, this.winWidth);
			height = Math.max(passagesHeight * this.story.zoom, this.winHeight);

			/*
			Give some space below and to the right for the user to add
			passages.
			*/

			width += this.winWidth / 2;
			height += this.winHeight / 2;

			return {
				width: width + 'px',
				height: height + 'px'
			};
		},

		/* Our grid size -- for now, constant. */

		gridSize() {
			return 25;
		},

		/*
		Returns an array of currently-selected <passage-item> components. This
		is used by the marquee selector component to do additive selections
		by remembering what was originally selected.
		*/

		selectedChildren() {
			return this.$refs.passages && this.$refs.passages.filter(p => p.passage.selected);
		},

		

		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		/* A human readable adjective for the story's zoom level. */

		zoomDesc() {
			return Object.keys(zoomSettings).find(
				key => zoomSettings[key] === this.story.zoom
			);
		}
	},

	watch: {
		'story.name': {
			handler(value) {
				document.title = value;
			},

			immediate: true
		},

		'story.zoom': {
			handler(value, old) {
				/*
				Change the window's scroll position so that the same logical
				coordinates are at its center.
				*/
				
				const halfWidth = window.innerWidth / 2;
				const halfHeight = window.innerHeight / 2;
				const logCenterX = (window.scrollX + halfWidth) / old;
				const logCenterY = (window.scrollY + halfHeight) / old;

				window.scroll(
					(logCenterX * value) - halfWidth,
					(logCenterY * value) - halfHeight
				);
			}
		}
	},

	mounted: function () {
		
		this.$nextTick(function () {
			this.resize();
			this.on(window, 'resize', this.resize);
			this.on(window, 'keyup', this.onKeyup);
	
			if (this.story.passages.length === 0) {
				this.createPassageAt();
			}
			
			this.passagePositions = this.createPassagePositions();
		});
	},

	methods: {
		/*
		An array of <passage-item> components and their link positions,
		indexed by name.
		*/

		createPassagePositions() {
			return this.$refs.passages && this.$refs.passages.reduce(
				(result, passageView) => {
					result[passageView.passage.name] = passageView.linkPosition;
					return result;
				},

				{}
			);
		},

		centerPosition() {
			const selectedPassage = document.querySelector(".passage.selected");
			const startPassage = document.querySelector(".passage.start");
			const setPositions = (target) => {
				const targetX = target.offsetLeft;
				const targetY = target.offsetTop;
				const windowHalfHeight = window.innerHeight / 2;
				const windowHalfWidth = window.innerWidth / 2;
				const calcX = targetX - windowHalfWidth;
				const calcY = targetY - windowHalfHeight;
				const x = calcX > 0 ? calcX : 0;
				const y = calcY > 0 ? calcY : 0;

				window.scroll(x, y);
			};
		
			if (selectedPassage) {
				setPositions(selectedPassage);
				return;
			}

			if (startPassage) {
				setPositions(startPassage);
				return;
			}
		
			window.scroll(0, 0);
		},

		resize() {
			this.winWidth = window.innerWidth;
			this.winHeight = window.innerHeight;
		},

		zoomIn(wraparound) {
			let zoomIndex = zoomLevels.indexOf(this.story.zoom);

			if (zoomIndex === 0) {
				if (wraparound) {
					this.updateStory(
						{
							id: this.story.id,
							zoom: zoomLevels[zoomIndex.length - 1]
						}
					);
				}
			}
			else {
				this.updateStory(
					{
						id: this.story.id,
						zoom: zoomLevels[zoomIndex - 1]
					}
				);
			}
		},

		zoomOut(wraparound) {
			let zoomIndex = zoomLevels.indexOf(this.story.zoom);

			if (zoomIndex === zoomLevels.length - 1) {
				if (wraparound) {
					this.updateStory(
						{
							id: this.story.id,
							zoom: zoomLevels[0]
						}
					);
				}
			}
			else {
				this.updateStory(
					{
						id: this.story.id,
						zoom: zoomLevels[zoomIndex + 1]
					}
				);
			}
		},

		/*
		Creates a passage, optionally at a certain position onscreen. If
		unspecified, this does so at the center of the page. This also
		handles positioning the passage so it doesn't overlap others.
		*/

		createPassageAt(name, top, left) {
			/*
			If we haven't been given coordinates, place the new passage at
			the center of the window. We start by finding the center point
			of the browser window in logical coordinates, e.g. taking into
			account the current zoom level. Then, we move upward and to the
			left by half the dimensions of a passage in logical space.
			*/

			if (!left) {
				left = (window.pageXOffset + window.innerWidth / 2)
					/ this.story.zoom;
				left -= passageDefaults.width;
			}

			if (!top) {
				top = (window.pageYOffset + window.innerHeight / 2)
					/ this.story.zoom;
				top -= passageDefaults.height;
			}

			/*
			Make sure the name is unique. If it's a duplicate, we add a
			number at the end (e.g. "Untitled Passage 2", "Untitled Passage
			3", and so on.
			*/

			name = name || locale.say('Untitled Passage');

			if (this.story.passages.find(p => p.name === name)) {
				const origName = name;
				let nameIndex = 0;

				do {
					nameIndex++;
					name = origName + ' ' + nameIndex;
				}
				while
					(this.story.passages.find(p => p.name === name));
			}

			/* Add it to our collection. */

			this.createPassage({id: this.story.id, name, left, top });

			/*
			Then position it so it doesn't overlap any others, and save it
			again.
			*/
			
			this.positionPassage({
				storyId: this.story.id,
				passageId: this.story.passages.find(p => p.name === name).id,
				gridSize: this.gridSize
			});
		},

		/*
		Creates a passage under the cursor in response to a
		webkitmouseforcedown event. At the time of writing, this is a
		Mac-specific feature, but can be extended once standards catch up.
		*/
		
		onMouseForceDown(e) {
			let top = (e.pageY / this.story.zoom) -
				(passageDefaults.height / 2);
			let left = (e.pageX / this.story.zoom) -
				(passageDefaults.width / 2);
			
			this.createPassage({name: null, top, left});
		},

		/*
		Zooms in or out based on a mouse wheel event. The user must hold
		down the Alt or Option key for it to register.
		*/

		onWheel(e) {
			if (e.altKey && !e.ctrlKey) {
				/* Only consider the Y component of the motion. */

				if (e.wheelDeltaY > 0) {
					this.zoomIn(true);
				}
				else {
					this.zoomOut(true);
				}

				e.preventDefault();
			}
		},

		onKeyup(e) {
			/*
			If the key is going anywhere (e.g. into a text field), disregard it.
			*/

			let target = e.target;

			while (target) {
				if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
					return;
				}

				target = target.parentNode;
			}

			switch (e.keyCode) {
				/* Plus key */

				case 187:
					this.zoomOut();
					break;
				
				/* Minus key */

				case 189:
					this.zoomIn();
					break;

				/* Delete key */

				case 46: {
					const toDelete =
						this.story.passages.filter(p => p.selected);

					if (toDelete.length === 0) {
						return;
					}

					const message = locale.sayPlural(
						`Are you sure you want to delete &ldquo;%2$s&rdquo;? This cannot be undone.`,
						`Are you sure you want to delete %d passages? This cannot be undone.`,
						toDelete.length,
						toDelete[0].name
					);

					confirm({
						message,
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
						buttonClass: 'danger'
					}).then(() => {
						toDelete.forEach(
							p => this.deletePassage({storyId: this.story.id, passageId: p.id})
						);
					});
					break;
				}
			}
		}
	},

	events: {
		/*
		Our children (e.g. the search field can tell us to change what the
		highlight filter should be.
		*/

		'highlight-regexp-change'(value) {
			this.highlightRegexp = value;
		},
		
		/*
		A hook into our createPassage() method for child components.
		*/

		'passage-create'(name, left, top) {
			this.createPassageAt(name, left, top);
		},

		/*
		A child will dispatch this event to us as it is dragged around. We
		set a data property here and other selected passages react to it by
		temporarily shifting their onscreen position.
		*/

		'passage-drag'(xOffset, yOffset) {
			if (this.story.snapToGrid) {
				const zoomedGridSize = this.gridSize * this.story.zoom;

				this.screenDragOffsetX = Math.round(xOffset / zoomedGridSize) *
					zoomedGridSize;
				this.screenDragOffsetY = Math.round(yOffset / zoomedGridSize) *
					zoomedGridSize;
			}
			else {
				this.screenDragOffsetX = xOffset;
				this.screenDragOffsetY = yOffset;
			}
		},

		/*
		A child will dispatch this event at the completion of a drag. We
		pass this onto our children, who use it as a chance to save what was
		a temporary change in the DOM to their model.
		*/

		'passage-drag-complete'(xOffset, yOffset) {
			this.screenDragOffsetX = 0;
			this.screenDragOffsetY = 0;

			if (this.story.snapToGrid) {
				const zoomedGridSize = this.gridSize * this.story.zoom;

				xOffset = Math.round(xOffset / zoomedGridSize) * zoomedGridSize;
				yOffset = Math.round(yOffset / zoomedGridSize) * zoomedGridSize;
			}

			this.$root.$emit('passage-drag-complete', xOffset, yOffset);
		},

		/*
		Positions a passage on behalf of a child component. This needs to be
		here, as opposed to a direct Vuex action, because this takes into
		account the grid size.
		*/

		'passage-position'(passage, options) {
			this.positionPassage({
				storyId: this.story.id,
				passageId: passage.id,
				gridSize: this.gridSize,
				filter: options.ignoreSelected && (otherPassage =>
					!otherPassage.selected)
			});
		}
	},

	components: {
		'link-arrows': LinkArrows,
		'passage-item': PassageItem,
		'story-toolbar': StoryToolbar,
		'marquee-selector': MarqueeSelector,
		'chatbot-toolbar': ChatbotToolbar,
		'create-chatbot-button': CreateChatbotButton,
	},

	mixins: [domEvents]
});

export default ChatbotEditView;
