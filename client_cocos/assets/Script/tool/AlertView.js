/**
 * 
 */
cc.Class({
    extends: cc.Component,

    properties: {

        labelMsg: {
            default: null,
            type: cc.Label
        },

        btnCancel: {
            default: null,
            type: cc.Button
        },

        btnOK: {
            default: null,
            type: cc.Button
        },
    },

    // use this for initialization
    onLoad: function () {
        this.btnCancel.node.on('click', this.dismiss, this);
        this.btnOK.node.on('click', this.dismiss, this);
    },

    dismiss: function () {
        this.node.removeFromParent();
    },

    // update: function (dt) {
    // },
});
