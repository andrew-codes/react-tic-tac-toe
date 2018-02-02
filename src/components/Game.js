/*
# General Feedback

When used for application state, it is recommended for arrays to represent ordering only, not the actual things being ordered. The reasoning is similar to why application state is stored normalized. You can read more about it here (https://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#normalizing-data). Although the link is to Redux, the concept is very much the same for React.

In this particular example, I would recommend restructuring history into two entities; turns and history. Turns would be a collection (a POJO). I use collection as a generic term in place of a a HashMap, Map, or Dictionary. History is not really the turn themselves, rather the historical ordering of turns. This would be an array of move IDs, ordered in the correct way.

You will find that the history of turns is actually a projection of turns and history and that accessing any particular turn can be done easily via its ID (versus an array loop).

Another thought: what does a Game need to know?
- if there is a winner (computed state)
- the active turn (projection)
  - which may contain the a player details
  - position
- current state of the board

You will notice that the winner is computed AND the turn can actually be represented as computed (project) state. This is an indication that there may be a dumb component hidden within this smart one. Maybe the one with the application state is the App component (lack of a better name) and the Game simply accepts the above state. It would not need to compute any of the values; that would be the job of the parent (container component in this case). It helps separate the "data I need" from "where is that data coming from and how it is computed." The Game component would be much easier to test and would be decoupled from the container; raising its re-usability capacity.

We also may notice that, in addition to a `Players` state collection, the board's state is also a projection of: history and turns. This will eliminate storing computed state (the square array in each turn). Storing computed state is generally considered a bad practice. This will make it easier to update any given square without needing to update all squares in all turns. Also, by isolating the computation of this to a higher parent (container component), it also means we can turn that projection into a selector function that can be memoized. This helps with performance for computationally intense selectors (functions used to derive computed state).

This would ultimately mean your normalized state may look something like this:
```js
{
  history: ['Turn:1', 'Turn:2'],
  players: {
    'Player:1': {
      symbol: 'X',
    },
    Player:2': {
      symbol: 'O',
    },
  },
  turns: {
    'Turn:1': {
      player: 'Player:1',
      squarePosition: 'Square:3',
    },
    {
    'Turn:2': {
      player: 'Player:2',
      squarePosition: 'Square:4',
    },
  }
}
```
 */

import React from 'react';
import Board from './Board';
import BoardUtils from '../utils/BoardUtils';

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
      movesAsc: true,
    };
  }

  handleClick(i) {
    /*
     I would recommend encapsulating what this is doing into a named function. I would leave `handleClick` as named, it is an accurate description; it handles the click event. However, what actually happens on that event would be easier to understand if it read `markSquare` or something of the like. If you are wondering why I would have handleClick just call out to another function; leaving it almost doing nothing, there are good reasons. For one, it is semantic in describing what each actually does and their intent. Semantics aside, it also decouples the action (what is happens on click) from the event (I clicked). This is helpful when multiple events may do the same action or cross-sections of several actions.
     */
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // Don't make move if winner exists or square is not null
      /*
      Instead of doing nothing, maybe the component should "react" to this computed state. The notion of a winner is state that is derived from the global state. This lets the component simply react to this state change. For example, maybe the button is disabled when there is a winner.
       */
    if (BoardUtils.calculateWinner(squares) || squares[i]) {
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

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  playerSymbol(xIsNext) {
    // This is a piece of sneaky state; masquerading as application logic.
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

  toggleMovesOrder() {
    this.setState({
      movesAsc: !this.state.movesAsc,
    })
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
    const winner = BoardUtils.calculateWinner(current.squares);
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
          <button onClick={() => this.toggleMovesOrder()}>Toggle Order</button>
          <ol>{this.state.movesAsc ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

export default Game;