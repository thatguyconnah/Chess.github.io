
window.onload = function () {

    var board,
        game = new Chess(),
        statusEl = $('#status');

    var socket = io();

// do not pick up pieces if the game is over
    var onDragStart = function(source, piece, position, orientation) {
        if (game.game_over() === true ||
            (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    };

    var onDrop = function(source, target) {

        var move = game.move({  // see if the move is legal
            from: source,
            to: target,
            promotion: 'q' // promote the pawn to a queen
        });


        if (move === null) return 'snapback';    // snapbakc if illegal move

        else socket.emit('move', move); //else emit the move in real time

        updateStatus(); //update the status of the turn
    };



    var onSnapEnd = function() {
        board.position(game.fen());     // for pawn promotion
    };

    var updateStatus = function() {
        var status = '';

        var moveColour = 'White';
        if (game.turn() === 'b') {      //if turn is black then move colour == black
            moveColour = 'Black';
        }


        if (game.in_checkmate() === true) {   // checks if checkmate
            status = 'Game over, ' + moveColour + ' is in checkmate.';
        }


        else if (game.in_draw() === true) { // checks if draw
            status = 'Game over, drawn position';
        }


        else {  //checks if the game still on
            status = moveColour + ' to move';


            if (game.in_check() === true) {     // checks if a player is in check
                status += ', ' + moveColour + ' is in check';
            }
        }

        statusEl.html(status);  //updates the status text on the screen
    };

    socket.on('move', function(msg) {
        game.move(msg);         //socket.io listening
        board.position(game.fen());

    });

   
        
        $('#exit').on('click', window.history.back());
    
    

    var chess = {
        draggable: true,        //makes the pieces draggable
        position: 'start',      //sets the board up
        onDragStart: onDragStart,       //allows the movement of legal pieces
        onDrop: onDrop,     //allows the drop of legal pieces
        onSnapEnd: onSnapEnd        //pawn promotion
    };

    board = ChessBoard('gameBoard', chess);     //sets up the chessboard & updates

    $('#flipOrientationBtn').on('click', board.flip);       //Flips the board so player 2 can play
    
    $('#exit').on('click', window.history.back());          //Exits the game
    
    updateStatus();     //go to update function

};
