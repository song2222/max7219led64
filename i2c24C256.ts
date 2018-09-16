namespace max7219led64 {

    /**
     * Write a 16-bit data into 24CXX.
     * Note that data address must be a 16-bit data for 24C128 or 24C256.
     * If you use a low capacity eeprom chip like 24C02, the data address should be a 8-bit data. So you need change 'NumberForamt.Int16BE' to 'NumberForamt.UInt8BE'.
     * @param i2cAddr 7-bit address of 24CXX chip, not inclued the 8th bit write/read flag
     * @param dataAddr address of data you want to write at
     * @param data data value
    */
    export function write24C256_Int16(i2cAddr:number, dataAddr:number, data:number)  {
        pins.i2cWriteNumber(
            i2cAddr,
            dataAddr * 65536 + data,
            NumberFormat.Int32BE,
            false
            )
        // basic.pause(5);
    }

    /**
     * Read a 8-bit data from 24CXX.
     * Note that data address must be a 16-bit data for 24C128 or 24C256.
     * If you use a low capacity eeprom chip like 24C02, the data address should be a 8-bit data. So you need change 'NumberForamt.Int16BE' to 'NumberForamt.UInt8BE'.
     * @param i2cAddr  7-bit address of 24CXX chip, not inclued the 8th bit write/read flag
     * @param dataAddr address of data you want to read at
    */
    export function read24C256_Int8(i2cAddr:number, dataAddr:number) : number  {
        // Set data address we want to 'read' by a 'dummy write'.
        pins.i2cWriteNumber(
            i2cAddr,
            dataAddr,
            NumberFormat.UInt16BE,
            true
            )
        // basic.pause(5);
        return pins.i2cReadNumber(80, NumberFormat.UInt8BE, false);
    }

    /**
     * Read a 16-bit data from 24CXX.
     * Note that data address must be a 16-bit data for 24C128 or 24C256.
     * If you use a low capacity eeprom chip like 24C02, the data address should be a 8-bit data. So you need change 'NumberForamt.Int16BE' to 'NumberForamt.UInt8BE'.
     * @param i2cAddr  7-bit address of 24CXX chip, not inclued the 8th bit write/read flag
     * @param dataAddr address of data you want to read at
    */
    export function read24C256_Int16(i2cAddr:number, dataAddr:number) : number  {
        // Set data address we want to 'read' by a 'dummy write'.
        pins.i2cWriteNumber(
            i2cAddr,
            dataAddr,
            NumberFormat.UInt16BE,
            true
            )
        // basic.pause(5);
        return pins.i2cReadNumber(i2cAddr, NumberFormat.UInt16BE, false);
    }
}