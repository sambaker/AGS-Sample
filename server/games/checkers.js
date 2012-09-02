(function(global, undefined) {

function CheckersGame(sessionState, gameState, debug) {
	var _i = this;

	_i.sessionState = sessionState;
	_i.gameState = gameState;

	_i.debug = debug;

	if (_i.debug) {

		_i.updateBoardString = function() {
			gameState.boardString = '|---|---|---|---|---|---|---|---|\n'
			for (var y = 0; y < 8; ++y) {
				for (var x = 0; x < 8; ++x) {
					var square = _i.getSquare({x:x,y:y});
					if (square.p == 1) {
						gameState.boardString += '| w ';
					} else if (square.p == 2) {
						gameState.boardString += '| b ';
					} else {
						gameState.boardString += '|   ';
					}
				}
				gameState.boardString += '|\n';
				gameState.boardString += '|---|---|---|---|---|---|---|---|\n'
			}
			console.log(gameState.boardString);
		}

		_i.updateBoardString();
	}

	_i.userToPlayer = {};
	_i.userToPlayer[sessionState.users[0]] = 1;
	_i.userToPlayer[sessionState.users[1]] = 2;
	_i.playerToUser = {};
	_i.playerToUser[1] = sessionState.users[0];
	_i.playerToUser[2] = sessionState.users[1];
}

// Returns true if the given user is currently allowed to take a turn
CheckersGame.prototype.allowTurn = function(user) {
	return this.userToPlayer[user] == this.gameState.nextPlayer;
}

CheckersGame.prototype.getNextPlayer = function() {
	return this.playerToUser[this.gameState.nextPlayer];
}

CheckersGame.prototype.moveSquare = function(from, to) {
	var p = this.getSquare(from);
	this.setSquare(from, null);
	this.setSquare(to, p);
}

CheckersGame.prototype.getWinner = function() {
	var won = true;
	var winner = null;
	for (var i = 1; i <= 2; ++i) {
		if (this.gameState.pieceCounts[i] > 0) {
			if (!winner) {
				winner = this.playerToUser[i];
			} else {
				won = false;
			}
		}
	}
	// If the game is won, return the winner
	return won && winner;
}

CheckersGame.prototype.getSquare = function(pos) {
	return this.gameState.board[pos.x + (pos.y << 3)] || { p:null, k:false };
}

CheckersGame.prototype.setSquare = function(pos, value) {
	var current = this.getSquare(pos);
	if (current.p) {
		--this.gameState.pieceCounts[current.p];
	}
	if (value && value.p) {
		++this.gameState.pieceCounts[value.p];
		if (value.p == 1 && pos.y == 7) {
			value.k = true;
		} else if (value.p == 2 && pos.y == 0) {
			value.k = true;
		}
	}
	this.gameState.board[pos.x + (pos.y << 3)] = value;
}

CheckersGame.prototype.isChainableMoveFrom = function(user, from) {
	var me = this.gameState.nextPlayer;
	var them = (me == 1 ? 2 : 1);
	var x = from.x;
	var y = from.y;
	var isKing = this.getSquare(from).k;
	var chainable = false;
	if ((me == 2 || isKing) && x > 1 && y > 1) {
		chainable = chainable ||
			(this.getSquare({x: x-1, y: y-1}).p == them &&
			 this.getSquare({x: x-2, y: y-2}).p == null);
	}
	if ((me == 2 || isKing) && x < 6 && y > 1) {
		chainable = chainable ||
			(this.getSquare({x: x+1, y: y-1}).p == them &&
			 this.getSquare({x: x+2, y: y-2}).p == null);
	}
	if ((me == 1 || isKing) && x > 1 && y < 6) {
		chainable = chainable ||
			(this.getSquare({x: x-1, y: y+1}).p == them &&
			 this.getSquare({x: x-2, y: y+2}).p == null);
	}
	if ((me == 1 || isKing) && x < 6 && y < 6) {
		chainable = chainable ||
			(this.getSquare({x: x+1, y: y+1}).p == them &&
			 this.getSquare({x: x+2, y: y+2}).p == null);
	}
	return chainable;
}

// Returns false if the turn is invalid for the given user. Anything truthy
// can be returned for a valid turn; it may be an object which can be useful for
// returning state to game clients.
// Updates game state unless validateOnly param is true.
CheckersGame.prototype.takeTurn = function(user, turn, validateOnly) {
	var me = this.gameState.nextPlayer;
	var them = (me == 1 ? 2 : 1);
	if (turn.turnType == 'move') {
		if (turn.from.x < 0 ||
			turn.from.y < 0 ||
			turn.from.x >= 8 ||
			turn.from.y >= 8 ||
			turn.to.x < 0 ||
			turn.to.y < 0 ||
			turn.to.x >= 8 ||
			turn.to.y >= 8) {
			return false;
		}
		if (this.getSquare(turn.from).p == me &&
			this.getSquare(turn.to).p == null) {

			var isKing = this.getSquare(turn.from).k;

			var dxAbs = Math.abs(turn.to.x - turn.from.x);
			var dy = turn.to.y - turn.from.y;
			if (me == 1 && dy < 0 && !isKing) {
				return false;
			}
			if (me == 2 && dy > 0 && !isKing) {
				return false;
			}
			var dyAbs = Math.abs(dy);
			if (dxAbs == 1 && dyAbs == 1 && !this.gameState.chainFrom) {
				if (!validateOnly) {
					this.moveSquare(turn.from, turn.to);
					// this.setSquare(turn.from, null);
					// this.setSquare(turn.to, me);
					this.gameState.nextPlayer = them;
					this.gameState.chainFrom = null;
				}

				if (this.debug) {
					this.updateBoardString();
				}
				// Move is valid
				return {};
			} else if (dxAbs == 2 && dyAbs == 2) {
				var over = {
					x: (turn.from.x + turn.to.x) / 2,
					y: (turn.from.y + turn.to.y) / 2
				};
				if (this.getSquare(over).p == them) {
					var chainable = false;
					if (!validateOnly) {
						this.setSquare(over, null);
						this.moveSquare(turn.from, turn.to);
						// this.setSquare(turn.from, null);
						// this.setSquare(turn.to, me);
						if (!this.isChainableMoveFrom(user, turn.to)) {
							this.gameState.nextPlayer = them;
							this.gameState.chainFrom = null;
						} else {
							this.gameState.chainFrom = { x: turn.to.x, y: turn.to.y };
							chainable = true;
						}
					}
					if (this.debug) {
						this.updateBoardString();
					}
					// Move is valid and chainable
					return {chainable: chainable};
				}
			}
		}
	}

	return false;
}

// Create the persistent state that clients need to run the game (will also be stored
// in the database for turn-based games)
CheckersGame.createGameState = function(sessionState) {

	var gameState = {
		nextPlayer: 1,
		board: [],
		boardString: "",
		pieceCounts: {
			1 : 12,
			2 : 12
		},
		chainFrom: null
	}

	for (var y = 0; y < 8; ++y) {
		for (var x = 0; x < 8; ++x) {
			if (y < 3 && ((x & 1) ^ (y & 1) == 0)) {
				gameState.board.push({p:1,k:false});
			} else if (y > 4 && ((x & 1) ^ (y & 1) == 0)) {
				gameState.board.push({p:2,k:false});
			} else {
				gameState.board.push(null);
			}
		}
	}

	return gameState;
}

global.Game = CheckersGame;

// TEMP:
global.Game.test = function() {
	session = { users: ['sam','eric'] }
	game = new CheckersGame(session, CheckersGame.createGameState(session), true);
	s = function(x1,y1,x2,y2) {
		return game.allowTurn('sam') && game.takeTurn('sam',{
			from:{x:x1,y:y1},
			to:{x:x2,y:y2},
			turnType:'move'
		});
	}
	e = function(x1,y1,x2,y2) {
		return game.allowTurn('eric') && game.takeTurn('eric',{
			from:{x:x1,y:y1},
			to:{x:x2,y:y2},
			turnType:'move'
		});
	}
}

return global.Game;

})(typeof exports === 'undefined' ? this : exports)
