import React, {useCallback, useEffect,useRef, useReducer} from 'react';
import styles from './App.module.css';
import useInterval from "@use-it/interval";
import Header from './components/Header';
import Notification from './components/Notification';
import MazeGenerator from './maze/MazeGenerator';
import Board from './components/Board';
import mazeTune from './audio/maze.mp3'; //alon
import levelEndTune from './audio/level_end.mp3'; //alon


export const ROUND_TIME = 10; //return to 60 -  alon
const ROWS = 17;
const COLS = 33;
const mazeAudio=new Audio(mazeTune); //alon
mazeAudio.loop=true; //alon*- find the right position to this line
const levelEndAudio=new Audio(levelEndTune); //alon
const keyArrows = [37,38,39,40];

function reducer(state, action) {
    switch (action.type) {
        case 'startGame': {
            return {
                ...state,
                maze: action.payload.maze,
                currentCell: action.payload.maze.startCell,
                time: ROUND_TIME,
                points: 0
            };
        }
        case 'decrementTime': {
            return {
                ...state,
                time: state.time - 1
            };
        }
        case 'gameOver': {
            return {
                ...state,
                hiScore: Math.max(state.hiScore, state.points),     
            }
        }
        case 'finishLevel': {
            console.log('aaaaaaa');
            return {
                ...state,
                finishLevel: true,
            }
        }
        case 'nextRound': {
            console.log('ccccccc',state.finishLevel);

            const points = state.points + (state.round * state.time * 100);
            return {
                ...state,
                hiScore: Math.max(state.hiScore, points),
                time:Math.max(ROUND_TIME, state.time),
                currentCell:[0,0],
                round: state.round + 1,
                points: 0,
                maze: action.payload.maze,
                //finishLevel:false    
            }
        }
        case 'hitLollipop': {
            return {
                ...state,
                time: state.time + 15,
                points: state.points + 5000
            }
        }
        case 'hitIceCream': {
            return {
                ...state,
                time: state.time + 30,
                points: state.points + 10000
            }
        }
        case 'move': {
            let newCell=undefined;
            switch(action.payload.keyCode){
                case 37:{
                    if(!state.maze.cells[state.currentCell[1] + state.currentCell[0] * state.maze.cols][3]
                        && (!(state.currentCell[0]===0 && state.currentCell[1]===0)))
                    {
                        newCell =[state.currentCell[0],state.currentCell[1]-1];
                    }   
                    break;
                }
                case 38:{
                    if(!state.maze.cells[state.currentCell[1] + state.currentCell[0] * state.maze.cols][0]){
                        newCell = [state.currentCell[0]-1,state.currentCell[1]];
                    }
                    break;
                }
                case 39:{
                    if(!state.maze.cells[state.currentCell[1] + state.currentCell[0] * state.maze.cols][1]){
                        newCell = [state.currentCell[0],state.currentCell[1]+1];
                    }
                    break;
                }
                case 40:{
                    if(!state.maze.cells[state.currentCell[1] + state.currentCell[0] * state.maze.cols][2]){
                        newCell = [state.currentCell[0]+1,state.currentCell[1]];
                    }
                    break;
                }
            }
            return {
                ...state,
                currentCell: newCell || state.currentCell,
                points: newCell ? state.points + 10 : state.points
            }
        }
        default:
            throw new Error("Unknown action");
    }
}

const playAudio = (audioPlayer)=>{ 
    const audioPromise = audioPlayer.play()
    if (audioPromise !== undefined) {
      audioPromise
        .then(_ => {
          //audio play started
        })
        .catch(err => {
          // catch dom exception
          console.info(err)
        })
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
        finishLevel:false
    });
 

    const handleOnEnterKeyPressed = useCallback(() => {
        if (!state.time) {
            dispatch({
                type: 'startGame',
                payload: {
                    maze: new MazeGenerator(ROWS, COLS).generate()
                }
            });            
            playAudio(mazeAudio);
        }
    }, [state.time]);



    // const handleOnEnterKeyPressed =() => {
    //     if (!state.time) {
    //         dispatch({
    //             type: 'startGame',
    //             payload: {
    //                 maze: new MazeGenerator(ROWS, COLS).generate()
    //             }

    //         });            
    //         playAudio(mazeAudio);
    //     }
    // };
    // console.log(handleOnEnterKeyPressed.name);
    

    // const handleOnArrowKeyPressed = (keyCode) => {
    //         if(state.time!==0 && !state.finishLevel ){
    //             dispatch({
    //                 type: 'move',
    //                 payload:{
    //                     keyCode: keyCode
    //                 }
    //             })
    //         }   
    // };

    const handleOnArrowKeyPressed = useCallback((keyCode) => {
        console.log('state.finishLevel',state.finishLevel);
        console.log('state.points',state.points);

        if(state.time!==0 && !state.finishLevel ){
            dispatch({
                type: 'move',
                payload:{
                    keyCode: keyCode
                }
            })
        }   
    }, [state.time]);

    useEffect(() => {
        const onKeyDown = e => {
            
            if (e.keyCode === 13) {
                handleOnEnterKeyPressed();
            }
            else if (keyArrows.includes(e.keyCode)) { 
                handleOnArrowKeyPressed(e.keyCode);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
        
    }, [handleOnEnterKeyPressed]);

    useInterval(() => {
        dispatch({type: 'decrementTime'})
    }, (state.time && !state.finishLevel)  ? 1000 : null);

    useEffect(() => {
        if (state.time === 0) {
            dispatch({type: 'gameOver'});
            mazeAudio.load();
        }
    }, [state.time]);

    useEffect(() => {
        if (state.maze && state.currentCell[0] === state.maze.endCell[0] && state.currentCell[1] === state.maze.endCell[1] ) {
            dispatch({type: 'finishLevel'});
            mazeAudio.load();
            playAudio(levelEndAudio);
            levelEndAudio.onended = function(){
                dispatch({type: 'nextRound',
                payload: {
                    maze: new MazeGenerator(ROWS, COLS).generate(),
                }});
                playAudio(mazeAudio);
                
              }
        }
    }, [state.currentCell]);

    
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
                time={state.time}
                dispatch={dispatch}
                finishLevel={state.finishLevel}
            />
            <Notification
                show={!state.time}
                gameOver={state.time === 0}
            />
        </div>
    );

}

export default App;
