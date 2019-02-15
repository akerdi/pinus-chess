var GateConnector = require("../protocol/GateConnector");
require("../pomelo/pomelo-client");

cc.Class({
    extends: cc.Component,

    properties: {

        buttonGuestLogin: {
            default: null,
            type: cc.Button
        },
    },

    // use this for initialization
    onLoad: function () {

        //点击登录
        this.buttonGuestLogin.node.on('click', this.btnGuestLoginTap, this);
    },

    // called every frame
    update: function (dt) {
    },

    btnGuestLoginTap: function () {

        var self = this;
        GateConnector.gateGuestLogin('127.0.0.1', 3101, function (data) {

            // 
            GateConnector.connectToConnector(function () {
                console.log('Connect Success');
            });

            //直接进入游戏场景
            self.node.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(function () {
                self.buttonBrnnRoomTap();
            })));
        });
    },

    buttonBrnnRoomTap: function () {
        
        //
        var param = {
            'token': pomelo.token,
            'rtype': 'brnn'
        };

        console.log("-----param:" + JSON.stringify(param));

        //请求进入房间
        pomelo.request('connector.entryHandler.joinRoom', param, function (data) {

            console.log("-----进入游戏场景");
            cc.director.loadScene('BrnnRoom');
        });
    },
});
