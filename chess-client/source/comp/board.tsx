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

   useEffect(() => {
      let doIgnore = false;
      console.log("helo0");
      setGame(new Game("max", "virgil"));

      return () => {
         doIgnore = true;
      };
   }, []);

   useEffect(() => {
      console.log("helo");
      console.log(`game`, game);
   }, [game]);

   return (
      <>
         <div className="col-12">Board</div>
         <div className="col-12">
            {game?.board?.length > 0 &&
               game?.board?.map((piecesAcrossRow, index) => {
                  let indexRowOriginal = index;
                  let locationRow = index * 2 + 1;

                  let pieces = Enumerable.from(piecesAcrossRow)
                     .select((_p, _index) => {
                        let indexColOriginal = _index;
                        let locationCol = _index * 2 + 2;
                        let display = ["cEng " + locationCol, _p?.toString()].join(" ");
                        let classNameCol = "col ";

                        if (_p?.getType() == "pawn") {
                           classNameCol = "col bg-warning";
                        }

                        if (_p?.getType() == "knight") {
                           classNameCol = "col bg-warning";
                        }

                        return (
                           <div
                              onClick={() => {
                                 console.log(`game`, game);
                                 console.log(`game getboard`, game?.getBoard());

                                 let moves = getMoves(_p, game.getBoard(), indexRowOriginal, indexColOriginal);
                                 game.movePiece(_p, indexRowOriginal, indexColOriginal, 3, 0, setGame);
                              }}
                              key={locationCol}
                              className={classNameCol}
                              style={{}}>
                              {display}
                              <br />
                              {"col:" + indexColOriginal}
                              <br />
                              {"row:" + indexRowOriginal}
                              <br />
                           </div>
                        );
                     })
                     .toArray();

                  return (
                     <div key={locationRow} className={"row "}>
                        {"rEng " + locationRow?.toString()}
                        {pieces}
                     </div>
                  );
               })}
         </div>
      </>
   );
};

export default Board;
