import { Socket } from "socket.io";
import { generateRandomNumber, generateRandomTextAndNumbers } from "./functions";
import _ from "lodash";
import * as Enumerable from "linq";

//const Enumerable = require("linq");

export const PORT_SERVER = 8081;

export type User = {
   socketId: string | null;
   username?: string;
};

export type MessageClient = User & {
   socket: Socket<any, any, any, any>;
};

export type Message = User & {
   command?:
      | "proposeuser"
      | "proposeuserconfirm"
      | "proposeuserdecline"
      | "startgame"
      | "setuser"
      | "makemove"
      | "getboard"
      | "propose"
      | "getavailableplayers"
      | "test";
   values?: Record<string, string>;

   to?: string;
   from?: string;
};

export type color = "white" | "black";
export type status = "pawnpromotion" | "checkmate" | "check" | null;
export type type = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type board = (Piece | null)[][];
export type move = [number, number, "en-passant" | "castling" | null];

type Player = {
   username: string;
   color: color;
};

export class Piece {
   private id = "";
   private type?: type;
   private color?: color;
   public isFirstMove;
   /** used for en passant oui oui */
   public isFirstRecentlyTaken;

   constructor(type: type, color: color) {
      this.id = generateRandomTextAndNumbers(5);
      this.type = type;
      this.color = color;
      this.isFirstMove = true;
      this.isFirstRecentlyTaken = false;
   }

   public toString() {
      return [this.color, this.type, this.id].join("|");
   }

   public getType() {
      return this.type!;
   }

   public getId() {
      return this.id!;
   }

   public getColor() {
      return this.color;
   }

   public hasDoneFirstMove() {
      return this.isFirstMove;
   }
}

export class Game {
   private players: Player[] = [];
   private boardInactive: Piece[] = [];
   public turn: color;
   public board: board = [];
   public isGameOver: boolean;
   public status: status = null;

   // need a timer that gets passed back and forth...
   // ischeckmate
   // ischeck?

   // castling
   // pawn promotion
   // en-passant

   public constructor(username1: string, username2: string) {
      this.fillBoard();
      this.assignPlayers(username1, username2);
      this.turn = "white";
      this.isGameOver = false;
   }

   private fillBoard() {
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

         this.board.push(rowArray);
      }

      if (false) console.log(this.board);
   }

   public getPiece(row: number, column: number) {
      let piece: Piece | null = null;

      try {
         piece = this.board[row][column];
      } catch (ex) {}

      return piece;
   }

   public consumePiece(row: number, column: number) {
      let piece = this.getPiece(row, column);
      if (piece != null) {
         this.boardInactive.push(piece);
         this.board[row][column] = null;
      }
   }

   public swapPiece(row: number, column: number, row2: number, column2: number) {
      let pieceOriginal = this.getPiece(row, column);
      if (pieceOriginal != null) {
         let pieceSwap = this.getPiece(row2, column2);
         if (pieceSwap != null) {
            this.board[row][column] = pieceSwap;
            this.board[row2][column2] = pieceOriginal;
         }
      }
   }

   public movePiece(
      rowFrom: number,
      columnFrom: number,
      rowTo: number,
      columnTo: number,
      setGame: React.Dispatch<React.SetStateAction<Game>>,
      metaData?: move[2]
   ) {
      let _piece = this.getPiece(rowFrom, columnFrom);
      /** current turn */
      let isBlack = _piece?.getColor() == "black";

      if (_piece != null) {
         if (_piece.isFirstMove) {
            _piece.isFirstMove = false;
            _piece.isFirstRecentlyTaken = true;
         } else {
            _piece.isFirstMove = false;
            _piece.isFirstRecentlyTaken = false;
         }

         let pieceToStash = this.getPiece(rowTo, columnTo);

         if (pieceToStash !== null && metaData == null) {
            this.boardInactive.push(pieceToStash);
         }

         if (metaData == "en-passant") {
            let piecePotential: Piece | null = null;

            let rowCalced = 0;

            if (_piece?.getColor() == "white") {
               rowCalced = rowTo + 1;
            } else if (_piece?.getColor() == "black") {
               rowCalced = rowTo - 1;
            }

            piecePotential = this.getPiece(rowCalced, columnTo);

            if (piecePotential !== null) {
               this.consumePiece(rowCalced, columnTo);
            }
         }

         if (metaData == "castling") {
            this.swapPiece(rowFrom, columnFrom, rowTo, columnTo);
         } else {
            // DEFAULT BEHAVIOUR
            this.board[rowTo][columnTo] = _piece;
            this.board[rowFrom][columnFrom] = null;
         }

         // pawn promotion magic
         if (
            (_piece?.getType() == "pawn" && [0, 7].includes(rowTo) && _piece?.getColor() == "white" && rowTo == 0) ||
            (_piece?.getColor() == "black" && rowTo == 7)
         ) {
            let pieces = Enumerable.from(this.boardInactive).where((p: Piece) => p.getColor() == _piece?.getColor());

            let piecesSelected = pieces.select((p) => `${p.getId()} @ ${p.getType()} (${p.getColor()})`).toArray();

            let piece: Piece | undefined | null;
            do {
               let result = prompt(
                  `You are up for pawn promotion and here are available pieces to resurrect: ${piecesSelected.join(", ")}`,
                  pieces.firstOrDefault()?.getId()
               );

               piece = this.boardInactive.find((p) => p.getId() == result);
            } while (piecesSelected?.length > 0 && piece == undefined);

            if (piece && piece?.getId()?.length > 0) {
               this.boardInactive.push(_piece);
               this.board[rowTo][columnTo] = piece;
               alert("pawn promoted!");
            }

            this.updateBoard(setGame, this);
            return;
         }

         this.updateBoard(setGame, this);
      }
   }

   private updateBoard(setGame: React.Dispatch<React.SetStateAction<Game>>, game: Game) {
      if (game.turn == "white") {
         game.turn = "black";
      } else {
         game.turn = "white";
      }

      setGame((prevGame: any) => {
         return _.clone(game);
      });
   }

   private assignPlayers(username1: string, username2: string) {
      let _players = [username1, username2];
      let randomNumber = generateRandomNumber();
      let randomNumberVal = randomNumber == 1;
      let colors = [randomNumberVal ? "black" : "white", !randomNumberVal ? "black" : "white"];

      _players.forEach((p, index) => {
         let player = { username: p, color: colors[index] } as Player;

         this.players.push(player);
      });
   }

   public showBoard() {
      console.log(`board`, JSON.stringify(this, null, "\t"));
   }

   public getBoard() {
      return this.board;
   }

   public getOtherPlayer(colorGiven: color) {
      let result = Enumerable.from(this.players).firstOrDefault((p: Player) => p.color != colorGiven);

      return result;
   }

   public getPlayers() {
      return this.players;
   }
}
