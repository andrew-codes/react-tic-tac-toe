import React from 'react';

function Square(props) {
  if (props.winning) {
    return (
      <button className="square square-winning" onClick={props.onClick}>
        {props.value}
      </button>
    );
  }

  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

export default Square;