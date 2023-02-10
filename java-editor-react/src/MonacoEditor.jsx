import React, { memo, useEffect, useRef, useImperativeHandle } from "react";
import * as monaco from "monaco-editor";
import {
  toSocket,
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";
import {
  CloseAction,
  ErrorAction,
  MonacoLanguageClient,
  MonacoServices,
} from "monaco-languageclient";

import normalizeUrl from "normalize-url";
import ReconnectingWebSocket from "reconnecting-websocket";

const JAVA_TEMPLATE_PATH = "/opt/java-languageserver-master/test/Test.java";
// const JAVA_TEMPLATE_PATH =
//   "D:/workspace/java_prj/spring-study/demo-01/src/main/java/org/example/Main.java";
// const HOST = "127.0.0.1";
const HOST = "192.168.137.132";

const DEFAUT_CODE = `package test;

public class Test {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}`;

function createUrl(hostname, port, path) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return normalizeUrl(`${protocol}://${hostname}:${port}${path}`);
}

function createWebSocket(url) {
  const socketOptions = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false,
  };

  const webSocket = new ReconnectingWebSocket(url, [], socketOptions);
  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    socket.onMessage = (cb) => {
      webSocket.onmessage = (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            if (data && Object.prototype.hasOwnProperty.call(data, "jsonrpc")) {
              cb(event.data);
            } else {
              console.error("is not json", event.data);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
    };
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({
      reader,
      writer,
    });
    languageClient.start();
    reader.onClose(() => languageClient.stop());
  };
  return webSocket;
}

function createLanguageClient(transports) {
  return new MonacoLanguageClient({
    name: "Java Language Client",
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ["java"],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
}

const MonacoEditor = React.forwardRef(({ style }, ref) => {
  const url = createUrl(HOST, "5036", "/java-lsp");
  console.log('>>url', url)
  const mainRef = useRef(null);
  const editorRef = useRef(null);
  const model = useRef(null);

  const getValue = () => {
    return model.current.getValue();
  };

  const setValue = (v) => {
    model.current.setValue(v);
  };

  // 导出接口
  useImperativeHandle(ref, () => ({
    getValue,
    setValue,
  }));

  const initMonacoEditor = () => {
    model.current = monaco.editor.getModel(monaco.Uri.file(JAVA_TEMPLATE_PATH));
    if (!model.current) {
      model.current = monaco.editor.createModel(
        DEFAUT_CODE,
        "java",
        monaco.Uri.file(JAVA_TEMPLATE_PATH)
      );
    }
    if (!editorRef.current) {
      editorRef.current = monaco.editor.create(mainRef.current, {
        model: model.current,
      });
      MonacoServices.install();
      createWebSocket(url);
    }
  };

  useEffect(() => {
    initMonacoEditor();
  }, []);

  const defaultStyle = { height: "100vh" };
  const mergeStyle = style ? { ...defaultStyle, ...style } : { ...style };
  return <div ref={mainRef} style={{height: '100%'}}></div>;
});

export default memo(MonacoEditor);
