import React from 'react';

const GridCell = (props) => {
    const classes = "grid-cell \n" + (
        props.foodCell ? "grid-cell--food" : "") + " \n" + (
        props.snakeCell ? "grid-cell--snake" : "") + "\n";
    return (
        <div className={classes} style={{ height: props.size + "px", width: props.size + "px" }} />
    );
};

export default GridCell;
