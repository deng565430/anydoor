# anydoor
Tiny NodeJS Static Web server


## 使用方法
.editorconfig  // 代买编写风格 配置文件
.gitignore // git 上传配置文件
.npmignore // npm 配置文件
.eslintignore // eslint风格不检查的配置文件

## 安装
```
npm i -g anydoor
```

## 使用方法
```
anydoor # 把当前文件夹作为静态资源服务器根目录

anydoor -p 8080 # 设置端口号为8080

anydoor -h localhost # 设置 host 为 localhost

anydoor -d /usr # 设置根目录为 /user
```
### 添加执行权限
chomd +x bin/anydoor
### 执行
bin/anydoor