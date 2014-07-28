var httpd = new Httpd();
httpd.init();
var host = new Host();
var apache = new Apache();
var dns = new DNS();
dns.init();
var qs = require('qs');

var Dialog = (function() {
    var template = $('#J_tmpl_modal_dialog').html();
    return {
        alert: function(msg) {
            var html = Mustache.render(template, {
                title: '提示 ',
                body: msg,
                ok: '确定'
            });
            var $html = $(html);
            $html.modal();
            $html.find('.btn-primary').on('click', function() {
                $html.modal('hide');
            })
        },
        confirm: function() {

        },

    }
}());

//获取IP
var network = os.networkInterfaces();
var en0 = network.en0;
if(!en0) {
    var arr = [];
    for(var i in network) {
        arr.push(network[i]);
    }
    en0 = arr[0];
}
en0.forEach(function(item, i) {
    if(item.family === 'IPv4') {
        $('#J_ip').val(item.address);
    }
})


$('#J_ip').on('mouseenter', function() {
    $(this).select();
});

//获取vhost列表
function loadHttpd() {
    var conf = httpd.getData();
    var objs = [];
    var list = httpd.getList(conf);
    if(list && list.length > 0) {
        list.forEach(function(item) {
            var obj = httpd.getObj(item);
            objs.push(obj);
        });
        var json = {
            success: true,
            data: objs
        };
        json._proxy = function() {
            return JSON.stringify(this.proxy);
        };
        var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
        $('#J_vhost_list').html(html);    
    }
}
loadHttpd();

if(localStorage.getItem('env-vhost')) {
    $('#J_vhost').val(localStorage.getItem('env-vhost'));
}
//读取vhost文本
$('#J_btn_read_vhost').on('click', function() {
    httpd.readFile(function(err, data) {
        if(err) {
            
        }
        $('#J_vhost').val(data).css('color', '#080');;
        localStorage.setItem('env-vhost', data);
    });
});
//写入vhost文本
$('#J_btn_write_vhost').on('click', function() {
    var data = $('#J_vhost').val()
    httpd.writeFile(data, function(err) {
        if(err) {
            
        }
        Dialog.alert('写入成功');
        localStorage.setItem('env-vhost', data);
    });
});

//添加
$('#J_vhost_add').on('click', function() {
    var dialogTmpl = $('#J_tmpl_modal_dialog').html();
    var dialog = Mustache.render(dialogTmpl, {
        title: '添加vhost',
        body: Mustache.render($('#J_tmpl_vhost_form').html()),
        close: '关闭',
        ok: '提交'
    }/*, {
        body: Mustache.render($('#J_tmpl_vhost_form').html())
    }*/);
    var $dialog = $(dialog);
    $dialog.modal();
    setTimeout(function() {
        $dialog.find('.form-control').eq(0).focus();
    }, 500);
    
    $dialog.on('click', '.J_delete', function(e) {
        e.preventDefault();
        var $li = $(this).closest('li');
        $li.remove();
    });
    $dialog.on('click', '.J_add', function(e) {
        var $html = $(Mustache.render($('#J_tmpl_proxy_item').html()));
        $dialog.find('.J_proxy_list').append($html);
        $html.find('.form-control').eq(0).focus();
    });
    $dialog.on('click', '.J_submit', function() {
        var $form = $dialog.find('form');
        var param = $form.serialize();
        var body = qs.parse(param);
        var name = body.name;
        var root = body.root;
        var proxyDir = body.proxyDir;
        var proxyPath = body.proxyPath;
        if(!name) {
            alert('name不能为空');
        }
        var item = httpd.getItem(name);
        //console.log(item);
        if(item) {
            alert('该配置已存在');
        }
        if(!root) {
            alert('root不能为空');
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
        var json = {
            success: true,
            data: httpd.getObj(result)
        };
        $dialog.modal('hide');
        Dialog.alert('添加成功');
        json._proxy = function() {
            return JSON.stringify(this.proxy);
        };
        var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
        $('#J_vhost_list').append(html);
    });
});

//编辑
$('#J_vhost_list').on('click', '.J_edit', function(e) {
    e.preventDefault();
    var $tr = $(this).closest('tr');
    var name = $tr.attr('data-name');
    var root = $tr.attr('data-root');
    var proxy = JSON.parse($tr.attr('data-proxy'));
    var dialogTmpl = $('#J_tmpl_modal_dialog').html();
    var dialog = Mustache.render(dialogTmpl, {
        title: '更新',
        body: Mustache.render($('#J_tmpl_vhost_form').html(), {
            name: name,
            root: root,
            proxys: proxy.list
        }, {
            body: $('#J_tmpl_proxy_item').html()
        }),
        close: '关闭',
        ok: '提交'
    }/*, {
        body: Mustache.render($('#J_tmpl_vhost_form').html(), {
            name: name,
            root: root,
            proxys: proxy.list
        }, {
            body: $('#J_tmpl_proxy_item').html()
        })
    }*/);
    var $dialog = $(dialog);
    $dialog.modal();
    $dialog.on('click', '.J_delete', function(e) {
        e.preventDefault();
        var $li = $(this).closest('li');
        $li.remove();
    });
    $dialog.on('click', '.J_add', function(e) {
        var html = Mustache.render($('#J_tmpl_proxy_item').html());
        $dialog.find('.J_proxy_list').append(html);
    });
    $dialog.on('click', '.J_submit', function() {
        var $form = $dialog.find('form');
        var param = $form.serialize();
        var body = qs.parse(param);
        var newName = body.name;
        var root = body.root;
        var proxyDir = body.proxyDir;
        var proxyPath = body.proxyPath;
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
            name: newName,
            root: root,
            proxy: proxy || ''
        };
        httpd.updateItem(name, obj, function(err, data) {
            var json = {
                success: !err,
                data: httpd.getObj(data)
            };
            if(err) {
                return Dialog.alert('更新失败');
            } else {
                $dialog.modal('hide');
                Dialog.alert('更新成功');
                json._proxy = function() {
                    return JSON.stringify(this.proxy);
                };
                var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
                $tr.replaceWith(html);
            }
        });
    });
});
//删除
$('#J_vhost_list').on('click', '.J_delete', function(e) {
    e.preventDefault();
    var $tr = $(this).closest('tr');
    var name = $tr.attr('data-name');
    var result = httpd.removeItem(name);
    Dialog.alert('删除成功');
    $tr.remove();
});
//重启apache
$('#J_restart').on('click', function() {
    console.log('重启');
    var $btn = $(this);
    $btn.button('loading');
    apache.restart(function(err, stdout, stderr) {
        //console.log(err, stdout, stderr);
        if(err) {
            return console.log('err');
        }
        $btn.button('reset');
        Dialog.alert('重启成功');
    });
});


//host
if(localStorage.getItem('env-host')) {
    $('#J_host').val(localStorage.getItem('env-host'));
}
$('#J_read').on('click', function() {
    var $btn = $(this);
    $btn.button('loading');
    
    host.read(function(err, data) {
        $btn.button('reset');
        $('#J_host').val(data).css('color', '#080');
        localStorage.setItem('env-host', data);
    })
});
$('#J_write').on('click', function() {
    var content = $('#J_host').val();
    host.write(content, function(err) {
        if(err) {
            return Dialog.alert('写入失败');
        } else {
            localStorage.setItem('env-host', content);
            Dialog.alert('写入成功');
        }
    })
});

//dns
if(localStorage.getItem('env-dns')) {
    $('#J_textarea_dns').val(localStorage.getItem('env-dns'));
}
$('#J_dns_read').on('click', function() {
    var result = dns.readConfigSync();
    if(!result) {
        console.log('读取dns配置异常');
        return;
    }
    $('#J_textarea_dns').val(result).css('color', '#080');
    localStorage.setItem('env-dns', result);
});

$('#J_dns_write').on('click', function() {
    var content = $('#J_textarea_dns').val()
    var result = dns.writeConfigSync(content);
    console.log(result);
    dns.init();
    localStorage.setItem('env-dns', content);
    Dialog.alert('写入成功');
});