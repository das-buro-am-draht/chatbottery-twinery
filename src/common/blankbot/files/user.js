/**
 * Function is called after the chatbottery runtime was loaded and
 * before function 'onChatbotteryRuntimeLoaded' is called
 * @param user user data object
 */
 function initUserDataProps(user) {

  // Add some default user data
  user.$name = "Nutzer";
  user.$plz = undefined;
  user.$mail = undefined;

	user.$yesAnswers = ['Ja', 'Klar', 'yes','verstanden', 'okay', 'Yup', 'Jawohl', 'ja', 'sicher', 'Okay', 'alle klar', 'klar', 'einverstanden', 'Einverstanden', 'Alles verstanden', 'alles verstanden'];
	user.$noAnswers = ['Nein', 'nein', 'ne', 'neeee', 'nope', 'no', 'neiän', 'neh', 'nicht einverstanden', 'Nicht einverstanden', 'Nicht Einverstanden'];

  // Comfort accessors to get a random image
  Object.defineProperty(user, "$randomImage", {
    get: function () {
      const images = [
        "https://images.unsplash.com/photo-1462953491269-9aff00919695?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80", 
        "https://images.unsplash.com/photo-1516934024742-b461fba47600?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80", 
        "https://cdn.pixabay.com/photo/2017/01/14/12/59/iceland-1979445_960_720.jpg", 
        "https://image.shutterstock.com/z/stock-photo-red-fox-vulpes-vulpes-hunting-i-412184455.jpg"
      ];
      return this.$random(images);
    }
  });
}

/**
 * Function is called after the chatbottery runtime was loaded and
 * before the Chatbot is shown
 * @param runtime Chatbottery Runtime Object
 */
 function onChatbotteryRuntimeLoaded(runtime) {

  // Get the user data object
  const user = runtime.userData;
	
  // Configure a Menu
  const menuItems = [
		{
			title: 'Zum Start',
			goto: 'Start'
		},
		{
			title: 'Erstes Thema',
			goto: 'Thema 1'
		},
		{
			title: 'Zweites Thema',
			goto: 'Thema 2'
		},
		{
			title: 'Drittes Thema',
			goto: 'Thema 3'
		},
		{
			title: 'Infos zum Datenschutz',
			goto: 'Datenschutz'
		},
		{
			title: 'Chatbot schließen',
			fn: 'closeChatWindow'			
		}
	];
	const config = {
    // define icon position in Chatbot
    // HEADER: menu icon will be shown in the header area as first item
    // INPUT : menu icon will be shown in the user input area as last item
    // for 'INPUT' remove 'filter: invert(1);' from the CSS menu class 'chatbot-persistent-menu-icon'
		position: 'HEADER' 
	};
  // Create a Menu in the Chatbot with configuration from above
  runtime.createPersistentMenu(menuItems, config);

  // Define a User Function that is shipped in the menu entry above and will close the Chatbot on invocation
  user.closeChatWindow = (app) => {
    app.onChatWindowClose();
  };

  // SET a base url to grab the images & videos
  // (otherwise pics would not show in twine tool)
  runtime.assetBaseUrl = "https://www.fb-berlin.de/projects/chatbottery/verdi/";

  // Fragefeld definieren
  runtime.i18n.de.inputFieldPlaceholder = ['']
  
  runtime.i18n.de.chooseIntent = ['Folgende Themen könnten dazu passen:', 'Vielleicht hilft Dir eines von diesen Themen?', 'Dazu habe ich Folgendes gefunden:','Meinst Du vielleicht das?', 'Meinst Du vielleicht das?','Dazu weiß ich Folgendes:','Dazu habe ich das gefunden:','Vielleicht passt dieses Thema:']
  
  runtime.i18n.de.unmatchedIntent = ['Entschuldige. Das habe ich leider nicht verstanden.','Hmmm. Könntest Du das bitte anders formulieren?','Darauf habe ich leider keine Antwort.','Hmm. Ich weiß nicht, ob ich Dich da richtig verstanden habe','Dazu kann ich leider noch nichts sagen.','Tut mir leid, das verstehe ich so nicht. Kannst Du das bitte anders ausdrücken?','Entschuldige. Ich weiß gerade nicht was Du meinst.','Diese Formulierung habe ich leider nicht verstanden.','Ich bin nicht ganz sicher was Du meinst.']
}

