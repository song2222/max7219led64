/**
 * Pick some fruit and peel it.
 */
//% weight=100 icon="\uf1db" color=#EC7505
namespace max7219led64 {

    /**
     * Turn on a led at specific position. 
     */
    //% blockId=“turnOnLed” block="turn on Led at x:%x|y:%y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function turnOnLed(x:number, y:number) {
        led.plot(x, y)
    }

    /**
     * Turn off a led at specific position. 
     */
    //% blockId=“turnOffLed” block="turn off Led at x:%x|y:%y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function turnOffLed(x:number, y:number) {
        led.unplot(x, y)
    }
}