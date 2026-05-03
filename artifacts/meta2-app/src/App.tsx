import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    window.location.replace("/app.html");
  }, []);

  return (
    <div style={{ background: "#0D1B2A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A84C", fontFamily: "Inter, sans-serif", fontSize: 16 }}>Loading...</div>
    </div>
  );
}
