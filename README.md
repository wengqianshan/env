# 本地环境配置工具

## 功能

* 显示本机ip
* 修改host
* 启动dns服务
* 重启apache
* 管理虚拟主机


## 环境要求

### nodejs

> mac下推荐使用[homebrew](http://brew.sh/)安装
> windows下请下载安装包http://nodejs.org/安装

### apache

> mac自带apache，跳过
> windows下安装[Appserv](http://www.appserv.net/)到D盘(先这么着吧，稍候改为随意)

* apache安装成功后请修改httpd.conf，找到：
````
# Virtual hosts
#Include /private/etc/apache2/extra/httpd-vhosts.conf
````
去掉注释，改为：
````
# Virtual hosts
Include /private/etc/apache2/extra/httpd-vhosts.conf
````

## 开始使用

1. 下载代码到本地目录
2. 安装npm包
 ````
 npm install
 ````
3. 启动服务
 ````
 sudo node app
 ````
4. 浏览器打开http://localhost:5733访问