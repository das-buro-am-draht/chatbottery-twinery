# Chatbottery Editor

Editor for creating stories used by [Chatbottery](https://chatbottery.com).

This project depends on Story Formats, NPC- and Web-Runtime as well as Proxy Functionality in the [Chatbottery Project](https://github.com/das-buro-am-draht/chatbottery-web-runtime).

The Editor uses a Proxy Server (https://proxy.chatbottery.com/) for Helper funtions to enable Browser's CORS compliance and OpenAI invocation of Chat GPT.

The Editor was created by forking [Twinery](https://twinery.org) on [Github](https://github.com/klembot/twinejs). See [twinejs](./twine.md).

> **Note**
> - Only Web build is used - no `Electron` or `CDN` deployment.
> - Tests are partially broken.

## Story Format

The Story Format is used to test Chatbot stories and create the storie's JSON file as a data object within a `script` element that starts the Chatbot's runtime and application `chatbottery.js` - see https://docu.chatbottery.com/#/setup/index?id=seiteneinbindung-des-chatbot.

The Story Format is fetched by the [Editor](https://github.com/das-buro-am-draht/chatbottery-twinery) whenever a story is played and thus a new tab is created using [JSON Padding](http://jsonp.eu/) to avoid CORS issues (`chatbotteryStoryFormat.v12.js?callback=storyFormat`). The invoked JS calls the JSONP callback function `storyFormat` with an JS Object as a parameter that is stored in file `storyFormat.ts` which has in its `source` parameter the HTML code for the newly created tab. The Editor replaces `{{STORY_NAME}}` with the storie's name and `{{STORY_DATA}}` with the story data within the HTML code to create the `window.story` object which contains all necessary data for constructing the NPC Runtime object within the story format code.

## Local setup 

### Setup local PHP Proxy

Local Proxy Server Functions require Apache web server and PHP (see https://proxy.chatbottery.com/info.php) being installed.

1. Setup a Virtual Host `chatbot.proxy` with declaration in `/etc/hosts` and definition in `/etc/apache2/sites-available` and `/etc/apache2/sites-enabled` pointing to your local Document Root Folder [php/proxy](https://github.com/das-buro-am-draht/chatbottery-web-runtime/tree/master/php/proxy).
```xml
<VirtualHost *:80>
	ServerName chatbot.proxy

	ServerAdmin proxy@dasburo.com
	DocumentRoot /home/{user}/chatbottery-web-runtime/php/proxy

	<Directory /home/{user}/chatbottery-web-runtime/php/proxy>
	        Options -Indexes +FollowSymLinks
	        AllowOverride All
	        Require all granted
	</Directory>

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
```

2. Start Aache Web Server with `service apache2 start`

### Setup Editor with NPM / YARN

1. Run `npm install` / `yarn install` for setup of dependency packages

2. Start Server by `npm run start` / `yarn start` listening on port 8080

3. Open Browser on `http://localhost:8080`

4. Set Variable `DEV_ENV` to `true` in Browser's Local Storage.<br>
   - This causes Proxy calls to adress the Local Host `chatbot.proxy`
   - The Variable has also an effect in the [Story Format and Chatbot](https://github.com/das-buro-am-draht/chatbottery-web-runtime)

5. In case you run the [Story Format](https://github.com/das-buro-am-draht/chatbottery-web-runtime/tree/master/twine2npc) locally you have to add the JS to the Editor's story formats (e.g. `http://localhost:8081/chatbotteryStoryFormat.v12.js`). The Url is stored in the Local Storage within a stringified JSON in variable `twine-storyformats-...`.

## Deployment

Changes are deployed by using [Github Workflows](https://docs.github.com/en/actions/using-workflows) whenever pushed to either Branch `develop` ([Staging](https://develop.editor.chatbottery.com/)) or `master` ([Production](https://editor.chatbottery.com/)).

Workflows create Build and transfer Files via FTP to the Deployment Server.