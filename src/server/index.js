const CACHE_MAX_AGE = 604800;

const express = require('express');
var request = require('request');
const os = require('os');
var router = express.Router();
var mcache = require('memory-cache');
const app = express();

var parser = new require('xml2js').Parser({
    "explicitArray": false
});
var cache = (duration) => {
    return (req, res, next) => {
      let key = '__express__' + req.originalUrl || req.url
      let cachedBody = mcache.get(key)
      if (cachedBody) {
        res.send(cachedBody)
        return
      } else {
        res.sendResponse = res.send
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body)
        }
        next()
      }
    }
}

app.use(express.static('dist'));
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "false");
    res.header("Access-Control-Max-Age", "60");
    res.header("Cache-Control", "max-age=" + CACHE_MAX_AGE +", public")
    next();
});
function convert_result(result){
    var out = {
        "status": "ok",
        "feed": {
            "url": result.rss.channel['atom:link'].$.href  || '',
            "title": result.rss.channel.title || '',
            "link": result.rss.channel.link  || '',
            "author": result.rss.channel.author || '',
            "description": result.rss.channel.description || '',
            "image":  result.rss.channel.image || '',
        },
        "items": []
    };
    result.rss.channel.item.forEach(function(i){
        i.content = i["content:encoded"];
        delete i["content:encoded"];
        i.author = i["dc:creator"];
        delete i["dc:creator"];
        i.categories = i.category;
        delete i.category
        i.guid = i.guid._;
        i.thumbnail = '';
        i.enclosure = [];
        out.items.push(i);
    });
    return out;
};
router.get('/api', cache(60), function(req, res) {
    if (req.query.feed == undefined)
        return res.json({error:"You must specify a feed parameter"});

    request(req.query.feed, function (error, response, body){
        if (!error && response.statusCode == 200) {
            body = body.replace("html_content");
            parser.parseString(body, function (err, result) {
                if (err != undefined)
                    return res.json(err);
                if (!req.query.raw == "1")
                    result = convert_result(result);
                return res.json(result);
        });
    }
    else
        return res.json({error:"unable to reach url"})
    });
});
router.get('/xml', cache(60), function(req, res) {
    if (req.query.feed == undefined)
    return res.json({error:"You must specify a feed parameter"});

    request(req.query.feed, function (error, response, body){
        if (!error && response.statusCode == 200) {
            body = body.replace("html_content");
            parser.parseString(body, function (err, result) {
                if (err != undefined)
                    return res.json(err);
                if (!req.query.raw == "1")
                    result = result;
                return res.json(result);
        });
}
else
    return res.json({error:"unable to reach url"})
});
})

app.use('/', router);
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
app.listen(8080, () => console.log('Listening on port 8080!'));
