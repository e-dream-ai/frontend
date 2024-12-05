import { useState, useEffect } from "react";

const JekyllViewer = () => {
  // We'll store the base path to the _site directory
  const [basePath, setBasePath] = useState("");

  const src = `${basePath}/index.html`;

  useEffect(() => {
    // In development, Vite serves files from /public directly
    // In production, they'll be at the root
    const path = import.meta.env.DEV ? "/_site" : "/";
    setBasePath(path);
  }, []);

  return (
    <>
      <iframe
        height="800px"
        src={src}
        title="Help Site"
        // className="w-full h-full border-0"
        // allow same origin and scripts for proper functionality
        sandbox="allow-scripts allow-same-origin"
        allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
      />
    </>
  );
};

export default JekyllViewer;
