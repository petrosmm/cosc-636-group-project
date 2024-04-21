import { Game } from "./lib";
import { getMoves } from "./lib-moves";

export function isKingInCheck(kingRow: number, kingColumn: number, game: Game, isWhite: boolean): boolean {
   // Loop through all board squares
   for (let row = 0; row <= 7; row++) {
      for (let col = 0; col <= 7; col++) {
         const piece = game.getPiece(row, col);

         if (piece !== null && piece.getColor() !== "white") {
            const moves = getMoves(row, col, game);

            if (moves.some(([destCol, destRow]) => destCol === kingColumn && destRow === kingRow)) {
               return true;
            }
         }
      }
   }

   return false;
}

export function isKingInCheckmate(kingColumn: number, kingRow: number, game: Game, isWhite: boolean): boolean {
   if (!isKingInCheck(kingRow, kingColumn, game, isWhite)) {
      return false; // not in checkmate if not currently in check
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

            if (!isKingInCheck(colNew, rowNew, game, isWhite)) {
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
