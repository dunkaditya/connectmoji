/* eslint-disable no-prototype-builtins */
// require your module, connectmoji
// require any other modules that you need, like clear and readline-sync
const clear = require('clear');
const c = require('./connectmoji.js');
const readlineSync = require('readline-sync');

const output = {};
// if start with an extended set of moves
if(process.argv.length > 2){

    // parse input
    const ls = process.argv[2].split(','); // PLAYER_VALUE,MOVE_STRING,NUMBER_ROWS,NUMBER_COLUMNS,NUMBER_CONSECUTIVE
    const player = ls[0];
    const moveString = ls[1];
    const moveStringArray = [...moveString];
    const computer = moveStringArray[1];
    const numberRows = parseInt(ls[2]);
    const numberColumns = parseInt(ls[3]);
    const numberConsecutive = parseInt(ls[4]);

    readlineSync.question('Press <ENTER> to start game');

    // run with initial script 
    const myBoard = c.generateBoard(numberRows, numberColumns);
    const result = c.autoplay(myBoard, moveString, numberConsecutive);
    clear();

    // error case 
    if (result.hasOwnProperty('error')) {
        console.log('The scripted moves have resulted in an error');
    } 
    // winner found after script case 
    else if (result.hasOwnProperty('winner')) {
        console.log(c.boardToString(result.board));
        console.log('\nThe winner is: ' + result.winner);
    } 
    // game continues after script case
    else {
        console.log(c.boardToString(result.board));
        console.log('The game will continue with manual play.');

        // set our turn to the opposite of last piece moved(whos turn it is)
        if (result.lastPieceMoved === player) {
            output.turn = computer;
        } else {
            output.turn = player;
        }

        output.board = result.board;
        output.player = player;
        output.computer = computer;
        output.numberConsecutive = numberConsecutive;
    }
} else {

    // input ROWS, COLS, CONSECUTIVE
    const input = readlineSync.question('Enter the number of rows, columns, and consecutive "pieces" for win\n (all separated by commas... for example: 6,7,4)\n>');
    const splitInp = input.split(',');
    if (input.length < 3) {
        console.log('No args entered, using default: ', 6, 7, 4);
        output.board = c.generateBoard(6, 7);
        output.numberConsecutive = 4;
    } else {
        const rows = parseInt(splitInp[0]);
        const cols = parseInt(splitInp[1]);
        output.board = c.generateBoard(rows, cols);
        output.numberConsecutive = parseInt(splitInp[2]);
        console.log('Using rows, cols and specified consecutive number of pieces: ', rows, cols, output.numberConsecutive);
    }

    const pc = readlineSync.question('Enter two characters that represent the player and computer\n(separated by a comma... for example: P,C)\n>');
    const pcSplit = pc.split(',');
    if (pc.length < 2) {
        console.log('No args entered, using default: 😎, 💻');
        output.player = '😎';
        output.computer = '💻';
    } else {
        output.player = pcSplit[0].trim();
        output.computer = pcSplit[1].trim();
        console.log('Using player and computer characters:', output.player, output.computer);
    }

    const first = readlineSync.question('Who goes first, (P)layer or (C)omputer?\n>');
    if (first.trim() === 'C'){
        output.turn = output.computer;
        console.log("Computer is first");
    } else {
        output.turn = output.player;
        console.log("Player is first");
    }
    console.log(output.board);
}

let winner = null;
let turn = output.turn; 
const player = output.player;
const computer = output.computer;
let myBoard = output.board;
const numberConsecutive = output.numberConsecutive;

// eslint-disable-next-line no-constant-condition
while(true){
    // tie check
    const availableCols = c.getAvailableColumns(myBoard);
    if (availableCols.length === 0) {
        break;
    }
    let move;
    clear();
    console.log(c.boardToString(myBoard));
    console.log('It is ' + turn + '\'s turn');
    if(turn === player){
        move = readlineSync.question('Choose a column letter to drop your piece in.\n>');
        while (!availableCols.includes(move)) {
            move = readlineSync.question('That is not a valid move, please choose a valid column.\n>');
        }

        const empty = c.getEmptyRowCol(myBoard, move);
        myBoard = c.setCell(myBoard, empty.row, empty.col, player);
        console.log(c.boardToString(myBoard));

        // winner winner chicken dinner
        if (c.hasConsecutiveValues(myBoard, empty.row, empty.col, numberConsecutive)) {
            winner = player;
            clear();
            break;
        }
        turn = computer;
    }
    else {
        move = availableCols[0];
        clear();
        console.log(c.boardToString(myBoard));
        console.log('The computer has selected: ' + move);
        readlineSync.question('Press <ENTER> to Continue');
        const empty = c.getEmptyRowCol(myBoard, move);
        myBoard = c.setCell(myBoard, empty.row, empty.col, computer);

        // winner winner chicken dinner
        if (c.hasConsecutiveValues(myBoard, empty.row, empty.col, numberConsecutive)) {
            winner = computer;
            clear();
            break;
        }
        turn = player;
    }
}

if(winner === null){
    console.log(c.boardToString(myBoard));
    console.log("No more moves available. The game has ended in a tie!");
} else {
    console.log(c.boardToString(myBoard));
    console.log("The winner is: " + winner);
}
