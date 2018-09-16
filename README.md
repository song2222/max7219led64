# max7219led64

由MAX7219芯片驱动的LED单色点阵屏模块 microbit 软件包

作者: 陈凌  
时间: 2018/9  

![image](https://github.com/slipperstree/max7219led64/blob/master/MAX7219_LedMatrix.jpg)  

## 使用方法

打开 makecode 编辑器，在项目中选择添加软件包，然后在地址栏输入下面网址：

https://github.com/slipperstree/max7219led64 

搜索后就可以添加并使用本软件包了。

## 程序例

![image](https://github.com/slipperstree/max7219led64/blob/master/sample.png)  

## API
TODO

## 关于显示字符
由于micro:bit的内存比较小，无法加载所有点阵字库，所以提供了一个选项允许从外部储存芯片（24CXX）读取点阵字库。
目前支持24C256和24C128两种I2C协议的EEPROM。
手头上没有外部芯片的话也可以不开启这个选项（init函数的useExFont参数，默认关闭）
