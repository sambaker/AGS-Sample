(function(global, undefined) {

function ChessGame(sessionState, gameState, debug) {
	var _i = this;

	_i.sessionState = sessionState;
	_i.gameState = gameState;

	_i.debug = debug;

	_i.userToPlayer = {};
	_i.userToPlayer[sessionState.users[0]] = 1;
	_i.userToPlayer[sessionState.users[1]] = 2;
	_i.playerToUser = {};
	_i.playerToUser[1] = sessionState.users[0];
	_i.playerToUser[2] = sessionState.users[1];
}

// Returns true if the given user is currently allowed to take a turn
ChessGame.prototype.allowTurn = function(user) {
	return this.userToPlayer[user] == this.gameState.nextPlayer;
}

ChessGame.prototype.getNextPlayer = function() {
	return this.playerToUser[this.gameState.nextPlayer];
}

ChessGame.prototype.moveSquare = function(from, to) {
	var p = this.getSquare(from);
	this.setSquare(from, null);
	this.setSquare(to, p);
}

ChessGame.prototype.getWinner = function() {
	if (this.gameState.won) {
		return this.playerToUser[this.gameState.won];
	}
	return null;
}

ChessGame.prototype.getSquare = function(pos) {
	return this.gameState.board[pos.x + (pos.y << 3)] || { p:null, t:null };
}

ChessGame.prototype.setSquare = function(pos, value) {
	var me = this.gameState.nextPlayer;
	if (this.getSquare(pos).t == 'king' && value && value.p == me) {
		this.gameState.won = me;
	}
	if (value && value.t == 'pawn') {
		if (me == 1 && pos.y == 7 || me == 2 && pos.y == 0) {
			value.t = 'queen';
		}
	}
	this.gameState.board[pos.x + (pos.y << 3)] = value;
}

ChessGame.prototype.checkMove = {
	pawn : function(from, fxy, to, txy, dxy) {
		var me = from.p;
		if (to.t == null && dxy.x == 0) {
			if (me == 1 && dxy.y == 1) {
				// Move down 1 square
				return true;
			}
			if (me == 1 && fxy.y == 1 && dxy.y == 2) {
				// Move down 2 from start position
				return true;
			}
			if (me == 2 && dxy.y == -1) {
				// Move up 1 square
				return true;
			}
			if (me == 2 && fxy.y == 6 && dxy.y == -2) {
				// Move up 2 from start position
				return true;
			}
		} else if (to.t) {
			if (me == 1 && dxy.y == 1 && Math.abs(dxy.x) == 1) {
				return true;
			}
			if (me == 2 && dxy.y == -1 && Math.abs(dxy.x) == 1) {
				return true;
			}
		}
		return false;
	},
	rook : function(from, fxy, to, txy, dxy) {
		return (dxy.x != 0 && dxy.y == 0) || (dxy.y != 0 && dxy.x == 0);
	},
	bishop : function(from, fxy, to, txy, dxy) {
		return Math.abs(dxy.x) == Math.abs(dxy.y);
	},
	knight : function(from, fxy, to, txy, dxy) {
		if (Math.abs(dxy.x) == 1 && Math.abs(dxy.y) == 2) {
			return true;
		}
		if (Math.abs(dxy.x) == 2 && Math.abs(dxy.y) == 1) {
			return true;
		}
		return false;
	},
	king : function(from, fxy, to, txy, dxy) {
		return (dxy.x <= 1 && dxy.x >= -1 && dxy.y <= 1 && dxy.y >= -1);
	},
	queen : function(from, fxy, to, txy, dxy) {
		return (dxy.x != 0 && dxy.y == 0) || (dxy.y != 0 && dxy.x == 0) || Math.abs(dxy.x) == Math.abs(dxy.y);
	}
}

ChessGame.prototype.lineOpen = function(from, to) {
	var d = { x: to.x - from.x, y: to.y - from.y };
	if (d.y == 0) {
		var x1 = Math.min(from.x, to.x);
		var x2 = Math.max(from.x, to.x);
		for (var x = x1 + 1; x < x2; ++x) {
			if (this.getSquare({x:x,y:from.y}).t) {
				return false;
			}
		}
	} else if (d.x == 0) {
		var y1 = Math.min(from.y, to.y);
		var y2 = Math.max(from.y, to.y);
		for (var y = y1 + 1; y < y2; ++y) {
			if (this.getSquare({x:from.x,y:y}).t) {
				return false;
			}
		}
	} else {
		var dx = 1;
		if (d.x < 1) {
			dx = -1;
		}
		var dy = 1;
		if (d.y < 1) {
			dy = -1;
		}
		var count = Math.abs(d.x);
		for (var i = 1; i < count; ++i) {
			var pos = {x:from.x + i * dx, y:from.y + i * dy};
			if (this.getSquare(pos).t) {
				return false;
			}
		}
	}
	return true;
}

// Returns false if the turn is invalid for the given user. Anything truthy
// can be returned for a valid turn; it may be an object which can be useful for
// returning state to game clients.
// Updates game state unless validateOnly param is true.
ChessGame.prototype.takeTurn = function(user, turn, validateOnly) {
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
		var from = this.getSquare(turn.from);
		var to = this.getSquare(turn.to);
		var delta = { x: turn.to.x - turn.from.x, y: turn.to.y - turn.from.y };
		if (from.p == me &&
			to.p != from.p &&
			this.checkMove[from.t](from,turn.from,to,turn.to,delta) &&
			(from.t == 'knight' || this.lineOpen(turn.from,turn.to))) {

			if (!validateOnly) {
				this.moveSquare(turn.from, turn.to);
				this.gameState.nextPlayer = them;
			}
			return true;
		}
	}

	return false;
}

// Create the persistent state that clients need to run the game (will also be stored
// in the database for turn-based games)
ChessGame.createGameState = function(sessionState) {

	var gameState = {
		nextPlayer: 1,
		board: [],
		won: null
	}

	gameState.board.push({p:1,t:'rook'});
	gameState.board.push({p:1,t:'knight'});
	gameState.board.push({p:1,t:'bishop'});
	gameState.board.push({p:1,t:'king'});
	gameState.board.push({p:1,t:'queen'});
	gameState.board.push({p:1,t:'bishop'});
	gameState.board.push({p:1,t:'knight'});
	gameState.board.push({p:1,t:'rook'});
	var x;
	for (x = 0; x < 8; ++x) {
		gameState.board.push({p:1,t:'pawn'});
	}
	for (x = 0; x < 32; ++x) {
		gameState.board.push(null);
	}
	for (x = 0; x < 8; ++x) {
		gameState.board.push({p:2,t:'pawn'});
	}
	gameState.board.push({p:2,t:'rook'});
	gameState.board.push({p:2,t:'knight'});
	gameState.board.push({p:2,t:'bishop'});
	gameState.board.push({p:2,t:'king'});
	gameState.board.push({p:2,t:'queen'});
	gameState.board.push({p:2,t:'bishop'});
	gameState.board.push({p:2,t:'knight'});
	gameState.board.push({p:2,t:'rook'});

	return gameState;
}

global.Game = ChessGame;

return global.Game;

})(typeof exports === 'undefined' ? this : exports)
