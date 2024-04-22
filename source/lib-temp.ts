import Enumerable from "linq";
import { Game, Piece, move, type color } from "./lib";
import { getMoves } from "./lib-moves";

export function isKingInCheck(kingRow: number, kingColumn: number, game: Game, color: color): boolean {
   let pieceKing = game.board[kingRow][kingColumn];
   let board = game.board;
   // Loop through all board squares
   for (let row = 0; row <= 7; row += 1) {
      for (let col = 0; col <= 7; col += 1) {
         const piece = board[row][col];
         if (piece !== null && piece?.getColor() !== color) {
            // Check enemy pieces
            // Get moves for each piece type
            const moves = getMoves(row, col, game);
            // Check if any move can attack the king's position
            if (moves.some(([destRow, destCol]) => destCol === kingColumn && destRow === kingRow)) {
               alert(`King belonging to ${pieceKing?.getColor()} is in check!`);
               return true; // King is in check if any move can capture the king
            }
         }
      }
   }
   return false; // No piece is threatening the king
}

export function isKingInCheckmate(kingRow: number, kingColumn: number, game: Game, color: color): boolean {
   console.log(`color`, color);
   if (!isKingInCheck(kingRow, kingColumn, game, color)) {
      return false; // Not in checkmate if not currently in check
   }

   let movesMine: move[] = [];
   let movesOpposition: move[] = [];
   let movesMineKing: move[] = [];

   // Loop through all board squares
   for (let row = 0; row <= 7; row++) {
      for (let col = 0; col <= 7; col++) {
         const piece = game.getPiece(row, col);

         if (piece !== null) {
            if (piece?.getType() == "king" && piece?.getColor() == color) {
               const moves = getMoves(row, col, game);
               console.log(`kling movess`, moves);
               if (moves?.length > 0) {
                  movesMineKing = movesMineKing.concat(moves);
               }
            }

            if (piece?.getType() != "king" && piece?.getColor() == color) {
               const moves = getMoves(row, col, game);
               if (moves?.length > 0) {
                  movesMine = movesMine.concat(moves);
               }
            }

            if (piece?.getColor() != color) {
               const moves = getMoves(row, col, game);
               if (moves?.length > 0) {
                  movesOpposition = movesOpposition.concat(moves);
               }
            }
         }
      }
   }

   for (let [_row, _col] of movesOpposition) {
      let hasCoverPiece = movesMine.some((p) => p[0] == _row && p[1] == _col);
      if (hasCoverPiece) {
         movesOpposition = Enumerable.from(movesOpposition)
            .where((p) => `${p[0]}-${p[1]}` != `${_row}-${_col}`)
            .toArray();
      }
   }

   console.log(`movesOpposition`, movesOpposition);

   for (let [__row, __col] of movesOpposition) {
      movesMineKing = Enumerable.from(movesMineKing)
         .where((p) => `${p[0]}-${p[1]}` != `${__row}-${__col}`)
         .toArray();
   }

   console.log(`movesMine`, movesMine);
   console.log(`movesMineKing`, movesMineKing);

   if (movesMineKing?.length > 0) {
      return false;
   } else {
      return true;
   }
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

export function fillBoardCheck(game: Game) {
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

export function fillBoardCheckmate(game: Game) {
   game.turn = "black";

   for (let row = 0; row <= 7; row++) {
      let rowArray: (Piece | null)[] = [];
      for (let col = 0; col <= 7; col++) {
         let piece: Piece | null = null;

         if (row == 0 && col == 0) {
            if (false) piece = new Piece("rook", "black");
            piece = new Piece("queen", "black");
         }

         if (row == 1 && col == 0) {
            piece = new Piece("rook", "black");
         }

         if (row == 2 && col == 0) {
            piece = new Piece("king", "black");
         }

         if (row == 1 && col == 7) {
            piece = new Piece("king", "white");
         }

         rowArray.push(piece);
      }

      game.board.push(rowArray);
   }

   console.log(game);
}

export function fillBoardCheckmateAlt(game: Game) {
   game.turn = "white";

   for (let row = 0; row <= 7; row++) {
      let rowArray: (Piece | null)[] = [];
      for (let col = 0; col <= 7; col++) {
         let piece: Piece | null = null;

         if (row == 0 && col == 0) {
            piece = new Piece("queen", "black");
         }

         if (row == 1 && col == 0) {
            piece = new Piece("rook", "black");
         }

         if (row == 2 && col == 0) {
            piece = new Piece("king", "black");
         }
         let rowMagic = 0;
         if (row == rowMagic && col == 7) {
            piece = new Piece("king", "white");
         }

         if (false)
            if (row == 1 && col == 6) {
               piece = new Piece("pawn", "white");
            }

         rowArray.push(piece);
      }

      game.board.push(rowArray);
   }

   console.log(game);
}
