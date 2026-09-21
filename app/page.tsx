"use client";

import { ArrowDown, Compass, MoveUpRight } from "lucide-react";
import { MouseEvent, useRef } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const tools = [
  { href: "/wheel", index: "01", title: "决策转盘", description: "把犹豫交给一次明确的转动。", label: "即刻开始" },
  { href: "/activity", index: "02", title: "活动海报", description: "把一场相聚，整理成值得分享的消息。", label: "开始编辑" },
];

export default function Home() {
  const sceneRef = useRef<HTMLElement>(null);

  const moveScene = (event: MouseEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const box = scene.getBoundingClientRect();
    scene.style.setProperty("--scene-x", `${((event.clientX - box.left) / box.width - .5) * 14}px`);
    scene.style.setProperty("--scene-y", `${((event.clientY - box.top) / box.height - .5) * 10}px`);
  };

  return (
    <main className="portal-page">
      <section ref={sceneRef} className="portal-scene" onMouseMove={moveScene} onMouseLeave={() => { sceneRef.current?.style.setProperty("--scene-x", "0px"); sceneRef.current?.style.setProperty("--scene-y", "0px"); }}>
        <div className="portal-image" aria-hidden="true" />
        <div className="portal-shade" aria-hidden="true" />
        <header className="portal-header">
          <a href={`${basePath}/`} className="portal-brand" aria-label="Toolio 首页"><span className="portal-brand-mark"><Compass size={19} strokeWidth={2.2} /></span><span><b>Toolio</b><small>把日常理清楚</small></span></a>
          <nav className="portal-nav" aria-label="主导航"><a href="#about">关于 Toolio</a><a href="#tools">工具集 <span>02</span></a></nav>
        </header>
        <div className="portal-hero" id="about">
          <p className="portal-meta"><span className="portal-pulse" /> TOOLIO / DAILY TOOLS</p>
          <div className="portal-title-wrap"><h1>穿过杂音。<em>看见下一步。</em></h1><p>当选择变多、事情变杂，给自己一个清晰的入口。</p></div>
          <p className="portal-side-note">两件小工具，<br />帮你把眼前的事做得更明白。</p>
          <a href="#tools" className="portal-explore">进入工具 <ArrowDown size={17} /></a>
        </div>
      </section>
      <section className="portal-tools" id="tools" aria-label="工具集">
        <div className="portal-tools-head"><span>02 / WORKING TOOLS</span><h2>从眼前这一件事开始</h2></div>
        <div className="portal-tool-grid">{tools.map((tool) => <a key={tool.href} href={`${basePath}${tool.href}/`} className="portal-tool-card"><span className="portal-card-index">{tool.index}</span><MoveUpRight className="portal-card-arrow" size={19} /><div><p>{tool.label}</p><h3>{tool.title}</h3><span>{tool.description}</span></div></a>)}</div>
      </section>
    </main>
  );
}
