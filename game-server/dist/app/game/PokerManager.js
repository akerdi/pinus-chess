"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PokerManager {
    constructor() {
        this.pokers = [];
    }
    recreatePoker(hasJoker) {
        for (let index = 1; index <= 13; index++) {
            let arrColor = ["A", "B", "C", "D"];
            for (let color = 0; color < 4; color++) {
                let card = {
                    color: arrColor[color],
                    value: index
                };
                this.pokers.push(card);
            }
        }
        if (hasJoker) {
            let jokerLittle = {
                color: "F",
                value: -1,
            };
            this.pokers.push(jokerLittle);
            let jokerBig = {
                color: "E",
                value: 0
            };
            this.pokers.push(jokerBig);
        }
    }
    randomPoker() {
        for (let index = 0; index < 5; index++) {
            for (let cindex = 0; cindex < this.pokers.length; cindex++) {
                let temp = this.pokers[cindex];
                let rindex = Math.floor(Math.random() * this.pokers.length);
                this.pokers[cindex] = this.pokers[rindex];
                this.pokers[rindex] = temp;
            }
        }
    }
    getPokers() {
        return this.pokers;
    }
    dealOnePoker() {
        return this.pokers.pop();
    }
    dealSomePoker(count) {
        let somepk = this.pokers.slice(-count);
        this.pokers.splice(-count, count);
        return somepk;
    }
    static nnResultForPoker(pokers) {
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
    }
    static nnComparePoker(pk1, pk2) {
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
    }
    static nnResultMuti(nnResult) {
        switch (nnResult.nntype) {
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
                if (nnResult.niuN > 6) {
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
    }
}
exports.default = PokerManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9rZXJNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL2dhbWUvUG9rZXJNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7SUFBQTtRQUNZLFdBQU0sR0FBZ0QsRUFBRSxDQUFDO0lBMkxyRSxDQUFDO0lBekxVLGFBQWEsQ0FBQyxRQUFRO1FBQ3pCLEtBQUssSUFBSSxLQUFLLEdBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwQyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNwQyxJQUFJLElBQUksR0FBRztvQkFDUCxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDdEIsS0FBSyxFQUFFLEtBQUs7aUJBQ2YsQ0FBQztnQkFDRixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMxQjtTQUNKO1FBQ0QsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLFdBQVcsR0FBRztnQkFDZCxLQUFLLEVBQUUsR0FBRztnQkFDVixLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ1osQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTlCLElBQUksUUFBUSxHQUFHO2dCQUNYLEtBQUssRUFBRSxHQUFHO2dCQUNWLEtBQUssRUFBRSxDQUFDO2FBQ1gsQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzlCO0lBQ0wsQ0FBQztJQUVNLFdBQVc7UUFDZCxLQUFLLElBQUksS0FBSyxHQUFDLENBQUMsRUFBRSxLQUFLLEdB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