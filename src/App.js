import React, { Component } from 'react';
import './App.css';
import { arrayDiff, shallowEquals } from './util/util';
import GridCell from './component/GridCell';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            snake: [],
            food: [],
            status: 0,
            direction: 39
        };
    }

    componentWillMount() {
        document.addEventListener("keydown", this.setDirection);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.setDirection);
        this.removeTimers();
    }

    moveFood = () => {
        if (this.moveFoodTimeout) {
            clearTimeout(this.moveFoodTimeout);
        }
        var x = parseInt(Math.random() * this.numCells);
        var y = parseInt(Math.random() * this.numCells);
        this.setState({ food: [x, y] });
        this.moveFoodTimeout = setTimeout(this.moveFood, 5000);
    };

    setDirection = (event) => {
        var keyCode = event.keyCode;
        var changeDirection = true;
        [[38, 40], [37, 39]].forEach((dir) => {
            if (dir.indexOf(this.state.direction) > -1 && dir.indexOf(keyCode) > -1) {
                changeDirection = false;
            }
        });
        if (changeDirection) {
            this.setState({ direction: keyCode });
        }
    };

    moveSnake = () => {
        var newSnake = [];
        var clonedSnake = [...this.state.snake];
        // set in the new "head" of the snake
        switch (this.state.direction) {
            // down
        case 40:
            newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] + 1];
            break;
            // up
        case 38:
            newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] - 1];
            break;
            // right
        case 39:
            newSnake[0] = [this.state.snake[0][0] + 1, this.state.snake[0][1]];
            break;
            // left
        case 37:
            newSnake[0] = [this.state.snake[0][0] - 1, this.state.snake[0][1]];
            break;
        default:
        }
        // now shift each "body" segment to the previous segment's position
        [].push.apply(
            newSnake,
            this.state.snake.slice(1).map(function (s, i) {
                // since we're starting from the second item in the list,
                // just use the index, which will refer to the previous item
                // in the original list
                return clonedSnake[i];
            }));


        this.setState({ snake: newSnake });

        this.checkIfAteFood(newSnake);
        if (!this.isValid(newSnake[0]) || !this.doesntOverlap(newSnake)) {
            // end the game
            this.endGame();
        }
    };

    checkIfAteFood = (newSnake) => {
        if (!shallowEquals(newSnake[0], this.state.food)) {
            return;
        }
        // snake gets longer
        var newSnakeSegment = void 0;
        var lastSegment = newSnake[newSnake.length - 1];

        // where should we position the new snake segment?
        // here are some potential positions, we can choose the best looking one
        var lastPositionOptions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

        // the snake is moving along the y-axis, so try that instead
        if (newSnake.length > 1) {
            lastPositionOptions[0] = arrayDiff(lastSegment, newSnake[newSnake.length - 2]);
        }

        for (var i = 0; i < lastPositionOptions.length; i++) {
            newSnakeSegment = [
                lastSegment[0] + lastPositionOptions[i][0],
                lastSegment[1] + lastPositionOptions[i][1]];

            if (this.isValid(newSnakeSegment)) {
                break;
            }
        }

        this.setState({
            snake: newSnake.concat([newSnakeSegment]),
            food: [],
        }, this.moveFood);
    };

    isValid = cell => (
        cell[0] > -1 &&
        cell[1] > -1 &&
        cell[0] < this.numCells &&
        cell[1] < this.numCells
    );

    doesntOverlap = snake => (
        snake.slice(1).filter(function (c) {
            return shallowEquals(snake[0], c);
        }).length === 0
    );

    startGame = () => {
        this.removeTimers();
        this.moveSnakeInterval = setInterval(this.moveSnake, 130);
        this.moveFood();

        this.setState({
            status: 1,
            snake: [[5, 5]],
            food: [10, 10],
        });

        //need to focus so keydown listener will work!
        this.el.focus();
    };

    endGame = () => {
        this.removeTimers();
        this.setState({
            status: 2,
        });
    };
    removeTimers = () => {
        if (this.moveSnakeInterval) {
            clearInterval(this.moveSnakeInterval);
        }
        if (this.moveFoodTimeout) {
            clearTimeout(this.moveFoodTimeout);
        }
    };

    render() {
        const { food, snake } = this.state;
        this.numCells = Math.floor(this.props.size / 15);
        var cellSize = this.props.size / this.numCells;
        var cellIndexes = Array.from(Array(this.numCells).keys());
        var renderCells = () => cellIndexes.map((y) => cellIndexes.map((x) => {
            var foodCell = food[0] === x && food[1] === y;
            var snakeCell = snake.filter((c) => (c[0] === x && c[1] === y));
            snakeCell = snakeCell.length && snakeCell[0];
            return (
                <GridCell
                    foodCell={foodCell}
                    snakeCell={snakeCell}
                    size={cellSize}
                    key={`${x} ${y}`}
                />
            );
        }));

        var overlay = void 0;
        if (this.state.status === 0) {
            overlay = (
                <div className="snake-app__overlay">
                    <button onClick={this.startGame}>Start </button>
                </div>
            );


        } else if (this.state.status === 2) {
            overlay = (
                <div className="snake-app__overlay">
                    <div className="mb-1">
                        <b> OVER</b>
                    </div>
                    <div className="mb-1">
                        Score: {snake.length-1}
                    </div>
                    <button onClick={this.startGame}>New game</button>
                </div>
            );
        }

        return (
            <div
                className="snake-app"
                onKeyDown={this.setDirection}
                style={{
                    width: this.props.size + "px",
                    height: this.props.size + "px",
                }}
                ref={ref => this.el = ref}
            >
                {overlay}
                <div
                    className="grid"
                    style={{
                        width: this.props.size + "px",
                        height: this.props.size + "px",
                    }}
                >
                    {renderCells()}
                </div>
            </div>
        );
    }
}

export default App;
