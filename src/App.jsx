import { useState } from "react";
import Home from "./components/Home";
import Program from "./pages/Program";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return <Home startApp={() => setPage("program")} />;
  }

  if (page === "program") {
    return <Program goHome={() => setPage("home")} />;
  }

  return null;
}

