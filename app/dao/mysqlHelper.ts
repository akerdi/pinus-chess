import { Application } from 'pinus'
import { Pool, MysqlError, queryCallback, PoolConnection } from 'mysql'
export default class mysqlHelper {
    private pool:Pool;
    constructor (private app:Application) {
        let mysqlConfig = app.get("mysql");
        let mysql = require("mysql");
        let pool = mysql.createPool(mysqlConfig);
        this.pool = pool;
    }

    public query(sqlString:string, values:any, callback) {
        if (values) {
            this.pool.query(sqlString, values, callback);
        } else {
            this.pool.query(sqlString, callback);
        }
    }

    public async guestLogin() {
        return new Promise((resolve, reject) => {
            let sql = "insert into t_user () values ();";
            let self = this;
            this.query(sql, null, function (err:MysqlError, results:any) {
                if (err) {
                    reject(err);
                } else {
                    console.log("11111:::", results);
                    let userid = results["insertId"];
                    self.queryUserInfo(userid, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    })
                }
            })
        })
    }

    public queryUserInfo(userid:string, callback:Function) {
        let sql = "select * from t_user where userid = '?'";
        this.query(sql, [userid], function (err:MysqlError, results:any) {
            if (results.length > 0) {
                callback(null, results[0]);
            } else {
                callback(err, "没有资料");
            }
        });
    }

    public async asyncQueryUserInfo(userid:string) {
        return new Promise((resolve, reject) => {
            let sql = "select * from t_user where userid = '?'";
            this.query(sql, [userid], function (err:MysqlError, results:any) {
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    reject(err);
                }
            });
        })
    }
    public beginTransaction(callback:(err:MysqlError, connection:PoolConnection)=>void) {
        this.pool.getConnection(callback);
    }
    public updateUserGold(ugoldResults, callback:Function) {
        this.beginTransaction(function (err:MysqlError, connection:PoolConnection) {
            if (err) {
                if (callback) {
                    callback(err);
                }
                return;
            }
            let userids = [];
            for (let index = 0; index < ugoldResults.length; index ++) {
                let element = ugoldResults[index];
                let userid = element.userid;
                userids.push(userid);
                let getGold = element.getGold;
                let sql = "update t_user set gold = IF(gold + '?' < 0, 0, gold + '?') where userid = ?; "
                connection.query(sql, [getGold, getGold, userid]);
            }

            let useridString = userids.join(",");
            let sql = "select userid, gold from t_user where userid in(" + useridString + ");"
            connection.query(sql, function (err:MysqlError, results:any) {
                if (!err) {
                    for (let index=0; index < ugoldResults.length; index++) {
                        let element = ugoldResults[index];
                        let dbElement = results[index];
                        element.totalGold = dbElement.gold;
                    }
                }
            });
            connection.commit(function (err:MysqlError) {
                if (err) {
                    connection.rollback();
                    callback(err, ugoldResults);
                } else {
                    if (callback) {
                        callback(null, ugoldResults);
                    }
                }
            })
        })
    }
}