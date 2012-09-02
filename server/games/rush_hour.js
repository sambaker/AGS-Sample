(function(global, undefined) {

function RushHourGame(sessionState, gameState, debug) {
	var _i = this;

	_i.sessionState = sessionState;
	_i.gameState = gameState;
}

// Returns true if the given user is currently allowed to take a turn
RushHourGame.prototype.allowTurn = function(user) {
	return true;
}

// Returns true if the turn is valid for the given user.
// Updates game state unless validateOnly param is true.
RushHourGame.prototype.takeTurn = function(user, turn, validateOnly) {
	return true;
}

// Create the persistent state that clients need to run the game (will also be stored
// in the database for turn-based games)
RushHourGame.createGameState = function(sessionState) {

	var gameState = {
		board: [],
	}

	// TODO:

	return gameState;
}

global.Game = RushHourGame;

return global.Game;

})(typeof exports === 'undefined' ? this : exports)
