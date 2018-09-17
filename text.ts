namespace max7219led64 {
    const myCharWidth = 8;

    let myText:string = "";
    let myTextOffset:number = 0;
    let myRightSideTextIdx:number =0;
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

            myRightSideTextIdx++;
            if (myRightSideTextIdx >= myText.length) {
                myRightSideTextIdx = 0;
            }
        }

        // 由于往左移动了一列所以需要取到最右侧新移动进来的一列的数据
        let row:number;
        let rowData_8bit:number;
        let letterAsciiCode:number;

        letterAsciiCode = myText.charCodeAt(myRightSideTextIdx);

        // if (myShowTextStartIdx + myNumberOfDevices > myText.length-1) {
        //     // 当左移到最后几个字时，重字符串前面开始取
        //     letterAsciiCode = myText.charCodeAt((myShowTextStartIdx + myNumberOfDevices) % myText.length) ;
        // } else {
        //     // 从外接储存芯片取点阵数据(这里使用的点阵字库数据行扫描，每一个字节是一个点阵的一行数据)
        //     // 如果是列扫描就需要修改相关代码
        //     letterAsciiCode = myText.charCodeAt(myShowTextStartIdx + myNumberOfDevices);
        // }

        // 从外接储存芯片取点阵数据
        let rightSideColData=0x00;
        for (row = 0; row < 8; row++) {
            // 7-bbit 24Cxx address: 1010 A2 A1 A0
            // 24C256 : A2=0
            // A1 : Connect to GND : 0
            // A0 : Connect to GND : 0
            // So, the address is 1010000 = 0x50 
            rowData_8bit = read24C256_Int8(0x50, (letterAsciiCode*8)+row);
            
            // 这里使用的字库的格式是以行为单位的，而左移函数需要的是一列数据，这里要做一个变换
            if (((rowData_8bit<<(-myTextOffset)) & 0x80) == 0x80) {
                rightSideColData = setBitInByte(rightSideColData, row);
            } else {
                rightSideColData = cleanBitInByte(rightSideColData, row);
            }
        }

        // 调用函数，向左移动一位
        scrollLeftNoCommit(rightSideColData);
        refreshAllScreen();
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

        let rowData_8bit:number = 0;

        myRightSideTextIdx = myNumberOfDevices;

        clearMap();

        for (textIdx = 0; textIdx < myNumberOfDevices; textIdx++) {
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
                        turnOnMapNoCommit(row, textIdx * myCharWidth + col + myTextOffset);
                    } else {
                        turnOffMapNoCommit(row, textIdx * myCharWidth + col + myTextOffset);
                    }
                }
            }
        }

        refreshAllScreen();
    }
}
