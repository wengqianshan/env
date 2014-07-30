# 本地环境配置工具

## 功能

* 显示本机ip
* 修改host
* 启动dns服务
* 重启apache
* 管理虚拟主机


## 环境要求

### nodejs

> mac下推荐使用 [homebrew](http://brew.sh/) 安装
> windows下请下载安装包 http://nodejs.org/ 安装

### apache

> mac自带apache，跳过。

> windows下安装[Appserv](http://www.appserv.net/)，也可以通过其他方式安装，已安装的跳过。

apache安装成功后请修改httpd.conf

> mac下路径为 /private/etc/apache2/httpd.conf

> windows下路径为 D:/AppServ/Apache2.2/conf/httpd.conf

找到：
````
# Virtual hosts
#Include (**mac和windows下路径不同**)extra/httpd-vhosts.conf
````
去掉注释，改为：
````
# Virtual hosts
Include (**mac和windows下路径不同**)extra/httpd-vhosts.conf
````

## 开始使用

1. 下载代码到本地目录

 > windows下需要修改配置文件config.js，设置vhost

2. 安装npm包
 ````
 npm install
 ````
3. 启动服务
 ````
 sudo node app
 ````
4. 浏览器打开http://localhost:5733访问