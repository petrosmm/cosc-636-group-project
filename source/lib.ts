// import Enumerable from "linq";
// /** white always goes first */
import { Socket } from "socket.io";
import { generateRandomNumber } from "./functions";

const Enumerable = require("linq");

export type User = {
  socketId: string| null;
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

/** white always goes first */
type color = "white" | "black";
type type = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

type Player = {
  username: string; // Full name of the player
  color: color; // Chess game color assigned to the player
};

type Square2 = null | {}; // 'null' for empty, string could represent pieces, e.g., 'WP' for white pawn

export class Piece {
  private type?: type;

  public Piece(type: type) {
    this.type = type;
  }
}

export class Game {
  private players: Player[] = [];
  private chessboard: (Piece | null)[][] = [];

  public constructor(username1: string, username2: string) {
    this.fillBoard();
    this.assignPlayers(username1, username2);
  }

  private fillBoard() {
    for (let row = 1; row <= 15; row += 2) {
      let rowArray: (Piece | null)[] | null[] = [];
      for (let col = 2; col <= 16; col += 2) {
        rowArray.push(null);
        //  throw Error("some stuff");
      }

      this.chessboard.push(rowArray);
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

    let x = Enumerable.from(colors).firstOrDefault();
    console.log(`colors2`, x);

    _players.forEach((p, index) => {
      let player = { username: p, color: colors[index] } as Player;

      this.players.push(player);
    });
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
