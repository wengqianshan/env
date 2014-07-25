var fs = require('fs');
var os = require('os');
var exec = require('child_process').exec;
var platform = os.platform();

var Platform = {
    interfaces: os.networkInterfaces(),
    isMac: platform === 'darwin',
    isWin: platform === 'win32',
    checkPermission: function(path, mask, callback) {
        /*canExecute():
        checkPermission (<path>, 1, cb);

        canRead():
        checkPermission (<path>, 4, cb);

        canWrite():
        checkPermission (<path>, 2, cb);*/
        fs.stat(path, function(err, stats) {
            if(err) {
                callback && callback.call(null, err, false);
            }else {
                callback && callback.call(null, null, !!(mask & parseInt ((stats.mode & parseInt ("777", 8)).toString (8)[0])));
            }
        })
    }
};
//console.log(Platform)

for (var i in Platform.interfaces) {
    //console.log(Platform.interfaces[i])
}

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
    restart: function(callback) {
        var _this = this;
        if (Platform.isMac) {
            exec(this.cmd.restart, function(err, stdout, stderr) {
                callback && callback.call(_this, err, stdout, stderr);
                if (err) {
                    console.log('重启失败:mac');
                    return;
                }
                console.log('重启成功:mac')
            });
        } else {
            //windows
            exec(this.cmd.stop, function(err, stdout, stderr) {
                if (err) {
                    callback && callback.call(_this, err, stdout, stderr);
                    console.log('停止失败');
                    return;
                }
                exec(_this.cmd.start, function(err, stdout, stderr) {
                    callback && callback.call(_this, err, stdout, stderr);
                    if (err) {
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
    //检查权限
    checkPermission: function(mask, callback) {
        Platform.checkPermission(this.path, mask, callback);
    },
    read: function(callback) {
        var _this = this;
        fs.readFile(this.path, 'utf8', function(err, data) {
            callback && callback.call(_this, err, data);
        });
    },
    write: function(content, callback) {
        var _this = this;
        fs.writeFile(this.path, content, function(err, data) {
            callback && callback.call(_this, err);
        });
    }
};

//虚拟主机
var Httpd = function() {
    this.cache = {
        data: null,
        items: []
    };
    this.path = Platform.isWin ? 'D:/AppServ/Apache2.2/conf/extra/httpd-vhosts.conf' : '/etc/apache2/extra/httpd-vhosts.conf';
    //this.path = 'httpd-vhosts.conf';
    //正则
    this.pattern = {
        vhost: /<VirtualHost\s+[^>]*?>[\s\S]*?<\/VirtualHost>/ig,
        serverName: /ServerName +("?)(.+)(\1)(?:\r?\n)/,
        documentRoot: /DocumentRoot +("?)(.+)(\1)(?:\r?\n)/,
        proxy: {
            pass: /[^\n]*ProxyPass +.* +.*(?:\r?\n)/ig,
            request: /[^\n]*ProxyRequests\s+Off(?:\r?\n)/ig,
            proxy: /[^\n]*<Proxy\s+[^>]*?>[\s\S]*?<\/Proxy>(?:\r?\n)/ig,
            reverse: /[^\n]*ProxyPassReverse +.* +.*(?:\r?\n)/ig
            //扩展ProxyPassMatch
        }
    };
};
Httpd.prototype = {
    init: function() {
        var _this = this;
        this.readFileSync();
        /*var conf = _this.updateItem('webapp.dev', {
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
        console.log(conf);*/
        //fs.writeFile('c.txt', conf);
    },
    //检查权限
    checkPermission: function(mask, callback) {
        Platform.checkPermission(this.path, mask, callback);
    },
    //获取配置文件
    getData: function() {
        //return this.cache.data || this.readFileSync();
        return this.readFileSync();
    },
    //读取vhost文件
    readFileSync: function() {
        console.log('读取vhost文件...');
        var _this = this;
        var data = fs.readFileSync(this.path, 'utf8');
        if (!data) {
            console.log('读取vhost文件失败');
            return data;
        }
        this.cache.data = data;
        _this.cache.items = [];
        var list = this.getList(data);
        if (!list) {
            console.log('没有匹配到内容, 可能是文件不对');
            return data;
        }
        list.forEach(function(item) {
            var obj = _this.getObj(item);
            _this.cache.items.push(obj);
        });
        return data;
    },
    //读取
    readFile: function(callback) {
        var _this = this;
        fs.readFile(this.path, 'utf8', function(err, data) {
            callback && callback.call(_this, err, data);
        });
    },
    //写入
    writeFile: function(data, callback) {
        var _this = this;
        fs.writeFile(this.path, data, function(err, data) {
            callback && callback.call(_this, err, data);
        });
    },
    //获取列表
    getList: function(data) {
        return data.match(this.pattern.vhost);
    },
    //获取对象
    getObj: function(data) {
        var _this = this;
        var name = data.match(this.pattern.serverName) || [];
        var root = data.match(this.pattern.documentRoot) || [];
        //var proxy = data.match(this.pattern.proxy.reverse);
        //console.log(data, data.match(this.pattern.proxy.pass));
        var proxy = {
            pass: data.match(this.pattern.proxy.pass),
            request: data.match(this.pattern.proxy.request),
            proxy: data.match(this.pattern.proxy.proxy),
            reverse: data.match(this.pattern.proxy.reverse)
        };
        if(proxy.pass) {
            proxy.list = [];
            proxy.pass.forEach(function(item) {
                var list = item.trim().split(/\s+/);
                proxy.list.push({
                    dir: list[1],
                    path: list[2]
                });
                
            });
        }
        return {
            name: name[2],
            root: root[2],
            proxy: proxy,
            input: data
        };
    },
    //获取一条数据
    getItem: function(name) {
        this.getData();
        if (this.cache.items.length <= 0) {
            console.log('尚未读取到vhost文件');
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
    //删除一条数据
    removeItem: function(name) {
        var data = this.getItem(name);
        if(!data) {
            console.log('没有' + name + '这个主机');
            return;            
        }
        var conf = this.readFileSync().replace(data.input, '');
        var result = fs.writeFileSync(this.path, conf);
        conf = this.readFileSync();
        console.log('删除主机：', result);
        return conf;
    },
    //更新一个虚拟主机
    updateItem: function(name, options, callback) {
        var obj = this.getItem(name);
        if (!obj) {
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
        this.writeFile(conf, function(error) {
            callback && callback.call(null, error, data);
        });
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
            '    Order deny,allow\n',
            '    Allow from all\n',
            '</Proxy>\n'
        ];
        proxy.forEach(function(item) {
            strs.push('ProxyPass ' + item.dir + ' ' + item.path + '\n');
            strs.push('ProxyPassReverse ' + item.dir + ' ' + item.path + '\n');
        });
        return strs.join('');
    },
    //创建虚拟主机
    createVhost: function(option) {
        var template = [
            '\n##############################\n#' + (option.comment || option.name) + '\n##############################\n',
            '<VirtualHost *:80>\n',
            '    ServerAdmin ' + (option.admin || 'admin@admin.com') + '\n',
            '    DocumentRoot "' + option.root + '"\n',
            '    ServerName ' + option.name + '\n',
            '    <Directory "' + option.root + '">\n',
            '        Options Indexes FollowSymLinks\n',
            '        AllowOverride All\n',
            '        Order allow,deny\n',
            '        Allow from all\n',
            '    </Directory>\n'
        ];
        if(option.proxy) {
            template.push(this.createProxy(option.proxy));
        }
        template.push('</VirtualHost>');
        var data = template.join('');
        fs.writeFileSync(this.path, data, {
            flag: 'a'
        });
        this.readFileSync();
        return data;
    }
};

module.exports = {
    platform: Platform,
    apache: Apache,
    httpd: Httpd,
    host: Host
};