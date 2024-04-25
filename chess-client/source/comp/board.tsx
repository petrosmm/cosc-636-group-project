import React from "react";
import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";

import { Game, color, move } from "../../../source/lib";
import Enumerable from "linq";
import { getMoves } from "../../../source/lib-moves";
import { isKingInCheck, isKingInCheckmate } from "../../../source/lib-temp";
import { Socket } from "socket.io-client";

const Board: React.FC<{ inputSocket: Socket<any, any>; inputGame?: Game; inputUsername?: string }> = ({
   inputSocket,
   inputGame,
   inputUsername
}) => {
   const [socket, setSocket] = useState(null as unknown as Socket);
   const [game, setGame] = useState(null as unknown as Game);
   const [pieceCurrent, setPieceCurrent, refPieceCurrent] = useStateRef(null as unknown as [number, number] | null);
   const [pieceCurrentMoves, setPieceCurrentMoves, refPieceCurrentMoves] = useStateRef([] as unknown as move[]);
   const [colorMine, setColorMine] = useState(null as unknown as color);

   useEffect(() => {
      let doIgnore = false;

      // do once....

      return () => {
         doIgnore = true;
      };
   }, []);

   useEffect(() => {
      setSocket(inputSocket);

      console.log(`inputGame`, inputGame);

      if (inputGame != null) {
         setGame(inputGame);

         let player = inputGame.getPlayers().find((p) => p.username == inputUsername);

         if (player != undefined) {
            setColorMine(player.color);
         }
      }
   }, []);

   return (
      <>
         <div className="row" hidden={game == null}>
            <div className="col-1 pb-4">
               {refPieceCurrentMoves.current != null && refPieceCurrentMoves.current?.length > 0 ? <>has moves!</> : <> </>}
            </div>
            <div className="col-1 pb-4">{colorMine}</div>
         </div>
         <div className="row" hidden={game == null}>
            <div className="col pb-4">
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     console.log(game);
                  }}>
                  Debug board
               </button>
            </div>
            <div className="col pb-4">
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     game.movePiece(7, 2, 4, 3, setGame, inputUsername, socket);
                     game.movePiece(7, 1, 4, 4, setGame, inputUsername, socket);
                     game.movePiece(7, 5, 4, 5, setGame, inputUsername, socket);
                     game.movePiece(7, 6, 4, 6, setGame, inputUsername, socket);
                     game.movePiece(7, 4, 4, 2, setGame, inputUsername, socket);

                     game.movePiece(0, 2, 5, 3, setGame, inputUsername, socket);
                     game.movePiece(0, 1, 5, 4, setGame, inputUsername, socket);

                     game.movePiece(0, 5, 5, 6, setGame, inputUsername, socket);
                     game.movePiece(0, 6, 5, 5, setGame, inputUsername, socket);
                     game.movePiece(0, 4, 5, 2, setGame, inputUsername, socket);
                  }}>
                  Test general
               </button>
            </div>
            <div className="col pb-4">
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     if (false) game.movePiece(6, 1, 0, 1, setGame, inputUsername, socket);
                     game.movePiece(1, 6, 7, 1, setGame, inputUsername, socket);
                  }}>
                  Test Pawn promotion
               </button>
            </div>
            <div className="col pb-4">
               <button
                  className="btn btn-primary"
                  onClick={() => {
                     if (false) game.movePiece(6, 1, 0, 1, setGame, inputUsername, socket);
                     game.movePiece(0, 4, 3, 3, setGame, inputUsername, socket);
                  }}>
                  Test Queen
               </button>
            </div>
         </div>
         <div className="row">
            <div className="col-12">
               {game != null &&
                  game?.board?.length > 0 &&
                  game?.board?.map((piecesAcrossRow, index) => {
                     let indexRowOriginal = index;
                     let locationRow = index * 2 + 1;

                     let pieces = Enumerable.from(piecesAcrossRow)
                        .select((_p, _index) => {
                           let pieceOccupant = _p;
                           let indexColOriginal = _index;
                           let locationCol = _index * 2 + 2;
                           let _display = ["cEng " + locationCol, pieceOccupant?.getColor(), "|", pieceOccupant?.getType()]
                              .filter(Boolean)
                              .join(" ");
                           let classNameCol = "col ";
                           let isActualPiece = pieceOccupant?.getType() != null;

                           if (isActualPiece) {
                              classNameCol = "col bg-warning";
                           }

                           let moves = refPieceCurrentMoves.current;
                           let hasMoves = moves?.length > 0;
                           let _pieceCurrent = refPieceCurrent.current;
                           let indexOfMove = moves.findIndex((p) => p[0] == indexRowOriginal && p[1] == indexColOriginal);
                           let move = moves[indexOfMove];
                           let buttonMove =
                              hasMoves && indexOfMove > -1 ? (
                                 <button
                                    onClick={() => {
                                       if (_pieceCurrent != null) {
                                          game.movePiece(
                                             _pieceCurrent[0],
                                             _pieceCurrent[1],
                                             indexRowOriginal,
                                             indexColOriginal,
                                             setGame,
                                             inputUsername,
                                             socket,
                                             move[2]
                                          );

                                          setPieceCurrentMoves([]);
                                       }
                                    }}
                                    className="btn-danger">
                                    Move here...
                                 </button>
                              ) : null;

                           let display = (
                              <>
                                 {isActualPiece && colorMine == game.turn && pieceOccupant?.getColor() == game.turn ? (
                                    <button
                                       title={pieceOccupant?.getId()}
                                       onClick={() => {
                                          let canGetMoves = true;
                                          setPieceCurrent([indexRowOriginal, indexColOriginal]);
                                          let pieceOccupying = game.getPiece(indexRowOriginal, indexColOriginal);
                                          let pieceSearchKing = game.findPiece(
                                             pieceOccupying?.getType()!,
                                             pieceOccupying?.getColor()!
                                          );

                                          let king = pieceSearchKing.piece;
                                          let rowKing = pieceSearchKing.row;
                                          let colKing = pieceSearchKing.col;

                                          let isKingCheck = isKingInCheck(rowKing, colKing, game, king?.getColor()!);
                                          if (isKingCheck) {
                                             alert(`King belonging to ${pieceOccupying?.getColor()} is in check!`);
                                             canGetMoves = true;
                                          }

                                          let isKingCheckmate = isKingInCheckmate(rowKing, colKing, game, king?.getColor()!);
                                          if (isKingCheckmate) {
                                             alert(`King belonging to ${pieceOccupying?.getColor()} is in checkmate!`);
                                             canGetMoves = false;
                                          }

                                          if (canGetMoves) {
                                             let moves = getMoves(indexRowOriginal, indexColOriginal, game);
                                             if (moves?.length > 0) {
                                                setPieceCurrentMoves(moves);
                                             } else {
                                                setPieceCurrentMoves([]);
                                                setPieceCurrent(null);
                                             }
                                          }
                                       }}>
                                       {_display}
                                    </button>
                                 ) : (
                                    _display
                                 )}
                                 {buttonMove}
                                 {!isActualPiece && buttonMove == null ? _display : null}
                              </>
                           );

                           let displayColumn = (
                              <div key={locationCol} className={classNameCol}>
                                 {display}
                                 <br />
                                 {["r: " + indexRowOriginal, "c: " + indexColOriginal].join(", ")}
                              </div>
                           );

                           return displayColumn;
                        })
                        .toArray();

                     return (
                        <div key={locationRow} className={"row "}>
                           {"rEng " + locationRow?.toString().padStart(2, "0")}
                           {pieces}
                        </div>
                     );
                  })}
            </div>
         </div>
      </>
   );
};

export default Board;
