该项目是抄录[大圣棋牌](https://github.com/ligun123/chess)
由原js 版本转化为pinus 的game-server 版本。

注意点：

* ./dist/config/servers.json 需要填上对应server

* ./dist/config/adminServer.json 添加上对应的server(不知道啥用)

* 其中Typescript 的DouniuRoom 对象挂到channel 时，使用字典对象，简单处理。

* 原**大圣棋牌** 的接口转为async 方式