import { Socket } from "socket.io";
import { generateRandomNumber, generateRandomTextAndNumbers } from "./functions";
import _ from "lodash";

const Enumerable = require("linq");

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
export type type = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type board = (Piece | null)[][];

type Player = {
   username: string;
   color: color;
};

export class Piece {
   private id = "";
   private type?: type;
   private color?: color;
   public isFirstMove;

   constructor(type: type, color: color) {
      this.id = generateRandomTextAndNumbers(5);
      this.type = type;
      this.color = color;
      this.isFirstMove = true;
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

   public constructor(username1: string, username2: string) {
      this.fillBoard();
      this.assignPlayers(username1, username2);
      this.turn = "white";
   }

   private fillBoard() {
      for (let row = 1; row <= 15; row += 2) {
         let rowArray: (Piece | null)[] = [];
         for (let col = 2; col <= 16; col += 2) {
            let piece: Piece | null = null;

            // Place pawns
            if (row === 3 || row === 13) {
               let color: color = null!;
               if (row === 3) {
                  // Second row from the top, black pawns
                  color = "black";
               } else if (row === 13) {
                  // Second row from the bottom, white pawns
                  color = "white";
               }

               piece = new Piece("pawn", color);
            }

            // Place the other pieces on the first and last rows
            if (row === 1 || row === 15) {
               let color: color = null!;
               if (row === 1) {
                  color = "black";
               }
               if (row === 15) {
                  color = "white";
               }

               if (col === 2 || col === 16) {
                  piece = new Piece("rook", color);
               } else if (col === 4 || col === 14) {
                  piece = new Piece("knight", color);
               } else if (col === 6 || col === 12) {
                  piece = new Piece("bishop", color);
               } else if (col === 8) {
                  piece = new Piece("king", color);

                  // old
                  if (false) piece = row === 1 ? new Piece("queen", color) : new Piece("king", color);
               } else if (col === 10) {
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

   public movePiece(
      rowFrom: number,
      columnFrom: number,
      rowTo: number,
      columnTo: number,
      setGame: React.Dispatch<React.SetStateAction<Game>>
   ) {
      let _piece = this.board[rowFrom][columnFrom];

      if (_piece != null) {
         _piece.isFirstMove = false;
         this.board[rowTo][columnTo] = _piece;
         this.board[rowFrom][columnFrom] = null;

         setGame((prevGame: any) => {
            return _.clone(this);
         });
      }
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
