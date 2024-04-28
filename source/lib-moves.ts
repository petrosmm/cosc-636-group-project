import { Piece, move, Game } from "./lib";
const Enumerable = require("linq");

export function getMoves(row: number, col: number, game: Game, shouldShowDebug = true) {
   let _moves: move[] = [];
   let moves: move[] = [];
   let pieceOccupying = game.getPiece(row, col);

   try {
      if (pieceOccupying != null) {
         switch (pieceOccupying?.getType()) {
            case "pawn": {
               _moves = getPawnMovesWithObstacles(row, col, game, shouldShowDebug);

               break;
            }

            case "rook": {
               _moves = getRookMovesWithObstacles(row, col, game, shouldShowDebug);

               break;
            }

            case "knight": {
               _moves = getKnightMovesWithObstacles(row, col, game, shouldShowDebug);

               break;
            }

            case "bishop": {
               _moves = getBishopMovesWithObstacles(row, col, game, shouldShowDebug);
               break;
            }

            case "queen": {
               _moves = getQueenMovesWithObstacles(row, col, game, shouldShowDebug);
               break;
            }

            case "king": {
               _moves = getKingMovesWithObstacles(row, col, game, shouldShowDebug);

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
         if (true) {
            let pieceTarget = game.getPiece(p[0], p[1]);
            if (pieceTarget == null) {
               moves.push(p);
            } else if (p[2] == "castling") {
               // exception
               moves.push(p);
            } else {
               // as long as it's not one of our own
               if (pieceOccupying?.getColor() !== pieceTarget?.getColor()) {
                  moves.push(p);
               }
            }
         } else {
            moves.push(p);
         }
      });
   } else {
      if (shouldShowDebug) console.log("no moves!");
   }

   if (shouldShowDebug) console.log(`moves`, moves);

   return moves;
}

function getRookMovesWithObstacles(row: number, column: number, game: Game, shouldShowDebug: boolean): Array<move> {
   let piece = game.getPiece(row, column);
   let isBlack = piece?.getColor() == "black";
   const rowHome = isBlack ? 0 : 7;
   const colHomeKing = 3;

   let moves: Array<move> = [];
   // Directions the rook can move: right, left, up, down
   const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
   ];

   for (let [dx, dy] of directions) {
      for (let step = 1; step < 8; step++) {
         let newRow = row + dx * step;
         let newColumn = column + dy * step;

         // Check if new position is out of bounds
         if (newColumn < 0 || newColumn > 7 || newRow < 0 || newRow > 7) break;

         // Check if there is a piece in the new position
         if (game.getPiece(newRow, newColumn) != null) {
            moves.push([newRow, newColumn, null]); // Can capture
            break; // Stop checking further in this direction
         }

         moves.push([newRow, newColumn, null]);
      }
   }

   if (row == rowHome && column == 0 && piece?.isFirstMove) {
      for (let col = 1; col <= colHomeKing; col++) {
         if (game.board[rowHome][col] == null) {
            continue;
         } else {
            if (col == colHomeKing) {
               let pieceKing = game.getPiece(rowHome, col);
               if (pieceKing != null && pieceKing.isFirstMove && piece.getColor() == pieceKing.getColor()) {
                  moves.push([rowHome, col, "castling"]);
                  if (shouldShowDebug) alert("castling available for " + piece?.getColor() + "!");
               }
            }

            break;
         }
      }
   }

   // castling white
   if (row == rowHome && column == 7 && piece?.isFirstMove) {
      for (let col = column - 1; col >= colHomeKing; col--) {
         if (game.board[rowHome][col] == null) {
            continue;
         } else {
            if (col == colHomeKing) {
               let pieceKing = game.getPiece(rowHome, col);
               if (pieceKing != null && pieceKing.isFirstMove && piece.getColor() == pieceKing.getColor()) {
                  moves.push([rowHome, col, "castling"]);
                  if (shouldShowDebug) alert("castling available for " + piece?.getColor() + "!");
               }
            }

            break;
         }
      }
   }

   return moves;
}

function getKnightMovesWithObstacles(row: number, column: number, game: Game, shouldShowDebug: boolean): Array<move> {
   let moves: Array<move> = [];
   let pieceMine = game.getPiece(row, column);
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
         let pieceProposed = game.getPiece(rowNew, columnNew);
         if (pieceProposed?.getColor() !== pieceMine?.getColor() || pieceProposed != null) {
            // Assuming knight can move to an empty square or capture an opponent's piece
            moves.push([rowNew, columnNew, null]);
         }
      }
   });

   return moves;
}

function getKingMovesWithObstacles(row: number, column: number, game: Game, shouldShowDebug: boolean): Array<move> {
   let moves: Array<move> = [];

   const directionsKing = [
      // Horizontal and vertical
      [0, 1],
      [0, -1], // Left and Right
      [1, 0],
      [-1, 0], // Up and Down
      // Diagonal
      [-1, -1],
      [-1, 1], // Diagonals left
      [1, -1],
      [1, 1] // Diagonals right
   ];

   for (let [dx, dy] of directionsKing) {
      let newRow = row + dx;
      let newColumn = column + dy;

      if (newColumn < 0 || newColumn > 7 || newRow < 0 || newRow > 7) continue;

      moves.push([newRow, newColumn, null]);
   }

   return moves;
}

function getBishopMovesWithObstacles(row: number, column: number, game: Game, shouldShowDebug: boolean): Array<move> {
   let moves: Array<move> = [];
   let pieceMine = game.getPiece(row, column);
   let colorMine = pieceMine?.getColor();
   let min = 0;
   let max = 7;

   for (let offset = min; offset <= max; offset++) {
      let rowNew = row - offset;
      let colNew = column - offset;

      // top-left
      if (colNew >= min && rowNew >= min && row != rowNew && column != colNew) {
         let piece = game.getPiece(rowNew, colNew);

         if (game.getPiece(rowNew, colNew)?.getColor() != colorMine) {
            moves.push([rowNew, colNew, null]);
         }

         if (piece != null) {
            break;
         }
      }
   }

   for (let offset = min; offset <= max; offset++) {
      let rowNew = row - offset;
      let colNew = column + offset;

      // top right
      if (colNew <= max && rowNew >= min && row != rowNew && column != colNew) {
         let piece = game.getPiece(rowNew, colNew);

         if (game.getPiece(rowNew, colNew)?.getColor() != colorMine) {
            moves.push([rowNew, colNew, null]);
         }

         if (piece != null) {
            break;
         }
      }
   }

   for (let offset = min; offset <= max; offset++) {
      let rowNew = row + offset;
      let colNew = column - offset;

      // Bottom-Left
      if (colNew >= min && rowNew <= max && row != rowNew && column != colNew) {
         let piece = game.getPiece(rowNew, colNew);

         if (game.getPiece(rowNew, colNew)?.getColor() != colorMine) {
            moves.push([rowNew, colNew, null]);
         }

         if (piece != null) {
            break;
         }
      }
   }

   for (let offset = min; offset <= max; offset++) {
      let rowNew = row + offset;
      let colNew = column + offset;

      // Bottom-Right
      if (colNew <= max && rowNew <= max && row != rowNew && column != colNew) {
         let piece = game.getPiece(rowNew, colNew);

         if (game.getPiece(rowNew, colNew)?.getColor() != colorMine) {
            moves.push([rowNew, colNew, null]);
         }

         if (piece != null) {
            break;
         }
      }
   }

   return moves;
}

function getQueenMovesWithObstacles(row: number, column: number, game: Game, shouldShowDebug: boolean): Array<move> {
   let moves: Array<move> = [];

   const directions = [
      // horizontal
      [0, 1],
      [0, -1],
      // vertical
      [1, 0],
      [-1, 0],
      // diagonal
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
   ];

   directions.forEach(([dx, dy]) => {
      let step = 1;

      while (true) {
         let newColumn = column + dx * step;
         let newRow = row + dy * step;

         if (newColumn < 0 || newColumn > 7 || newRow < 0 || newRow > 7) break;

         if (game.getPiece(newRow, newColumn) != null) {
            moves.push([newRow, newColumn, null]);
            break;
         }

         moves.push([newRow, newColumn, null]);
         step++;
      }
   });

   return moves;
}

function getPawnMovesWithObstacles(row: number, column: number, game: Game, shouldShowDebug: boolean): Array<move> {
   let piece = game.getPiece(row, column);
   let isBlack = piece?.getColor() == "black";
   let moves: Array<move> = [];
   let startRow = isBlack ? 1 : 6;
   let direction = isBlack ? 1 : -1;

   let newRow = row + direction;

   if (newRow >= 0 && newRow <= 7 && game.board[newRow][column] === null) {
      moves.push([newRow, column, null]);

      // double move
      //  || row === startRow
      if (piece?.hasDoneFirstMove()) {
         if (false) console.log(row);
         if (false) console.log(`piece getPawnMovesWithObstacles`, piece);

         let twoStepsRow = row + 2 * direction;

         if (false) console.log(`twoStepsRow`, twoStepsRow);

         if (twoStepsRow >= 0 && twoStepsRow <= 7 && game.board[twoStepsRow][column] === null) {
            if (shouldShowDebug) console.log("Double move");
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
         moves.push([captureRow, captureCol, null]);
      }
   });

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
