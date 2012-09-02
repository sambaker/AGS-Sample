
var preloadImages = [
	'/images/vintage_red.png',
	'/images/vintage_black.png',
	'/images/vintage_red_king.png',
	'/images/vintage_black_king.png',
	'/images/board_white.png',
	'/images/board_black.png',
	'/images/bishop.png',
	'/images/king2.png',
	'/images/knight2.png',
	'/images/pawn2.png',
	'/images/queen2.png',
	'/images/rook2.png',
	'/images/bishop2.png',
	'/images/king2.png',
	'/images/knight2.png',
	'/images/pawn2.png',
	'/images/queen2.png',
	'/images/rook2.png',
	'/images/chess_light.jpg',
	'/images/chess_dark.jpg'
];

for (var i = 0; i < preloadImages.length; ++i) {
	var image = new Image();
	image.src = preloadImages[i];
}
image = null;

function GameClientChessCheckers(parent, gameType) {
	var _i = this;

	_i.content = Awe.createElement('div', null, {
		styles: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: '0px',
			left: '0px',
		}
	});

	Awe.createElement('div', _i.content, {
		styles: {
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: '0px',
			left: '0px',
			backgroundColor: '#000000',
			opacity: 0.6
		}
	});

	var container = Awe.createElement('div', _i.content, {
		styles: {
			position: 'absolute',
			width: '700px',
			height: '835px',
			top: '10px',
			left: '145px',
//			background: "#ffffff url(/images/hemp.jpeg) repeat"
			backgroundColor: '#eeeeee',
			borderRadius: '8px'
		}
	});

	var close = Awe.createElement('div', container, {
		attrs: {
			innerText: 'CLOSE'
		},
		styles: {
			backgroundColor: "#bbbbbb",
			color: "#333333",
			fontSize: '18px',
			fontWeight: 'bold',
			"float": 'right',
			margin: '6px',
			padding: "0px 20px",
			textAlign: 'center',
			lineHeight: '36px',
			borderRadius: '8px',
			cursor: 'pointer'
		}
	});

	var status = Awe.createElement('div', container, {
		styles: {
			color: "#333333",
			fontSize: '18px',
			fontWeight: 'bold',
			margin: '6px 6px 6px 125px',
			textAlign: 'center',
			width: '450px',
			lineHeight: '36px',
			cursor: 'pointer'
		}
	});

	var labelP1 = Awe.createElement('div', container, {
		styles: {
			color: "#333333",
			fontSize: '24px',
			fontWeight: 'bold',
			width: '100%',
			textAlign: 'center',
			lineHeight: '50px'
		}
	});

	var board = Awe.createElement('div', container, {
		styles: {
			position: 'relative',
			backgroundColor: "#222222",
			width: '688px',
			height: '688px',
			margin: '0px 6px'
		}
	});

	var boardSquares = [
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null]
	];

	var boardPieces = [
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null]
	];

	var boardMargins = { x: 8, y: 8 };
	var boardSquareSize = 84;

	var doneButton = Awe.createElement('div', null, {
		attrs: {
			innerHTML: 'Done'
		},
		styles: {
			position: 'absolute',
			top: '60px',
			left: '50px',
			padding: '5px',
			backgroundColor: '#dddddd',
			borderRadius: '8px',
			color: '#333333'
		}
	});

	function getSquarePosition(x, y) {
		return { x: boardMargins.x + boardSquareSize * x, y: boardMargins.y + boardSquareSize * y };
	}

	function getSquareImage(x, y) {
		var light = ((x ^ y) & 1);
		if (gameType == 'checkers') {
			return light ? '/images/board_white.png' : '/images/board_black.png';
		} else {
			return light ? '/images/chess_light.jpg' : '/images/chess_dark.jpg';
		}
	}

	for (var y = 0; y < 8; ++y) {
		for (var x = 0; x < 8; ++x) {
			var p = getSquarePosition(x, y);
			var square = Awe.createElement('div', board, {
				className: ((x ^ y) & 1) ? 'square-light' : 'square-dark',
				styles: {
					position: 'absolute',
					top: p.y+'px',
					left: p.x+'px',
					width: boardSquareSize+'px',
					height: boardSquareSize+'px',
					backgroundImage: 'url('+getSquareImage(x,y)+')'
//					backgroundColor: ((x ^ y) & 1) ? '#000000' : '#ffffff'
				}
			});

			boardSquares[x][y] = square;
		}
	}

	var labelP2 = Awe.createElement('div', container, {
		styles: {
			color: "#333333",
			fontSize: '24px',
			fontWeight: 'bold',
			width: '100%',
			textAlign: 'center',
			lineHeight: '50px'
		}
	});

	function getPieceImage(p) {
		if (gameType == 'checkers') {
			if (p.k) {
				return p.p == 1 ? '/images/vintage_red_king.png' : '/images/vintage_black_king.png';
			} else {
				return p.p == 1 ? '/images/vintage_red.png' : '/images/vintage_black.png';
			}
		} else {
			var url = '/images/'+p.t;
			if (p.p == 2) {
				url += '2.png';
			} else {
				url += '.png';
			}
			return url;
		}
	}

	function updatePiece(x, y, listen, onlyPiece) {
		if (boardPieces[x][y]) {
			board.removeChild(boardPieces[x][y]);
			boardPieces[x][y] = null;
		}
		var current = _i.game.getSquare({x:x,y:y});
		if (current.p) {
			var p = getSquarePosition(x, y);
			var piece = Awe.createElement('div', board, {
				styles: {
					position: 'absolute',
					top: p.y+'px',
					left: p.x+'px',
					width: boardSquareSize+'px',
					height: boardSquareSize+'px',
					backgroundImage: 'url('+getPieceImage(current)+')'
				}
			});
			piece.boardPos = { x: x, y: y };
			boardPieces[x][y] = piece;
			if (listen && current.p == _i.game.gameState.nextPlayer) {
				if (onlyPiece && onlyPiece.x == x && onlyPiece.y == y) {
					piece.appendChild(doneButton);
				} else if (onlyPiece) {
					listen = false;
				}
				if (listen) {
					Awe.enableDrag(piece, {
					    //anchor: new Awe.DragAnchorTopLeft(),
					    // filters: new Awe.DragFilterLimitAxes(x, x, y, y + sliderHeight),
					    updater: {
					    	move: function(el, evt) {
					    	}
					    },
					    onDragStart: function(event) {
					    	piece._left = xLeft(piece);
					    	piece._top = xTop(piece);
					    	piece.style.zIndex = 1000;
			    			piece.moveTo = null;
			    			if (onlyPiece) {
								piece.removeChild(doneButton);
							}
					    },
					    onDragMove: function(event) {
					    	// TODO: Remove xPageX/Y, they can be very slow
							var boardPos = { x: xPageX(board) + boardMargins.x, y: xPageY(board) + boardMargins.y };
				    		piece._top += event.delta.y;
				    		piece._left += event.delta.x;
				    		var boardX = event.clientPos.x - boardPos.x;
				    		var boardY = event.clientPos.y - boardPos.y;
				    		boardX = Math.floor(boardX / boardSquareSize);
				    		boardY = Math.floor(boardY / boardSquareSize);
				    		var turn = {
				    			from: piece.boardPos,
				    			to: { x: boardX, y: boardY },
				    			turnType: 'move'
				    		}
				    		if (_i.game.takeTurn(gGameview.whoAmI(),turn,true)) {
					    		piece.style.left = boardMargins.x + boardX * boardSquareSize + 'px';
					    		piece.style.top = boardMargins.y + boardY * boardSquareSize + 'px';
					    		piece.moveTo = turn.to;
				    		} else {
				    			piece.moveTo = null;
				    			piece.style.border = null;
					    		piece.style.left = piece._left + 'px';
					    		piece.style.top = piece._top + 'px';
				    		}
					    },
					    onDragEnd: function(event) {
					    	if (piece.moveTo) {
					    		var turn = {
					    			from: piece.boardPos,
					    			to: piece.moveTo,
					    			turnType: 'move'
					    		}
					    		var moveState = _i.game.takeTurn(gGameview.whoAmI(),turn);
					    		if (moveState) {// && !moveState.chainable) {
						    		gGameview.takeTurn(turn)

						    		if (!_i.game.sessionState.won) {
							    		if (moveState.chainable) {
							    			_i.smMove.requestOrRestartState('chooseTurn', piece.moveTo);
							    		} else {
							    			_i.smMove.requestState('opponentTurn');
							    		}
							    	}
					    		} else if (moveState) {
					    			// Keep moving
					    			_i.smMove.restartCurrentState();
					    		}
					    	} else {
					    		_i.smMove.restartCurrentState();
					    	}
					    	piece.style.zIndex = 0;
					    }
					});
				}
			}
		}
	}

	function updatePieces(listen, onlyPiece) {
		for (var y = 0; y < 8; ++y) {
			for (var x = 0; x < 8; ++x) {
				updatePiece(x, y, listen, onlyPiece);
			}
		}
	}

	var $close;

	_i.smMove = new Awe.StateMachine("Checkers move", {
		"opponentTurn" : {
			start : function() {
				status.innerText = "Waiting for " + _i.game.getNextPlayer();
				status.style.color = "#3333cc";
				updatePieces();
			}
		},
		"chooseTurn" : {
			start : function(fromState) {
				status.innerText = "Your turn";
				status.style.color = "#33cc33";
				updatePieces(true, _i.game.gameState.chainFrom);
			}
		},
		"gameOver" : {
			start : function() {
				console.log("X",status.innerHTML);
				if (_i.game.getWinner() == gGameview.whoAmI()) {
					status.innerText = "You won!";
				} else {
					status.innerText = "You lost!";
				}
				console.log("Y",status.innerHTML);
				status.style.color = "#333333";
				status.style.backgroundColor = "#ffff33";
				updatePieces();
			}
		}
	}, null);

	_i.show = function(gameSession, game) {
		_i.game = game;
		_i.gameSession = gameSession;

		console.log("gameSession ---- ",gameSession);
		labelP1.innerText = gameSession.users[0];
		labelP2.innerText = gameSession.users[1];
		parent.appendChild(_i.content);
		if (!$close) {
			$close = $(close);
			$close.click(_i.hide);
		}

		if (gameSession.won) {
			_i.smMove.requestState("gameOver");
		} else if (game.allowTurn(gGameview.whoAmI())) {
			_i.smMove.requestOrRestartState("chooseTurn");
		} else {
			_i.smMove.requestOrRestartState("opponentTurn");
		}
	}

	_i.hide = function() {
		gGameview.exitGame();
		parent.removeChild(_i.content);
	}
}
