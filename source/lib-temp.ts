import { Game, Piece, type color } from "./lib";
import { getMoves } from "./lib-moves";

export function isKingInCheck(kingRow: number, kingColumn: number, game: Game, color: color): boolean {
   // Loop through all board squares
   for (let row = 0; row <= 7; row++) {
      for (let col = 0; col <= 7; col++) {
         const piece = game.getPiece(row, col);

         // piece.getColor() !== "white"
     console.log(piece?.getColor() != color);
         if (piece !== null && piece?.getColor() != color) {
            const moves = getMoves(row, col, game);

            if (moves.some(([destRow, destCol]) => destRow === kingRow && destCol === kingColumn)) {
               return true;
               break;
            }
         }
      }
   }

   return false;
}

export function isKingInCheckmate(kingColumn: number, kingRow: number, game: Game): boolean {
   let color = game.getPiece(kingColumn, kingRow)?.getColor();
   if (!isKingInCheck(kingRow, kingColumn, game, color!)) {
      return false;
   }

   // check all possible moves for the king to see if he can escape check
   const directions = [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
      [2, 2],
      [2, -2],
      [-2, 2],
      [-2, -2] // all possible king moves
   ];
   for (let [dx, dy] of directions) {
      const rowNew = kingRow + dx;
      const colNew = kingColumn + dy;
      if (rowNew >= 0 && rowNew <= 7 && colNew >= 0 && colNew <= 7) {
         if (game.board[rowNew][colNew] === null || game.board[rowNew][colNew]?.getColor() !== "white") {
            // temporarily move king and check if still in check
            const tempPiece = game.board[rowNew][colNew];
            // move king to new position
            game.board[rowNew][colNew] = game.board[kingRow][kingColumn];
            game.board[kingRow][kingColumn] = null;

            if (!isKingInCheck(colNew, rowNew, game, color!)) {
               // If not in check in new position
               game.board[kingRow][kingColumn] = game.board[rowNew][colNew]; // Move king back
               game.board[rowNew][colNew] = tempPiece;

               return false; // Not checkmate since the king can escape
            }

            game.board[kingRow][kingColumn] = game.board[rowNew][colNew]; // Move king back
            game.board[rowNew][colNew] = tempPiece;
         }
      }
   }

   return true; // no valid moves left, king is in checkmate
}

export function fillBoardStandard(game: Game) {
   for (let row = 0; row <= 7; row++) {
      let rowArray: (Piece | null)[] = [];
      for (let col = 0; col <= 7; col++) {
         let piece: Piece | null = null;

         // Place pawns
         if (row === 1 || row === 6) {
            let color: color = null!;
            if (row === 1) {
               // Second row from the top, black pawns
               color = "black";
            } else if (row === 6) {
               // Second row from the bottom, white pawns
               color = "white";
            }

            piece = new Piece("pawn", color);
         }

         // Place the other pieces on the first and last rows
         if (row === 0 || row === 7) {
            let color: color = null!;
            if (row === 0) {
               color = "black";
            }
            if (row === 7) {
               color = "white";
            }

            if (col === 0 || col === 7) {
               piece = new Piece("rook", color);
            } else if (col === 1 || col === 6) {
               piece = new Piece("knight", color);
            } else if (col === 2 || col === 5) {
               piece = new Piece("bishop", color);
            } else if (col === 3) {
               piece = new Piece("king", color);

               // old
               if (false) piece = row === 1 ? new Piece("queen", color) : new Piece("king", color);
            } else if (col === 4) {
               piece = new Piece("queen", color);

               // old
               if (false) piece = row === 1 ? new Piece("king", color) : new Piece("queen", color);
            }
         }

         rowArray.push(piece);
      }

      game.board.push(rowArray);
   }

   if (false) console.log(game.board);
}

export function fillBoardCheckmate(game: Game) {
   game.turn = "black";

   for (let row = 0; row <= 7; row++) {
      let rowArray: (Piece | null)[] = [];
      for (let col = 0; col <= 7; col++) {
         let piece: Piece | null = null;

         if (row == 0 && col == 7) {
            piece = new Piece("king", "black");
         }

         if (row == 6 && col == 7) {
            piece = new Piece("queen", "white");
         }

         if (row == 7 && col == 7) {
            piece = new Piece("king", "white");
         }

         rowArray.push(piece);
      }

      game.board.push(rowArray);
   }

   console.log(game);
}

export function fillBoardCheck(game: Game) {
   game.turn = "black";

   for (let row = 0; row <= 7; row++) {
      let rowArray: (Piece | null)[] = [];
      for (let col = 0; col <= 7; col++) {
         let piece: Piece | null = null;

         if (row == 0 && col == 0) {
            piece = new Piece("rook", "black");
         }

         if (row == 0 && col == 7) {
            piece = new Piece("king", "white");
         }

         rowArray.push(piece);
      }

      game.board.push(rowArray);
   }

   console.log(game);
}
