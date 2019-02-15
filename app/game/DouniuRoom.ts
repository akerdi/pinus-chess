import PokerManager from './PokerManager'
import GMResponse from './GMResponse'
import mysqlHelper from '../dao/mysqlHelper'
import { ChannelService, Channel, RestartNotifyModule } from 'pinus'

// type GameType = 0 | 1 | 2;//state: 0,下注时间等待开始 | 1,游戏开始计算输赢 | 2,其他场景
enum GameType {
    StartWaiting = 0,
    Start = 1,
    Other = 2
}

export default class DouniuRoom {
    private channel:Channel;
    private sqlHelper:mysqlHelper;
    private userList:string[];
    private chipList:{};
    private state:GameType;
    private maxWillWait:number;
    private willWait:number;
    constructor (channel:Channel, sqlHelper:mysqlHelper) {
        this.userList = [];
        this.chipList = {};
        this.state = GameType.StartWaiting;
        this.channel = channel;
        this.sqlHelper = sqlHelper;
        this.maxWillWait = 10;
        this.willWait = 0;
    }

    public joinUser(userid) {
        this.userList.push(userid);
    }

    public kickUser(userid) {
        for (let index = 0; index < this.userList.length; index ++) {
            let element = this.userList[index];
            if (element == userid) {
                this.userList.splice(index, 1);
            }
        }
    }
    private willStartTimer:NodeJS.Timer;
    public startGame() {
        this.state = GameType.StartWaiting;
        this.willWait = this.maxWillWait;
        this.chipList = {};
        this.willStartTimer = setInterval(this.willStartTimerCall.bind(this), 1000);
    }

    private willStartTimerCall() {
        this.willWait --;
        if (this.willWait <= 1) {
            this.state = GameType.Start;
        }
        this.pushWillStartMessage();
        if (this.willWait == 0) {
            clearInterval(this.willStartTimer);
            this.dealPokers();
        }
    }
    private pushWillStartMessage() {
        let data = {
            state: this.state,
            time: this.willWait
        };
        let response = GMResponse(1, 'ok', data);
        this.channel.pushMessage("brnn.onWillStart", response);
    }

    private dealPokers() {
        let pkmanager = new PokerManager();
        pkmanager.recreatePoker(false);
        pkmanager.randomPoker();
        let pokerRes = [];
        for (let index = 0; index < 5; index ++) {
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
                } else {
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
        let response = GMResponse(1, 'ok', data);
        this.channel.pushMessage("brnn.onDealPoker", response);

        setTimeout(function () {
            this.pushGoldResult(pokerRes);
            this.state = 2;
        }.bind(this), 1000* 10);
    }

    public chipIn(userid:string, gold:any, pkindex:number, balance:number) {
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

    public getGoldChipedForUser(userid:string) {
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

    public pushGoldResult(pokerRes) {
        let compareResult = {};
        let dbcount;
        for (let index = 1; index < pokerRes.length; index ++) {
            let pkn = pokerRes[index]["result"];
            let pk0 = pokerRes[0]["result"];
            if (comparePoker(pk0, pkn) >= 0) {
                 dbcount = doubleCountForPoker(pk0);
                dbcount *= -1;
                compareResult[index] = dbcount;
            } else {
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
                let allGoldInfo = {getGold: goldResult, userid: userid};
                userGoldResult.push(allGoldInfo);
            }
        }
        if (userGoldResult.length == 0) {
            let res = GMResponse(1, "ok", []);
            this.channel.pushMessage("brnn.onGoldResult", res);
            setTimeout(this.startGame.bind(this), 3000);
            return ;
        }
        userGoldResult.sort(function (a, b) {
            return a.userid > b.userid;
        });
        this.sqlHelper.updateUserGold(userGoldResult, function (err, allGoldResult) {
            if (err) {
                let res = GMResponse(-1001, "can not calculate", err);
                this.channel.pushMessage("brnn.onGoldResult", res);
            } else {
                let res = GMResponse(1, "ok", allGoldResult);
                this.channel.pushMessage("brnn.onGoldResult", res);
            }
            setTimeout(this.startGame.bind(this), 8000);
        }.bind(this))
    }
    public destroy() {
        clearInterval(this.willStartTimer);
        clearTimeout(this.startGame);
    }
}

var calculateResult = function (pokers:{color:string, value:number, nnValue?:any}[]) {
    let total = 0;
    let nntype = 0;
    let wuxiaoCount = 0;
    let zhadanDic = {};
    let tenCount = 0;
    let huaCount = 0;
    for (let index = 0; index < pokers.length; index ++) {
        let pk = pokers[index];
        pk.nnValue = pk.value > 10 ? 10 : pk.value;
        total += pk.nnValue;

        zhadanDic[pk.value] = ((zhadanDic[pk.value] == undefined) ? 1 : zhadanDic[pk.value] + 1);
        if (pk.value == 10) {
            tenCount ++;
        }

        if (pk.value > 10) {
            huaCount ++;
        }
    }

    let res:any = {};
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

    for (let index = 0; index < pokers.length; index ++) {
        for (let sec = index + 1; sec < pokers.length; sec ++) {
            let pkf = pokers[index];
            let pkl = pokers[sec];
            let testN = (pkf.nnValue + pkl.nnValue) % 10;
            if (testN == niuN) {
                hasNiu = true;
                if (niuN == 0) {
                    res.nntype = 2;
                } else {
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
}

var comparePoker = function (pk1, pk2) {
    if (pk1.nntype > pk2.nntype) {
        return 1;
    } else if (pk1.nntype == pk2.nntype) {
        if (pk1.niuN > pk2.niuN) {
            return 1;
        } else if (pk1.niuN == pk2.niuN) {
            return 0;
        } else {
            return -1;
        }
    } else {
        return -1;
    }
}

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
            } else return 1;
        }
        case 0:
            return 1;
        default:
            return 1;
    }
}