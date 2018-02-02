import React from 'react';
import Board from './Board';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        player: true,
        position: null,
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // Don't make move if winner exists or square is not null
    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.playerSymbol(this.state.xIsNext);
    this.setState({
      history: history.concat([{
        squares: squares,
        player: this.playerSymbol(this.state.xIsNext),
        position: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  playerSymbol(xIsNext) {
    return xIsNext ? 'X' : 'O';
  }

  getLocation(position) {
    const col = position % 3 + 1;
    const row = Math.floor(position / 3) + 1;
    return `(${col}, ${row})`;
  }

  getStatusMsg(winner) {
    if (winner) {
      return `Winner ${winner}`;
    }
    return `Next player: ${this.playerSymbol(this.state.xIsNext)}`;
  }

  renderMove(step, move) {
    let desc;
    if (move) {
      desc = `Go to move #${move} - ${step.player} ${this.getLocation(step.position)}`;
    } else {
      desc = "Go to game start";
    }

    if (move === this.state.stepNumber) {
      return (
        <li key={move}>
          <button className="selected-move" onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    }
    return (
      <li key={move}>
        <button onClick={() => this.jumpTo(move)}>{desc}</button>
      </li>
    );
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);
    const moves = history.map((step,move) => this.renderMove(step, move));

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{this.getStatusMsg(winner)}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

export default Game;