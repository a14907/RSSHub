const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.sehuatang.net/';

const forumIdMaps = {
    mrhj: '106',
    gcyc: '2',
    yzwmyc: '36',
    yzymyc: '37',
    gqzwzm: '103',
    sjxz: '107',
    yzmzym: '104',
    vr: '102',
    omwm: '38',
    dmyc: '39',
    ai: '113',
    ydsc: '111',
    hrxazp: '125',
    hrjpq: '50',
    yzxa: '48',
    omxa: '49',
    ktdm: '117',
};

module.exports = async (ctx) => {
    const subformName = ctx.params.subforumid || 'gqzwzm';
    const subformId = subformName in forumIdMaps ? forumIdMaps[subformName] : subformName;
    const typefilter = ctx.params.type ? `&filter=typeid&typeid=${ctx.params.type}` : '';
    const link = `${host}forum.php?mod=forumdisplay&fid=${subformId}${typefilter}`;
    const headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };
    let c;
    const response = await got({
        method: 'get',
        url: link,
        headers: headers,
        hooks: {
            beforeRedirect: [
                (options, response) => {
                    const cookie = response.headers['set-cookie'];
                    if (cookie) {
                        const cook = cookie.map((c) => c.split(';')[0]).join('; ');
                        options.headers.Cookie = cook;
                        c = cook;
                        options.headers.Referer = response.url;
                    }
                },
            ],
        },
    });
    headers.Cookie = c;
    const $ = cheerio.load(response.data);
    
    const list = null;
    try{
        console.log("1");
        const list1 = $('div.savephotop img');
        console.log("2");
        const list2 = list1.map(function () {
            console.log(this);
            const info = {
                title: $(this).attr('title'),
                link: $(this).attr('file'),
            };
            console.log(info);
            return info;
        });
        console.log("3");
        const list = list2.get();
        console.log("4");
    }catch(err){
        console.log("5");
        console.log(err);
    }

    console.log("6");
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = host + info.link; 

            const single = {
                title: title,
                link: itemUrl, 
                pubDate: new Date().toUTCString(), 
                enclosure_type: 'application/x-bittorrent',
            }; 
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `色花堂 - ${$('#pt > div:nth-child(1) > a:last-child').text()}`,
        link: link,
        item: out,
    };
};
