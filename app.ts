import { pinus } from 'pinus';
import { preload } from './preload';
import mysqlHelper from './app/dao/mysqlHelper'

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload();

/**
 * Init app for client.
 */
var app = pinus.createApp();
app.set('name', 'niuniuDemo0');

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pinus.connectors.hybridconnector,
      heartbeat : 3,
      useDict : true,
      useProtobuf : true
    });
});

app.configure("production|development", "gate", function () {
  app.set("connectorConfig", {
    connector: pinus.connectors.hybridconnector,
    useProtobuf: true
  });
});

app.loadConfig("mysql", app.getBase() + "/config/mysql.json");
app.configure("production|development", function () {
  let sqlHelper = new mysqlHelper(app);
  app.set("sqlHelper", sqlHelper);
})

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});