"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("bluebird");
// 支持注解
require("reflect-metadata");
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
function preload() {
    // 使用bluebird输出完整的promise调用链
    global.Promise = bluebird_1.Promise;
    // 开启长堆栈
    bluebird_1.Promise.config({
        // Enable warnings
        warnings: true,
        // Enable long stack traces
        longStackTraces: true,
        // Enable cancellation
        cancellation: true,
        // Enable monitoring
        monitoring: true
    });
    // 自动解析ts的sourcemap
    require('source-map-support').install({
        handleUncaughtExceptions: false
    });
    // 捕获普通异常
    process.on('uncaughtException', function (err) {
        console.error('Caught exception: ' + err.stack);
    });
    // 捕获async异常
    process.on('unhandledRejection', (reason, p) => {
        console.error('Caught Unhandled Rejection at:' + p + 'reason:' + reason.stack);
    });
}
exports.preload = preload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3ByZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBaUM7QUFDakMsT0FBTztBQUNQLDRCQUEwQjtBQUUxQjs7OztHQUlHO0FBQ0g7SUFDSSw0QkFBNEI7SUFDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBTyxDQUFDO0lBQ3pCLFFBQVE7SUFDUixrQkFBTyxDQUFDLE1BQU0sQ0FBQztRQUNYLGtCQUFrQjtRQUNsQixRQUFRLEVBQUUsSUFBSTtRQUNkLDJCQUEyQjtRQUMzQixlQUFlLEVBQUUsSUFBSTtRQUNyQixzQkFBc0I7UUFDdEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsb0JBQW9CO1FBQ3BCLFVBQVUsRUFBRSxJQUFJO0tBQ25CLENBQUMsQ0FBQztJQUVILG1CQUFtQjtJQUNuQixPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDbEMsd0JBQXdCLEVBQUUsS0FBSztLQUNsQyxDQUFDLENBQUM7SUFFSCxTQUFTO0lBQ1QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLEdBQUc7UUFDekMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZO0lBQ1osT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMzQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25GLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQTdCRCwwQkE2QkMifQ==