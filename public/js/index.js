//hash 控制
$(document).on('click', '#J_side_tab a', function(e) {
    location.hash = $(this).attr('href');
});

function hashChange() {
    var hash = location.hash;
    if (!hash) {
        hash = '#J_tab_home';
    }
    $('#J_side_tab a[href="' + hash + '"]').tab('show');    
}
$(window).on('hashchange', function(e) {
    hashChange();
});
hashChange();
// hash end


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
$('#J_ip').on('mousedown', function(e) {
    e.preventDefault();
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
                $('#J_vhost').val(json.data).css('color', '#080');;
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
                //Dialog.alert('写入成功');
                BootstrapDialog.alert({
                    title: '提示',
                    message: '写入成功',
                    buttonLabel: '好的'
                });
                localStorage.setItem('env-vhost', data);
            }
        }
    });
});

//添加
$('#J_vhost_add').on('click', function() {
    BootstrapDialog.show({
        title: '添加虚拟主机',
        message: function(dialogRef) {
            var html = Mustache.render($('#J_tmpl_vhost_form').html());
            var $dialog = $(html);
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
            return $dialog;
        },
        buttons: [
            {
                label: '提交',
                cssClass: 'btn-primary',
                action: function(dialogRef) {
                    var $form = dialogRef.$modalContent.find('form');
                    var param = $form.serialize();
                    $.ajax({
                        url: 'api/vhost/',
                        type: 'post',
                        data: param,
                        dataType: 'jsonp',
                        success: function(json) {
                            if(json.success) {
                                dialogRef.close();
                                //console.log('添加成功');
                                BootstrapDialog.alert({
                                    title: '提示',
                                    message: '添加成功',
                                    buttonLabel: '好的'
                                });
                                json._proxy = function() {
                                    return JSON.stringify(this.proxy);
                                };
                                var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
                                $('#J_vhost_list').append(html);
                            }else{
                                BootstrapDialog.alert({
                                    title: '提示',
                                    message: json.message,
                                    buttonLabel: '好的'
                                });
                            }
                        }
                    })
                }
            },
            {
                label: '取消',
                action: function(dialogRef) {
                    dialogRef.close();
                }
            }
        ],
        closable: false
    });
});

//编辑
$('#J_vhost_list').on('click', '.J_edit', function(e) {
    e.preventDefault();
    var $tr = $(this).closest('tr');
    var name = $tr.attr('data-name');
    var root = $tr.attr('data-root');
    var proxy = JSON.parse($tr.attr('data-proxy'));
    BootstrapDialog.show({
        title: '编辑虚拟主机',
        message: function() {
            var html = Mustache.render($('#J_tmpl_vhost_form').html(), {
                name: name,
                root: root,
                proxys: proxy.list
            }, {
                body: $('#J_tmpl_proxy_item').html()
            });
            var $dialog = $(html);
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
            return $dialog;
        },
        buttons: [
            {
                label: '提交',
                cssClass: 'btn-primary',
                action: function(dialogRef) {
                    var $form = dialogRef.$modalContent.find('form');
                    var param = $form.serialize();
                    $.ajax({
                        url: 'api/vhost/' + name,
                        type: 'put',
                        data: param,
                        dataType: 'jsonp',
                        success: function(json) {
                            console.log(json);
                            if(json.success) {
                                dialogRef.close();
                                //console.log('更新成功')
                                BootstrapDialog.alert({
                                    title: '提示',
                                    message: '更新成功',
                                    buttonLabel: '好的'
                                });
                                json._proxy = function() {
                                    return JSON.stringify(this.proxy);
                                };
                                var html = Mustache.render($('#J_tmpl_vhost_item').html(), json);
                                //$('#J_vhost_list').append(html);
                                $tr.replaceWith(html);
                            }
                        }
                    })
                    
                }
            },
            {
                label: '取消',
                action: function(dialogRef) {
                    dialogRef.close();
                }
            }
        ]
    });
});
//删除
$('#J_vhost_list').on('click', '.J_delete', function(e) {
    e.preventDefault();
    var $this = $(this);
    var $tr = $this.closest('tr');
    var name = $tr.attr('data-name');
    var request = function() {
        $.ajax({
            url: '/api/vhost/' + name,
            type: 'delete',
            dataType: 'jsonp',
            success: function(json) {
                //console.log(json);
                if(json.success) {
                    BootstrapDialog.alert({
                        title: '提示',
                        message: '删除成功',
                        buttonLabel: '好的'
                    });
                    $tr.remove();
                }
            }
        });
    };
    BootstrapDialog.show({
        title: '提示',
        message: '真要删除吗？',
        closable: true,
        buttons: [{
            label: '确定',
            cssClass: 'btn-primary',
            action: function(dialog) {
                dialog.close();
                request();
            }
        },{
            label: '取消',
            action: function(dialog) {
                dialog.close();
            }
        }]
    })
    return;

    
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
            BootstrapDialog.alert({
                title: '提示',
                message: '重启成功',
                buttonLabel: '好的'
            });
        }
    });
});
//apache语法检查
/*$('#J_apache_check').on('click', function() {
    //console.log('重启');
    var $btn = $(this);
    $btn.button('loading');
    $.ajax({
        url: '/api/apache/check',
        type: 'post',
        dataType: 'jsonp',
        success: function(json) {
            //console.log(json);
            $btn.button('reset');
            Dialog.alert(json.data);
        }
    });
});*/
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
                BootstrapDialog.alert({
                    title: '提示',
                    message: '写入成功',
                    buttonLabel: '好的'
                });
            }else {
                BootstrapDialog.alert({
                    title: '提示',
                    message: '写入失败',
                    buttonLabel: '好的'
                });
            }
            
        }
    });
});


if(localStorage.getItem('env-dns')) {
    $('#J_textarea_dns').val(localStorage.getItem('env-dns'));
}
$('#J_dns_read').on('click', function() {
    var $btn = $(this);
    $btn.button('loading');
    $.ajax({
        url: '/api/dns',
        type: 'get',
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
            $btn.button('reset');
            $('#J_textarea_dns').val(json.data).css('color', '#080');
            localStorage.setItem('env-dns', json.data);
        }
    });
});

$('#J_dns_write').on('click', function() {
    $.ajax({
        url: '/api/dns',
        type: 'post',
        data: {
            content: $('#J_textarea_dns').val()
        },
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
            if(json.success) {
                localStorage.setItem('env-dns', $('#J_textarea_dns').val());
                //$('#J_host').val(json.data);
                BootstrapDialog.alert({
                    title: '提示',
                    message: '写入成功',
                    buttonLabel: '好的'
                });
            }else {
                BootstrapDialog.alert({
                    title: '提示',
                    message: '写入失败',
                    buttonLabel: '好的'
                });
            }
            
        }
    });
});


//代理
$proxyContrlBtn = $('#J_proxy_control');
$.ajax({
    url: '/api/proxy/get',
    type: 'get',
    dataType: 'jsonp',
    success: function(json) {
        console.log(json);
        if (json.enabled === 'No') {
            $proxyContrlBtn[0].checked = false;
        } else if (json.enabled === 'Yes') {
            $proxyContrlBtn[0].checked = true;
        }
    }
});

$proxyContrlBtn.on('change', function() {
    var $this = $(this);
    console.log(this.checked);
    var checked = this.checked;
    var url = '';
    if (checked === true) {
        url = '/api/proxy/start'
    } else {
        url = '/api/proxy/stop'
    }
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'jsonp',
        success: function(json) {
            console.log(json);
           
        }
    });
});