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
$.ajax({
    url: '/api/ip',
    type: 'get',
    dataType: 'jsonp',
    success: function(json) {
        var data = json.data;
        data.forEach(function(item, i) {
            if(item.family === 'IPv4') {
                $('#J_ip').val(item.address);
            }
        })
    }
});
$('#J_ip').on('mouseenter', function() {
    $(this).select();
});

//获取vhost列表
$.ajax({
    url: '/api/vhost',
    type: 'get',
    dataType: 'jsonp',
    success: function(json) {
        json._proxy = function() {
            return JSON.stringify(this.proxy);
        };
        var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
        $('#J_vhost_list').html(html);
    }
});
if(localStorage.getItem('env-vhost')) {
    $('#J_vhost').val(localStorage.getItem('env-vhost'));
}
//读取vhost文本
$('#J_btn_read_vhost').on('click', function() {
    $.ajax({
        url: 'api/vhost/text',
        type: 'get',
        dataType: 'jsonp',
        success: function(json) {
            if(json.success) {
                $('#J_vhost').val(json.data);
                localStorage.setItem('env-vhost', json.data);
            }
        }
    });
});
//写入vhost文本
$('#J_btn_write_vhost').on('click', function() {
    var data = $('#J_vhost').val()
    $.ajax({
        url: 'api/vhost/text',
        type: 'post',
        data: {
            content: data
        },
        dataType: 'jsonp',
        success: function(json) {
            if(json.success) {
                //alert('写入成功')
                Dialog.alert('写入成功');
                localStorage.setItem('env-vhost', data);
            }
        }
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
        $.ajax({
            url: 'api/vhost/',
            type: 'post',
            data: param,
            dataType: 'jsonp',
            success: function(json) {
                if(json.success) {
                    $dialog.modal('hide');
                    //console.log('添加成功');
                    Dialog.alert('添加成功');
                    json._proxy = function() {
                        return JSON.stringify(this.proxy);
                    };
                    var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
                    $('#J_vhost_list').append(html);
                }
            }
        })
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
        $.ajax({
            url: 'api/vhost/' + name,
            type: 'put',
            data: param,
            dataType: 'jsonp',
            success: function(json) {
                console.log(json);
                if(json.success) {
                    $dialog.modal('hide');
                    //console.log('更新成功')
                    Dialog.alert('更新成功');
                    json._proxy = function() {
                        return JSON.stringify(this.proxy);
                    };
                    var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
                    //$('#J_vhost_list').append(html);
                    $tr.replaceWith(html);
                }
            }
        })
    });
});
//删除
$('#J_vhost_list').on('click', '.J_delete', function(e) {
    e.preventDefault();
    var $tr = $(this).closest('tr');
    var name = $tr.attr('data-name');
    $.ajax({
        url: '/api/vhost/' + name,
        type: 'delete',
        dataType: 'jsonp',
        success: function(json) {
            //console.log(json);
            if(json.success) {
                Dialog.alert('删除成功');
                $tr.remove();
            }
        }
    });
});
//重启apache
$('#J_restart').on('click', function() {
    console.log('重启');
    var $btn = $(this);
    $btn.button('loading');
    $.ajax({
        url: '/api/apache/restart',
        type: 'post',
        dataType: 'jsonp',
        success: function(json) {
            //console.log(json);
            $btn.button('reset');
            Dialog.alert('重启成功');
        }
    });
});
//host

/*$.ajax({
    url: '/api/host/permiss',
    type: 'get',
    dataType: 'jsonp',
    success: function(json) {
        if(!json.success) {
            Dialog.alert('您没有写入host的权限，请用sudo执行命令行！');
        }
    }
});*/

if(localStorage.getItem('env-host')) {
    $('#J_host').val(localStorage.getItem('env-host'));
}
$('#J_read').on('click', function() {
    var $btn = $(this);
    $btn.button('loading');
    $.ajax({
        url: '/api/host',
        type: 'get',
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
            $btn.button('reset');
            $('#J_host').val(json.data).css('color', '#080');
            localStorage.setItem('env-host', json.data);
        }
    });
});
$('#J_write').on('click', function() {
    $.ajax({
        url: '/api/host',
        type: 'post',
        data: {
            content: $('#J_host').val()
        },
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
            if(json.success) {
                localStorage.setItem('env-host', $('#J_host').val());
                //$('#J_host').val(json.data);
                Dialog.alert('写入成功');
            }else {
                Dialog.alert('写入失败');
            }
            
        }
    });
});