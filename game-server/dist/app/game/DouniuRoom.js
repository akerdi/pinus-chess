"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PokerManager_1 = require("./PokerManager");
const GMResponse_1 = require("./GMResponse");
// type GameType = 0 | 1 | 2;//state: 0,下注时间等待开始 | 1,游戏开始计算输赢 | 2,其他场景
var GameType;
(function (GameType) {
    GameType[GameType["StartWaiting"] = 0] = "StartWaiting";
    GameType[GameType["Start"] = 1] = "Start";
    GameType[GameType["Other"] = 2] = "Other";
})(GameType || (GameType = {}));
class DouniuRoom {
    constructor(channel, sqlHelper) {
        this.userList = [];
        this.chipList = {};
        this.state = GameType.StartWaiting;
        this.channel = channel;
        this.sqlHelper = sqlHelper;
        this.maxWillWait = 10;
        this.willWait = 0;
    }
    joinUser(userid) {
        this.userList.push(userid);
    }
    kickUser(userid) {
        for (let index = 0; index < this.userList.length; index++) {
            let element = this.userList[index];
            if (element == userid) {
                this.userList.splice(index, 1);
            }
        }
    }
    startGame() {
        this.state = GameType.StartWaiting;
        this.willWait = this.maxWillWait;
        this.chipList = {};
        this.willStartTimer = setInterval(this.willStartTimerCall.bind(this), 1000);
    }
    willStartTimerCall() {
        this.willWait--;
        if (this.willWait <= 1) {
            this.state = GameType.Start;
        }
        this.pushWillStartMessage();
        if (this.willWait == 0) {
            clearInterval(this.willStartTimer);
            this.dealPokers();
        }
    }
    pushWillStartMessage() {
        let data = {
            state: this.state,
            time: this.willWait
        };
        let response = GMResponse_1.default(1, 'ok', data);
        this.channel.pushMessage("brnn.onWillStart", response);
    }
    dealPokers() {
        let pkmanager = new PokerManager_1.default();
        pkmanager.recreatePoker(false);
        pkmanager.randomPoker();
        let pokerRes = [];
        for (let index = 0; index < 5; index++) {
            let aPkGroup = pkmanager.dealSomePoker(5);
            let nnRes = calculateResult(aPkGroup);
            if (nnRes.nntype == 1 || nnRes.nntype == 2) {
                let tmp = aPkGroup[4];
                aPkGroup[4] = aPkGroup[nnRes.pIndex1];
                aPkGroup[nnRes.pIndex1] = tmp;
                tmp = aPkGroup[3];
                aPkGroup[3] = aPkGroup[nnRes.pIndex2];
                aPkGroup[nnRes.pIndex2] = tmp;
            }
            delete nnRes.pIndex1;
            delete nnRes.pIndex2;
            if (index > 0) {
                let pk0 = pokerRes[0]['result'];
                if (comparePoker(pk0, nnRes) >= 0) {
                    nnRes.win = false;
                }
                else {
                    nnRes.win = true;
                }
            }
            let dic = {
                poker: aPkGroup,
                result: nnRes
            };
            pokerRes.push(dic);
        }
        let data = {
            state: this.state,
            pokerRes: pokerRes
        };
        let response = GMResponse_1.default(1, 'ok', data);
        this.channel.pushMessage("brnn.onDealPoker", response);
        setTimeout(function () {
            this.pushGoldResult(pokerRes);
            this.state = 2;
        }.bind(this), 1000 * 10);
    }
    chipIn(userid, gold, pkindex, balance) {
        if (pkindex <= 0 || this.state != 0) {
            return null;
        }
        let goldBefore = this.getGoldChipedForUser(userid);
        if (goldBefore >= balance) {
            return null;
        }
        if (!this.chipList[userid]) {
            this.chipList[userid] = {};
        }
        this.chipList[userid][pkindex] = parseInt(gold);
        return this.chipList[userid];
    }
    getGoldChipedForUser(userid) {
        let chipInfo = this.chipList[userid];
        let goldnow = 0;
        for (let key in chipInfo) {
            if (chipInfo.hasOwnProperty(key)) {
                let element = chipInfo[key];
                goldnow += element;
            }
        }
        return goldnow;
    }
    pushGoldResult(pokerRes) {
        let compareResult = {};
        let dbcount;
        for (let index = 1; index < pokerRes.length; index++) {
            let pkn = pokerRes[index]["result"];
            let pk0 = pokerRes[0]["result"];
            if (comparePoker(pk0, pkn) >= 0) {
                dbcount = doubleCountForPoker(pk0);
                dbcount *= -1;
                compareResult[index] = dbcount;
            }
            else {
                dbcount = doubleCountForPoker(pkn);
                compareResult[index] = dbcount;
            }
        }
        let userGoldResult = [];
        for (let userid in this.chipList) {
            if (this.chipList.hasOwnProperty(userid)) {
                let chipInfo = this.chipList[userid];
                let goldResult = 0;
                for (let pkIndex in chipInfo) {
                    if (chipInfo.hasOwnProperty(pkIndex)) {
                        let goldChiped = chipInfo[pkIndex];
                        dbcount = compareResult[pkIndex];
                        goldResult += (dbcount * goldChiped);
                    }
                }
                let allGoldInfo = { getGold: goldResult, userid: userid };
                userGoldResult.push(allGoldInfo);
            }
        }
        if (userGoldResult.length == 0) {
            let res = GMResponse_1.default(1, "ok", []);
            this.channel.pushMessage("brnn.onGoldResult", res);
            setTimeout(this.startGame.bind(this), 3000);
            return;
        }
        userGoldResult.sort(function (a, b) {
            return a.userid > b.userid;
        });
        this.sqlHelper.updateUserGold(userGoldResult, function (err, allGoldResult) {
            if (err) {
                let res = GMResponse_1.default(-1001, "can not calculate", err);
                this.channel.pushMessage("brnn.onGoldResult", res);
            }
            else {
                let res = GMResponse_1.default(1, "ok", allGoldResult);
                this.channel.pushMessage("brnn.onGoldResult", res);
            }
            setTimeout(this.startGame.bind(this), 8000);
        }.bind(this));
    }
    destroy() {
        clearInterval(this.willStartTimer);
        clearTimeout(this.startGame);
    }
}
exports.default = DouniuRoom;
var calculateResult = function (pokers) {
    let total = 0;
    let nntype = 0;
    let wuxiaoCount = 0;
    let zhadanDic = {};
    let tenCount = 0;
    let huaCount = 0;
    for (let index = 0; index < pokers.length; index++) {
        let pk = pokers[index];
        pk.nnValue = pk.value > 10 ? 10 : pk.value;
        total += pk.nnValue;
        zhadanDic[pk.value] = ((zhadanDic[pk.value] == undefined) ? 1 : zhadanDic[pk.value] + 1);
        if (pk.value == 10) {
            tenCount++;
        }
        if (pk.value > 10) {
            huaCount++;
        }
    }
    let res = {};
    for (let key in zhadanDic) {
        if (zhadanDic.hasOwnProperty(key)) {
            let element = zhadanDic[key];
            if (element == 4) {
                nntype = 6;
                res.nntype = nntype;
                res.niuN = key;
                res.pIndex1 = -1;
                res.pIndex2 = -1;
                return res;
            }
        }
    }
    if (wuxiaoCount == 5 && total <= 10) {
        nntype = 5;
        res.nntype = nntype;
        res.niuN = 0;
        res.pIndex1 = -1;
        res.pIndex2 = -1;
        return res;
    }
    if (huaCount == 5) {
        nntype = 4;
        res.nntype = nntype;
        res.niuN = 0;
        res.pIndex1 = -1;
        res.pIndex2 = -1;
        return res;
    }
    if (huaCount == 4 && tenCount == 1) {
        nntype = 3;
        res.nntype = nntype;
        res.niuN = 0;
        res.pIndex1 = -1;
        res.pIndex2 = -1;
        return res;
    }
    let niuN = total % 10;
    let hasNiu = false;
    for (let index = 0; index < pokers.length; index++) {
        for (let sec = index + 1; sec < pokers.length; sec++) {
            let pkf = pokers[index];
            let pkl = pokers[sec];
            let testN = (pkf.nnValue + pkl.nnValue) % 10;
            if (testN == niuN) {
                hasNiu = true;
                if (niuN == 0) {
                    res.nntype = 2;
                }
                else {
                    res.nntype = 1;
                }
                res.niuN = niuN;
                res.pIndex1 = index;
                res.pIndex2 = sec;
                break;
            }
        }
        if (hasNiu) {
            break;
        }
    }
    if (!hasNiu) {
        res.nntype = 0;
        res.niuN = -1;
        res.pIndex1 = -1;
        res.pIndex2 = -1;
    }
    return res;
};
var comparePoker = function (pk1, pk2) {
    if (pk1.nntype > pk2.nntype) {
        return 1;
    }
    else if (pk1.nntype == pk2.nntype) {
        if (pk1.niuN > pk2.niuN) {
            return 1;
        }
        else if (pk1.niuN == pk2.niuN) {
            return 0;
        }
        else {
            return -1;
        }
    }
    else {
        return -1;
    }
};
var doubleCountForPoker = function (poker) {
    switch (poker.nntype) {
        case 6:
            return 8;
        case 5:
            return 6;
        case 4:
            return 5;
        case 3:
            return 4;
        case 2:
            return 3;
        case 1: {
            if (poker.niuN > 6) {
                return 2;
            }
            else
                return 1;
        }
        case 0:
            return 1;
        default:
            return 1;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG91bml1Um9vbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9nYW1lL0RvdW5pdVJvb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBeUM7QUFDekMsNkNBQXFDO0FBSXJDLHNFQUFzRTtBQUN0RSxJQUFLLFFBSUo7QUFKRCxXQUFLLFFBQVE7SUFDVCx1REFBZ0IsQ0FBQTtJQUNoQix5Q0FBUyxDQUFBO0lBQ1QseUNBQVMsQ0FBQTtBQUNiLENBQUMsRUFKSSxRQUFRLEtBQVIsUUFBUSxRQUlaO0FBRUQ7SUFRSSxZQUFhLE9BQWUsRUFBRSxTQUFxQjtRQUMvQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVNLFFBQVEsQ0FBQyxNQUFNO1FBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxRQUFRLENBQUMsTUFBTTtRQUNsQixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFHLEVBQUU7WUFDeEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxJQUFJLE9BQU8sSUFBSSxNQUFNLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtB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