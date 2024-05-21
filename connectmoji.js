// implement your functions here
// ...don't forget to export functions! 

const c = { 

    generateBoard: function(rows, cols, fill = null){

        const board = {};
        board.data = new Array(rows*cols);
        board.rows = rows;
        board.cols = cols;

        for (let i = 0; i < board.data.length; i++) {
            board.data[i] = fill;
        }
        return board;
    },

    rowColToIndex: function(board, row, col){

        const index = row*board.cols + col;
        return index;
    },

    indexToRowCol: function(board, i){

        const obj = {};
        obj.row = Math.floor(i / board.cols);
        obj.col = i % board.cols;
        return obj;
    },

    setCell: function(board, row, col, value){

        const i = c.rowColToIndex(board, row, col);
        const newBoard = {rows: board.rows, cols: board.cols};
        newBoard.data = [...board.data];
        newBoard.data[i] = value;
        return newBoard;
    },

    setCells: function(board){

        const newBoard = {rows: board.rows, cols: board.cols};
        newBoard.data = [...board.data];

        for (let i = 0; i < arguments.length; i++) {
            const index = c.rowColToIndex(board, arguments[i].row, arguments[i].col);
            newBoard.data[index] = arguments[i].val;
        }
        return newBoard;
    },

    boardToString: function(board){

        let s = "";
        for (let r = 0; r < board.rows; r++) {
            for (let c = 0; c < board.cols; c++){
                s += "| ";
                const i = this.rowColToIndex(board, r, c);
                if(board.data[i] === null){
                    s += "  ";
                } else {
                    s += board.data[i];
                    if(board.data[i].length < 2){
                        s += " ";
                    }
                }
                s += " ";
            }
            s += "|\n";
        }
        // row of |----+----+...
        s += "|";
        for (let r = 0; r < board.rows+1; r++){
            s += "----";
            if(r !== board.rows){
                s += "+";
            }
        }
        s+= "|\n";

        // row of letters
        s += "|";
        for (let r = 0; r < board.rows+1; r++){
            s += " " + String.fromCharCode(65+r) + "  ";
            if(r !== board.rows){
                s += "|";
            }
        }
        s+= "|";
        return s;
    },

    letterToCol: function(letter){
        const code = letter.charCodeAt(0);
        if(letter.length === 1 && code >= 65 && code <= 91){
            return (code - 65);
        }
        return null;
    },

    getEmptyRowCol: function(board, letter, empty = null){

        const c = this.letterToCol(letter);
        //check to see if c is valid -> null if not
        if(c === null || c >= board.cols){
            return null;
        } 

        //loop through rows backwards
        let found = false;
        const obj = {};
        for (let r = board.rows-1; r >= 0; r--){

            if(board.data[this.rowColToIndex(board, r, c)] === empty){
                if(!found){
                    found = true;
                    obj.row = r;
                    obj.col = c;
                }
            }
            else if (found){
                found = false;
            }
        }

        if(found){
            return obj;
        }
        return null;
    },
    
    getAvailableColumns: function(board){

        const availableColumns = new Array();
        for (let c = 0; c < board.cols; c++){

            const letter = String.fromCharCode(65+c);
            if(this.getEmptyRowCol(board, letter) !== null){
                availableColumns.push(letter);
            }
        }
        return availableColumns;
    },

    hasConsecutiveValues: function(board, row, col, n){

        const val = board.data[this.rowColToIndex(board,row,col)];

        // check the rows
        let horiz = 1;
        let i = col+1; 
        while(i < board.cols){
            if(board.data[this.rowColToIndex(board,row,i)] === val){
                horiz += 1;
            }
            else{
                break;
            }
            i += 1;
        }
        i = col-1; 
        while(i >= 0){
            if(board.data[this.rowColToIndex(board,row,i)] === val){
                horiz += 1;
            }
            else{
                break;
            }
            i -= 1;
        }
        if(horiz >= n){
            return true;
        }

        // check the cols
        let vert = 1;
        i = row+1; 
        while(i < board.rows){
            if(board.data[this.rowColToIndex(board,i,col)] === val){
                vert += 1;
            }
            else{
                break;
            }
            i += 1;
        }
        i = row-1; 
        while(i >= 0){
            if(board.data[this.rowColToIndex(board,i,col)] === val){
                vert += 1;
            }
            else{
                break;
            }
            i -= 1;
        }
        if(vert >= n){
            return true;
        }

        // check diag
        let rightLen = 1;
        i = row+1;
        let j = col+1;
        while(i < board.rows && j < board.cols){
            if(board.data[this.rowColToIndex(board,i,j)] === val){
                rightLen += 1;
            }
            else{
                break;
            }
            i += 1;
            j += 1;
        }
        i = row-1;
        j = col-1;
        while(i >= 0 && j >= 0){
            if(board.data[this.rowColToIndex(board,i,j)] === val){
                rightLen += 1;
            }
            else{
                break;
            }
            i -= 1;
            j -= 1;
        }
        if(rightLen >= n){
            return true;
        }

        let leftLen = 1;
        i = row+1;
        j = col-1;
        while(i < board.rows && j >= 0){
            if(board.data[this.rowColToIndex(board,i,j)] === val){
                leftLen += 1;
            }
            else{
                break;
            }
            i += 1;
            j -= 1;
        }
        i = row-1;
        j = col+1;
        while(i >= 0 && j < board.cols){
            if(board.data[this.rowColToIndex(board,i,j)] === val){
                leftLen += 1;
            }
            else{
                break;
            }
            i -= 1;
            j += 1;
        }
        if(leftLen >= n){
            return true;
        }

        return false;
    },
    
    autoplay: function(board, s, numConsecutive){

        const result = {};

        const newBoard = {rows: board.rows, cols: board.cols};
        newBoard.data = [...board.data];
        result.pieces = new Array();
        result.lastPieceMoved = null;

        // initiate pieces, emojis (non ascii) are of length 2
        let z = 0;
        while(result.pieces.length !== 2){
            // eslint-disable-next-line no-control-regex
            if(/^[\x00-\x7F]*$/.test(s[z])){
                result.pieces.push(s[z]);
                z += 1;
            }
            else{
                result.pieces.push(s.substring(z, z+2));
                z += 2;
            }
        }

        // go through each move
        for (let i = z; i < s.length; i++){

            const movePiece = result.pieces[i % 2];
            result.lastPieceMoved = movePiece;
            
            const empty = this.getEmptyRowCol(newBoard, s[i]);

            //error if col is full
            if(empty === null){
                result.board = null;
                result.error = {num: i-z+1, val: movePiece, col: s[i]};
                return result;
            }
            newBoard.data[this.rowColToIndex(newBoard, empty.row, empty.col)] = movePiece;

            //if winning move
            if(this.hasConsecutiveValues(newBoard, empty.row, empty.col, numConsecutive)){
                if(i === s.length - 1){
                    result.board = newBoard;
                    result.winner = movePiece;
                    return result;
                }
                // error if there are more moves
                else{
                    const nextPiece = result.pieces[(i+1)% 2];
                    result.lastPieceMoved = nextPiece;
                    result.error = {num: i-z+2, val: nextPiece, col: s[i+1]};
                    result.board = null;
                    return result;
                }
            }
        }
        result.board = newBoard;
        return result;
    },
};

module.exports = c;