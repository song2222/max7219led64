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

enum TestMode {

    //% block=TrunOnAllLed
    DISPLAY_TEST_MODE_TEST    =	0x01, //测试模式(全亮模式)

    //% block=Normal
    DISPLAY_TEST_MODE_NORMAL  =	0x00  //正常运行模式

}

enum ShutdownMode {
    //% block=Shutdown
    SHUTDOWN_MODE_SHUTDOWN  = 0x00, //关断模式

    //% block=Normal
    SHUTDOWN_MODE_NORMAL    = 0x01  //正常运行模式
}

/**
 * A driver for MAX7219 with a 8x8 Martix LEDs in MakeCode.
 */
//% weight=100 icon="\uf1db" color=#EC7505
namespace max7219led64 {

    /** 定义有几块横向级联的8x8点阵屏 最少1块 */
    let myNumberOfDevices:number=4;

    export function getMyNumberOfDevices() : number {
        return myNumberOfDevices;
    }

    // 定义点阵数组，每一个元素都是代表一个8位的数据（行单位）
    // 对应硬件的点阵顺序是从左到右从上到下
    // 比如有两个级联的点阵屏的时候，这个数组会被初始化成16个元素】
    // 第1个数是第1个点阵屏的第1行数据，第2个数据是第2个点阵屏第1行数据
    // 第3个数据是第1个点阵屏的第2行数据
    let _ledDatas : number[] = [];

    /** 串行数据输入 */
    let _DIO = DigitalPin.P0;
    /** 串行数据时钟信号————上升沿有效 */
    let _SCLK = DigitalPin.P1;
    /** 锁存信号——上升沿有效 */
    let _LOAD = DigitalPin.P2;

    function setBitData(bitData : number){
        pins.digitalWritePin(_SCLK, 0);
        pins.digitalWritePin(_DIO, bitData);
        pins.digitalWritePin(_SCLK, 1);
    }

    function commit(){
        pins.digitalWritePin(_LOAD, 1);
        pins.digitalWritePin(_LOAD, 0);

        //basic.pause(500);
    }

    // 传输一个8位数
    function sendByte(byteData : number){
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

    /** 
     * 给指定设备发送命令和数据，并提交（load）
     * @param devicde max7219设备编号 从0开始
     * @param reg 寄存器地址
     * @param data 数据
    */
    export function sendDiviceCommit (device:number, reg:number, data:number) {
        for(let i=0;i<myNumberOfDevices;i++) {
            if (i==device) {
                sendByte(reg);
                sendByte(data);
            } else {
                // 如果不是指定的device则传16位的空数据
                // 注意，由于所有设备的移位寄存器都是连在一起的，
                // 所以必须传一组空数据过去占位
                sendByte(0x00);
                sendByte(0x00);
            }
        }
        commit();
    }

    /** 
     * 给级联的所有设备传同样的命令和数据，并提交（load）
     * 用于统一设置亮度等共通的设置
     * @param reg 寄存器地址
     * @param data 数据
    */
    export function sendAllDiviceCommit (reg:number, data:number) {
        for(let i=0;i<myNumberOfDevices;i++) {
            sendByte(reg);
            sendByte(data);
        }
        commit();
    }

    /** 
     * 传送指定行的数据，不提交（load）
     * 用于多块级联时，将所有数据全部送完以后统一提交一次(提交动作由调用方实行)
     * @param rowIdx 行idx（从0开始）
     * @param data 数据
    */
    function sendDisplayDataNoCommit (rowIdx:number, data:number) {
        sendByte(rowIdx + 1); //加1是因为max7219的各行点阵数据的寄存器地址是1-8而不是0-7
        sendByte(data);

        //basic.showIcon(IconNames.Heart);
        //basic.showNumber(rowIdx);
        //basic.showIcon(IconNames.Duck);
        //basic.showNumber(data);
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
        sendAllDiviceCommit(0x09, mode);
    }

    /**
     * 亮度设置 
     */
    //% blockId=setIntensity block="Set brightness %mode"
    //% mode.min=0 mode.max=15 mode.defl=7
    //% weight=99
    export function setIntensity(intensity : number) {
        // 指令寄存器地址设置：0xXA
        // D15-D12:任意
        // D11,10,9,8: 1,0,1,0
        // 
        // 亮度从0到15共16个等级，指令的D3－D0就是数字0－15的二进制编码
        // D7-D4:任意
        sendAllDiviceCommit(0x0A, intensity);
    }
        
    // 扫描显示位数设置(0-7)
    function setScanLimit(scanLimit : number) {
        // 指令寄存器地址设置：0xXB
        // D15-D12:任意
        // D11,10,9,8: 1,0,1,1
        //
        // 扫描位数可设置0－7共8种选择，指令的D2－D0就是数字0－7的二进制编码
        // D7-D3:任意
        // D2-D0:0-7的3位二进制编码
        sendAllDiviceCommit(0x0B, scanLimit);
    }

    // 关断模式设置
    //% blockId=setShutdownMode block="setShutdownMode %mode"
    export function setShutdownMode(mode : ShutdownMode) {

        // 指令寄存器地址设置：0xXC
        // D15-D12:任意
        // D11,10,9,8: 1,1,0,0
        //
        // 关断模式可设置0－1共2种选择，设置D0即可
        // D7-D1:任意
        // D0:1: 正常运行模式 0: 关断模式
        sendAllDiviceCommit(0x0C, mode);
    }

    // 测试模式设置
    //% blockId=setDisplayTestMode block="setDisplayTestMode %mode"
    export function setDisplayTestMode(mode : TestMode) {

        // 指令寄存器地址设置：0xXF
        // D15-D12:任意
        // D11,10,9,8: 1,1,1,1
        //
        // 测试模式可设置0－1共2种选择，设置D0即可
        // D7-D1:任意
        // D0:0: 正常运行模式 1: 测试模式(全亮模式)
        sendAllDiviceCommit(0x0F, mode);
    }

    /**
     * Init the max7219. 
     */
    //% blockId=init block="Init MAX7219 pin DIN %pinDIO|pin CLK %pinCLK|pin LOAD %pinLOAD|num of matrix? %numberOfDevices|with brightness %intensity"
    //% pinDIO.defl=DigitalPin.P14
    //% pinCLK.defl=DigitalPin.P12
    //% pinLOAD.defl=DigitalPin.P13
    //% numberOfDevices.defl=1
    //% intensity.min=0 intensity.max=15 intensity.defl=7
    //% weight=100
    export function init(
        pinDIO : DigitalPin,
        pinCLK : DigitalPin,
        pinLOAD: DigitalPin,
        numberOfDevices: number,
        intensity : number)
    {
        _DIO = pinDIO;	    // 串行数据输入
        _SCLK = pinCLK;	    // 串行数据时钟信号————上升沿有效
        _LOAD = pinLOAD;	// 锁存信号——上升沿有效

        myNumberOfDevices = numberOfDevices;

        for (let index = 0; index < myNumberOfDevices * 8; index++) {
            _ledDatas.push(0x00);
        }

        // 为了避免上电瞬间的电流干扰，首先设置成关断模式（MAX7219容易受到干扰，会出现各种奇怪的现象）
        setShutdownMode(ShutdownMode.SHUTDOWN_MODE_SHUTDOWN);

        // 初始化各种设置
        setDecodeMode(DECODE_MODE_ALL_NOT_USE);			// 数码管7－0全部不采用译码模式
        setIntensity(intensity);						// 亮度(0-15)
        setScanLimit(7);								// 扫描显示位数(0-7)
        setDisplayTestMode(TestMode.DISPLAY_TEST_MODE_NORMAL);	// 正常运行模式

        // 在退出关断模式之前清一次屏幕
        clearScreen();

        // 所有准备工作就绪，退出关断模式
        setShutdownMode(ShutdownMode.SHUTDOWN_MODE_NORMAL);			// 正常运行模式
    }

    // 点亮所有点
    function fillScreen() {
        for (let index = 0; index < myNumberOfDevices * 8; index++) {
            _ledDatas[index]=0xff;
        }
        refreshAllScreen();
    }

    // 清屏幕（关闭所有点）
    //% blockId=clearScreen block="clear screen"
    //% weight=10
    export function clearScreen() {
        for (let index = 0; index < myNumberOfDevices * 8; index++) {
            _ledDatas[index]=0x00;
        }
        refreshAllScreen();
    }

    // 清内存（屏幕不更新）
    export function clearMap() {
        for (let index = 0; index < myNumberOfDevices * 8; index++) {
            _ledDatas[index]=0x00;
        }
    }

    // 给内存数据指定行列置1（不刷新屏幕）
    export function turnOnMapNoCommit(row:number, col:number) { 
        // 指定行不能超过8行（index:7）
        // 指定列不能超过级联后每行最大led个数
        if (row<8 && row>=0 && col<myNumberOfDevices*8 && col>=0) {
            // 根据坐标确定要修改数组第几个元素
            let idx = row*myNumberOfDevices + col/8;
            // 将指定位置1
            _ledDatas[idx] = setBitInByte(_ledDatas[idx], 7 - (col%8));
        }
    }

    // 给内存数据指定行列置0（不刷新屏幕）
    export function turnOffMapNoCommit(row:number, col:number) { 
        // 指定行不能超过8行（index:7）
        // 指定列不能超过级联后每行最大led个数
        if (row<8 && row>=0 && col<myNumberOfDevices*8 && col>=0) {
            // 根据坐标确定要修改数组第几个元素
            let idx = row*myNumberOfDevices + col/8;
            // 将指定位置0
            _ledDatas[idx] = cleanBitInByte(_ledDatas[idx], 7 - (col%8));
        }
}

    /**
     * Turn on a led at specific position. 
     */
    //% blockId=“turnOnLed” block="turn on Led at row:%row|col:%col"
    //% col.min=0 row.min=0 row.max=7
    export function turnOnLed(row:number, col:number) { 
        // 指定行不能超过8行（index:7）
        // 指定列不能超过级联后每行最大led个数
        if (row<8 && row>=0 && col<myNumberOfDevices*8 && col>=0) {
            // 根据坐标确定要修改数组第几个元素
            let idx = row*myNumberOfDevices + col/8;
            // 将指定位置1
            _ledDatas[idx] = setBitInByte(_ledDatas[idx], 7 - (col%8));

            // 更新屏幕(y+1是因为max7219更新数据的行号是1-8 而不是0-7)
            sendDiviceCommit(col/8, row+1, _ledDatas[idx]);
        }
    }

    /**
     * Turn off a led at specific position. 
     */
    //% blockId=“turnOffLed” block="turn off Led at row:%y|col:%x"
    //% col.min=0 row.min=0 row.max=7
    export function turnOffLed(row:number, col:number) {
        // 指定行不能超过8行（index:7）
        // 指定列不能超过级联后每行最大led个数
        if (row<8 && row>=0 && col<myNumberOfDevices*8 && col>=0) {
            // 根据坐标确定要修改数组第几个元素
            let idx = row*myNumberOfDevices + col/8;
            // 将指定位置0
            _ledDatas[idx] = cleanBitInByte(_ledDatas[idx], 7 - (col%8));

            // 更新屏幕(y+1是因为max7219更新数据的行号是1-8 而不是0-7)
            sendDiviceCommit(col/8, row+1, _ledDatas[idx]);
        }
    }

    /**
     * Flash all leds some times.
     */
    //% blockId=flashAllLed block="flash all leds times %times | with speed %speed"
    export function flashAllLed(times:number, speed:FlashSpeed) {

        for (let index = 0; index < times; index++) {
            fillScreen();
            basic.pause(speed);
            clearScreen();
            basic.pause(speed);
        }
    }

    export function refreshAllScreen() {
        for (let idx = 0; idx < _ledDatas.length; idx++) {
            sendDisplayDataNoCommit(_getRowNoByArrIdx(idx), _ledDatas[idx]);
            // 所有级联的设备的一整行数据全部传输完毕以后，统一提交一次
            if (_getDevNoByArrIdx(idx) == (myNumberOfDevices-1) ) {
                commit();

                //basic.showIcon(IconNames.SmallHeart);
            }
        }
    }

    /**
     * 根据数组下标计算设备号
     * @param idxOfDataArray 点阵数组下标
     * @returns 设备号(从0开始计数)
     */
    function _getDevNoByArrIdx(idxOfDataArray : number) : number{
        return idxOfDataArray%myNumberOfDevices;
    }

    /**
     * 根据数组下标计算点阵行号(从0开始计数)
     * @param idxOfDataArray 点阵数组下标
     * @returns 点阵行号(从0开始计数)
     */
    function _getRowNoByArrIdx(idxOfDataArray : number) : number{
        return idxOfDataArray/myNumberOfDevices;
    }

    export function setLedData(idx:number, data:number){
        _ledDatas[idx] = data;
    }

    export function getLedData(idx:number):number{
        return _ledDatas[idx];
    }

    /** 
     * 将指定位置1
    */
    export function setBitInByte(byteData:number, pos:number) : number{
        return (0x01 << pos ) | byteData;
    }

    /** 
     * 将指定位置0
     * 采取的方法是先跟(0x01<<pos)进行或操作将指定位置1
     * 然后再跟(0x01<<pos)进行异或操作，从而将指定位置0.
     * 异或操作的意义是，0跟任何数异或等于任何数，1跟任何数异或等于取反。
    */
    export function cleanBitInByte(byteData:number, pos:number) : number{
        return ((0x01 << pos ) | byteData) ^ (0x01 << pos);
    }


    // 仅仅作为测试使用，正式版本不对外公开
    //% blockId=test block="test"
    export function test() {
        sendAllDiviceCommit(6, 0x00);
        sendAllDiviceCommit(7, 0xff);
        sendAllDiviceCommit(8, 0x00);
        basic.showIcon(IconNames.Heart);
        basic.showIcon(IconNames.SmallHeart);
    }
}
