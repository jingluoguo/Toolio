"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, RotateCcw } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const presets = [5, 25, 50];

export default function FocusPage() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const choosePreset = (value: number) => {
    setMinutes(value);
    setSecondsLeft(value * 60);
    setRunning(false);
  };

  const reset = () => {
    setSecondsLeft(minutes * 60);
    setRunning(false);
  };

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <main className="utility-page">
      <header className="utility-header">
        <a href={`${basePath}/`} className="utility-header-icon" aria-label="返回工具集"><ArrowLeft size={22} /></a>
        <div className="utility-brand-mark"><span>TOOLIO</span><strong>focus timer</strong></div>
        <button className="utility-header-icon" type="button" onClick={reset} aria-label="重置计时"><RotateCcw size={19} /></button>
      </header>
      <section className="utility-content">
        <p className="utility-tag"><Clock3 size={14} /> 02 / FOCUS</p>
        <h1>专注计时</h1>
        <p className="utility-intro">给一段不被打扰的时间，留出清晰边界。</p>
        <div className="focus-card">
          <span className="focus-status">{running ? "FOCUSING NOW" : secondsLeft === 0 ? "TIME IS UP" : "READY WHEN YOU ARE"}</span>
          <div className="focus-time" aria-live="polite">{formattedTime}</div>
          <div className="focus-presets">{presets.map((value) => <button key={value} type="button" className={minutes === value ? "is-selected" : ""} onClick={() => choosePreset(value)}>{value} min</button>)}</div>
          <button className="focus-main-action" type="button" onClick={() => setRunning((value) => !value)}>{running ? "暂停计时" : secondsLeft === 0 ? "重新开始" : "开始专注"}</button>
          <p className="focus-note">把手机放远一点，只做眼前这一件事。</p>
        </div>
      </section>
    </main>
  );
}
