import { Socket } from "socket.io";
import { Socket as SocketClient } from "socket.io-client";
import { generateRandomNumber, generateRandomTextAndNumbers } from "./functions";
import _ from "lodash";
import * as Enumerable from "linq";
import { fillBoardCheck, fillBoardCheckmate, fillBoardCheckmateAlt, fillBoardStandard } from "./lib-temp";
import { Timer } from "timer-node";

//const Enumerable = require("linq");

export const PORT_SERVER = 8085;

export type User = {
   socketId?: string | null;
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
      | /** used by client */ "receiveboard"
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
         this.turn = game.turn;
         this.isGameOver = game.isGameOver;

         this.winner = game.winner;
         this.status = game.status;

         game.board.forEach((row, index) => {
            row.forEach((col, index) => {
               if (col != null) {
                  let colNew = new Piece(col.type!, col.color!);
                  colNew.isFirstMove = col.isFirstMove;
                  colNew.isFirstRecentlyTaken = col.isFirstRecentlyTaken;
                  if (false!)
                     if (!col.isFirstMove || col.isFirstRecentlyTaken) {
                        console.log(`implanting peice`, col);
                     }
                  row[index] = colNew;
               }
            });
         });
         
         if (false!) console.log(`game.board`, game.board);

         game.boardInactive.forEach((col, index) => {
            if (col != null) {
               let colNew = new Piece(col.type!, col.color!);
               colNew.isFirstMove = col.isFirstMove;
               colNew.isFirstRecentlyTaken = col.isFirstRecentlyTaken;
               game.boardInactive[index] = colNew;
            }
         });

         // reset the actual board, back
         this.board = game.board;
         this.boardInactive = game.boardInactive;

         if (false!) console.log(`game.board...`, game.board);
      }
   }

   private fillBoard() {
      if (true) fillBoardStandard(this);
      if (false) fillBoardCheck(this);
      if (false) fillBoardCheckmate(this);
      if (false) fillBoardCheckmateAlt(this);
   }

   public setGameOver(
      setGame: React.Dispatch<React.SetStateAction<Game>>,
      winner: color,
      username: string,
      socket: SocketClient
   ) {
      this.isGameOver = true;
      this.winner = winner;
      this.updateBoard(setGame, this, username, socket);
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
      username: string | null | undefined,
      timer: Timer,
      socket?: SocketClient,
      metaData?: move[2]
   ) {
      let _piece = this.getPiece(rowFrom, columnFrom);

      if (_piece != null) {
         if (false!)
            if (_piece.isFirstRecentlyTaken) {
               _piece.isFirstMove = false;
               _piece.isFirstRecentlyTaken = false;
            } else if (_piece.isFirstMove) {
               _piece.isFirstMove = false;
               _piece.isFirstRecentlyTaken = true;
            } else {
               _piece.isFirstMove = false;
               _piece.isFirstRecentlyTaken = false;
            }

         if (_piece.isFirstMove) {
            _piece.isFirstMove = false;
            _piece.isFirstRecentlyTaken = true;
         } else if (_piece.isFirstRecentlyTaken) {
            _piece.isFirstMove = false;
            _piece.isFirstRecentlyTaken = false;
         }

         // update piece
         this.board[rowFrom][columnFrom] = _piece;
         _piece = this.getPiece(rowFrom, columnFrom);

         console.log(`show board during movepiece 1`, _piece);

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

            timer.stop();
            this.updateBoard(setGame, this, username, socket);
            return;
         }

         timer.stop();
         this.updateBoard(setGame, this, username, socket);
      }
   }

   private updateBoard(
      setGame: React.Dispatch<React.SetStateAction<Game>>,
      game: Game,
      username: string | null | undefined,
      socket?: SocketClient
   ) {
      if (game.turn == "white") {
         game.turn = "black";
      } else {
         game.turn = "white";
      }
      let gameUpdated = _.clone(game);
      console.log(`gameUpdated`, gameUpdated);
      // send updated game
      let message = {
         command: "updateboard",
         username: username,
         values: { "0": JSON.stringify(gameUpdated) }
      } as Message;

      socket?.emit("from-client", message);

      setGame((prevGame: any) => {
         return gameUpdated;
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
