import React from "react";
import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";

import { Game } from "../../../source/lib";
import Enumerable from "linq";
import { getMoves } from "../../../source/lib-moves";

const Board: React.FC<{}> = ({}) => {
   const [socket, setSocket, refSocket] = useStateRef();
   const [game, setGame, refGame] = useStateRef(null as unknown as Game);
   const [test, setTest] = useState(true);
   const [pieceCurrent, setPieceCurrent, refPieceCurrent] = useStateRef(null as unknown as [number, number] | null);
   const [pieceCurrentMoves, setPieceCurrentMoves, refPieceCurrentMoves] = useStateRef([] as unknown as [number, number][]);

   useEffect(() => {
      let doIgnore = false;

      setGame(new Game("max", "virgil"));

      return () => {
         doIgnore = true;
      };
   }, []);

   useEffect(() => {}, []);

   return (
      <>
         <div className="col-12 pb-4">{refPieceCurrent.current != null && "has moves!"}</div>
         <div className="col-11">
            {game?.board?.length > 0 &&
               game?.board?.map((piecesAcrossRow, index) => {
                  let indexRowOriginal = index;
                  let locationRow = index * 2 + 1;

                  let pieces = Enumerable.from(piecesAcrossRow)
                     .select((_p, _index) => {
                        let indexColOriginal = _index;
                        let locationCol = _index * 2 + 2;
                        let _display = ["cEng " + locationCol, _p?.getColor(), "|", _p?.getType()].filter(Boolean).join(" ");
                        let classNameCol = "col ";
                        let isActualPiece = _p?.getType() != null;

                        if (isActualPiece) {
                           classNameCol = "col bg-warning";
                        }

                        let moves = refPieceCurrentMoves.current;
                        let hasMoves = moves?.length > 0;
                        let _pieceCurrent = refPieceCurrent.current;
                        let display =
                           isActualPiece && _p?.getColor() == game.turn ? (
                              <button
                                 title={_p?.getId()}
                                 onClick={() => {
                                    setPieceCurrent([indexRowOriginal, indexColOriginal]);

                                    let moves = getMoves(game.getBoard(), indexRowOriginal, indexColOriginal);
                                    if (moves?.length > 0) {
                                       setPieceCurrentMoves(moves);
                                    } else {
                                       setPieceCurrentMoves([]);
                                       setPieceCurrent(null);
                                    }
                                 }}>
                                 {_display}
                              </button>
                           ) : hasMoves && moves.findIndex((p) => p[0] == indexRowOriginal && p[1] == indexColOriginal) > -1 ? (
                              <button
                                 onClick={() => {
                                    if (_pieceCurrent != null) {
                                       // let moves = getMoves(game.getBoard(), _pieceCurrent[0], _pieceCurrent[1]);

                                       game.movePiece(
                                          _pieceCurrent[0],
                                          _pieceCurrent[1],
                                          indexRowOriginal,
                                          indexColOriginal,
                                          setGame
                                       );

                                       setPieceCurrentMoves([]);
                                    }
                                 }}
                                 className="btn-danger">
                                 Move here...
                              </button>
                           ) : (
                              _display
                           );

                        return (
                           <div
                              onClick={() => {
                                 if (false) {
                                 }
                              }}
                              key={locationCol}
                              className={classNameCol}>
                              {display}
                              <br />
                              {["r: " + indexRowOriginal, "c: " + indexColOriginal].join(", ")}
                           </div>
                        );
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
      </>
   );
};

export default Board;
