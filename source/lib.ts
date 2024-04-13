import { Socket } from "socket.io";
import {
  generateRandomNumber,
  generateRandomTextAndNumbers,
} from "./functions";

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

type color = "white" | "black";
type type = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

type Player = {
  username: string; // Full name of the player
  color: color; // Chess game color assigned to the player
};

type Square2 = null | {}; // 'null' for empty, string could represent pieces, e.g., 'WP' for white pawn

export class Piece {
  private id = "";
  private type?: type;
  private color?: color;

  constructor(type: type, color: color) {
    this.id = generateRandomTextAndNumbers(5);
    this.type = type;
    this.color = color;
  }

  public toString() {
    return [this.color, this.type, this.id].join("|");
  }
}

export class Game {
  private players: Player[] = [];
  private board: (Piece | null)[][] = [];
  private boardInactive: Piece[] = [];

  public constructor(username1: string, username2: string) {
    this.fillBoard();
    this.assignPlayers(username1, username2);
  }

  private fillBoard() {
    for (let row = 1; row <= 15; row += 2) {
      let rowArray: (Piece | null)[] = [];
      for (let col = 2; col <= 16; col += 2) {
        let piece: Piece | null = null;

        // Place pawns
        if (row === 3) {
          // Second row from the bottom, white pawns
          piece = new Piece("pawn", "white");
        } else if (row === 13) {
          // Second row from the top, black pawns
          piece = new Piece("pawn", "black");
        }

        // Place the other pieces on the first and last rows
        if (row === 1 || row === 15) {
          let color: color = null!;
          if (row === 1) {
            color = "white";
          }
          if (row === 15) {
            color = "black";
          }

          if (col === 2 || col === 16) {
            piece = new Piece("rook", color);
          } else if (col === 4 || col === 14) {
            piece = new Piece("knight", color);
          } else if (col === 6 || col === 12) {
            piece = new Piece("bishop", color);
          } else if (col === 8) {
            piece =
              row === 1 ? new Piece("queen", color) : new Piece("king", color);
          } else if (col === 10) {
            piece =
              row === 1 ? new Piece("king", color) : new Piece("queen", color);
          }
        }

        rowArray.push(piece);
      }

      this.board.push(rowArray);
    }
  }

  private assignPlayers(username1: string, username2: string) {
    let _players = [username1, username2];
    let randomNumber = generateRandomNumber();
    let randomNumberVal = randomNumber == 1;
    let colors = [
      randomNumberVal ? "black" : "white",
      !randomNumberVal ? "black" : "white",
    ];

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
    let result = Enumerable.from(this.players).firstOrDefault(
      (p: Player) => p.color != colorGiven
    );

    return result;
  }

  public getPlayers() {
    return this.players;
  }
}
