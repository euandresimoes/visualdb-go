import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { Main } from "./components/Main";
import { useEffect, useState } from "react";

export function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  return (
    <>
      <main className="w-screen h-screen flex flex-col body-theme">
        {/* TOP BAR */}
        <TopBar />

        {/* MAIN */}
        <div className="w-full h-full flex flex-row">
          <Sidebar />
          <Main />
        </div>
      </main>
    </>
  );
}

export default App;
