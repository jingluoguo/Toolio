"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CirclePlus, Hand, Heart, RotateCcw, Settings2, Sparkles, Timer, X } from "lucide-react";

const DEFAULT_DARK_COLOR = "#65c552";
const DEFAULT_LIGHT_COLOR = "#a6e77e";
const defaultEntries = ["整理本周课堂笔记", "开始十分钟", "把手机放远一点", "回复一条消息", "喝一杯水", "完成最小的一步"];
const MAX_ENTRIES = 36;
const AUTO_SPIN_MIN_MS = 3200;
const AUTO_SPIN_MAX_MS = 6800;
const SETTLE_MS = 1050;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
type Point = { x: number; y: number };
type PauseMode = "manual" | "automatic";

function polarToCartesian(cx: number, cy: number, radius: number, angle: number): Point {
  const radians = ((angle - 90) * Math.PI) / 180;
  const round = (value: number) => Math.round(value * 10000) / 10000;
  return { x: round(cx + radius * Math.cos(radians)), y: round(cy + radius * Math.sin(radians)) };
}

function segmentPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(50, 50, 49.6, endAngle);
  const end = polarToCartesian(50, 50, 49.6, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M 50 50 L ${start.x} ${start.y} A 49.6 49.6 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function getWheelLabels(entries: string[]) {
  const minimum = 24;
  if (entries.length >= minimum) return entries;
  return Array.from({ length: minimum }, (_, index) => entries[index % entries.length]);
}

function wrapWheelLabel(label: string, charsPerLine: number, maxLines: number) {
  const characters = Array.from(label);
  const lines = Array.from({ length: Math.ceil(characters.length / charsPerLine) }, (_, index) => characters.slice(index * charsPerLine, (index + 1) * charsPerLine).join(""));
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, Math.max(1, charsPerLine - 1))}…`;
  return visible;
}

function AngelCatMark() {
  return <svg viewBox="0 0 180 180" aria-hidden="true">
    <ellipse className="angel-halo" cx="90" cy="29" rx="30" ry="8" />
    <path className="angel-wing" d="M54 91c-21-20-38-10-38 6 0 15 13 27 39 28-11-8-17-16-15-22 4 6 10 11 18 14" />
    <path className="angel-wing" d="M126 91c21-20 38-10 38 6 0 15-13 27-39 28 11-8 17-16 15-22-4 6-10 11-18 14" />
    <path className="angel-body" d="M61 114c-4 9-5 22 1 32 7 11 17 15 28 10 11 5 21 1 28-10 6-10 5-23 1-32" />
    <path className="angel-head" d="M55 72 58 43l20 15c8-4 16-4 24 0l20-15 3 29c5 7 7 15 6 25-2 26-18 42-41 42S49 123 49 97c-1-10 1-18 6-25Z" />
    <path className="angel-inner-ear" d="m61 53 4 17 9-8M119 53l-4 17-9-8" />
    <path className="angel-eye" d="M68 96c4 5 9 5 13 0M99 96c4 5 9 5 13 0" />
    <path className="angel-mouth" d="M85 108c3 3 7 3 10 0m-5 0v5m-7 4c4 5 10 5 14 0" />
    <path className="angel-paw" d="M68 126c4-6 11-6 16 0v10M112 126c-4-6-11-6-16 0v10" />
    <circle className="angel-cheek" cx="68" cy="109" r="3" /><circle className="angel-cheek" cx="112" cy="109" r="3" />
  </svg>;
}

export default function WheelPage() {
  const [entries, setEntries] = useState(defaultEntries);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [title, setTitle] = useState("拖延症学习计划");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftEntries, setDraftEntries] = useState(entries);
  const [darkColor, setDarkColor] = useState(DEFAULT_DARK_COLOR);
  const [lightColor, setLightColor] = useState(DEFAULT_LIGHT_COLOR);
  const [showCenterMark, setShowCenterMark] = useState(true);
  const [draftDarkColor, setDraftDarkColor] = useState(darkColor);
  const [draftLightColor, setDraftLightColor] = useState(lightColor);
  const [draftShowCenterMark, setDraftShowCenterMark] = useState(showCenterMark);
  const [pauseMode, setPauseMode] = useState<PauseMode>("manual");
  const [draftPauseMode, setDraftPauseMode] = useState<PauseMode>(pauseMode);
  const [manualSpin, setManualSpin] = useState(false);
  const [settling, setSettling] = useState(false);
  const [manualSpinPhase, setManualSpinPhase] = useState(0);
  const [newItem, setNewItem] = useState("");
  const finishTimer = useRef<number | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  const wheelLabels = useMemo(() => getWheelLabels(entries), [entries]);
  const wheelColor = (index: number) => index % 2 === 0 ? darkColor : lightColor;
  const step = 360 / wheelLabels.length;
  const segments = useMemo(() => wheelLabels.map((label, index) => ({ label, index, start: index * step, center: index * step + step / 2 })), [wheelLabels, step]);

  useEffect(() => () => { if (finishTimer.current) window.clearTimeout(finishTimer.current); }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setSettingsOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [settingsOpen]);

  const centeredRotation = (fromAngle: number, segmentIndex: number) => {
    const landingAngle = (360 - (segmentIndex * step + step / 2)) % 360;
    const currentAngle = ((fromAngle % 360) + 360) % 360;
    const delta = ((landingAngle - currentAngle + 540) % 360) - 180;
    return fromAngle + delta;
  };

  const currentWheelAngle = () => {
    if (!wheelRef.current) return rotation;
    const matrix = new DOMMatrixReadOnly(window.getComputedStyle(wheelRef.current).transform);
    return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
  };

  const segmentAtAngle = (angle: number) => {
    const pointerAngle = ((360 - angle) % 360 + 360) % 360;
    return segments[Math.floor(pointerAngle / step) % segments.length];
  };

  const finishSpin = (winner: string) => {
    if (finishTimer.current) window.clearTimeout(finishTimer.current);
    finishTimer.current = null;
    setManualSpin(false);
    setSettling(false);
    setResult(winner);
    setSpinning(false);
  };

  const settleAtCurrentPosition = () => {
    const angle = currentWheelAngle();
    const target = segmentAtAngle(angle);
    setManualSpin(false);
    setSettling(true);
    setRotation(angle);
    window.requestAnimationFrame(() => {
      setRotation(centeredRotation(angle, target.index));
      finishTimer.current = window.setTimeout(() => finishSpin(target.label), SETTLE_MS);
    });
  };

  const spin = () => {
    if (spinning || entries.length < 2) return;
    setResult(null);
    setSpinning(true);

    if (pauseMode === "manual") {
      setManualSpinPhase(Math.floor(Math.random() * 720));
      setManualSpin(true);
      setSettling(false);
      return;
    }

    const duration = AUTO_SPIN_MIN_MS + Math.round(Math.random() * (AUTO_SPIN_MAX_MS - AUTO_SPIN_MIN_MS));
    setManualSpinPhase(Math.floor(Math.random() * 720));
    setManualSpin(true);
    setSettling(false);
    finishTimer.current = window.setTimeout(settleAtCurrentPosition, duration);
  };

  const stopSpin = () => {
    if (!spinning) return spin();
    if (!manualSpin || !wheelRef.current) return;
    settleAtCurrentPosition();
  };

  const openSettings = () => {
    if (spinning) return;
    setDraftTitle(title);
    setDraftEntries(entries);
    setDraftDarkColor(darkColor);
    setDraftLightColor(lightColor);
    setDraftShowCenterMark(showCenterMark);
    setDraftPauseMode(pauseMode);
    setNewItem("");
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    const cleanEntries = draftEntries.map((entry) => entry.trim()).filter(Boolean).slice(0, MAX_ENTRIES);
    if (cleanEntries.length < 2) return;
    setEntries(cleanEntries);
    setDarkColor(draftDarkColor);
    setLightColor(draftLightColor);
    setShowCenterMark(draftShowCenterMark);
    setTitle(draftTitle.trim() || "未命名计划");
    setPauseMode(draftPauseMode);
    setResult(null);
    setRotation(0);
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
    if (draftEntries.length > 2) setDraftEntries((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <main className={`candy-wheel-page ${spinning ? "is-spinning" : ""}`}>
      <header className="candy-header">
        <a href={`${basePath}/`} className="header-icon" aria-label="返回工具集"><ArrowLeft size={22} /></a>
        <div className="brand-mark"><span>today&apos;s</span><strong>lucky pick</strong></div>
        <div className="header-actions">
          <button type="button" className="header-icon" onClick={openSettings} disabled={spinning} aria-label="编辑转盘"><Settings2 size={20} /></button>
          <button type="button" className="header-icon reset-icon" onClick={() => { if (!spinning) { setEntries(defaultEntries); setTitle("拖延症学习计划"); setPauseMode("manual"); setDarkColor(DEFAULT_DARK_COLOR); setLightColor(DEFAULT_LIGHT_COLOR); setShowCenterMark(true); setResult(null); setRotation(0); } }} disabled={spinning} aria-label="恢复示例"><RotateCcw size={19} /></button>
        </div>
      </header>

      <section className="candy-wheel-layout" aria-labelledby="wheel-heading">
        <div className="task-copy">
          <p className="task-tag"><Sparkles size={15} /> {title} | 暂停接受任务！</p>
          <h1 id="wheel-heading">{result ? <>就做这件事<br /><em>{result}</em></> : <>现在要做什么？<br />让转盘替你决定</>}</h1>
          <p className="task-hint">{pauseMode === "manual" ? "点一下中间的小天使开始，再点一次即可暂停。" : "这一次会在随机时间自动停下。"}</p>
        </div>

        <div className="wheel-scene">
          <div className="heart-burst" aria-hidden="true">
            <Heart className="burst-heart burst-heart-one" fill="currentColor" /><Heart className="burst-heart burst-heart-two" fill="currentColor" /><Heart className="burst-heart burst-heart-three" fill="currentColor" /><Heart className="burst-heart burst-heart-four" fill="currentColor" />
          </div>
          <div className="sparkle sparkle-one" aria-hidden="true">+</div><div className="sparkle sparkle-two" aria-hidden="true">+</div>
          <div className="wheel-glow" />
          <div ref={wheelRef} className={`candy-wheel ${manualSpin ? "is-manual-spin" : ""}`} style={{ transform: `rotate(${rotation}deg)`, transition: settling ? `transform ${SETTLE_MS}ms cubic-bezier(.16,.78,.2,1)` : "transform .45s cubic-bezier(.22,1,.36,1)", animationDelay: manualSpin ? `-${manualSpinPhase}ms` : undefined }} aria-label="任务转盘">
            <svg viewBox="0 0 100 100" role="img">
              {segments.map((segment) => {
                const dense = segments.length >= 30;
                const compact = segments.length >= 24;
                const charsPerLine = dense ? 2 : compact ? 3 : 4;
                const fontSize = dense ? 1.45 : compact ? 2 : 2.2;
                const lineHeight = dense ? 1.75 : compact ? 2.25 : 2.5;
                const maxLines = dense ? 6 : compact ? 5 : 4;
                const textPoint = polarToCartesian(50, 50, dense ? 30.5 : 31.5, segment.center);
                const lines = wrapWheelLabel(segment.label, charsPerLine, maxLines);
                return <g key={`${segment.label}-${segment.index}`}>
                  <path d={segmentPath(segment.start, segment.start + step)} fill={wheelColor(segment.index)} stroke="#d8edd9" strokeWidth=".5" vectorEffect="non-scaling-stroke" />
                  <path d={segmentPath(segment.start + .65, segment.start + step - .65)} fill="none" stroke="rgba(255,255,255,.34)" strokeWidth=".28" />
                  <text x={textPoint.x} y={textPoint.y} fill={segment.index % 2 === 0 ? "#f2faef" : "#24513d"} fontSize={fontSize} fontWeight="700" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${segment.center} ${textPoint.x} ${textPoint.y})`}>{lines.map((line, index) => <tspan key={`${line}-${index}`} x={textPoint.x} dy={index === 0 ? -((lines.length - 1) * lineHeight) / 2 : lineHeight}>{line}</tspan>)}</text>
                </g>;
              })}
              <circle cx="50" cy="50" r="12.8" fill="#d9efd9" stroke="#fff" strokeWidth="1" />
            </svg>
          </div>
          <button type="button" className={`angel-button ${showCenterMark ? "" : "simple-center-button"}`} onClick={pauseMode === "automatic" && spinning ? undefined : stopSpin} disabled={spinning && (pauseMode === "automatic" || settling)} aria-label={!spinning ? "开始转盘" : pauseMode === "automatic" ? "自动停止中" : settling ? "正在归位" : "停止转盘"}>
            {showCenterMark ? <><AngelCatMark /><span className="angel-button-label">{!spinning ? "点我开始" : pauseMode === "automatic" ? "自动停止中" : settling ? "正在归位" : "点我停止"}</span></> : <span className="simple-center" aria-hidden="true"><strong>{!spinning ? "GO" : pauseMode === "automatic" || settling ? "..." : "STOP"}</strong><small>{entries.length} 项</small></span>}
          </button>
          <div className="selection-pointer" aria-hidden="true"><span /></div>
          {result && <div className="candy-result" role="status"><Heart size={15} fill="currentColor" /> 已选中：<strong>{result}</strong></div>}
        </div>

        <div className="bottom-hearts" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((heart) => <Heart key={heart} fill="currentColor" className={`bottom-heart heart-${heart + 1}`} />)}
        </div>
      </section>

      {settingsOpen && <div className="settings-overlay candy-settings-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
        <section className="settings-panel candy-settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="flex items-start justify-between border-b border-emerald-100 pb-5"><div><p className="text-xs font-medium tracking-[.12em] text-emerald-700">MAKE IT YOURS</p><h2 id="settings-title" className="mt-2 text-3xl font-bold text-[#24513d]">编辑转盘</h2></div><button onClick={() => setSettingsOpen(false)} className="grid h-9 w-9 place-items-center text-emerald-600" aria-label="关闭设置"><X size={19} /></button></div>
          <label className="mt-6 block text-xs tracking-[.1em] text-emerald-700" htmlFor="wheel-title">转盘名称</label><input id="wheel-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} maxLength={20} className="settings-title mt-2 w-full bg-transparent text-2xl font-bold text-[#24513d] outline-none" />
          <div className="mt-6"><p className="text-xs tracking-[.1em] text-emerald-700">转盘颜色</p><div className="wheel-color-control mt-2"><label><span className="color-choice-swatch" style={{ backgroundColor: draftDarkColor }} /><span>深色扇区</span><input type="color" value={draftDarkColor} onChange={(event) => setDraftDarkColor(event.target.value)} aria-label="选择深色扇区颜色" /></label><label><span className="color-choice-swatch" style={{ backgroundColor: draftLightColor }} /><span>浅色扇区</span><input type="color" value={draftLightColor} onChange={(event) => setDraftLightColor(event.target.value)} aria-label="选择浅色扇区颜色" /></label></div></div>
          <label className="center-visibility-toggle mt-5"><input type="checkbox" checked={draftShowCenterMark} onChange={(event) => setDraftShowCenterMark(event.target.checked)} /><span><strong>显示中心天使猫</strong><small>关闭后显示 GO 和选项数量</small></span></label>
          <div className="mt-6"><p id="pause-mode-label" className="text-xs tracking-[.1em] text-emerald-700">停止方式</p><div className="pause-mode-control mt-2" role="group" aria-labelledby="pause-mode-label"><button type="button" className={draftPauseMode === "manual" ? "is-selected" : ""} onClick={() => setDraftPauseMode("manual")} aria-pressed={draftPauseMode === "manual"}><Hand size={16} /><span>手动暂停</span><small>再次点击中心停止</small></button><button type="button" className={draftPauseMode === "automatic" ? "is-selected" : ""} onClick={() => setDraftPauseMode("automatic")} aria-pressed={draftPauseMode === "automatic"}><Timer size={16} /><span>自动暂停</span><small>每次随机 3.2-6.8 秒</small></button></div></div>
          <div className="mt-7 flex items-center justify-between"><label className="text-xs tracking-[.1em] text-emerald-700" htmlFor="new-entry">选项</label><span className="text-xs text-emerald-600">{draftEntries.length} / {MAX_ENTRIES}</span></div>
          <div className="settings-list mt-3">{draftEntries.map((entry, index) => <div className="settings-entry" key={`${entry}-${index}`}><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: index % 2 === 0 ? draftDarkColor : draftLightColor }} /><input value={entry} onChange={(event) => setDraftEntries((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} maxLength={18} aria-label={`选项 ${index + 1}`} /><button onClick={() => removeEntry(index)} disabled={draftEntries.length <= 2} aria-label={`删除 ${entry}`}><X size={14} /></button></div>)}</div>
          <form onSubmit={addEntry} className="mt-4 flex border-b border-emerald-200 pb-2"><CirclePlus size={18} className="mr-3 shrink-0 text-emerald-700" /><input id="new-entry" value={newItem} onChange={(event) => setNewItem(event.target.value)} maxLength={18} disabled={draftEntries.length >= MAX_ENTRIES} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-emerald-300" placeholder={draftEntries.length >= MAX_ENTRIES ? "已达到 36 个选项" : "添加一个新选项"} /><button type="submit" disabled={!newItem.trim() || draftEntries.length >= MAX_ENTRIES} className="text-xs text-emerald-700 disabled:opacity-30">加入</button></form>
          <div className="mt-8 flex justify-end gap-3"><button onClick={() => setSettingsOpen(false)} className="border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">取消</button><button onClick={saveSettings} disabled={draftEntries.filter((entry) => entry.trim()).length < 2} className="bg-[#2b7654] px-5 py-2.5 text-sm text-white shadow-[0_8px_18px_rgba(43,118,84,.26)] disabled:opacity-40">保存设置</button></div>
        </section>
      </div>}
    </main>
  );
}
