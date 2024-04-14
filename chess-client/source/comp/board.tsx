import React from "react";
import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";

import { Game } from "../../../source/lib";
import Enumerable from "linq";
import { getMoves } from "../../../source/lib-moves";

const Board: React.FC<{}> = ({}) => {
   const [socket, setSocket, refSocket] = useStateRef();
   const [game, setGame] = useState(new Game("max", "virgil"));

   useEffect(() => {
      console.log();
   }, []);

   return (
      <>
         <div className="col-12">Board</div>
         <div className="col-12">
            {game.getBoard().map((piecesAcrossRow, index) => {
               let indexRowOriginal = index;
               let locationRow = index * 2 + 1;

               let pieces = Enumerable.from(piecesAcrossRow)
                  .select((_p, _index) => {
                     let indexColOriginal = _index;
                     let locationCol = _index * 2 + 2;
                     let display = ["cEng " + locationCol, _p?.toString()].join(" ");

                     let classNameCol = "col ";
                     if (_p?.getType() == "pawn") {
                        console.log(indexRowOriginal, indexColOriginal);
                        classNameCol = "col bg-warning";
                        console.log(classNameCol);
                     }

                     if (_p?.getType() == "knight") {
                        console.log(indexRowOriginal, indexColOriginal);
                        classNameCol = "col bg-warning";
                        console.log(classNameCol);
                     }

                     return (
                        <div
                           onClick={() => {
                              let moves = getMoves(_p, game.getBoard(), indexColOriginal, indexRowOriginal);
                              console.log(indexColOriginal, indexRowOriginal);
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
