import * as crypto from 'crypto'

let secret_key = "InmbuvP6Z8";

export default class UToken {
    public userid:string;
    public exp:number;

    constructor (userid?:string) {
        this.userid = userid;
        this.refresh();
    }

    public refresh() {
        this.exp = new Date().getTime() + 1000 * 60 * 60;
    }

    public isValid() {
        if (this.userid && this.exp) {
            return true;
        }
        return false;
    }

    public isOutOfDate() {
        let now = new Date().getTime();
        return (now > this.exp);
    }

    public encrypt() {
        let cipher = crypto.createCipher("aes-256-cbc", secret_key);
        let str = JSON.stringify(this);
        let crypted = cipher.update(str, 'utf8', 'hex');
        crypted += cipher.final("hex");
        return crypted;
    }

    public decrypt(tokenString:string) {
        if (tokenString) {
            let decipher = crypto.createDecipher("aes-256-cbc", secret_key);
            let dec = decipher.update(tokenString, "hex", "utf8");
            dec += decipher.final("utf8");
            let obj = JSON.parse(dec);
            this.userid = obj.userid;
            this.exp = obj.exp;
        } else {
            this.userid = null;
            this.exp = null;
        }
    }
}