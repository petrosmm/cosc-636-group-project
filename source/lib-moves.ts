import { Piece, color, type, board, move, Game } from "./lib";
const Enumerable = require("linq");

const directionsKing = [
   // Horizontal and vertical
   [-2, 0],
   [2, 0], // Left and Right
   [0, -1],
   [0, 1], // Up and Down
   // Diagonal
   [-2, -1],
   [-2, 1], // Diagonals left
   [2, -1],
   [2, 1] // Diagonals right
];

const directionsKnight2 = [
   // Two squares along columns, one along row
   [-4, 1],
   [4, 1], // Upward L-moves
   [-4, -1],
   [4, -1], // Downward L-moves
   // Two squares along rows, one along column
   [-1, 4],
   [1, 4], // Rightward L-moves
   [-1, -4],
   [1, -4] // Leftward L-moves
];

const directionsQueen = [
   // Horizontal and vertical
   [-2, 0],
   [2, 0], // Left and Right
   [0, -1],
   [0, 1], // Up and Down
   // Diagonal
   [-2, -1],
   [-2, 1], // Diagonals left
   [2, -1],
   [2, 1] // Diagonals right
];

const directionsRook = [
   [0, 2],
   [0, -2],
   [2, 0],
   [-2, 0]
];

const directionsBishop = [
   [2, 2],
   [-2, 2],
   [2, -2],
   [-2, -2]
];

export function getMoves(board: board, row: number, col: number, game: Game) {
   let _moves: move[] = [];
   let moves: move[] = [];
   let pieceOccupying = board[row][col];

   try {
      if (pieceOccupying != null) {
         switch (pieceOccupying?.getType()) {
            case "pawn": {
               _moves = getPawnMovesWithObstacles(row, col, game, pieceOccupying);

               break;
            }

            case "rook": {
               break;
            }

            case "knight": {
               _moves = getKnightMovesWithObstacles(row, col, board);

               break;
            }

            case "bishop": {
               break;
            }

            case "queen": {
               break;
            }

            case "king": {
               break;
            }

            default:
               break;
         }
      }
   } catch (ex) {
      console.log(ex);
   }

   if (_moves?.length > 0) {
      _moves.forEach((p) => {
         let pieceTarget = board[p[0]][p[1]];
         if (pieceTarget == null) {
            moves.push(p);
         } else {
            // as long as it's not one of our own
            if (pieceOccupying?.getColor() !== pieceTarget?.getColor()) {
               moves.push(p);
            }
         }
      });
   } else {
      console.log("no moves!");
   }

   console.log(`moves`, moves);

   return moves;
}

export function getKnightMovesWithObstacles(row: number, column: number, board: Array<Array<Piece | null>>): Array<move> {
   let moves: Array<move> = [];
   let pieceMine = board[row][column];
   // All possible "L" moves for a knight

   const directionsKnight = [
      [1, 2],
      [-1, 2],
      [1, -2],
      [-1, -2], // Horizontal first, then vertical
      [2, 1],
      [-2, 1],
      [2, -1],
      [-2, -1] // Vertical first, then horizontal
   ];

   directionsKnight.forEach(([rowChange, colChange]) => {
      let rowNew = row + rowChange;
      let columnNew = column + colChange;

      if (false) {
         console.log(`columnNew`, columnNew);
         console.log(`colChange`, colChange);
         console.log(`rowNew`, rowNew);
         console.log(`rowChange`, rowChange);
      }

      // Check if new position is within bounds
      if (columnNew >= 0 && columnNew <= 7 && rowNew >= 0 && rowNew <= 7) {
         // Check if the square is occupied or not
         let pieceProposed = board[rowNew][columnNew];
         if (pieceProposed?.getColor() !== pieceMine?.getColor() || pieceProposed != null) {
            // Assuming knight can move to an empty square or capture an opponent's piece
            moves.push([rowNew, columnNew, null]);
         }
      }
   });

   return moves;
}

function getKingMovesWithObstacles(column: number, row: number, board: Array<Array<Piece | null>>): Array<move> {
   let moves: Array<move> = [];
   // Directions the king can move (one square in any direction)
   if (false) {
      const directions = [
         [2, 0],
         [-2, 0],
         [0, 1],
         [0, -1],
         [2, 2],
         [-2, 2],
         [2, -2],
         [-2, -2]
      ];
   }

   for (let [dx, dy] of directionsKing) {
      let newColumn = column + dx;
      let newRow = row + dy;

      // Check if new position is out of bounds
      if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) continue;

      let pieceProposed = board[newRow][newColumn];
      // Check if there is a piece in the new position
      if (pieceProposed != null) {
         moves.push([newRow, newColumn, null]); // Can capture
         continue; // Only one move possible in each direction for the king
      }

      moves.push([newRow, newColumn, null]);
   }

   return moves;
}

function getBishopMovesWithObstacles(column: number, row: number, board: Array<Array<any>>): Array<move> {
   let moves: Array<move> = [];
   // Directions the bishop can move: up-right, up-left, down-right, down-left

   for (let [dx, dy] of directionsBishop) {
      for (let step = 1; step < 8; step++) {
         let newColumn = column + dx * step;
         let newRow = row + dy * step;

         // Check if new position is out of bounds
         if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) break;

         // Check if there is a piece in the new position
         if (board[newRow][newColumn] != null) {
            moves.push([newRow, newColumn, null]); // Can capture
            break; // Stop checking further in this direction
         }

         moves.push([newRow, newColumn, null]);
      }
   }

   return moves;
}

function getQueenMovesWithObstacles(column: number, row: number, board: Array<Array<Piece | null>>): Array<move> {
   let moves: Array<move> = [];
   // Directions the queen can move (combines rook and bishop directions)

   for (let [dx, dy] of directionsQueen) {
      for (let step = 1; step < 8; step++) {
         let newColumn = column + dx * step;
         let newRow = row + dy * step;

         // Check if new position is out of bounds
         if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) break;

         // Check if there is a piece in the new position
         if (board[newRow][newColumn] != null) {
            moves.push([newColumn, newRow, null]); // Can capture
            break; // Stop checking further in this direction
         }

         moves.push([newColumn, newRow, null]);
      }
   }

   return moves;
}

export function findLocationOfPiece(board: board, piece: Piece) {
   let id = piece.getId();
   return Enumerable.from(board).firstOrDefault((p: Piece | null) => p);
}

export function getPawnMovesWithObstacles(
   row: number,
   column: number,
   // board: Array<Array<Piece | null>>,
   game: Game,
   piece: Piece | null
): Array<move> {
   let isBlack = piece?.getColor() == "black";
   let moves: Array<move> = [];
   let startRow = isBlack ? 1 : 6; // Starting rows for white and black pawns
   let direction = isBlack ? 1 : -1; // Direction of movement depending on the pawn's color

   // Single move forward
   let newRow = row + direction;

   if (newRow >= 0 && newRow <= 7 && game.board[newRow][column] === null) {
      moves.push([newRow, column, null]);

      // Double move from starting position
      if (piece?.hasDoneFirstMove() || row === startRow) {
         if (false) console.log(row);

         let twoStepsRow = row + 2 * direction;

         if (false) console.log(`twoStepsRow`, twoStepsRow);

         if (twoStepsRow >= 0 && twoStepsRow <= 7 && game.board[twoStepsRow][column] === null) {
            console.log("Double move");
            moves.push([twoStepsRow, column, null]);
         }
      }
   }

   // Capturing diagonally
   const captureMoves = [
      [isBlack ? 1 : -1, isBlack ? 1 : -1],
      [isBlack ? 1 : -1, isBlack ? -1 : 1]
   ];

   captureMoves.forEach(([rowChange, colChange]) => {
      let captureRow = row + rowChange;
      let captureCol = column + colChange;

      let pieceProposed: Piece | null = null;
      try {
         pieceProposed = game.board[captureRow][captureCol];
      } catch (ex) {}

      if (captureCol >= 0 && captureCol <= 7 && captureRow >= 0 && captureRow <= 7 && pieceProposed != null) {
         // Assuming Piece includes a color property or similar logic
         moves.push([captureRow, captureCol, null]);
      }
   });

   let pieceProposedEnPassant: Piece | null = null;
   let pieceProposedEnPassant2: Piece | null = null;

   const captureMovesEnPassant = [
      [isBlack ? 1 : -1, -1],
      [isBlack ? 1 : -1, 1]
   ];

   captureMovesEnPassant.forEach(([rowChange, colChange]) => {
      let rowCapturePassant = row + rowChange;
      let colCapturePassant = column + colChange;

      let piecePassantForMove = game.getPiece(rowCapturePassant, colCapturePassant);

      if (piecePassantForMove == null) {
         if (isBlack) {
            let pieceAdjacent = game.getPiece(rowCapturePassant - 1, colCapturePassant);
            if (
               pieceAdjacent != null &&
               pieceAdjacent?.getColor() == "white" &&
               pieceAdjacent?.getType() == "pawn" &&
               pieceAdjacent.isFirstRecentlyTaken
            ) {
               moves.push([rowCapturePassant, colCapturePassant, "en-passant"]);
               alert("En passant for black!");
            }
         } else {
            let pieceAdjacent = game.getPiece(rowCapturePassant + 1, colCapturePassant);
            if (
               pieceAdjacent != null &&
               pieceAdjacent?.getColor() == "black" &&
               pieceAdjacent?.getType() == "pawn" &&
               pieceAdjacent.isFirstRecentlyTaken
            ) {
               moves.push([rowCapturePassant, colCapturePassant, "en-passant"]);
               alert("En passant for white!");
            }
         }
      }
   });

   if (!isBlack && moves?.length > 0) {
      moves = Enumerable.from(moves)
         .orderBy((p: any) => p[0])
         .toArray();
   }

   return moves;
}
