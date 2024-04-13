import React from "react";
import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";

import { Game } from "../../../source/lib";
import Enumerable from "linq";

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
               let pieces = Enumerable.from(piecesAcrossRow)
                  .select((_p, _index) => (
                     <div key={_index} className="col">
                        {["c" + _index, _p?.toString()].join(" ")}
                     </div>
                  ))
                  .toArray();

               return (
                  <div key={index} className="row">
                     {"r" + index?.toString()}
                     {pieces}
                  </div>
               );
            })}
         </div>
      </>
   );
};

export default Board;
