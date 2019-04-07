// 链接数据库 文件
const mysql = require('mysql');
const Promise = require('bluebird')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'juejin'
})
connection.connect();
module.exports = {
    // 变成了 promise 对象， bind  将 this 指向这个对象
    query: Promise.promisify(connection.query).bind(connection)
}