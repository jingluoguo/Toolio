"use client";

import { ChangeEvent, CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const storageKey = "toolio-table-editor-v3";

type Align = "left" | "center" | "right";

type Column = { id: string; name: string; weight: number; align: Align };

type Row = { id: string; cells: string[] };

type TableState = {
  title: string;
  subtitle: string;
  footnote: string;
  headerColor: string;
  zebra: boolean;
  pageSize: number;
  columns: Column[];
  rows: Row[];
};

const SEED_COLUMNS: Column[] = [
  { id: "col-1", name: "序号", weight: 7, align: "center" },
  { id: "col-2", name: "山名", weight: 21, align: "center" },
  { id: "col-3", name: "门票", weight: 15, align: "center" },
  { id: "col-4", name: "登山时间", weight: 12, align: "center" },
  { id: "col-5", name: "特色", weight: 45, align: "left" },
];

// 杭州秋日可以爬的山（44 条路线），作为初始示例数据，可自由编辑或清空。
const SEED_ROWS: string[][] = [
  ["1", "天马山", "免费", "约 1h", "滨江近郊，山体平缓，适合日常遛弯入门"],
  ["2", "贵人峰", "免费", "约 1h", "九溪旁小山，俯瞰钱塘江与茶园，轻松出片"],
  ["3", "小和山", "免费", "约 1h", "市区近郊，高校旁小山，适合散步爬山"],
  ["4", "超山", "40 元", "约 1.5h", "以梅花闻名，奇石，可眺望塘栖平原风光"],
  ["5", "云栖竹径万木草堂线", "8 元", "约 1.5h", "竹海秘境，古木参天，清凉治愈出片"],
  ["6", "大石佛院（将台山）", "免费", "约 1.5h", "西湖摩崖大佛，吴越古迹，山林清幽适合访古"],
  ["7", "老和山", "免费", "约 1.2h", "浙大后山，平缓山脊，观西湖与校园城市景色"],
  ["8", "湘湖老虎洞山", "免费", "约 1.2h", "湘湖旁窑文化遗址，登顶俯瞰湘湖，步道平缓"],
  ["9", "大雄山（良渚）", "免费", "约 1.2h", "良渚秘境，低难度野路竹林，亲子友好人少清净"],
  ["10", "灵隐飞来峰", "45 元", "约 1.2h", "千年石刻石窟，人文浓厚，短途登山游览"],
  ["11", "径山古道 — 径山寺", "径山寺 20 元", "约 1.5h", "秋日竹林光影绝美"],
  ["12", "鹰嘴崖小环线", "免费", "约 1h", "俯瞰法喜寺、龙井茶园，禅意浓厚可祈福"],
  ["13", "南高峰", "免费", "约 1.8h", "西湖十景双峰插云，溶洞古迹，人少静谧"],
  ["14", "西山森林公园（富阳）", "免费", "约 1.8h", "平缓森林步道，溪流潺潺，新手友好适合避暑"],
  ["15", "东明山", "免费", "约 2h", "森林公园松林成片，人少适合休闲徒步"],
  ["16", "龙门山（富阳）", "免费", "约 2h", "龙门古镇旁，怪石山野小路，山水人文兼具"],
  ["17", "龙坞白岩山", "免费", "约 2h", "龙坞茶镇，满山茶园，平缓山道观赏茶田"],
  ["18", "甘岭水库长乐林场", "免费", "约 2h", "水库森林，红杉水杉，秋日氛围感强"],
  ["19", "北高峰", "免费（灵隐寺另购票）", "约 2h", "可眺望西湖、西溪、城西天际线、钱塘江远景"],
  ["20", "豆腐皮古道小环线", "免费", "约 2h", "大洋坞水库➡️东庵遗址➡️大德岭➡️飞凤岩➡️鉴远亭➡️大洋坞水库"],
  ["21", "康门水库环线", "免费", "约 2h", "康门水库停车场➡️大坝➡️良渚天梯➡️山脊观景台➡️竹林步道➡️康门水库停车场"],
  ["22", "宝石山", "免费", "约 2.5h", "俯瞰西湖全景，日出日落景观绝佳"],
  ["23", "午潮山", "免费", "约 2.5h", "原始森林溪流瀑布，野趣足，高负氧离子，可走小环线"],
  ["24", "王位山", "免费", "约 2.8h", "高山草甸云海机位，秋季红杉景观美，爬升偏大"],
  ["25", "吴山", "免费（城隍阁 30 元）", "约 3h", "网红绿野仙踪，拍照出片效果佳"],
  ["26", "如意尖", "免费", "约 3h", "杭州城西最高峰，群山连绵，适合进阶徒步"],
  ["27", "马岭古道", "免费", "约 3h", "古村人文浓厚，雨后光影佳，可下水踩水"],
  ["28", "鸬鸟山", "免费", "约 3h", "高山草甸，山顶芦苇花海，视野辽阔"],
  ["29", "玉皇山", "10 元（16:30 后免票）", "约 3.5h", "新西湖十景玉皇飞云所在地，八卦田绝佳俯瞰点"],
  ["30", "杏梅尖", "免费", "约 3.5h", "富阳最高峰，原始山林大瀑布，硬核徒步"],
  ["31", "十里琅珰（五云山→梅家坞）", "免费", "约 2.5h", "经典山脊徒步线，层层茶园，杭州徒步标杆"],
  ["32", "上香古道南高峰环线", "免费", "约 2.5h", "六通宾馆➡️南高峰➡️五老峰➡️双峰村➡️三台阁➡️茅家埠上香古道➡️六通宾馆"],
  ["33", "龙坞白岩山茶园环线", "免费", "约 2.5h", "龙坞茶镇➡️白岩山➡️茶园山脊➡️光明寺水库➡️何家村➡️龙坞茶镇"],
  ["34", "云栖十里琅珰环线", "8 元", "约 3h", "云栖竹径➡️真迹寺➡️十里琅珰➡️梅家坞➡️三分岔➡️云栖竹径"],
  ["35", "玉皇山", "10 元（16:30 后免票）", "约 3.5h", "新西湖十景玉皇飞云所在地，八卦田绝佳俯瞰点"],
  ["36", "如意尖环线", "免费", "约 3.5h", "双灵村➡️如意尖山顶➡️狗头山➡️野山头➡️板壁山水库➡️双灵村"],
  ["37", "杏梅尖", "免费", "约 3.5h", "富阳最高峰，原始山林大瀑布，硬核徒步，体力要求高"],
  ["38", "九溪环线", "免费", "约 4h", "一次打卡江边、溪谷瀑布、古寺茶园、山脊，新手友好"],
  ["39", "凤凰山", "免费", "约 4h", "栖云古刹清幽，藏有南宋老虎洞官窑遗址"],
  ["40", "鸬鸟山罗窑坞环线", "免费", "约 4h", "罗窑坞➡️鸬鸟山顶爱心天梯➡️泗溪古道➡️罗窑坞"],
  ["41", "富阳横坑坞环线", "免费", "约 4.5h", "横坑村➡️万年石浪➡️峭壁山脊➡️粽叶林➡️溪谷涉水路段➡️横坑村"],
  ["42", "小猪线", "免费", "约 5h", "吴山广场 D 口➡️城隍阁➡️十二生肖石➡️江湖汇观亭➡️绿野仙踪➡️白蛇飞渡桥➡️和孚精舍➡️凤凰山➡️老玉皇宫➡️八卦田➡️紫来洞➡️月宝亭➡️九曜阁➡️南屏山➡️学士桥➡️吴山广场"],
  ["43", "西湖爱心线", "免费", "约 6h", "龙翔桥➡️湖滨➡️宝石山➡️青芝坞➡️灵峰山➡️灵隐外围➡️满觉陇➡️九曜山➡️雷峰塔➡️长桥➡️龙翔桥"],
  ["44", "六和塔-虎跑", "免费", "约 2h", "六和塔 → 二龙山 → 虎跑后山 → 虎跑梦泉 → 虎跑雕像 → 虎跑山"],
];

function makeId(index = 0) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${index}`;
}

function defaultState(): TableState {
  return {
    title: "杭州秋日可以爬的山",
    subtitle: "44 条路线 · 按用时与体力递增",
    footnote: "信息仅供参考，出行前请以景区最新公告为准",
    headerColor: "#5b79b4",
    zebra: false,
    pageSize: 14,
    columns: SEED_COLUMNS.map((column) => ({ ...column })),
    rows: SEED_ROWS.map((cells, index) => ({ id: makeId(index), cells: [...cells] })),
  };
}

function normalizeState(value: Partial<TableState>): TableState {
  const fallback = defaultState();
  const columns = Array.isArray(value.columns) && value.columns.length > 0
    ? value.columns.map((column, index): Column => ({
        id: column?.id || makeId(index),
        name: String(column?.name ?? ""),
        weight: Number(column?.weight) > 0 ? Number(column.weight) : 15,
        align: column?.align === "left" || column?.align === "right" ? column.align : "center",
      }))
    : fallback.columns;
  const rows = Array.isArray(value.rows)
    ? value.rows.map((row, index): Row => ({
        id: row?.id || makeId(index),
        cells: columns.map((_, cellIndex) => String(row?.cells?.[cellIndex] ?? "")),
      }))
    : fallback.rows;
  return {
    title: typeof value.title === "string" ? value.title : fallback.title,
    subtitle: typeof value.subtitle === "string" ? value.subtitle : fallback.subtitle,
    footnote: typeof value.footnote === "string" ? value.footnote : fallback.footnote,
    headerColor: typeof value.headerColor === "string" ? value.headerColor : fallback.headerColor,
    zebra: Boolean(value.zebra),
    pageSize: Math.min(40, Math.max(1, Math.round(Number(value.pageSize)) || 14)),
    columns,
    rows,
  };
}

export default function TablePage() {
  const [state, setState] = useState<TableState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(0);
  const sheetRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [fitScale, setFitScale] = useState(1);

  const { title, subtitle, footnote, headerColor, zebra, pageSize, columns, rows } = state;
  const current = rows[active];
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const startIndex = page * pageSize;
  const group = rows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setState(normalizeState(JSON.parse(saved)));
    } catch {
      // Keep bundled seed data when local storage is unavailable or malformed.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Oversized content can exceed localStorage limits; in-memory edits still work.
    }
  }, [state, hydrated]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(".midautumn-event-choice.is-active")?.scrollIntoView({ block: "nearest" });
  }, [active, rows.length]);

  useEffect(() => {
    if (rows.length === 0) {
      setActive(0);
      setPage(0);
      return;
    }
    setActive((value) => Math.min(value, rows.length - 1));
    setPage((value) => Math.min(value, Math.ceil(rows.length / pageSize) - 1));
  }, [rows.length, pageSize]);

  // The sheet keeps a fixed 3:4 ratio, so shrink the table type until this page fits.
  const lastFitInputs = useRef<unknown[]>([]);
  useLayoutEffect(() => {
    const inputs: unknown[] = [rows, columns, page, pageSize, title, subtitle, footnote];
    const previous = lastFitInputs.current;
    const changed = previous.length !== inputs.length || inputs.some((value, index) => value !== previous[index]);
    lastFitInputs.current = inputs;
    if (changed) {
      setFitScale(1);
      return;
    }
    const wrap = tableWrapRef.current;
    const table = tableRef.current;
    if (!wrap || !table) return;
    const available = wrap.clientHeight;
    const height = table.getBoundingClientRect().height;
    if (available <= 0 || height <= available + 1) return;
    // Light shrink only when a page would otherwise overflow; keeps normal pages at full size.
    const next = Math.max(0.86, fitScale * (available / height) * 0.99);
    if (fitScale - next > 0.004) setFitScale(next);
  });

  const update = (patch: Partial<TableState>) => setState((prev) => ({ ...prev, ...patch }));

  const totalWeight = columns.reduce((sum, column) => sum + Math.max(1, column.weight), 0) || 1;
  const columnWidth = (weight: number) => `${((Math.max(1, weight) / totalWeight) * 100).toFixed(2)}%`;

  const updateColumn = (id: string, patch: Partial<Column>) =>
    setState((prev) => ({ ...prev, columns: prev.columns.map((column) => (column.id === id ? { ...column, ...patch } : column)) }));

  const addColumn = () =>
    setState((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: makeId(prev.columns.length), name: `新列 ${prev.columns.length + 1}`, weight: 15, align: "left" }],
      rows: prev.rows.map((row) => ({ ...row, cells: [...row.cells, ""] })),
    }));

  const removeColumn = (id: string) => {
    if (columns.length <= 1 || !window.confirm("删除该列？列内数据会一并清除。")) return;
    const index = columns.findIndex((column) => column.id === id);
    setState((prev) => ({
      ...prev,
      columns: prev.columns.filter((column) => column.id !== id),
      rows: prev.rows.map((row) => ({ ...row, cells: row.cells.filter((_, cellIndex) => cellIndex !== index) })),
    }));
    setActive(0);
  };

  const addRow = () => {
    const nextIndex = rows.length;
    setState((prev) => ({ ...prev, rows: [...prev.rows, { id: makeId(prev.rows.length), cells: prev.columns.map(() => "") }] }));
    setActive(nextIndex);
    setPage(Math.floor(nextIndex / pageSize));
  };

  const removeRow = () => {
    if (!current || !window.confirm(`删除第 ${active + 1} 行？`)) return;
    setState((prev) => ({ ...prev, rows: prev.rows.filter((_, index) => index !== active) }));
    setActive((value) => Math.max(0, Math.min(value, rows.length - 2)));
  };

  const updateCell = (cellIndex: number, value: string) =>
    setState((prev) => ({ ...prev, rows: prev.rows.map((row, index) => (index === active ? { ...row, cells: row.cells.map((cell, i) => (i === cellIndex ? value : cell)) } : row)) }));

  const resetState = () => {
    if (!window.confirm("恢复初始表格？当前编辑内容会被覆盖。")) return;
    setState(defaultState());
    setActive(0);
    setPage(0);
  };

  // Selecting a row also jumps the canvas to the page that holds it.
  const selectRow = (index: number) => {
    setActive(index);
    setPage(Math.floor(index / pageSize));
  };

  const goPage = (pageIndex: number) => {
    setPage(pageIndex);
    setActive(Math.min(rows.length - 1, pageIndex * pageSize));
  };

  const captureSheet = async () => {
    if (!sheetRef.current) return null;
    try {
      await document.fonts.ready;
    } catch {
      // Font availability check is best-effort; capture regardless.
    }
    // Matches the poster export: a 720px-wide sheet at scale 3, i.e. a 2160 x 2880 (3:4) PNG.
    const width = sheetRef.current.offsetWidth || 720;
    const canvas = await html2canvas(sheetRef.current, {
      scale: Math.min(6, Math.max(1, 2160 / width)),
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    return canvas.toDataURL("image/png");
  };

  // Auto-fit runs over a few frames before the table stops shrinking.
  const settleSheet = () => new Promise((resolve) => setTimeout(resolve, 320));

  const safeFilename = (title.trim() || "表格").replace(/[\\/:*?"<>|]/g, "-").slice(0, 80);

  const exportPage = async () => {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    try {
      // Wait for React to drop the active-row highlight before capturing.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))));
      await settleSheet();
      const dataUrl = await captureSheet();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `${safeFilename}-${String(page + 1).padStart(2, "0")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const exportAllPages = async () => {
    if (!sheetRef.current || exporting || rows.length === 0) return;
    setExporting(true);
    const restorePage = page;
    try {
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        goPage(pageIndex);
        // Wait for React to re-render the sheet with the next page before capturing.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))));
        await settleSheet();
        const dataUrl = await captureSheet();
        if (!dataUrl) continue;
        const link = document.createElement("a");
        link.download = `${safeFilename}-${String(pageIndex + 1).padStart(2, "0")}.png`;
        link.href = dataUrl;
        link.click();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } finally {
      setPage(restorePage);
      setExporting(false);
    }
  };

  return (
    <main className="midautumn-app">
      <header className="midautumn-header">
        <a href={`${basePath}/`} className="midautumn-header-icon" aria-label="返回工具集"><ArrowLeft size={22} /></a>
        <div className="midautumn-brand-mark"><span>TOOLIO / 03</span><strong>表格生成器</strong></div>
        <div className="midautumn-header-spacer" aria-hidden="true" />
      </header>

      <aside className="midautumn-editor">
        <div className="midautumn-brand">
          <div>
            <h1>表格生成器</h1>
            <p>自定义列与内容，导出成图</p>
          </div>
          <button className="midautumn-icon-button" type="button" onClick={resetState} title="恢复初始表格" aria-label="恢复初始表格"><RotateCcw size={15} /></button>
        </div>

        <div className="midautumn-toolbar">
          <button className="midautumn-command" type="button" onClick={addRow}><Plus size={15} />新增一行</button>
          <button className="midautumn-command is-primary" type="button" onClick={exportAllPages} disabled={exporting}><Download size={15} />{exporting ? "生成中" : `导出全部（${totalPages} 页）`}</button>
        </div>

        <div className="midautumn-section-label"><span>页面设置</span><span>可编辑</span></div>
        <div className="midautumn-form midautumn-page-settings">
          <label className="midautumn-field"><span>主标题</span><input value={title} onChange={(event) => update({ title: event.target.value })} placeholder="表格标题" /></label>
          <label className="midautumn-field"><span>副标题</span><input value={subtitle} onChange={(event) => update({ subtitle: event.target.value })} placeholder="留空则不显示" /></label>
          <label className="midautumn-field"><span>底部备注</span><input value={footnote} onChange={(event) => update({ footnote: event.target.value })} placeholder="留空则不显示" /></label>
          <div className="tablex-inline-fields">
            <label className="midautumn-field"><span>每页行数</span><input type="number" min={1} max={40} value={pageSize} onChange={(event) => { const next = Math.min(40, Math.max(1, Math.round(Number(event.target.value)) || 1)); update({ pageSize: next }); setPage(Math.min(page, Math.max(0, Math.ceil(rows.length / next) - 1))); }} /></label>
            <label className="midautumn-field"><span>表头颜色</span><input type="color" value={headerColor} onChange={(event) => update({ headerColor: event.target.value })} /></label>
          </div>
          <label className="tablex-check-field"><input type="checkbox" checked={zebra} onChange={(event) => update({ zebra: event.target.checked })} /><span>隔行变色</span></label>
        </div>

        <div className="midautumn-section-label"><span>列设置</span><span>{columns.length} 列</span></div>
        <div className="tablex-column-list">
          {columns.map((column) => (
            <div className="tablex-column-row" key={column.id}>
              <input value={column.name} onChange={(event) => updateColumn(column.id, { name: event.target.value })} placeholder="列名" aria-label="列名" />
              <input type="number" min={1} value={column.weight} onChange={(event) => updateColumn(column.id, { weight: Number(event.target.value) || 1 })} title="列宽占比" aria-label="列宽占比" />
              <select value={column.align} onChange={(event) => updateColumn(column.id, { align: event.target.value as Align })} aria-label="对齐方式">
                <option value="left">左</option>
                <option value="center">中</option>
                <option value="right">右</option>
              </select>
              <button type="button" onClick={() => removeColumn(column.id)} disabled={columns.length <= 1} title="删除该列" aria-label="删除该列"><X size={14} /></button>
            </div>
          ))}
        </div>
        <button className="midautumn-command tablex-add-column" type="button" onClick={addColumn}><Plus size={14} />新增一列</button>

        <div className="midautumn-section-label"><span>数据行</span><span>{rows.length} 行</span></div>
        <div className="midautumn-event-list" ref={listRef}>
          {rows.map((row, index) => (
            <button className={`midautumn-event-choice${index === active ? " is-active" : ""}`} type="button" key={row.id} onClick={() => selectRow(index)}>
              <span className="midautumn-event-number">{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{row.cells[0] || "未填写"}</strong><span>{row.cells[1] || "未填写"}</span></span>
            </button>
          ))}
          {rows.length === 0 && <div className="midautumn-empty-card">还没有数据行</div>}
        </div>

        <div className="midautumn-section-label"><span>当前行</span><span>{current ? `第 ${active + 1} 行` : "无数据"}</span></div>
        {current ? (
          <form className="midautumn-form" onSubmit={(event) => event.preventDefault()} autoComplete="off">
            {columns.map((column, cellIndex) => (
              <label className="midautumn-field" key={column.id}><span>{column.name || `列 ${cellIndex + 1}`}</span><input value={current.cells[cellIndex] ?? ""} onChange={(event) => updateCell(cellIndex, event.target.value)} /></label>
            ))}
          </form>
        ) : (
          <p className="tablex-hint">先「新增一行」，再逐格填写内容。</p>
        )}
        <button className="midautumn-danger" type="button" onClick={removeRow} disabled={!current}><X size={14} />删除当前行</button>
      </aside>

      <section className="midautumn-workspace">
        <div className="midautumn-topbar">
          <div className="midautumn-page-nav">
            <button type="button" onClick={() => goPage(Math.max(0, page - 1))} disabled={page === 0} title="上一页" aria-label="上一页"><ChevronLeft size={17} /></button>
            <span>第 {page + 1} / {totalPages} 页</span>
            <button type="button" onClick={() => goPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} title="下一页" aria-label="下一页"><ChevronRight size={17} /></button>
          </div>
          <button className="midautumn-export" type="button" onClick={exportPage} disabled={exporting}><Download size={15} />{exporting ? "生成中" : "导出本页 PNG"}</button>
        </div>
        <div className="midautumn-canvas-wrap">
          <article className="tablex-sheet" ref={sheetRef}>
            <header className="tablex-sheet-head">
              {title.trim() && <h2>{title}</h2>}
              {(title.trim() || subtitle.trim()) && <p>{subtitle.trim() ? `${subtitle} ｜ ` : ""}第 {String(page + 1).padStart(2, "0")} 页</p>}
              {(title.trim() || subtitle.trim()) && <div />}
            </header>
            <div className="tablex-table-wrap" ref={tableWrapRef} style={{ "--tablex-fit": fitScale } as CSSProperties}>
              <table className="tablex-table" ref={tableRef}>
                <colgroup>
                  {columns.map((column) => <col key={column.id} style={{ width: columnWidth(column.weight) }} />)}
                </colgroup>
                <thead>
                  <tr>{columns.map((column) => <th key={column.id} style={{ background: headerColor }}>{column.name}</th>)}</tr>
                </thead>
                <tbody>
                  {group.length > 0 ? group.map((row, offset) => (
                    <tr key={row.id}>
                      {columns.map((column, cellIndex) => (
                        <td key={column.id} style={{ textAlign: column.align, background: zebra && offset % 2 === 1 ? "#eef2f9" : undefined }}>{row.cells[cellIndex] ?? ""}</td>
                      ))}
                    </tr>
                  )) : (
                    <tr><td colSpan={columns.length} style={{ textAlign: "center", color: "#8a94a6" }}>本页暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {footnote.trim() && <footer className="tablex-foot">{footnote}</footer>}
          </article>
        </div>
      </section>
    </main>
  );
}
