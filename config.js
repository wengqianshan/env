module.exports = {
    apache: {
        vhost: ''//httpd-vhosts.conf文件路径，比如windows下 D:/AppServ/Apache2.2/conf/extra/httpd-vhosts.conf
    },
    dns: {
        nameserver: '8.8.8.8'//备用dns解析服务. 10.65.0.1
    },
    combo: {
        dir: '/Users/xiaoshan/gitlab/ilw',//
        dist: 'build'
    }
};