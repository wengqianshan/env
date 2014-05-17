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
        //console.log(json);
        var text = JSON.stringify(json);
        //$('#J_httpd').val(text.replace(/(\\r)?\\n/g, '\r\n'));
        json._proxy = function() {
            return JSON.stringify(this.proxy);
        };
        var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
        //console.log(html);
        $('#J_vhost_list').html(html);
        //- json.data.forEach(function(item) {
        //-     console.log(item);
        //- })
    }
});
//读取vhost文本
$('#J_btn_read_vhost').on('click', function() {
    $.ajax({
        url: 'api/vhost/text',
        type: 'get',
        dataType: 'jsonp',
        success: function(json) {
            if(json.success) {
                $('#J_vhost').val(json.data);
            }
        }
    });
});
//写入vhost文本
$('#J_btn_write_vhost').on('click', function() {
    $.ajax({
        url: 'api/vhost/text',
        type: 'post',
        data: {
            content: $('#J_vhost').val()
        },
        dataType: 'jsonp',
        success: function(json) {
            if(json.success) {
                alert('写入成功')
            }
        }
    });
});

//添加
/*var $addVhostModal = $('#J_modal_add_vhost');
$addVhostModal.find('.J_submit').on('click', function() {
    var param = $addVhostModal.find('form').serialize();
    console.log(param);
    $.ajax({
        url: 'api/vhost/',
        type: 'post',
        data: param,
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
            if(json.success) {
                $addVhostModal.modal('hide');
            }
        }
    })
});
$('#J_btn_add_proxy').on('click', function() {
    var html = Mustache.render($('#J_tmpl_proxy_item').html());
    $('#J_proxy_list').append(html);
});
$('#J_proxy_list').on('click', '.J_delete', function() {
    var $li = $(this).closest('li');
    $li.remove();
});*/

$('#J_vhost_add').on('click', function() {
    var dialogTmpl = $('#J_tmpl_modal_dialog').html();
    var dialog = Mustache.render(dialogTmpl, {
        title: '更新',
        //body: '',
        close: '关闭',
        ok: '提交'
    }, {
        body: Mustache.render($('#J_tmpl_vhost_form').html())
    });
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
                //console.log(json);
                if(json.success) {
                    $dialog.modal('hide');
                    console.log('添加成功');
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
        //body: '',
        close: '关闭',
        ok: '提交'
    }, {
        body: Mustache.render($('#J_tmpl_vhost_form').html(), {
            name: name,
            root: root,
            proxys: proxy.list
        }, {
            body: $('#J_tmpl_proxy_item').html()
        })
    });
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
                    console.log('更新成功')
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
            console.log(json);
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
            console.log(json);
            $btn.button('reset');
        }
    });
});
//host
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
            localStorage.setItem('env-host', $('#J_host').val());
            $('#J_host').val(json.data);
        }
    });
});