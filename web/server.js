// 配置 服务
const express = require('express');
const path = require('path');
const app = express();
// 模板配置三部曲
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, 'views'));
app.engine('html', require('ejs').__express);
const {query} = require('../db');

app.use(express.static(path.resolve(__dirname, 'public')))
app.get('/', async function(req, res) {
    let tags = await query(`select * from tags`);
    
    
    // 根据条件查值 http://localhost:8080/?tagId=345678
    //  tagId  =》  345678
    let { tagId } = req.query;

    let id = tagId ? tagId : tags[0].id 
    // 关联 查询，先把 articles =所有数据查出来，根据条件关联查询 join 右边的表
    //(将articles 全部查询出来，与关联不 做比较，articles 的id 和 article_tag 的 article_id 相同的部分查询出来)
    let articles = await query(`select articles.* from articles right join article_tag on articles.id=article_tag.article_id where article_tag.tag_id=?`, [id]);
    res.render('index', { tags, articles });
})

// 详情页， 根据id 展示数据
app.get('/detail/:id', async function(req, res) {
    
    // req.params.id  拿到 id 的参数
    let id = req.params.id;
    let articles = await query(`select * from articles where id=?`, [id]);
    let article = articles[0];
    
    //`SELECT tags.* FROM article_tag INNER JOIN tags on article_tag.tag_id = tags.id WHERE article_tag.article_id='5b123ace6fb9a01e6f560a4b'`
    // 查询关联表 article_tab，将 article_tab.tag_id 和 标签表 tags.id 做比较， id 相同的 查询出来 ，条件 和 关联表 article_tag.article_id 相同的 查询出来
    let tags = await query(`SELECT tags.* FROM article_tag INNER JOIN tags on article_tag.tag_id = tags.id WHERE article_tag.article_id=?`, [id])
    console.log('tags', tags)
    res.render('detail', {article, tags})

})

app.listen(8080)

// 使用 cron 编写定时任务

// 6个占位符从左到右分别代表：秒、分、时、日、月、周几

// 每分钟的第30秒触发： '30 * * * * *'
// 每小时的1分30秒触发 ：'30 1 * * * *'
// 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
// 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
// 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
// 每周1的1点1分30秒触发 ：'30 1 1 * * 1' 

// 每隔30分钟0秒跑一次 ：'0 */30 * * * *'
//job  (工作)  
console.log(process.stdout)
const CronJob = require('cron').CronJob;
//使用 子进程模块
const {spawn} = require('child_process');
const job = new CronJob('0 */30 * * * *', function() {
    //debug('开始执行定时任务')

    // console.log( process.execPath) //   /usr/local/bin/node 
    // console.log(path.resolve(__dirname))  //  /Users/zhangzhenguo/Desktop/items/jia-go前端/test/09-day/juejin/web
    // path.resolve(__dirname, '../update/index.js')  // /Users/zhangzhenguo/Desktop/items/jia-go前端/test/09-day/juejin/update/index.js
    let url = path.resolve(__dirname, '../update/index.js')
    spawn(process.execPath, [url]); // 使用 node 模块 启动一个进程
    //stdout   (标准输出)
    // 把子进程的输出挂载到自己的 标准输出
    child.stdout.pipe(process.stdout); // 想在 字段中看到进程要做这样的操作
    // srderr  (标准错误)
    // 子进程有错误输出，在终端中输出
    child.stdout.pipe(process.stderr());
    // 监听错误
    child.on('error', function(){
        console.log('任务执行失败')
    })
    // 监听结束
    child.on('close', function(doc){
        console.log('任务执行结束', doc)
    })
    
});
job.start();  // 启动

process.on('uncaughtException', function(err){
    // stack   堆
    console.error('uncaughtException: %s', error.stack)
})
   
