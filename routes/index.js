var os = require('os');
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

router.get('/api/ip', function(req, res) {
    var network = os.networkInterfaces();
    var en0 = network.en0;
    if(!en0) {
        var arr = [];
        for(var i in network) {
            arr.push(network[i]);
        }
        en0 = arr[0];
    }
    var jsonp = {
        success: true,
        data: en0
    };
    res.jsonp(jsonp);
});
//host
router.get('/api/host/permiss', function(req, res) {
    host.checkPermission(2, function(error, status) {
        res.jsonp({
            success: status
        });
    });
});
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
});


//vhost
router.get('/api/vhost/text', function(req, res) {
    httpd.readFile(function(err, data) {
        if(err) {
            return res.jsonp({
                success: false,
                message: '读取失败'
            });
        }
        var jsonp = {
            success: true,
            data: data
        };
        res.jsonp(jsonp);
    });
});
router.post('/api/vhost/text', function(req, res) {
    var content = req.body.content;
    httpd.writeFile(content, function(err) {
        if(err) {
            return res.jsonp({
                success: false,
                message: '写入失败'
            });
        }
        var jsonp = {
            success: !err,
            data: content
        };
        res.jsonp(jsonp);
    });
});

router.get('/api/vhost/permiss', function(req, res) {
    httpd.checkPermission(2, function(error, status) {
        res.jsonp({
            success: status
        });
    });
})
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
        return res.jsonp({
            success: false,
            message: 'name不能为空'
        });
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
        return res.jsonp({
            success: false,
            message: 'root不能为空'
        });
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
    if(result) {
        obj.input = result;
    }
    var jsonp = {
        success: true,
        data: obj
    };
    res.jsonp(jsonp);
});

//更新
router.put('/api/vhost/:name', function(req, res) {
    var oldName = req.params.name;
    var name = req.body.name;
    var root = req.body.root;
    var proxyDir = req.body.proxyDir;
    var proxyPath = req.body.proxyPath;
    var proxy = null;
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
        proxy = proxyArr;
    }
    var obj = {
        name: name,
        root: root,
        proxy: proxy || ''
    };
    httpd.updateItem(oldName, obj, function(err, data) {
        obj.input = data;
        var jsonp = {
            success: !err,
            data: obj
        };
        res.jsonp(jsonp);
    });
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
