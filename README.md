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

> 使用代理功能还需要开启模块 `mod_proxy.so` 和 `mod_proxy_http.so`：取消前面的`#`号后重启apache。


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


## 常见问题

* mac版本升级后出现403：找到文件`/private/etc/apache2/httpd.conf`，取消注释并设置`ServerName localhost:80`



### 使用帮助

#### 新建虚拟主机本地访问方法
1. 进入虚拟主机管理页面，点击添加

2. 输入域名和本地路径，点击提交

3. 点击左栏的重启apache

4. host里面加入刚才的域名，指向127.0.0.1，保存

5. 浏览器访问刚加的域名

#### 手机访问电脑的虚拟主机方法
1. 进入dns页面，添加一个虚拟主机已有域名，如demo.laiwang.com

2. 同局域网的手机设置dns为当前电脑ip

3. 手机访问demo.laiwang.com

#### 虚拟主机的反向代理配置方法
> 先确保已经设置dns和虚拟主机

1. 本地开启调试环境，如http://localhost:9000/

2. 虚拟主机添加反向代理，如： / http://localhost:9000/

3. 手机访问之前配置的域名

#### DNS设置方法
支持以下3种配置方式：
demo.laiwang.com将demo.laiwang.com代理到本机
demo.laiwang.com demo2.laiwang.com将demo.laiwang.com demo2.laiwang.com 代理到本机
10.68.108.15 demo.laiwang.com demo2.laiwang.com将demo.laiwang.com demo2.laiwang.com代理到10.68.108.15