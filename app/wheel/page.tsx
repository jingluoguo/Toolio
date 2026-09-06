"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CirclePlus, RotateCcw, Settings2, Sparkles, X } from "lucide-react";

const palette = ["#D9B679", "#C87756", "#A96062", "#587C82", "#7B9676", "#5871A8", "#94748F", "#B69062"];
const defaultEntries = ["心之所向", "深度工作", "留白片刻", "认识新人", "即时行动", "重新开始"];
const MAX_ENTRIES = 36;
type Point = { x: number; y: number };

function polarToCartesian(cx: number, cy: number, radius: number, angle: number): Point {
  const radians = ((angle - 90) * Math.PI) / 180;
  const round = (value: number) => Math.round(value * 10000) / 10000;
  return { x: round(cx + radius * Math.cos(radians)), y: round(cy + radius * Math.sin(radians)) };
}

function segmentPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(50, 50, 49.5, endAngle);
  const end = polarToCartesian(50, 50, 49.5, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M 50 50 L ${start.x} ${start.y} A 49.5 49.5 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function wrapWheelLabel(label: string, maxChars: number) {
  const characters = Array.from(label);
  const lines: string[] = [];
  for (let index = 0; index < characters.length; index += maxChars) {
    lines.push(characters.slice(index, index + maxChars).join(""));
  }
  if (lines.length <= 6) return lines;
  const visibleLines = lines.slice(0, 6);
  const lastLine = Array.from(visibleLines[5]);
  visibleLines[5] = `${lastLine.slice(0, Math.max(1, maxChars - 1)).join("")}…`;
  return visibleLines;
}

export default function WheelPage() {
  const [entries, setEntries] = useState(defaultEntries);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [title, setTitle] = useState("九月的选择");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftEntries, setDraftEntries] = useState(entries);
  const [newItem, setNewItem] = useState("");

  const step = 360 / entries.length;
  const segments = useMemo(() => entries.map((label, index) => ({ label, index, start: index * step, center: index * step + step / 2 })), [entries, step]);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [settingsOpen]);

  const openSettings = () => {
    if (spinning) return;
    setDraftTitle(title);
    setDraftEntries(entries);
    setNewItem("");
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    const cleanEntries = draftEntries.map((entry) => entry.trim()).filter(Boolean).slice(0, MAX_ENTRIES);
    if (cleanEntries.length < 2) return;
    setEntries(cleanEntries);
    setTitle(draftTitle.trim() || "未命名转盘");
    setResult(null);
    setSettingsOpen(false);
  };

  const addEntry = (event: FormEvent) => {
    event.preventDefault();
    const value = newItem.trim();
    if (!value || draftEntries.length >= MAX_ENTRIES) return;
    setDraftEntries((items) => [...items, value]);
    setNewItem("");
  };

  const removeEntry = (index: number) => {
    if (draftEntries.length <= 2) return;
    setDraftEntries((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateEntry = (index: number, value: string) => setDraftEntries((items) => items.map((item, itemIndex) => itemIndex === index ? value : item));

  const spin = () => {
    if (spinning || entries.length < 2) return;
    setSpinning(true);
    setResult(null);
    const winnerIndex = Math.floor(Math.random() * entries.length);
    const landingAngle = (360 - (winnerIndex * step + step / 2)) % 360;
    const currentAngle = ((rotation % 360) + 360) % 360;
    const delta = (landingAngle - currentAngle + 360) % 360;
    setRotation((value) => value + 1800 + delta);
    window.setTimeout(() => { setResult(entries[winnerIndex]); setSpinning(false); }, 4100);
  };

  const reset = () => {
    if (spinning) return;
    setEntries(defaultEntries);
    setResult(null);
    setRotation(0);
    setTitle("九月的选择");
  };

  return (
    <main className="wheel-page min-h-screen overflow-hidden bg-[#F4F1EA] text-[#16252E]">
      <div className="page-grain" />
      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-10 lg:px-16">
        <a href="/" className="flex items-center gap-3" aria-label="Toolio 工具集首页"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#142B36] text-[11px] font-semibold tracking-[0.18em] text-[#F4E3BA]">T</span><span className="font-serif text-xl tracking-[0.08em]">TOOLIO</span></a>
        <nav className="hidden items-center gap-8 text-sm text-[#53616A] md:flex"><a href="/" className="transition-colors hover:text-[#16252E]">工具集</a><a href="#about" className="transition-colors hover:text-[#16252E]">关于我们</a><a href="/" className="inline-flex items-center gap-1 border-b border-[#AD9363] pb-1 text-[#16252E]">返回工具集 <ArrowUpRight size={14} /></a></nav>
        <a href="/" className="grid h-10 w-10 place-items-center border border-[#D2CCC0] text-[#16252E] md:hidden" aria-label="返回工具集"><span className="h-px w-4 bg-current" /></a>
      </header>

      <section id="wheel" className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-[1440px] items-center px-6 pb-12 pt-4 md:px-10 lg:px-16 lg:pb-16 lg:pt-0">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(560px,1.2fr)] lg:gap-20">
          <div className="order-2 lg:order-1"><p className="mb-6 flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-[#9B7A43]"><span className="h-px w-8 bg-[#9B7A43]" /> DECISION ROOM</p><div className="mb-6 flex items-center gap-4"><span className="text-xs text-[#8A918D]">当前转盘</span><span className="h-px w-8 bg-[#CBBFAE]" /><span className="font-serif text-xl text-[#53616A]">{title}</span></div><h1 className="max-w-md font-serif text-5xl leading-[1.06] text-[#142B36] md:text-6xl">让下一步，<br />优雅地出现。</h1><p className="mt-7 max-w-md text-[15px] leading-7 text-[#66737B]">为那些不必过度思考的决定，留一点仪式感。写下选项，转动转盘，顺着答案前行。</p><div className="mt-9 flex flex-wrap items-center gap-4"><button onClick={openSettings} disabled={spinning} className="inline-flex items-center gap-2 border border-[#BBA77E] px-4 py-2.5 text-sm text-[#52636A] transition-colors hover:border-[#8D7650] hover:text-[#142B36] disabled:opacity-40"><Settings2 size={15} />编辑转盘</button><button onClick={reset} disabled={spinning} className="inline-flex items-center gap-2 px-2 py-2.5 text-sm text-[#7C8583] transition-colors hover:text-[#142B36] disabled:opacity-40"><RotateCcw size={15} />恢复示例</button></div><div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm"><div><span className="font-serif text-2xl text-[#16252E]">{entries.length}</span><span className="ml-2 text-[#778188]">个选项</span></div><div className="h-7 w-px bg-[#D4CEC2]" /><div><span className="font-serif text-2xl text-[#16252E]">01</span><span className="ml-2 text-[#778188]">枚指针</span></div><div className="h-7 w-px bg-[#D4CEC2]" /><div><span className="font-serif text-2xl text-[#16252E]">∞</span><span className="ml-2 text-[#778188]">种可能</span></div></div></div>
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end"><div className="wheel-stage"><div className="orbital-label orbital-label-top">TO CHOOSE IS TO MOVE</div><div className="orbital-label orbital-label-bottom">TURN · PAUSE · BEGIN</div><div className="pointer" aria-hidden="true"><span /></div><div className="wheel-shadow" /><div className="wheel" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.1s cubic-bezier(0.16, 0.79, 0.12, 1)" : "transform 560ms cubic-bezier(0.16, 1, 0.3, 1)" }} aria-label="决策转盘"><svg viewBox="0 0 100 100" role="img">{segments.map((segment) => { const denseWheel = entries.length > 24; const maxChars = denseWheel ? 2 : entries.length > 12 ? 3 : entries.length > 8 ? 5 : 7; const fontSize = denseWheel ? 1.85 : entries.length > 12 ? 2.35 : entries.length > 8 ? 3.1 : 3.8; const lineHeight = denseWheel ? 2.1 : entries.length > 12 ? 2.5 : 3.2; const textPoint = polarToCartesian(50, 50, 31, segment.center); const lines = wrapWheelLabel(segment.label, maxChars); return <g key={`${segment.label}-${segment.index}`}><path d={segmentPath(segment.start, segment.start + step)} fill={palette[segment.index % palette.length]} stroke="#F4F1EA" strokeWidth="0.55" vectorEffect="non-scaling-stroke" /><text x={textPoint.x} y={textPoint.y} fill="#FFFAEF" fontSize={fontSize} fontFamily="Georgia, serif" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${segment.center} ${textPoint.x} ${textPoint.y})`}>{lines.map((line, lineIndex) => <tspan key={`${line}-${lineIndex}`} x={textPoint.x} dy={lineIndex === 0 ? -((lines.length - 1) * lineHeight) / 2 : lineHeight}>{line}</tspan>)}</text></g>; })}<circle cx="50" cy="50" r="8.8" fill="#F4F1EA" /><circle cx="50" cy="50" r="7.2" fill="#16303A" /><circle cx="50" cy="50" r="2.2" fill="#D6B674" /></svg></div><button className={`spin-button ${spinning ? "is-spinning" : ""}`} onClick={spin} disabled={spinning || entries.length < 2}><span>{spinning ? "转动中" : "转动"}</span><RotateCcw size={16} strokeWidth={1.6} className={spinning ? "animate-spin" : ""} /></button>{result && <div className="result-reveal" role="status"><Sparkles size={15} /> <span>答案是 <strong>{result}</strong></span></div>}</div></div>
        </div>
      </section>

      <footer id="about" className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-5 border-t border-[#DED8CC] px-6 py-6 text-xs text-[#7A8382] md:flex-row md:items-center md:justify-between md:px-10 lg:px-16"><p><span className="font-serif tracking-[0.1em] text-[#42535A]">TOOLIO</span> &nbsp; A quieter way to decide.</p><span>2026</span></footer>

      {settingsOpen && <div className="settings-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}><section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="flex items-start justify-between border-b border-[#D8D1C5] pb-5"><div><p className="text-xs font-medium tracking-[0.18em] text-[#9B7A43]">WHEEL SETTINGS</p><h2 id="settings-title" className="mt-2 font-serif text-3xl text-[#142B36]">编辑转盘</h2></div><button onClick={() => setSettingsOpen(false)} className="grid h-9 w-9 place-items-center text-[#6D7778] transition-colors hover:text-[#142B36]" aria-label="关闭设置"><X size={18} /></button></div><label className="mt-6 block text-xs tracking-[0.14em] text-[#7B7770]" htmlFor="wheel-title">转盘名称</label><input id="wheel-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} maxLength={20} className="settings-title mt-2 w-full bg-transparent font-serif text-2xl text-[#1B3038] outline-none" /><div className="mt-7 flex items-center justify-between"><label className="text-xs tracking-[0.14em] text-[#7B7770]" htmlFor="new-entry">选项</label><span className="text-xs text-[#8A918D]">{draftEntries.length} / {MAX_ENTRIES}</span></div><div className="settings-list mt-3">{draftEntries.map((entry, index) => <div className="settings-entry group" key={`${entry}-${index}`}><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} /><input value={entry} onChange={(event) => updateEntry(index, event.target.value)} maxLength={18} aria-label={`选项 ${index + 1}`} /><button onClick={() => removeEntry(index)} disabled={draftEntries.length <= 2} aria-label={`删除 ${entry}`}><X size={14} /></button></div>)}</div><form onSubmit={addEntry} className="mt-4 flex border-b border-[#A79A85] pb-2"><CirclePlus size={18} className="mr-3 shrink-0 text-[#9B7A43]" /><input id="new-entry" value={newItem} onChange={(event) => setNewItem(event.target.value)} maxLength={18} disabled={draftEntries.length >= MAX_ENTRIES} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8B938E]" placeholder={draftEntries.length >= MAX_ENTRIES ? "已达到 36 个选项" : "添加一个新选项"} /><button type="submit" disabled={!newItem.trim() || draftEntries.length >= MAX_ENTRIES} className="text-xs text-[#9B7A43] disabled:opacity-30">加入</button></form><div className="mt-8 flex justify-end gap-3"><button onClick={() => setSettingsOpen(false)} className="border border-[#D1C9BD] px-4 py-2.5 text-sm text-[#677477] transition-colors hover:border-[#9E9078]">取消</button><button onClick={saveSettings} disabled={draftEntries.filter((entry) => entry.trim()).length < 2} className="bg-[#142E38] px-5 py-2.5 text-sm text-[#F6E8C9] transition-colors hover:bg-[#23434D] disabled:opacity-40">保存设置</button></div></section></div>}
    </main>
  );
}
