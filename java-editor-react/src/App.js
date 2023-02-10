import React, { useRef, useEffect } from "react";
import MonacoEditor from "./MonacoEditor";
import "./App.css";

const testCode = `package org.example;

public class Test {
    public static void main(String[] args) {
        System.out.println("Hello Test!");
    }
}`;

function App() {
  const editorRef = useRef();

  const handleGetValue = () => {
    console.log(editorRef.current.getValue());
  };
  const handleSetValue = () => {
    editorRef.current.setValue(testCode);
  };

  return (
    <div>
      <div
        style={{
          height: "10vh",
          borderBottom: "1px solid #ccc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button onClick={handleGetValue} className="button">
          getValue
        </button>
        <button onClick={handleSetValue} className="button">
          setValue
        </button>
      </div>
      <div style={{ height: "90vh" }}>
        <MonacoEditor ref={editorRef} />
      </div>
    </div>
  );
}

export default App;
