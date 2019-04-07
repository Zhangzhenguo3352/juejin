/**
 * 此文件用来读取远程接口的数据
 */
// request 使用 回调的方式实现的
// request-promise 是使用 then 的方式实现
const request = require('request-promise')
// cheerio 专为服务器而设计，灵活和精简的jquery 实现
const cheerio = require('cheerio');
exports.tags = async function(url){
    let options = {
        url,
        transform(body){
            // cheerio.load()  将获取的节点，转换成 jquery 对象
            return cheerio.load(body)
        }
    }
    return request(options).then($ => {
        
        let infos = $('.item .tag .info-box');
        
        let tags = [];
        infos.each((index, info ) => {
            let tagInfo = $(info);
            let href = tagInfo.children().first().attr('href');
            let image = tagInfo.find('div.thumb').first().data('src');
            let title = tagInfo.find('div.title').first().text();
            let subscribe = tagInfo.find('div.subscribe').first().text();
            let article = tagInfo.find('div.article').first().text();
            tags.push({
                href: `https://juejin.im${href}`,
                image,
                title,
                subscribe: parseInt(subscribe), // 关注
                article: parseInt(article), // 文章
            })
        })
        return tags;
    });
}

// 掘金 所有 的功能模块
// let tagUrl = 'https://juejin.im/subscribe/all';
// exports.tags(tagUrl).then(tags => {
//     console.log('tags', tags)
// }) 



exports.articleList = async function(url) {
    let options = {
        url,
        // transform(){},
        transform: (body) => {
            return cheerio.load(body);
        }
    }
    return request(options).then(async $ => {
        let articleTitles = $('.info-box .title-row .title');
        let articles = [];
        // 在forEach里， each里不能使用 async    await
        for(let i = 0; i < articleTitles.length; i++) {
            let article = $(articleTitles[i]);
            let href = article.attr('href');
            let title = article.text();
            //  '/post/5ca2e1935188254416288eb2'.slice(6) =》 5ca2e1935188254416288eb2
            let id = href.slice(6);

            href = `https://juejin.im${href}`;
            // 这个地方调用 详情页的页面数据
            let { content, tags } = await exports.articleDetail(href);
            articles.push({
                href,
                title,
                id,
                content, // 详情页的 文章内容
                tags, // 关注的标签 名字
            })
        }
        return articles;
    })
}
// // 掘金 某一个 模块的 列表 (文章列表)
// let articleUrl = 'https://juejin.im/tag/%E5%89%8D%E7%AB%AF';
// exports.articleList(articleUrl).then(articles => {
//     console.log(articles)
// })





exports.articleDetail = async function(url) {
    let options = {
        url,
        transform(body){
            return cheerio.load(body);
        }
    }
    return request(options).then( $ => {
        let content = $('.article-content').first().html();
        let tagTitles = $('.tag-list .item .tag-title');
        let tags = [];
        tagTitles.each((index, title) => {
            tags.push($(title).text())
        })
        return {
            content,
            tags
        };
    })
}
// // 掘金 详情页 (详情页数据)
// let articleDetailUrl = 'https://juejin.im/post/5ca2e1935188254416288eb2';
// exports.articleDetail(articleDetailUrl).then(article => {
//     console.log(article)
// })