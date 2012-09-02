var gGameview;

function startup() {
	var root = document.getElementById('root');

	var clients = {
		checkers: new GameClientChessCheckers(root, "checkers"),
		chess: new GameClientChessCheckers(root, "chess"),
		match: new GameClientMatch(root, "match")
	}

	gGameview = new ArtefactGameServerConnectionView(gameServer,
		["checkers", "chess", "match"],
		clients,
		true);
}
