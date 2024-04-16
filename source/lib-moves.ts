import { Piece, color, type, board } from "./lib";
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

const directionsKnight = [
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

const directionsKnight2 = [
   [1, 2],
   [-1, 2],
   [1, -2],
   [-1, -2], // Horizontal first, then vertical
   [2, 1],
   [-2, 1],
   [2, -1],
   [-2, -1] // Vertical first, then horizontal
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

export function getMoves(board: board, row: number, col: number) {
   let moves: [number, number][] = [];
   let piece = board[row][col];

   try {
      if (piece != null) {
         switch (piece?.getType()) {
            case "knight": {
               moves = getKnightMovesWithObstacles(row, col, board, piece);

               break;
            }
            
            case "pawn": {
               moves = getPawnMovesWithObstacles(row, col, board, piece);

               break;
            }

            default:
               break;
         }
      }
   } catch (ex) {
      console.log(ex);
   }

   console.log(`moves`, moves);

   return moves;
}

export function getKnightMovesWithObstacles(
   row: number,
   column: number,
   board: Array<Array<Piece | null>>,
   piece: Piece | null
): Array<[number, number]> {
   let moves: Array<[number, number]> = [];
   let myColor = piece?.getColor();
   // All possible "L" moves for a knight

   directionsKnight.forEach(([colChange, rowChange]) => {
      let newColumn = column + colChange;
      let newRow = row + rowChange;

      console.log(`newColumn`, newColumn);
      console.log(`newRow`, newRow);

      // Check if new position is within bounds
      if (newColumn >= 2 && newColumn <= 16 && newRow >= 1 && newRow <= 15) {
         // Check if the square is occupied or not
         let piece = board[newRow][newColumn];
         if (piece === null || board[newRow][newColumn] !== null) {
            // Assuming knight can move to an empty square or capture an opponent's piece
            moves.push([newColumn, newRow]);
         }
      }
   });

   return moves;
}

function getKingMovesWithObstacles(column: number, row: number, board: Array<Array<Piece | null>>): Array<[number, number]> {
   let moves: Array<[number, number]> = [];
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

      // Check if there is a piece in the new position
      if (board[newRow][newColumn] != null) {
         moves.push([newColumn, newRow]); // Can capture
         continue; // Only one move possible in each direction for the king
      }

      moves.push([newColumn, newRow]);
   }

   return moves;
}

function getBishopMovesWithObstacles(column: number, row: number, board: Array<Array<any>>): Array<[number, number]> {
   let moves: Array<[number, number]> = [];
   // Directions the bishop can move: up-right, up-left, down-right, down-left

   for (let [dx, dy] of directionsBishop) {
      for (let step = 1; step < 8; step++) {
         let newColumn = column + dx * step;
         let newRow = row + dy * step;

         // Check if new position is out of bounds
         if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) break;

         // Check if there is a piece in the new position
         if (board[newRow][newColumn] != null) {
            moves.push([newColumn, newRow]); // Can capture
            break; // Stop checking further in this direction
         }

         moves.push([newColumn, newRow]);
      }
   }

   return moves;
}

function getQueenMovesWithObstacles(column: number, row: number, board: Array<Array<Piece | null>>): Array<[number, number]> {
   let moves: Array<[number, number]> = [];
   // Directions the queen can move (combines rook and bishop directions)

   for (let [dx, dy] of directionsQueen) {
      for (let step = 1; step < 8; step++) {
         let newColumn = column + dx * step;
         let newRow = row + dy * step;

         // Check if new position is out of bounds
         if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) break;

         // Check if there is a piece in the new position
         if (board[newRow][newColumn] != null) {
            moves.push([newColumn, newRow]); // Can capture
            break; // Stop checking further in this direction
         }

         moves.push([newColumn, newRow]);
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
   board: Array<Array<Piece | null>>,
   piece: Piece | null
): Array<[number, number]> {
   let isBlack = piece?.getColor() == "black";
   let moves: Array<[number, number]> = [];
   let startRow = isBlack ? 1 : 6; // Starting rows for white and black pawns
   let direction = isBlack ? 1 : -1; // Direction of movement depending on the pawn's color

   // Single move forward
   let newRow = row + direction;
   if (false) console.log(`newRow`, newRow);

   if (newRow >= 1 && newRow <= 15 && board[newRow][column] === null) {
      moves.push([newRow, column]);
      if (false)
         if (piece?.hasDoneFirstMove()) {
            moves.push([newRow + 1, column]);
         }

      // Double move from starting position
      if (piece?.hasDoneFirstMove() || row === startRow) {
         console.log(row);
         let twoStepsRow = row + 2 * direction;
         console.log(`twoStepsRow`, twoStepsRow);
         if (twoStepsRow >= 1 && twoStepsRow <= 15 && board[twoStepsRow][column] === null) {
            console.log("Double move");
            moves.push([twoStepsRow, column]);
         }
      }
   }

   // Capturing diagonally
   const captureMoves = [
      [2, direction],
      [-2, direction]
   ];

   captureMoves.forEach(([colChange, rowChange]) => {
      let captureCol = column + colChange;
      let captureRow = row + rowChange;
      if (captureCol >= 2 && captureCol <= 16 && captureRow >= 1 && captureRow <= 15 && board[captureRow][captureCol] != null) {
         // Check if the piece at the diagonal is of opposite color
         if (board[captureRow][captureCol] !== null) {
            // Assuming Piece includes a color property or similar logic
            moves.push([captureRow, captureCol]);
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
