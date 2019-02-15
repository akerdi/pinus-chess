
export default class PokerManager {
    private pokers:{color:string, value:number, nnValue?:any}[] = [];

    public recreatePoker(hasJoker) {
        for (let index=1; index <= 13; index++) {
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

    public randomPoker() {
        for (let index=0; index < 5; index++) {
            for (let cindex=0; cindex < this.pokers.length; cindex++) {
                let temp = this.pokers[cindex];
                let rindex = Math.floor(Math.random() * this.pokers.length);
                this.pokers[cindex] = this.pokers[rindex];
                this.pokers[rindex] = temp;
            }
        }
    }

    public getPokers() {
        return this.pokers;
    }

    public dealOnePoker() {
        return this.pokers.pop();
    }

    public dealSomePoker(count) {
        let somepk = this.pokers.slice(-count);
        this.pokers.splice(-count, count);
        return somepk;
    }

    public static nnResultForPoker(pokers) {
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
            for (let sec = index + 1; sec < pokers.length; sec++) {
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

    public static nnComparePoker(pk1, pk2) {
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

    public static nnResultMuti(nnResult) {
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
                } else return 1;
            }
            case 0:
                return 1;
            default:
                return 1;
        }
    }
}