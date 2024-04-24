import { Socket } from "socket.io";
import { generateRandomNumber, generateRandomTextAndNumbers } from "./functions";
import _ from "lodash";
import * as Enumerable from "linq";
import { fillBoardCheck, fillBoardCheckmate, fillBoardCheckmateAlt, fillBoardStandard } from "./lib-temp";

//const Enumerable = require("linq");

export const PORT_SERVER = 8081;

export type User = {
   socketId: string | null;
   username?: string;
};

export type MessageClient = User & {
   socket: Socket<any, any, any, any>;
};

export type color = "white" | "black";
export type status = "pawnpromotion" | "checkmate" | "check" | null;
export type type = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type board = (Piece | null)[][];
export type move = [number, number, "en-passant" | "castling" | null];

export type Message = User & {
   command?:
      | "proposeuser"
      | "proposeuserconfirm"
      | "proposeuserdecline"
      | "startgame"
      | "propose"
      | "getavailableplayers"
      | "test"
      // | "setboard"
      | /** used by client */ "receiveboard"
      // | "checkgame"
      | "updateboard"
      | "refreshboard";
   values?: Record<string, string>;

   to?: string;
   from?: string;
};

type Player = {
   username: string;
   color: color;
};

export class Piece {
   public id = "";
   public type?: type;
   public color?: color;
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
   public winner: string = null!;
   public status: status = null;

   // need a timer that gets passed back and forth...

   public constructor(username1: string, username2: string, game?: Game) {
      if (game == undefined) {
         this.assignPlayers(username1, username2);
         this.turn = "white";
         this.isGameOver = false;

         // specific order
         this.fillBoard();
      } else {
         // incoming game
         this.players = game.players;
         console.log(`game.players`, game.players);
         if (false)
            this.players.forEach((item, index) => {
               if (item != null) {
                  //   let playerNew = new Player();
               }
            });
         this.turn = game.turn;
         this.isGameOver = game.isGameOver;

         this.winner = game.winner;
         this.status = game.status;

         game.board.forEach((row, index) => {
            row.forEach((col, index) => {
               if (col != null) {
                  let colNew = new Piece(col.type!, col.color!);
                  row[index] = colNew;
               }
            });
         });

         game.boardInactive.forEach((col, index) => {
            if (col != null) {
               let colNew = new Piece(col.type!, col.color!);
               game.boardInactive[index] = colNew;
            }
         });

         // reset the actual board, back
         this.board = game.board;
         this.boardInactive = game.boardInactive;

         console.log(`game.board...`, game.board);
      }
   }

   private fillBoard() {
      if (false) fillBoardStandard(this);
      if (true) fillBoardCheck(this);
      if (false) fillBoardCheckmate(this);
      if (false) fillBoardCheckmateAlt(this);
   }

   public getPiece(row: number, column: number) {
      let piece: Piece | null = null;

      try {
         piece = this.board[row][column];
      } catch (ex) {}

      return piece;
   }

   public findPiece(type: type, color: color) {
      let piece: Piece | null = null;
      let row = -1;
      let col = -1;

      this.board.forEach((p, index) => {
         p.forEach((_p, _index) => {
            if (_p?.getType() == type && _p.getColor() == color) {
               piece = _p;
               row = index;
               col = _index;
            }
         });
      });

      return { piece: piece as Piece | null, row, col };
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

      // TODO MAX
      throw new Error("NOT IMPLEMENTED, NEED TO SYNC board")
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
