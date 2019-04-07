let read = require('./read');
let write = require('./write');
(async function(){
    let tagUrl = 'https://juejin.im/subscribe/all';
    // 读取掘金的标签列表
    let tags = await read.tags(tagUrl);
    //console.log('tags',tags)
    // 把标签写到数据库中
    await write.tags(tags);

    let allArticles =   {};
    // 在首页标签列表中拿到 每一个  标签列表数据 （这里我们 只插入  第一个数据）
    for(let i = 0; i < 6; i++) {
    // for(tag of tags){
        //tag.href 拿到去每一个去列表的链接，得到数据
        // 要考虑到去除 重复数据，保证重复的数据 只保留一个
        let articles = await read.articleList(tags[i].href);

        // 标签有很多，不同的标签下面的文章可能会重复，这里起到了，去重的目的
        articles.forEach(article => allArticles[ article.id ] = article);
        console.log(articles)
    }
    
    // Object.values()  拿到每一个 值， 插入数据库
    await write.articles(Object.values(allArticles));
    process.exit();
})()