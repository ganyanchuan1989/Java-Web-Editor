# Java Web Editor 

Java Web 编辑器，支持智能感知（intellisense）。前端基于React，代码编辑使用Monaco-editor组件库。LSP基于https://github.com/eclipse/eclipse.jdt.ls



## 效果图

demo.gif有点大，有可能github的README.md显示不出来，请查看：`imgs\demo.gif`。

![](imgs\demo.gif)


## 环境依赖

- JDK 

  ```
  java version "17.0.6" 2023-01-17 LTS
  Java(TM) SE Runtime Environment (build 17.0.6+9-LTS-190)
  Java HotSpot(TM) 64-Bit Server VM (build 17.0.6+9-LTS-190, mixed mode, sharing)
  ```

- nodejs

  ```
  C:\Users\Admin>node -v
  v14.17.6
  ```
  
- jdt-language-server-1.10.0-202203040350

  仓库地址：https://github.com/eclipse/eclipse.jdt.ls

  镜像下载地址：https://download.eclipse.org/jdtls/snapshots/?d


## 工程说明

- java-editor-react：Java editor 界面工程
- java-languageserver-master：LSP服务工程



## 快速开始

> 提前准备好上诉环境

### 前端工程

```shell
cd java-editor-react
npm install

# 启动服务，服务启动成功，http://localhost:3000
npm start 
```

### 后端工程

- 安装：jdt-language-server-1.10.0-202203040350

  解压即可。

- 启动java-languageserver-master

  ```shell
  cd java-languageserver-master
  npm install 
  
  # 修改jdt-language-server-1.10.0-202203040350路劲
  # 编辑 index.js文件，修改BASE_URL
  
  # 启动服务
  npm run dev
  ```

  

## Q&A

### 能打开网页并能编辑，但是没有代码提示

> 问题描述：https://github.com/TypeFox/monaco-languageclient/issues/47
>
> 解决办法：
>
> - when you create an instance of the Monaco editor you should provide a file URI
> - the second, you can provide a workspace URI when you create Monaco services:

我这边的做法是参考上面的方案1，在java-languageserver 所在服务器上创建一个Model.java文件，前端编辑器创建的时候，Uri设置为服务器上Model.java文件路径，进而绕过去，详见：`MonacoEditor.jsx`：

```jsx
const JAVA_TEMPLATE_PATH = "/opt/java-languageserver-master/Model.java";

let model = monaco.editor.getModel(monaco.Uri.file(JAVA_TEMPLATE_PATH));
    if (!model) {
      model = monaco.editor.createModel(
        defaultCode,
        "java",
        monaco.Uri.file(JAVA_TEMPLATE_PATH)
      );
    }
```

Model.java
```java
package test;

public class Model {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}
```

当日志出现如下关键字，标识智能感知（intellisense）已经生效。

![image-20230206152612386](.\imgs\image-20230206152612386.png)

### 内网部署

如果你有内网部署需求，可以参考如下步骤（注意区分window和linux，如外网是window，内网也应该是window）：

1. 拷贝已经安装依赖的：java-editor-react 和 java-languageserver-master 项目
2. 拷贝已经安装工具的：jdt-language-server-1.10.0-202203040350
3. 拷贝缓存：用户目录下的`.cache\tooling`到内网
