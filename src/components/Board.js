import React, { useEffect, useRef, useState } from 'react';
import styles from './Board.module.css';
import PropTypes from 'prop-types';
import logoImage from '../logo.svg';
import lollipopImage from '../images/lollipop.svg';
import iceCreamImage from '../images/ice_cream.svg';


function Board({ maze, currentCell, time, dispatch, finishLevel }) {
    const canvas = useRef(null);
    const container = useRef(null);
    const blockRef = useRef({});
    const logoDrawer = useRef({});
    const lollipopDrawer = useRef({});
    const iceCreamDrawer = useRef({});

    const [ctx, setCtx] = useState(undefined);
    const [lollipopObj, setLollipopObj] = useState({});
    const [iceCreamObj, setIceCreamObj] = useState({});
    

    useEffect(() => { //every new maze, initalize the prizes and the drawing constants
        if(maze){
            setLollipopObj(
                {
                    firstCreated: false,
                    show: false,
                    // col: Math.floor(Math.random()*maze.cols),
                    // row: Math.floor(Math.random()*maze.rows),
                    col:31,
                    row:15,
                    showPtsCounter: undefined,
                    timeToShow:time - 3 //-30
                }
              );
            setIceCreamObj(
                {
                firstCreated: false,
                show:false,
                col: Math.floor(Math.random()*maze.cols),
                row: Math.floor(Math.random()*maze.rows),
                showPtsCounter: undefined,
                timeToShow: 15
            });

             blockRef.current.blockWidth = Math.floor(canvas.current.width / maze.cols);
             blockRef.current.blockHeight = Math.floor(canvas.current.height / maze.rows);
             blockRef.current.xOffset = Math.floor((canvas.current.width - maze.cols * blockRef.current.blockWidth) / 2);
             const {blockWidth, blockHeight, xOffset} = blockRef.current;
             const logoSize = 0.75 * Math.min(blockWidth, blockHeight);
            
             const initiateDrawer = (drawerRef, imageSrc, showOnLoad) =>{
                drawerRef.logoSize=  logoSize; 
                drawerRef.image  = new Image(logoSize, logoSize);
                if(showOnLoad){
                    drawerRef.image.onload = () => {
                        ctx.drawImage(drawerRef.image, currentCell[1] * blockWidth + xOffset + (blockWidth - logoSize) / 2, currentCell[0] * blockHeight + (blockHeight - logoSize) / 2, logoSize, logoSize);
                    };
                }
                drawerRef.image.src=imageSrc;
                drawerRef.draw = (currentCell)=>{console.log('current',currentCell);ctx.drawImage(drawerRef.image, currentCell[1] * blockWidth + xOffset + (blockWidth - logoSize) / 2, currentCell[0] * blockHeight + (blockHeight - logoSize) / 2, logoSize, logoSize)};

             }

             initiateDrawer(logoDrawer.current, logoImage,true);
             initiateDrawer(lollipopDrawer.current, lollipopImage,false);
             initiateDrawer(iceCreamDrawer.current, iceCreamImage,false);
             
             


        }
    },[maze,finishLevel]);

    useEffect(() => {
        const fitToContainer = () => {
            const { offsetWidth, offsetHeight } = container.current;
            canvas.current.width = offsetWidth;
            canvas.current.height = offsetHeight;
            canvas.current.style.width = offsetWidth + 'px';
            canvas.current.style.height = offsetHeight + 'px';
        };
        setCtx(canvas.current.getContext('2d'));
        setTimeout(fitToContainer, 0);

    }, []);

    useEffect(() => {
        const drawLine = (x1, y1, width, height) => {
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + width, y1 + height);
            ctx.stroke();
        };

        const draw = () => {
            if (!maze) {
                return;
            }
            ctx.fillStyle = 'blue';
            ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);

            const {blockWidth,blockHeight,xOffset} = blockRef.current;

            for (let y = 0; y < maze.rows; y++) {
                for (let x = 0; x < maze.cols; x++) {
                    const cell = maze.cells[x + y * maze.cols];
                    if (y === 0 && cell[0]) {
                        drawLine(blockWidth * x + xOffset, blockHeight * y, blockWidth, 0)
                    }
                    if (cell[1]) {
                        drawLine(blockWidth * (x + 1) + xOffset, blockHeight * y, 0, blockHeight);
                    }
                    if (cell[2]) {
                        drawLine(blockWidth * x + xOffset, blockHeight * (y + 1), blockWidth, 0);
                    }
                    if (x === 0 && cell[3]) {
                        drawLine(blockWidth * x + xOffset, blockHeight * y, 0, blockHeight);
                    }
                }
            }
            //drawing the logo
            logoDrawer.current.draw(currentCell);
            
            const textSize = Math.min(blockWidth, blockHeight);
            ctx.fillStyle = 'red';
            ctx.font = '20px "Joystix"'; 
            ctx.textBaseline = 'top';

            if(time%2==0){ //make the "GOAL" blinking every even second.
                ctx.fillText('Goal', maze.endCell[1] * blockWidth + xOffset + (blockWidth - textSize) / 2, maze.endCell[0] * blockHeight + (blockHeight - textSize) / 2, textSize)
            }

            //show lollipop logo
            if((time===lollipopObj.timeToShow && !lollipopObj.firstCreated) || lollipopObj.show ){ //alon* - should be 30!
                if(!lollipopObj.firstCreated){
                    setLollipopObj(lollipopObj => {
                        return { ...lollipopObj, firstCreated:true, show:true }
                      });        
                }    
                if(lollipopObj.col===currentCell[1] && lollipopObj.row===currentCell[0] && lollipopObj.show){
                    setLollipopObj(lollipopObj => {
                        return { ...lollipopObj,show:false, showPtsCounter: 3}
                      });
                    dispatch({
                        type: 'hitLollipop',
                    }); 
                }
                else{ //draw the lollipop image
                    lollipopDrawer.current.draw([lollipopObj.row,lollipopObj.col]);
                }
            }
             //show lollipop Points
             if(lollipopObj.showPtsCounter>=0){
                ctx.fillText('+5000', (lollipopObj.col) * blockWidth + xOffset + (blockWidth - textSize) / 2, (lollipopObj.row) * blockHeight + (blockHeight - textSize) / 2, textSize)  
            }

           //show iceCream logo
            if((time===iceCreamObj.timeToShow && !iceCreamObj.firstCreated) || iceCreamObj.show){
                if(!iceCreamObj.firstCreated){
                    setIceCreamObj(iceCreamObj => {
                        return { ...iceCreamObj, firstCreated:true, show:true }
                      }); 
                }
                if(iceCreamObj.col===currentCell[1] && iceCreamObj.row===currentCell[0] && iceCreamObj.show){
                    setIceCreamObj(iceCreamObj => {
                        return { ...iceCreamObj, show:false,  showPtsCounter: 3 }
                      }); 
                    dispatch({
                        type: 'hitIceCream',
                    }); 
                    if(!lollipopObj.firstCreated){ //if the *lollipop* never created, update the time to show the lollipop
                        setLollipopObj(lollipopObj => {
                            return { ...lollipopObj, timeToShow: lollipopObj.timeToShow + 30 }
                          }); 
                    }
                }
                else{ //draw the iceCream image
                    iceCreamDrawer.current.draw([iceCreamObj.row,iceCreamObj.col]);
                }
            }
            //show IceCream points
             if(iceCreamObj.showPtsCounter>=0){
                ctx.fillText('+10000', (iceCreamObj.col) * blockWidth + xOffset + (blockWidth - textSize) / 2, (iceCreamObj.row) * blockHeight + (blockHeight - textSize) / 2, textSize)
            }
        };

        draw();
    }, [ctx, currentCell, maze, time]);

    useEffect(()=>{ //stop showing the points after 3 seconds
        if(lollipopObj.showPtsCounter>=0){
            setLollipopObj(lollipopObj => {
                return { ...lollipopObj,showPtsCounter:lollipopObj.showPtsCounter-1 }
              });    
        }

        if(iceCreamObj.showPtsCounter>=0){
            setIceCreamObj(iceCreamObj => {
                return { ...iceCreamObj,showPtsCounter:iceCreamObj.showPtsCounter-1 }
              });    
        }
    },[time]);
    
    return (
        <div
            className={styles.root}
            ref={container}
        >
            <canvas ref={canvas} />
        </div>
    );
}

Board.propTypes = {
    maze: PropTypes.shape({
        cols: PropTypes.number.isRequired,
        rows: PropTypes.number.isRequired,
        cells: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
        currentCell: PropTypes.arrayOf(PropTypes.number)
    })
};

export default Board;
