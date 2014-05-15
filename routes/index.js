var express = require('express');
var router = express.Router();
var api = require('../api/index');
//console.log(api);
var httpd = new api.httpd();
httpd.init();

var host = new api.host();

var apache = new api.apache();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '本地环境工具' });
});

router.post('/', function(req, res) {
    console.log(req.body);
    res.jsonp(req.body);
})

router.post('/api/apache/restart', function(req, res) {
    apache.restart(function(err, stdout, stderr) {
        //console.log(err, stdout, stderr);
        var jsonp = {
            success: !err,
            data: stdout
        };
        res.jsonp(jsonp);
    });
});


//host
router.get('/api/host', function(req, res) {
    host.read(function(err, data) {
        var jsonp = {
            success: !err,
            err: err,
            data: data
        };
        res.jsonp(jsonp);
    })
});
router.post('/api/host', function(req, res) {
    var content = req.body.content;
    host.write(content, function(err) {
        var jsonp = {
            success: !err,
            data: content
        };
        res.jsonp(jsonp);
    })
})


//vhost

//列表
router.get('/api/vhost', function(req, res) {
    var conf = httpd.getData();
    var objs = [];
    var list = httpd.getList(conf);
    list.forEach(function(item) {
        var obj = httpd.getObj(item);
        objs.push(obj);
    });
    var jsonp = {
        success: true,
        data: objs
    };
    res.jsonp(jsonp);
});



//获取单个
router.get('/api/vhost/:name', function(req, res) {
    var name = req.params.name;
    var obj = httpd.getItem(name);
    var jsonp = {
        success: true,
        data: obj
    };
    res.jsonp(jsonp);
});

//新增
router.post('/api/vhost/', function(req, res) {
    var name = req.body.name;
    var root = req.body.root;
    var proxyDir = req.body.proxyDir;
    var proxyPath = req.body.proxyPath;
    if(!name) {
        console.log('name不能为空');
        return;
    }
    var item = httpd.getItem(name);
    //console.log(item);
    if(item) {
        return res.jsonp({
            success: false,
            data: item,
            message: '该配置已存在'
        });
    }
    if(!root) {
        console.log('root不能为空');
        return;
    }
    var obj = {
        name: name,
        root: root
    };
    //如果有配置代理
    if(proxyDir && proxyPath) {
        var proxyArr = [];
        if(typeof proxyDir === 'string') {
            proxyArr.push({
                dir: proxyDir,
                path: proxyPath
            });
        }else if(typeof proxyDir === 'object') {
            proxyDir.forEach(function(item, i) {
                proxyArr.push({
                    dir: item,
                    path: proxyPath[i]
                });
            })
        }
        obj.proxy = proxyArr;
    }
    var result = httpd.createVhost(obj);
    var jsonp = {
        success: !result,
        data: result
    };
    res.jsonp(jsonp);
});

//更新
router.put('/api/vhost/:name', function(req, res) {
    var name = req.params.name;
    var conf = httpd.updateItem(name, {
        name: 'laiwang.com',
        root: '/etc/host/',
        proxy: [{
            path: '/',
            proxy: 'http://127.0.0.1:3000/'
        }, {
            path: '/js',
            proxy: 'http://127.0.0.1:3000/js'
        }]
    });
    //TODO:写入文件
    var jsonp = {
        success: true,
        data: conf
    };
    res.jsonp(jsonp);
});

//删除
router.delete('/api/vhost/:name', function(req, res) {
    var name = req.params.name;
    var result = httpd.removeItem(name);
    var jsonp = {
        success: true,
        data: result
    };
    res.jsonp(jsonp);
});

module.exports = router;
