Refactoring notes
-----------------

- This project has been split into 3 different github repos
- Everything still works, but the documentation isn't yet updated (although AGS-Sample should be self-explanatory)

Notes from latest checkin
-------------------------

Changed this repo to be the AGS Server only
The AGS project with a couple of sample games is split into:

AGS-Server - server component only with no game definitions
AGS-Client - AGS client files with no html or game-specific javascript
AGS-Sample - A complete sample app with html and JS files for checkers and chess. Includes AGS-Server and AGS-Client as submodules and shows how to create a new project for a new game type using the AGS-Server and AGS-Client modules


Artefact Game Server
--------------------

AGS is a multiplayer client/server platform. It includes a node.js server that provides

- basic user account creation and authentication
- game creation and player matchmaking
- server side move validation using javascript game logic functions
- couchdb game persistence to be crash-tolerant
- uses socket.io connections for presence-aware connectivity
- turn-based game client support
- real-time game client support
- games are added via game definition plugins with a currently undocumented interface - although multiple sample clients are included, it's not too hard to figure out what's required

There is also a early web client freamwork that includes

- An interface for handling all server communication, account creation, login, matchmaking, instancing games and hooks to custom game clients
- A client interface for rendering the games

Project status
--------------

The following features are in progress:

- Presence awareness on the client isn't finished yet
- A realtime match game is being added to test/demonstrate support for real-time games
- Interface for choosing the number of players and picking specific opponents is not yet working but is in progress

Not yet supported
-----------------

- Encrypted passwords! Currently user passwords are stored in the database and in client cookies as plain text
- A well designed game interface. Chess and Checkers are intended as demo games only and will not have their dubious interfaces refined.
- Scalability: currently the app supports only 1 server

Local installation
------------------

- Install node.js and npm

- From the root folder of the repo, install the required node packages using:

npm install socket.io cradle node-inspector

- Create a couch database - you can create a free one at cloudant.com

- Copy gameserver/server-config-template.js to gameserver/server-config.js and set:

	- the port that you want your nodeserver to run on (I use 8000 since my servers also have apache running on port 80)

	- the url, port, username and password for your couch database. These are the credentials you provided when creating your cloudant db and the default port is 443

Here's an example version of settings in server-config.js for a cloudant database:

	global.Config = {
		// Port that node server will run on
		serverPort: 8000,
		dbURL: "https://sam-baker.cloudant.com",
		// Couch database port
		dbPort: 443,
		dbUser: "sam-baker",
		dbPassword: "your-password-here"
	}

- To run the node server locally, I use the run.sh script in the root folder. This does a few things:

1) it kills any existing node server running in the background

2) it starts the game server running in the background

3) it starts node-inspector which allows you to debug the node server in any webkit browser. You can set breakpoints, inspect objects etc, a very useful environment.

Deployment
----------

To deploy I ftp the ags folder (the game clients) to one server. The clients are served by apache so if my server root for example.domain.com is /var/www and I copied the ags folder to that folder, the game client is accessed in a browser at http://example.domain.com/ags/

I ftp the gameserver folder to a different Ubuntu server which has node and the socket.io, cradle and node-inspector packages installed.

To run the server as a daemon, I created a file:

	/etc/init/node-game.conf

Which is included in this repo but needs to be moved to /etc/init to work.

This will start the node server when the Ubuntu server boots.

When I make updates to the server, I ssh to the Ubuntu box and run:

	stop node-game
	start node-game

To restart the node server with the latest changes.

Adding a game on the server
---------------------------

Game logic and game state are written in javascript. To make a game available to the server, create two javascript files in the gameserver/games folder:

	game-name.def.js
	game-name.js

game-name.def.js file is a data structure that describes the game (min/max players, realtime/turn-based, display name). See the included games for examples.

game-name.js defines a game object and must assign it to global.Game. This object must implement a standard set of methods to provide the game logic. This file is used on the client to validate moves by the user and also on the server to validate move requests coming from the client. This stops a client from cheating by sending moves that are invalid but produce an advantageous game state.

After adding a game, restart the node server. If the server is running locally on port 8000, you can visit this URL in your browser:

	http://localhost:8000/api/game-types

and you should see your new game returned in the list. You should also see the game logic javascript file returned at:

	http://localhost:8000/api/games/game-name

Adding a game on the client
---------------------------

The client is currently run as a web app and the best place to start is with the example client.

The client consists of:

index.html - the html template for the webapp
javascripts/AGSConnectionView.js - the javascript view that handles account/creation and login, creating and displaying games and starting a multiplayer game
javascripts/app_checkers.js - this is the bit you need to rewrite for a new game client. It needs to provide a global function that's called on the webpages onload event:

	function startup() {
		var root = document.getElementById('root');

		var clients = {
			checkers: new GameClient(root, "checkers"),
			chess: new GameClient(root, "chess")
		}

		gGameview = new ArtefactGameServerConnectionView(gameServer,
			["checkers", "chess"],
			clients,
			true);
	}

First it initializes some clients for each supported game type - in the above example chess and checkers.

It passes that to an instance of ArtefactGameServerConnectionView which takes params:

- the URL of your node server (typically "localhost:8000" for development)
- the array of game types that the client supports (used for filtering games on the server side). These names match the server-side javascript files, for example chess corresponds to the game defined in games/chess.def.js and games/chess.js on the server.
- a debug flag, which is propagated to the game clients. For example my checkers.js game dumps the board state to the console via console.log() after each move.

The GameClient class is also included in app_checkers.js and it is responsible for the interaction and rendering of the game. It must include a method show(gameSession, game) which takes the current game session from the server and an instance of the current game class (e.g. CheckersGame in checkers.js). show is called when the user chooses to play the game and also after a move is received from the server and the client needs to update the current state.

How to edit
-----------

If you're not already using Sublime Text to edit your code, download it here http://www.sublimetext.com/

Image credits
-------------

The chess game uses chess board squares from here:

http://www.chesssets.com/chess-boards/wood-boards/championsycamorewalnutchessboard.cfm

And chess pieces from A Kadir Bener on deviantArt:

http://abener.deviantart.com/#/d2n6kcb
