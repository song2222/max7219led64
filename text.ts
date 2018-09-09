namespace max7219led64 {
    // for now cp437 font char width is 7
    const myCharWidth = 7;

    let myText:string = "";
    let myNextText:string = "";
    let myTextOffset:number = 0;
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
        for (let col = 0; col < myNumberOfDevices * 8; col++) {
            sendDiviceCommit(col / 8, col % 8 + 1, getLedData(col));
        }
    }
    
    //% blockId=setText block="setText %text"
    export function setText(text:string) {
        myText = text;
        myTextOffset = 0;
        calculateTextAlignmentOffset();
    }
    
    function setNextText(nextText:string) {
        myNextText = nextText;
    }
    
    function scrollTextRight() {
        myTextOffset = (myTextOffset + 1) % (myText.length * myCharWidth - 5);
    }
    
    //% blockId=scrollTextLeft block="scroll text to left"
    export function scrollTextLeft() {
        myTextOffset = (myTextOffset - 1) % (myText.length * myCharWidth + myNumberOfDevices * 8);
        if (myTextOffset == 0 && myNextText.length > 0) {
            myText = myNextText;
            myNextText = "";
            calculateTextAlignmentOffset();
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
        let letter = 0;
        let position = 0;
        for (let i = 0; i < myText.length; i++) {
            letter = myText.charCodeAt(i);
            for (let col = 0; col < 8; col++) {
                position = i * myCharWidth + col + myTextOffset + myTextAlignmentOffset;
                if (position >= 0 && position < myNumberOfDevices * 8) {
                    // setColumn(position, cp437_font[letter][col]);
                    setColumn(position, (cp437_font[letter-48][col/4] & 0xff<<((3-(col%4))*8)) >> (3-(col%4))*8 );
                }
            }
        }
    }
    
    function setColumn(column:number, value:number) {
        if (column < 0 || column >= myNumberOfDevices * 8) {
            return;
        }
        setLedData(column, value);
    }
}
