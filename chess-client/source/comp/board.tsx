import React from "react";
import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";

import { Game } from "../../../source/lib";

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
            {game.getBoard().map((piecesAsRow, index) => {
               console.log(
                  `piecesAsColumn`,
                  piecesAsRow.map((p) => p?.toString())
               );
               return <div key={index}></div>;
            })}
         </div>
      </>
   );
};

export default Board;
