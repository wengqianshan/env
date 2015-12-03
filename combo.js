var config = require('./config');
var fs = require('fs');
var path = require('path');
/**
 * 替换路径，如/combo/tcc/tbr/1.3.3/tbr/loader.js 替换为/tcc/tbr/[src|build]]/tbr/loader.js
 * @param {String} p 传入的路径
 * @param {Boolean} withVersion 是否替换版本号
 * @returns {String} 替换后的文件路径
 **/
function replacePath(p, withVersion) {
    if (withVersion) {
        return p.replace(/^\/?combo\/?/, '');
    } else {
        return p.replace(/^\/?combo\/?/, '').replace(/(\d+\.){2}\d+/, config.combo.dist);
    }
}

/**
 * 根据文件信息加载内容并拼接到一起
 * @param {Array} fileList 处理好的文件列表
 * @returns {Object} 返回拼接后的内容和错误信息
 **/
function loadFile(fileList) {
    var content = '';
    var errors = [];
    fileList.forEach(function(item) {
        var localPath = path.join(config.combo.dir, item.path);
        localPath = localPath.split('?')[0];
        var exist = fs.existsSync(localPath);
        if(!exist) {
            errors.push('文件不存在，请求线上资源: ' + localPath);
            return;
        }
        var c = fs.readFileSync(localPath, 'utf8');
        content += c;
    });
    return {
        content: content,
        errors: errors
    };
}

module.exports = function(req, res, obj) {
    console.log(obj);
    var search = obj.search;
    var pathName = obj.pathname;
    var href = obj.href;
    var files = [];
    if (search && search.indexOf('??') > -1) {
        var searchArray = search.substr(2).split(',');
        searchArray.forEach(function(item) {
            var p = path.join(pathName, item);
            files.push({
                opath: replacePath(p, true),
                path: replacePath(p)
            });
        })
    } else {
        files.push({
            opath: replacePath(pathName, true),
            path: replacePath(pathName)
        });
    }
    var results = loadFile(files);
    if (results.errors < 1) {
        if (href.indexOf('js') > -1) {
            res.type('application/x-javascript');
        } else if (href.indexOf('css') > -1) {
            res.type('text/css');
        }
        res.send(results.content);
    } else {
        res.send(results.errors.join('<br/>'))
    }
}