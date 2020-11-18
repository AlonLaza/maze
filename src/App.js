import React, {useCallback, useEffect,useRef, useReducer} from 'react';
import styles from './App.module.css';
import useInterval from "@use-it/interval";
import Header from './components/Header';
import Notification from './components/Notification';
import MazeGenerator from './maze/MazeGenerator';
import Board from './components/Board';
import mazeTune from './audio/maze.mp3'; //alon

const ROUND_TIME = 60; //return to 60 -  alon
const ROWS = 17;
const COLS = 33;
const mazeAudio=new Audio(mazeTune); //alon
mazeAudio.loop=true; //alon*- find the right position to this line


function reducer(state, action) {
    switch (action.type) {
        case 'startGame': {
            return {
                ...state,
                maze: action.payload.maze,
                currentCell: action.payload.maze.startCell,
                time: ROUND_TIME
            };
        }
        case 'decrementTime': {
            return {
                ...state,
                time: state.time - 1
            };
        }
        case 'endGame': {
            return {
                ...state,
                hiScore: Math.max(state.hiScore, state.points)
            }
        }
        default:
            throw new Error("Unknown action");
    }
}

function App() {
    const [state, dispatch] = useReducer(reducer, {
        points: 0,
        round: 1,
        hiScore: 0,
        time: undefined,
        maze: undefined,
        currentCell: undefined,
    });

    //alon
    const playAudio = ()=>{ 
        const audioPromise = mazeAudio.play()
        if (audioPromise !== undefined) {
          audioPromise
            .then(_ => {
              // autoplay started
            })
            .catch(err => {
              // catch dom exception
              console.info(err)
            })
        }
    }
    //alon.

    const handleOnEnterKeyPressed = useCallback(() => {
        if (!state.time) {
            dispatch({
                type: 'startGame',
                payload: {
                    maze: new MazeGenerator(ROWS, COLS).generate()
                }
            });
            playAudio(); //alon


        }
    }, [state.time]);

    useEffect(() => {
        const onKeyDown = e => {
            if (e.keyCode === 13) {
                handleOnEnterKeyPressed();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
    }, [handleOnEnterKeyPressed]);

    useInterval(() => {
        dispatch({type: 'decrementTime'})
    }, state.time ? 1000 : null);

    useEffect(() => {
        if (state.time === 0) {
            dispatch({type: 'endGame'});
            mazeAudio.load(); //alon

        }
    }, [state.time]);



    return (
        <div className={styles.root}>
            <Header
                hiScore={state.hiScore}
                points={state.points}
                time={state.time}
                round={state.round}
            />
            <Board
                maze={state.maze}
                currentCell={state.currentCell}
            />
            <Notification
                show={!state.time}
                gameOver={state.time === 0}
            />
        </div>
    );

}

export default App;
