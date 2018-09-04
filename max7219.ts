/**
 * Pick some fruit and peel it.
 */
//% weight=100 icon="\uf1db" color=#EC7505
namespace pmbmax7219 {

    /**
     * Turn on a led at specific position. 
     */
    //% blockId=“turnOnLed” block="turn on Led at x:%x|y:%y"
    export function turnOnLed(x:number, y:number) {
        led.plot(0, 0)
    }

    /**
     * Turn off a led at specific position. 
     */
    //% blockId=“turnOffLed” block="turn off Led at x:%x|y:%y"
    export function turnOffLed(x:number, y:number) {
        led.unplot(0, 0)
    }
}