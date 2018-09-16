namespace max7219led64 {
    const myCharWidth = 7;

    let myText:string = "";
    let myNextText:string = "";
    let myTextOffset:number = 0;
    let myShowTextStartIdx:number =0;
    let increment:number = -1;

    let myTextAlignment:number = 0;
    let myTextAlignmentOffset:number = 0;
    const TEXT_ALIGN_LEFT:number          = 0; // Text is aligned to left side of the display
    const TEXT_ALIGN_LEFT_END:number      = 1; // Beginning of text is just outside the right end of the display
    const TEXT_ALIGN_RIGHT:number         = 2; // End of text is aligned to the right of the display
    const TEXT_ALIGN_RIGHT_END:number     = 3; // End of text is just outside the left side of the display

    let myNumberOfDevices = getMyNumberOfDevices();

    function setTextAlignment(textAlignment : number) {
        myTextAlignment = textAlignment;
        calculateTextAlignmentOffset();
    }

    function calculateTextAlignmentOffset() {

        switch(myTextAlignment) {
            case TEXT_ALIGN_LEFT:
                myTextAlignmentOffset = 0;
                break;
            case TEXT_ALIGN_LEFT_END:
                myTextAlignmentOffset = myNumberOfDevices * 8;
                break;
            case TEXT_ALIGN_RIGHT:
                myTextAlignmentOffset = myText.length * myCharWidth - myNumberOfDevices * 8;
                break;
            case TEXT_ALIGN_RIGHT_END:
                myTextAlignmentOffset = - (myText.length * myCharWidth);
                break;
            default:
                break;
        }
        
    }

    function clear() {
        for (let col = 0; col < myNumberOfDevices * 8; col++) {
            setLedData(col, 0);
        }
        
    }
    
    //% blockId=commit block="commit"
    export function commit() {
        refreshAllScreen();
    }
    
    //% blockId=setText block="setText %text"
    export function setText(text:string) {

        //myNumberOfDevices = getMyNumberOfDevices();

        myText = text;
        myTextOffset = 0;
        calculateTextAlignmentOffset();
    }
    
    function scrollTextRight() {
        myTextOffset = (myTextOffset + 1) % (myText.length * myCharWidth - 5);
    }
    
    //% blockId=scrollTextLeft block="scroll text to left"
    export function scrollTextLeft() {
        myTextOffset -= 1;
        if (myTextOffset <= (-myCharWidth)) {
            myTextOffset=0;

            myShowTextStartIdx++;
            if (myShowTextStartIdx >= myText.length) {
                myShowTextStartIdx = 0;
                myTextOffset = myNumberOfDevices * myCharWidth;
            }
        }
    }
    
    function oscillateText() {
        let maxColumns = myText.length * myCharWidth;
        let maxDisplayColumns = myNumberOfDevices * 8;
        if (maxDisplayColumns > maxColumns) {
            return;
        }
        if (myTextOffset - maxDisplayColumns == -maxColumns) {
            increment = 1;
        }
        if (myTextOffset == 0) {
            increment = -1;
        }
        myTextOffset += increment;
    }
    
    //% blockId=drawText block="draw text"
    export function drawText() {
        let letter:number = 0;
        let col:number = 0;
        let row:number = 0;
        let textIdx:number = 0;
        let colData_32bit = 0;
        let colData_8bit = 0;

        let rowData_8bit:number = 0;

        clearMap();

        for (textIdx = myShowTextStartIdx; textIdx < (myShowTextStartIdx + myNumberOfDevices + 1); textIdx++) {
            if (textIdx > myText.length-1) {
                break;
            }
            letter = myText.charCodeAt(textIdx);

            // for (col = 0; col < myCharWidth; col++) {
            //     colData_32bit = cp437_font[letter-32][col/4];
            //     colData_8bit = (colData_32bit& (0xff<<((3-col%4)*8))) >> (3-(col%4))*8;
            //     for (row = 0; row < 8; row++) {
            //         if (((colData_8bit<<row) & 0x80) == 0x80) {
            //             turnOnMapNoCommit(7-row, textIdx * myCharWidth + col + myTextOffset);
            //         } else {
            //             turnOffMapNoCommit(7-row, textIdx * myCharWidth + col + myTextOffset);
            //         }
            //     }
            // }

            for (row = 0; row < 8; row++) {
                // 7-bbit 24Cxx address: 1010 A2 A1 A0
                // 24C256 : A2=0
                // A1 : Connect to GND : 0
                // A0 : Connect to GND : 0
                // So, the address is 1010000 = 0x50 
                rowData_8bit = read24C256_Int8(0x50, (letter*8)+row);
                
                for (col = 0; col < myCharWidth; col++) {
                    if (((rowData_8bit<<col) & 0x80) == 0x80) {
                        turnOnMapNoCommit(row, (textIdx-myShowTextStartIdx) * myCharWidth + col + myTextOffset);
                    } else {
                        turnOffMapNoCommit(row, (textIdx-myShowTextStartIdx) * myCharWidth + col + myTextOffset);
                    }
                }
            }
        }
    }
}
