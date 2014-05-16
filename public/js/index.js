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
        console.log(json);
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

//添加
var $addVhostModal = $('#J_modal_add_vhost');
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
});


$('#J_put').on('click', function() {
    $.ajax({
        url: '/api/vhost/localhost',
        type: 'put',
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
        }
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
            $('#J_host').val(json.data);
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
            $('#J_host').val(json.data);
        }
    });
});