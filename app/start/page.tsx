"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function StartPage() {
  const [goal, setGoal] = useState("");
  const [firstStep, setFirstStep] = useState("");

  const createStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanGoal = goal.trim();
    if (!cleanGoal) return;
    setFirstStep(`先为「${cleanGoal}」留出 10 分钟，写下你已经知道的第一件事。`);
  };

  return (
    <main className="utility-page">
      <header className="utility-header">
        <a href={`${basePath}/`} className="utility-header-icon" aria-label="返回工具集"><ArrowLeft size={22} /></a>
        <div className="utility-brand-mark"><span>TOOLIO</span><strong>first step</strong></div>
        <span className="utility-header-spacer" aria-hidden="true" />
      </header>
      <section className="utility-content start-content">
        <p className="utility-tag"><Sparkles size={14} /> 03 / START</p>
        <h1>行动起点</h1>
        <p className="utility-intro">把一个模糊的念头，拆成今天可以完成的一步。</p>
        <form className="start-card" onSubmit={createStep}>
          <label htmlFor="goal">你想开始什么？</label>
          <textarea id="goal" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例如：整理作品集、开始运动、读完一本书……" rows={4} />
          <button className="start-action" type="submit">找到第一步 <ArrowRight size={16} /></button>
          {firstStep && <div className="start-result"><span>YOUR NEXT MOVE</span><strong>{firstStep}</strong></div>}
        </form>
      </section>
    </main>
  );
}
