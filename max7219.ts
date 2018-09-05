/**
 * Types of speed level
 */
enum FlashSpeed {

    //% block=fast
    fast = 100,

    //% block=normal
    normal = 300,

    //% block=slow
    slow = 500
}

/**
 * A driver for MAX7219 with a 8x8 Martix LEDs in MakeCode.
 */
//% weight=100 icon="\uf1db" color=#EC7505
namespace max7219led64 {

    let _maxX = 4;
    let _maxY = 4;

    let _ledMap : number[] = [0,0,0,0,0,0,0,0];

    let _DIO = DigitalPin.P0;	// 串行数据输入
    let _SCLK = DigitalPin.P1;	// 串行数据时钟信号————上升沿有效
    let _LOAD = DigitalPin.P2;	// 锁存信号——上升沿有效

    function setBitData(bitData : number){
        pins.digitalWritePin(_SCLK, 0);
        pins.digitalWritePin(_DIO, bitData);
        pins.digitalWritePin(_SCLK, 1);
    }

    function load(){
        pins.digitalWritePin(_LOAD, 1);
        pins.digitalWritePin(_LOAD, 0);
    }

    // 传输一个8位数
    function setByte(byteData : number){
        for (let i = 0; i < 8; i++)
        {
            // 传入的数字从高位到低位依次判断是否为1，若为1则设置高电平，否则设置低电平
            // 判断的方法是先向左移位，把要判断的位移动到最高位然后跟0x80（1000 0000）相与，
            // 如果结果仍然是0x80（1000 0000）就表示最高位是1，否则最高位就是0
            if (((byteData<<i) & 0x80) == 0x80) {
                setBitData(1);
            } else {
                setBitData(0);
            }
        }
    }

    // 译码模式设置
    const DECODE_MODE_ALL_NOT_USE = 0x00;	// 所有数码管均不使用译码功能
    const DECODE_MODE_DIG0_ONLY	  = 0x01; 	// 只对DIG0号数码管进行译码，其他数码管不使用译码功能
    const DECODE_MODE_DIG0123_ONLY= 0x0f; 	// 对DIG0-3号数码管进行译码，其他数码管不使用译码功能
    const DECODE_MODE_ALL_USE     = 0xff;	// 数码管7－0全部采用译码模式
    function setDecodeMode(mode : number) {
        // 指令寄存器地址设置：0xX9
        // D15-D12:任意
        // D11,10,9,8: 1,0,0,1
        setByte(0x09);
        setByte(mode);
        load();
    }

    /**
     * 亮度设置 
     */
    //% blockId=setIntensity block="Set brightness %mode"
    //% mode.min=0 mode.max=15 mode.defl=7
    //% weight=99
    export function setIntensity(mode : number) {
        // 指令寄存器地址设置：0xXA
        // D15-D12:任意
        // D11,10,9,8: 1,0,1,0
        setByte(0x0A);
        
        // 亮度从0到15共16个等级，指令的D3－D0就是数字0－15的二进制编码
        // D7-D4:任意
        setByte(mode);

        load();
    }
        
    // 扫描显示位数设置(0-7)
    function setScanLimit(mode : number) {
        // 指令寄存器地址设置：0xXB
        // D15-D12:任意
        // D11,10,9,8: 1,0,1,1
        setByte(0x0B);
        
        // 扫描位数可设置0－7共8种选择，指令的D2－D0就是数字0－7的二进制编码
        // D7-D3:任意
        // D2-D0:0-7的3位二进制编码
        setByte(mode);

        load();
    }

    // 关断模式设置
    const SHUTDOWN_MODE_SHUTDOWN = 0x00; //关断模式
    const SHUTDOWN_MODE_NORMAL	 = 0x01; //正常运行模式
    function setShutdownMode(mode : number) {

        // 指令寄存器地址设置：0xXC
        // D15-D12:任意
        // D11,10,9,8: 1,1,0,0
        setByte(0x0C);
        
        // 关断模式可设置0－1共2种选择，设置D0即可
        // D7-D1:任意
        // D0:1: 正常运行模式 0: 关断模式
        setByte(mode);

        load();
    }

    // 测试模式设置
    const DISPLAY_TEST_MODE_NORMAL  =	0x00; //正常运行模式
    const DISPLAY_TEST_MODE_TEST    =	0x01; //测试模式(全亮模式)
    function setDisplayTestMode(mode : number) {

        // 指令寄存器地址设置：0xXF
        // D15-D12:任意
        // D11,10,9,8: 1,1,1,1
        setByte(0x0f);
        
        // 测试模式可设置0－1共2种选择，设置D0即可
        // D7-D1:任意
        // D0:0: 正常运行模式 1: 测试模式(全亮模式)
        setByte(mode);

        load();
    }

    /**
     * Init the max7219. 
     */
    //% blockId=init block="Init MAX7219 with Intensity %intensity"
    //% intensity.min=0 intensity.max=15 intensity.defl=7
    //% weight=100
    export function init(intensity : number)
    {
        setDecodeMode(DECODE_MODE_ALL_NOT_USE);			// 数码管7－0全部不采用译码模式
        setIntensity(intensity);						// 亮度(0-15)
        setScanLimit(7);								// 扫描显示位数(0-7)
        setShutdownMode(SHUTDOWN_MODE_NORMAL);			// 正常运行模式
        setDisplayTestMode(DISPLAY_TEST_MODE_NORMAL);	// 正常运行模式

        _ledMap = [0,0,0,0,0,0,0,0];

        for (let row = 0; row < _ledMap.length; row++) {
            setRowData(row, _ledMap[row]);
        }
    }

    /** 
     * 指定行显示指定内容
     * @param row 行号 0-7
     * @param rowData 一个字节的8位数据也就是数字0-255之间的数
    */
    function setRowData(row : number, rowData : number) {

        // 设置指令寄存器地址：0xX1-0xX8
        // 格式：D15-D12:任意（我们这里设置0）
        //       D11-D8: 1-8的4位二进制编码：例：1（0,0,0,1）
        setByte(row+1);

        // 设置显示内容
        setByte(rowData);

        load();
    }

    function turnOnAllLeds() {
        for (let x = 0; x <= _maxX; x++) {
            for (let y = 0; y <= _maxY; y++) {
                led.plot(x, y);
            }
        }
    }

    function turnOffAllLeds() {
        for (let x = 0; x <= _maxX; x++) {
            for (let y = 0; y <= _maxY; y++) {
                led.unplot(x, y);
            }
        }
    }

    /**
     * Turn on a led at specific position. 
     */
    //% blockId=“turnOnLed” block="turn on Led at x:%x|y:%y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    export function turnOnLed(x:number, y:number) {
        let rowData = _ledMap[y];

        rowData = (0x01<<x) | rowData;
        _ledMap[y] = rowData;

        setRowData(y, rowData);
    }

    /**
     * Turn off a led at specific position. 
     */
    //% blockId=“turnOffLed” block="turn off Led at x:%x|y:%y"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    export function turnOffLed(x:number, y:number) {
        let rowData = _ledMap[y];

        // 将指定位置0，采取的方法是先跟(0x01<<x)进行或操作将指定位置1
        // 然后再跟(0x01<<x)进行异或操作，从而将指定位置0.
        // 异或操作的意义是，0跟任何数异或等于任何数，1跟任何数异或等于取反。
        rowData = (0x01<<x)^((0x01<<x)|rowData);
        _ledMap[y] = rowData;

        setRowData(y, rowData);
    }

    /**
     * Flash all leds some times.
     */
    //% blockId=flashAllLed block="flash all leds times %times | with speed %speed"
    export function flashAllLed(times:number, speed:FlashSpeed) {

        for (let index = 0; index < times; index++) {
            turnOnAllLeds();
            basic.pause(speed);
            turnOffAllLeds();
            basic.pause(speed);
        }
    }
}
