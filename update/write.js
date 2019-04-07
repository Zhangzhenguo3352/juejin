// 此方法用于把 标签数组 保存到mysql数据库中

const { query } = require('../db');
exports.tags = async function(tags) {
    for(tag of tags) {
        let oldTags = await query(`select * from tags where name = ?`, [tag.title])
        //console.log(oldTags)
        let {title, image, subscribe, article, href} = tag;
        // 查询有这个数据，并且这个数的长度 大于 0 
        if(Array.isArray(oldTags) && oldTags.length > 0) {
            // 有数据这里做更新 
            await query(`update tags set image=?,subscribe=?,article=?,href=? where id=?`, 
            [ image, subscribe, article, href, oldTags[0].id])
        } else {
            
            // 没有这个数据， 就插入
            await query(`insert into tags(name, image, subscribe, article, href) values (?,?,?,?,?)`, 
            [title, image, subscribe, article, href])
        }
    }
}

// 文章列接口
exports.articles = async function(articles) {
    // 循环插入 列表数据
    for( le of articles) {
        let oldArticles = await query(`select * from articles where id = ?`, [le.id])
        
        console.log('oldArticles', oldArticles)
        const {id, title, content, href} = le;
        if(oldArticles.length > 0) {
            // 有值就更新
            await query(`update articles set title=?,content=?,href=? where id=?`, 
            [title, content, href, id])
        } else {
            // 列表里没有数据，就插入
            await query(`insert into articles(id, title, content, href) values(?,?,?,?)`, 
            [id, title, content, href]);
        }
        // 处理关联 表，先删除这一条要关联的表
        await query(`delete from article_tag where article_id=?`, [le.id]);
        //查询 tags 表中 name 是其中任意一个的数据，打印出 id
        // article.tags  =》  ['title1', 'title2']
        // 想要得到  'title1', 'title2'
        let tagWhere = "'"+ le.tags.join("','") +"'"
        let tagIds = await query(`select id from tags where name in(${tagWhere})`);
        //console.log(tagIds) // [ { id: 1 }, { id: 2 } ]
        for(tagId of tagIds) {
            await query(`insert into article_tag(article_id, tag_id) values (?,?)`, [le.id, tagId.id])
        }
    
    }
}

// exports.tags([ 
//     { 
//         href: 'https://juejin.im/tag/%E5%89%8D%E7%AB%AF',
//         image:'https://lc-gold-cdn.xitu.io/bac28828a49181c34110.png?imageView2/2/w/200/h/64/q/85/interlace/1',
//         title: '前端',
//         subscribe: 336845,
//         article: '31257 文章' 
//     },
//     { 
//         href: 'https://juejin.im/tag/%E5%90%8E%E7%AB%AF',
//         image:'https://lc-gold-cdn.xitu.io/d83da9d012ddb7ae85f4.png?imageView2/2/w/200/h/64/q/85/interlace/1',
//         title: '后端',
//         subscribe: 265651,
//         article: '19164 文章' 
//     }
//  ])

// exports.articles([
//     {
//         id: 1, title: 'title1', content: 'image1', href: '1',
//         tags: [ 'title2'] // 这两个文章都关联着两个标签
//     },
//     {
//         id: 2, title: 'title3', content: 'image3', href: '3',
//         tags: ['title1'] // 这两个文章都关联着两个标签
//     }
// ])