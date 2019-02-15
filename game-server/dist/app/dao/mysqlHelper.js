"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class mysqlHelper {
    constructor(app) {
        this.app = app;
        let mysqlConfig = app.get("mysql");
        let mysql = require("mysql");
        let pool = mysql.createPool(mysqlConfig);
        this.pool = pool;
    }
    query(sqlString, values, callback) {
        if (values) {
            this.pool.query(sqlString, values, callback);
        }
        else {
            this.pool.query(sqlString, callback);
        }
    }
    guestLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let sql = "insert into t_user () values ();";
                let self = this;
                this.query(sql, null, function (err, results) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("11111:::", results);
                        let userid = results["insertId"];
                        self.queryUserInfo(userid, function (err, result) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(result);
                            }
                        });
                    }
                });
            });
        });
    }
    queryUserInfo(userid, callback) {
        let sql = "select * from t_user where userid = '?'";
        this.query(sql, [userid], function (err, results) {
            if (results.length > 0) {
                callback(null, results[0]);
            }
            else {
                callback(err, "没有资料");
            }
        });
    }
    asyncQueryUserInfo(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let sql = "select * from t_user where userid = '?'";
                this.query(sql, [userid], function (err, results) {
                    if (results.length > 0) {
                        resolve(results[0]);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        });
    }
    beginTransaction(callback) {
        this.pool.getConnection(callback);
    }
    updateUserGold(ugoldResults, callback) {
        this.beginTransaction(function (err, connection) {
            if (err) {
                if (callback) {
                    callback(err);
                }
                return;
            }
            let userids = [];
            for (let index = 0; index < ugoldResults.length; index++) {
                let element = ugoldResults[index];
                let userid = element.userid;
                userids.push(userid);
                let getGold = element.getGold;
                let sql = "update t_user set gold = IF(gold + '?' < 0, 0, gold + '?') where userid = ?; ";
                connection.query(sql, [getGold, getGold, userid]);
            }
            let useridString = userids.join(",");
            let sql = "select userid, gold from t_user where userid in(" + useridString + ");";
            connection.query(sql, function (err, results) {
                if (!err) {
                    for (let index = 0; index < ugoldResults.length; index++) {
                        let element = ugoldResults[index];
                        let dbElement = results[index];
                        element.totalGold = dbElement.gold;
                    }
                }
            });
            connection.commit(function (err) {
                if (err) {
                    connection.rollback();
                    callback(err, ugoldResults);
                }
                else {
                    if (callback) {
                        callback(null, ugoldResults);
                    }
                }
            });
        });
    }
}
exports.default = mysqlHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlzcWxIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZGFvL215c3FsSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQTtJQUVJLFlBQXFCLEdBQWU7UUFBZixRQUFHLEdBQUgsR0FBRyxDQUFZO1FBQ2hDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVNLEtBQUssQ0FBQyxTQUFnQixFQUFFLE1BQVUsRUFBRSxRQUFRO1FBQy9DLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNoRDthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUVZLFVBQVU7O1lBQ25CLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ25DLElBQUksR0FBRyxHQUFHLGtDQUFrQyxDQUFDO2dCQUM3QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEdBQWMsRUFBRSxPQUFXO29CQUN2RCxJQUFJLEdBQUcsRUFBRTt3QkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ2Y7eUJBQU07d0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVB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