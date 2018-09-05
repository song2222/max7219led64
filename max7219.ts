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

    let maxX = 4;
    let maxY = 4;

    function turnOnAllLeds() {
        for (let x = 0; x <= maxX; x++) {
            for (let y = 0; y <= maxY; y++) {
                led.plot(x, y);
            }
        }
    }

    function turnOffAllLeds() {
        for (let x = 0; x <= maxX; x++) {
            for (let y = 0; y <= maxY; y++) {
                led.unplot(x, y);
            }
        }
    }

    /**
     * Turn on a led at specific position. 
     */
    //% blockId=“turnOnLed” block="turn on Led at x:%x|y:%y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function turnOnLed(x:number, y:number) {
        led.plot(x, y);
    }

    /**
     * Turn off a led at specific position. 
     */
    //% blockId=“turnOffLed” block="turn off Led at x:%x|y:%y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function turnOffLed(x:number, y:number) {
        led.unplot(x, y);
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
