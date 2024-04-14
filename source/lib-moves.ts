import { Piece, color, type, board } from "./lib";
const Enumerable = require("linq");

const directionsKing = [
  // Horizontal and vertical
  [-2, 0],
  [2, 0], // Left and Right
  [0, -1],
  [0, 1], // Up and Down
  // Diagonal
  [-2, -1],
  [-2, 1], // Diagonals left
  [2, -1],
  [2, 1], // Diagonals right
];

const knightMoves = [
  // Two squares along columns, one along row
  [-4, 1],
  [4, 1], // Upward L-moves
  [-4, -1],
  [4, -1], // Downward L-moves
  // Two squares along rows, one along column
  [-1, 4],
  [1, 4], // Rightward L-moves
  [-1, -4],
  [1, -4], // Leftward L-moves
];

const directionsQueen = [
  // Horizontal and vertical
  [-2, 0],
  [2, 0], // Left and Right
  [0, -1],
  [0, 1], // Up and Down
  // Diagonal
  [-2, -1],
  [-2, 1], // Diagonals left
  [2, -1],
  [2, 1], // Diagonals right
];

const directionsRook = [
  [0, 2],
  [0, -2],
  [2, 0],
  [-2, 0],
];

const directionsBishop = [
  [2, 2],
  [-2, 2],
  [2, -2],
  [-2, -2],
];

function getKingMovesWithObstacles(
  column: number,
  row: number,
  board: Array<Array<Piece | null>>
): Array<[number, number]> {
  let moves: Array<[number, number]> = [];
  // Directions the king can move (one square in any direction)
  if (false) {
    const directions = [
      [2, 0],
      [-2, 0],
      [0, 1],
      [0, -1],
      [2, 2],
      [-2, 2],
      [2, -2],
      [-2, -2],
    ];
  }

  for (let [dx, dy] of directionsKing) {
    let newColumn = column + dx;
    let newRow = row + dy;

    // Check if new position is out of bounds
    if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) continue;

    // Check if there is a piece in the new position
    if (board[newRow][newColumn] != null) {
      moves.push([newColumn, newRow]); // Can capture
      continue; // Only one move possible in each direction for the king
    }

    moves.push([newColumn, newRow]);
  }

  return moves;
}

function getBishopMovesWithObstacles(
  column: number,
  row: number,
  board: Array<Array<any>>
): Array<[number, number]> {
  let moves: Array<[number, number]> = [];
  // Directions the bishop can move: up-right, up-left, down-right, down-left

  for (let [dx, dy] of directionsBishop) {
    for (let step = 1; step < 8; step++) {
      let newColumn = column + dx * step;
      let newRow = row + dy * step;

      // Check if new position is out of bounds
      if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) break;

      // Check if there is a piece in the new position
      if (board[newRow][newColumn] != null) {
        moves.push([newColumn, newRow]); // Can capture
        break; // Stop checking further in this direction
      }

      moves.push([newColumn, newRow]);
    }
  }

  return moves;
}

function getQueenMovesWithObstacles(
  column: number,
  row: number,
  board: Array<Array<Piece | null>>
): Array<[number, number]> {
  let moves: Array<[number, number]> = [];
  // Directions the queen can move (combines rook and bishop directions)

  for (let [dx, dy] of directionsQueen) {
    for (let step = 1; step < 8; step++) {
      let newColumn = column + dx * step;
      let newRow = row + dy * step;

      // Check if new position is out of bounds
      if (newColumn < 2 || newColumn > 16 || newRow < 1 || newRow > 15) break;

      // Check if there is a piece in the new position
      if (board[newRow][newColumn] != null) {
        moves.push([newColumn, newRow]); // Can capture
        break; // Stop checking further in this direction
      }

      moves.push([newColumn, newRow]);
    }
  }

  return moves;
}

export function getMoves(
  piece: Piece | null,
  board: board,
  col: number,
  row: number
) {
  switch (piece?.getType()) {
    case "pawn":
      {
        try {
          let moves = getPawnMovesWithObstacles(row, col, board, piece);
          console.log(`moves`, moves);
        } catch (ex) {
          console.log(ex);
        }
      }
      break;
    default:
      break;
  }
}

export function findLocationOfPiece(board: board, piece: Piece) {
  let id = piece.getId();
  return Enumerable.from(board).firstOrDefault((p: Piece | null) => p);
}

export function getPawnMovesWithObstacles(
  row: number,
  column: number,
  board: Array<Array<Piece | null>>,
  piece: Piece | null
): Array<[number, number]> {
  let isBlack = piece?.getColor() == "black";
  let moves: Array<[number, number]> = [];
  let startRow = isBlack ? 3 : 13; // Starting rows for white and black pawns
  let direction = isBlack ? 2 : -2; // Direction of movement depending on the pawn's color

  // Single move forward
  let newRow = row + direction;

  if (newRow >= 1 && newRow <= 15 && board[newRow][column] === null) {
    moves.push([newRow, column]);
    if (piece?.isFirstMove()) {
      moves.push([newRow + 1, column]);
    }

    // Double move from starting position
    if (row === startRow) {
      let twoStepsRow = row + 2 * direction;
      if (
        twoStepsRow >= 1 &&
        twoStepsRow <= 15 &&
        board[twoStepsRow][column] === null
      ) {
        moves.push([twoStepsRow, column]);
      }
    }
  }

  // Capturing diagonally
  const captureMoves = [
    [2, direction],
    [-2, direction],
  ];

  captureMoves.forEach(([colChange, rowChange]) => {
    let captureCol = column + colChange;
    let captureRow = row + rowChange;
    if (
      captureCol >= 2 &&
      captureCol <= 16 &&
      captureRow >= 1 &&
      captureRow <= 15 &&
      board[captureRow][captureCol] != null
    ) {
      // Check if the piece at the diagonal is of opposite color
      if (board[captureRow][captureCol] !== null) {
        // Assuming Piece includes a color property or similar logic
        moves.push([captureRow, captureCol]);
      }
    }
  });

  return moves;
}
