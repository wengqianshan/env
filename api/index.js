var fs = require('fs');
var os = require('os');
var exec = require('child_process').exec;
var platform = os.platform();

//console.log(os.getNetworkInterfaces())


var Platform = {
    ip: os.networkInterfaces()['en0'],
    isMac: platform === 'darwin',
    isWin: platform === 'win32'
};

console.log(Platform);

//Apache
var Apache = function() {
    this.cmd = {
        start: Platform.isWin ? 'net start apache2.2' : 'sudo apachectl start',
        stop: Platform.isWin ? 'net stop apache2.2' : 'sudo apachectl stop',
        restart: Platform.isWin ? 'net restart apache2.2' : 'sudo apachectl restart'
    };
};
Apache.prototype = {
    start: function() {
        exec(this.cmd.start, function(err, stdout, stderr) {

        });
    },
    stop: function() {
        exec(this.cmd.stop, function(err, stdout, stderr) {

        });  
    },
    restart: function() {
        var _this = this;
        if(Platform.isMac) {
            exec(this.cmd.restart, function(err, stdout, stderr){
                if(err) {
                    console.log('重启失败:mac');
                    return;
                }
                console.log('重启成功:mac')
            });
        }else{
            //windows
            exec(this.cmd.stop, function(err, stdout, stderr){
                if(err) {
                    console.log('停止失败');
                    return;
                }
                exec(_this.cmd.start, function(err, stdout, stderr){
                    if(err) {
                        console.log('重启失败');
                        return;
                    }
                    console.log('重启成功:windows');
                })
            })
        }
    }
};

//var apache = new Apache();
//apache.restart();

//HOST
var Host = function() {
    this.path = Platform.isWin ? 'C:/Windows/System32/drivers/etc/hosts' : '/etc/hosts';
};
Host.prototype = {
    read: function() {
        fs.readFile(this.path, 'utf8', function(err, data){
            
        });
    },
    write: function(content) {
        fs.writeFile(this.path, content, function(err){

        });
    }
}

//虚拟主机
var Httpd = function() {
    this.cache = {
        data: null,
        items: []
    };
    this.path = Platform.isWin ? 'D:/AppServ/Apache2.2/conf/extra/httpd-vhosts.conf' : '/etc/apache2/extra/httpd-vhosts.conf';
    //正则
    this.pattern = {
        vhost: /<VirtualHost\s+[^>]*?>[\s\S]*?<\/VirtualHost>/ig,
        serverName: /ServerName\s+"?(.+)"?/,
        documentRoot: /DocumentRoot\s+("?)(.+)(\1)/,
        proxy: {
            pass: /ProxyPass( +)+.*( +)+.*\n/ig,
            request: /ProxyRequests\s+Off\n/ig,
            proxy: /<Proxy\s+[^>]*?>[\s\S]*?<\/Proxy>\n/ig,
            reverse: /ProxyPassReverse( +)+.*( +).*\n/ig
        }
    };
};
Httpd.prototype = {
    init: function() {
        var _this = this;
        this.readFile(function(data) {
            _this.cache.data = data;
            var list = _this.getList(data);
            if(!list) {
                console.log('没有匹配到内容, 可能是文件不对');
                return;
            }
            list.forEach(function(item) {
                var obj = _this.getObj(item);
                _this.cache.items.push(obj);
            });
            
            var conf = _this.updateItem('webapp.dev', {
                name: 'laiwang.com',
                root: '/etc/host/',
                proxy: [
                    {
                        path: '/',
                        proxy: 'http://127.0.0.1:3000/'
                    },{
                        path: '/js',
                        proxy: 'http://127.0.0.1:3000/js'
                    }
                ]
            });
            //console.log(conf)
            //fs.writeFile('c.txt', conf);
        });
    },
    //读取vhost文件
    readFile: function(callback) {
        var _this = this;
        fs.readFile(this.path, 'utf8', function(error, data) {
            if(error) {
                return;
            }
            callback && callback.call(_this, data);
        });
    },
    //获取列表
    getList: function(data) {
        return data.match(this.pattern.vhost);
    },
    //获取对象
    getObj: function(data) {
        var name = data.match(this.pattern.serverName);
        var root = data.match(this.pattern.documentRoot);
        //var proxy = data.match(this.pattern.proxy.reverse);
        var proxy = {
            pass: data.match(this.pattern.proxy.pass),
            request: data.match(this.pattern.proxy.request),
            proxy: data.match(this.pattern.proxy.proxy),
            reverse: data.match(this.pattern.proxy.reverse)
        };
        return {
            name: name[1],
            root: root[2],
            proxy: proxy,
            input: data
        };
    },
    //获取一条数据
    getItem: function(name) {
        if (this.cache.items.length <= 0) {
            return;
        }
        var result = null;
        this.cache.items.forEach(function(item) {
            //console.log(item);
            if (item.name === name) {
                result = item;
            }
        });
        return result;
    },
    //更新一个虚拟主机
    updateItem: function(name, options) {
        var obj = this.getItem(name);
        if(!obj) {
            console.log('虚拟主机' + name + '不存在');
            return;
        }
        var data = obj.input;
        if (options && options.name) {
            data = data.replace(new RegExp(obj.name, 'g'), options.name);
        }
        if (options && options.root) {
            data = data.replace(new RegExp(obj.root, 'g'), options.root);
        }

        if (options && options.proxy) {
            data = this.updateProxy(data, options.proxy, obj);
        } else if (options && options.proxy === '') {
            //清空代理配置
            data = this.removeProxy(data);
        }
        //console.log(obj.input, data);
        var conf = this.cache.data.replace(obj.input, data);
        //console.log(conf);
        return conf;
        /*fs.writeFile('a.txt', conf, function(error, data) {
            console.log(error, data);
        });*/
    },
    //删除反向代理
    removeProxy: function(data) {
        var text = data.replace(this.pattern.proxy.pass, '')
            .replace(this.pattern.proxy.request, '')
            .replace(this.pattern.proxy.proxy, '')
            .replace(this.pattern.proxy.reverse, '');
        return text;
    },
    //更新反向代理
    updateProxy: function(data, proxy, obj) {
        if (!proxy || proxy.length < 1) {
            console.log('no proxy');
            return data;
        }
        //已有反向代理
        var _proxy = this.createProxy(proxy);
        if (obj.proxy.request) {
            //第一步清空反向代理配置
            var text = data.replace(this.pattern.proxy.request, '##Proxy##\n');
            text = this.removeProxy(text);
            text = text.replace('##Proxy##\n', _proxy);
            return text;
        } else {
            //console.log(data.match(/(\n).*(<\/VirtualHost>)/));
            data = data.replace(/(\n).*(<\/VirtualHost>)/, '$1' + _proxy + '$2');
            return data;
        }
    },
    //创建代理
    createProxy: function(proxy) {
        var strs = ['ProxyRequests Off\n',
            '<Proxy *>\n',
            'Order deny,allow\n',
            'Allow from all\n',
            '</Proxy>\n'
        ];
        proxy.forEach(function(item) {
            strs.push('ProxyPass ' + item.path + ' ' + item.proxy + '\n');
            strs.push('ProxyPassReverse ' + item.path + ' ' + item.proxy + '\n');
        });
        return strs.join('');
    }
};

new Httpd().init();


/*var httpd = new Httpd();
var getList = function() {
    httpd.readFile(function(data) {
        var list = this.getList(data);
        console.log(list);
    })
};
getList();*/