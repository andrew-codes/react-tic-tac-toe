import React from 'react';
import Square from './Square';
import BoardUtils from '../utils/BoardUtils';

class Board extends React.Component {
  renderSquare(i, winningSquares) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winning={winningSquares && winningSquares.includes(i)}
      />
    );
  }

  render() {
    const winningSquares = BoardUtils.retrieveWinnerSquares(this.props.squares);
    let rows = [];
    for (let row = 0; row < 3; row++) {
      let cols = [];
      for (let col = 0; col < 3; col++) {
        cols.push(this.renderSquare(row * 3 + col, winningSquares));
      }
      rows.push(<div key={row} className="board-row">{cols}</div>);
    }

    return (
      <div>{rows}</div>
    );
  }
}

export default Board;