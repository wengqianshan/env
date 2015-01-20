var os = require('os');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config');
var api = require('../api/index');
//console.log(api);
var httpd = new api.httpd();
httpd.init();

var host = new api.host();
host.init(function(write) {
    setTimeout(function() {
        write(123456);
        console.log('可正常使用功能了')
    }, 4000);
});

var apache = new api.apache();

var dns = new api.dns();
dns.init();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '本地环境工具' });
});

//combo
router.get('/combo', function(req, res) {
    //console.log('++++++++++++++++++++')
    var search = req._parsedUrl.search;
    if(!search || search.indexOf('??') < 0) {
        return res.send('缺少参数');
    }
    var str = search.substr(2).replace(/ilw/g, config.combo.dir).replace(/(\d+\.){2}\d+/g, config.combo.dist).replace(/(\?|#).*$/g, '');
    if(!str) {
        return res.send('没有文件');
    }
    var files = str.split(',');
    //console.log(files)
    var content = '';
    var errors = [];
    files.forEach(function(file){
        var exist = fs.existsSync(file);
        if(!exist) {
            errors.push('文件不存在: ' + file);
            return;
        }
        var c = fs.readFileSync(file, 'utf8');
        content += c;
    });
    if(errors.length > 0) {
        return res.send(errors.join('<br/>'));
    }
    res.type('application/x-javascript');
    res.send(content);
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
/*router.post('/api/apache/check', function(req, res) {
    apache.check(function(err, stdout, stderr) {
        //console.log(err, stdout, stderr);
        var jsonp = {
            success: !err,
            data: stdout
        };
        res.jsonp(jsonp);
    });
});*/

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
    var jsonp = {
        success: true,
        data: httpd.getObj(result)
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
        var jsonp = {
            success: !err,
            data: httpd.getObj(data)
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


//dns
router.get('/api/dns', function(req, res) {
    var result = dns.readConfigSync();
    var jsonp = {
        success: true,
        data: result
    };
    res.jsonp(jsonp);
});
router.post('/api/dns', function(req, res) {
    var content = req.body.content;
    var result = dns.writeConfigSync(content);
    dns.init();
    var jsonp = {
        success: true,
        data: result
    };
    res.jsonp(jsonp);
});

module.exports = router;
