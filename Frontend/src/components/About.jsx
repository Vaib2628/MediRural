import { useEffect, useState } from "react";
import { loadServerFiles } from "../utils/loadServerFiles";

export default function About() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadServerFiles().then(data => {
      console.log("Loaded backend files:", data);
      setFiles(data);
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Backend Code Backup</h1>

      {files.length === 0 && <p>No backend files found.</p>}

      {files.map((file, index) => (
        <div key={index} style={{ marginBottom: "30px" }}>
          <h3>{file.path}</h3>

          <pre style={{
            background: "#111",
            color: "#0f0",
            padding: "15px",
            overflowX: "auto",
            borderRadius: "8px"
          }}>
            <code>{file.content}</code>
          </pre>

          <button
            onClick={() => navigator.clipboard.writeText(file.content)}
          >
            Copy
          </button>
        </div>
      ))}
    </div>
  );
}
