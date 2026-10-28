"use client";

import { ChangeEvent, CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  ListPlus,
  RotateCcw,
  X,
} from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const storageKey = "toolio-table-editor-v5";

type Align = "left" | "center" | "right";

type Column = { id: string; name: string; weight: number; align: Align };

type Row = { id: string; kind?: "row" | "group"; label?: string; cells: string[] };

type SeedItem = { group: string } | { cells: string[] };

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
  { id: "col-2", name: "书店", weight: 21, align: "center" },
  { id: "col-3", name: "位置", weight: 22, align: "left" },
  { id: "col-4", name: "特点", weight: 32, align: "left" },
  { id: "col-5", name: "日期", weight: 9, align: "center" },
  { id: "col-6", name: "照片", weight: 9, align: "center" },
];

// 杭州值得逛的独立书店（39 家，按行政区分组），group 项渲染为通栏分组行，可自由编辑或清空。
const SEED_ITEMS: SeedItem[] = [
  { group: "西湖区 · 共 13 家" },
  { cells: ["1", "茑屋书店（天目里店）", "天目里2-4号楼", "日系选品，艺术画册和文创很强", "", ""] },
  { cells: ["2", "西溪·果麦书店", "西溪湿地福堤北端（近北门）", "临水而建的白盒子建筑，馆藏2万余册，设月光影院、诗歌留言墙", "", ""] },
  { cells: ["3", "麦家理想谷", "文二西路683号西溪文创园11栋", "作家麦家的公益书房，经典藏书，咖啡茶免费自取，周一闭馆", "", ""] },
  { cells: ["4", "纯真年代书吧", "保俶塔前山路8号（宝石山腰）", "杭州早期书吧，坐拥西湖全景，文学沙龙名店，9:00-22:00", "", ""] },
  { cells: ["5", "晓风书屋（北山街店）", "北山路56号（新新饭店旁）", "陪伴杭州30年的最老牌民营书店，历史最悠久的门店之一", "", ""] },
  { cells: ["6", "晓风书屋（丝绸博物馆店）", "玉皇山路73号中国丝绸博物馆内", "书籍+文创+咖啡一体的博物馆系书店，陈列精致", "", ""] },
  { cells: ["7", "阅见西湖", "曙光路184号", "原西湖区文化馆改造，晓风书屋运营，约2500㎡复合文化空间，讲座展览密集", "", ""] },
  { cells: ["8", "浙江书房", "葛岭路1号（北山街）", "民国风建筑（智果禅寺遗址），藏书+茶室+小院，闹中取静", "", ""] },
  { cells: ["9", "会饮书店", "三墩镇宝嘉誉府8幢109", "人文社科书店，卖书也卖酒，店名取自柏拉图《会饮》，周四店休", "", ""] },
  { cells: ["10", "乐园书店", "留和路东信和创园64幢2F", "旧书店，让被时代冲刷掉的旧纸重新发光，10:00-22:00", "", ""] },
  { cells: ["11", "尤利西斯书店", "公元里5幢二层", "严肃文学书店，曾只卖《尤利西斯》一种书，现主营西方现代主义文学", "", ""] },
  { cells: ["12", "不熟艺术书店", "之江文化中心B1", "策展型艺术书店，主营艺术、设计、摄影类及青年艺术家衍生品", "", ""] },
  { cells: ["13", "乌托邦书店（西投银泰店）", "西投银泰城2L", "浙江本土独立书店分店，人文社科与珍藏本，10:00-22:00", "", ""] },
  { group: "拱墅区 · 共 7 家" },
  { cells: ["14", "单向空间（远洋乐堤港店）", "丽水路58号远洋乐堤港二期1-3F", "许知远联合创立，设畅销榜与滞销榜，文化沙龙丰富，10:00-22:00", "", ""] },
  { cells: ["15", "我的精神家园·王小波书店", "延安路468号1号楼1楼", "王小波主题书店，王小波作品与爱读之书齐备，10:00-22:00", "", ""] },
  { cells: ["16", "晓风书屋（桥西直街店）", "小河路桥西直街30号", "运河畔老牌门店，与南派三书相邻，盗墓文化氛围浓厚，9:00-21:00", "", ""] },
  { cells: ["17", "风雨书店", "狮虎桥路26号", "温暖系二手书店，处处细节，1/2号线凤起路可达", "", ""] },
  { cells: ["18", "再见城市", "小河东河下66-7号", "小河直街旧书店，民国旧书旧物古着，重现昨日摩登，周二店休", "", ""] },
  { cells: ["19", "乌托邦书店（孩儿巷店）", "孩儿巷109号", "人文社科、艺术设计与生活美学精选，2016年创立的本土品牌", "", ""] },
  { cells: ["20", "大兜商店", "经纬天地创意园1A3三楼321室", "风格化艺术商店，小众杂志、艺术书籍、黑胶唱片与中古好物", "", ""] },
  { group: "上城区 · 共 7 家" },
  { cells: ["21", "南宋书房", "中山中路6号（鼓楼旁）", "宋韵主题复合书店，青砖黑瓦+玻璃台阶，南宋邮局可寄明信片", "", ""] },
  { cells: ["22", "牡蛎书店", "海月路18号", "城南文学小书店，铁路山与钱塘江之间，选品见主理人品味，周二闭店", "", ""] },
  { cells: ["23", "梦蝶书店", "抚宁巷9号-5", "二手书+黑胶唱片+一架子蝴蝶标本的小小书店，周二店休", "", ""] },
  { cells: ["24", "大五书店", "凤山路79号2幢8号", "电影主题旧书店，咖啡以电影命名，店猫叫阿飞，13:00-24:00", "", ""] },
  { cells: ["25", "南山书屋", "南山路210号", "毗邻中国美院的民国别墅书屋，美术、绘画、摄影类为主，9:30-20:00", "", ""] },
  { cells: ["26", "乌托邦书店（延安路店）", "延安路297-1号", "精选人文社科与艺术设计图书的本土独立书店", "", ""] },
  { cells: ["27", "庆春路购书中心", "庆春路217号", "杭州新华书店旗舰书城，大型综合购书点，教辅文艺齐全", "", ""] },
  { group: "滨江区 · 共 4 家" },
  { cells: ["28", "钟书阁", "星光国际广场4栋2层", "号称杭州最美书店，镜面天花板魔法空间，童趣书架适合亲子", "", ""] },
  { cells: ["29", "爱读客二手书店", "储仓快杰大楼4层4051", "400㎡仓储式二手书店，藏书超10万册，无分类适合淘书", "", ""] },
  { cells: ["30", "OPEN the DOOR", "CC流量谷C102", "设计感艺术书店，艺术书+咖啡+放映厅+唱片试听，11:00-19:00", "", ""] },
  { cells: ["31", "风雨喫茶", "保利天汇1055c", "以漫画为核心的纸漫王国，借阅+手办周边综合体验，10:00-22:00", "", ""] },
  { group: "萧山区 · 共 2 家" },
  { cells: ["32", "普通读者书店", "市心北路归谷国际中心1楼", "复古绿色调的人文书店，文史社科选品有品味，活动口碑好，10:00-22:00", "", ""] },
  { cells: ["33", "光画堂（1908阅览室）", "江寺公园西北角", "公益性摄影图书馆，2500余册专业摄影书免费开放，需预约，周三至周日", "", ""] },
  { group: "余杭区 · 共 6 家" },
  { cells: ["34", "单向空间（良渚大谷仓店）", "良渚街道玉鸟集1-101", "清水混凝土大谷仓，良渚的小镇客厅，可开合屋脊引自然光，10:00-21:00", "", ""] },
  { cells: ["35", "小风光书店", "亲橙里购物中心商业街", "铁皮集装箱改建的在地人文书店，关注实际问题与人的境况", "", ""] },
  { cells: ["36", "鲍贝书屋", "问溪路99号", "200年历史清代徽派古建筑中的书屋，古建筑博物馆群一景，9:30-21:30", "", ""] },
  { cells: ["37", "晓风书屋（求是合集）", "仓前龙舟北路76号浙大校友企业总部经济园", "选品丰富偏商业与流行，二楼画作与历代绘画大系，近梦想小镇", "", ""] },
  { cells: ["38", "猫的天空之城（梦想小镇店）", "仓前梦想小镇创业大街29栋", "文创+明信片概念书店，高挑玻璃建筑门前是油菜花田", "", ""] },
  { cells: ["39", "西溪北苑新华书店（文字里）", "五常街道西溪北苑1幢102室", "临街社区书店，余杭余阅书吧，免费阅览自习+自助借还", "", ""] },
];

function makeId(index = 0) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${index}`;
}

function defaultState(): TableState {
  return {
    title: "杭州书店地图",
    subtitle: "39 家独立书店 · 按区域打卡",
    footnote: "营业时间随门店调整，出行前建议先确认",
    headerColor: "#1f5fa8",
    zebra: false,
    pageSize: 10,
    columns: SEED_COLUMNS.map((column) => ({ ...column })),
    rows: SEED_ITEMS.map((item, index): Row =>
      "group" in item
        ? { id: makeId(index), kind: "group", label: item.group, cells: [] }
        : { id: makeId(index), cells: [...item.cells] },
    ),
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
    ? value.rows.map((row, index): Row => {
        const isGroup = row?.kind === "group";
        return {
          id: row?.id || makeId(index),
          kind: isGroup ? "group" : "row",
          label: isGroup ? String(row?.label ?? "") : undefined,
          cells: isGroup ? [] : columns.map((_, cellIndex) => String(row?.cells?.[cellIndex] ?? "")),
        };
      })
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

// Every cell renders its text through this block so the vertical padding can live
// here instead of on the cell itself (see .tablex-cell in globals.css).
const CELL_CLASS = "tablex-cell";

const BASELINE_SAMPLE = "国Hg";
const BLANK_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// html2canvas derives the glyph baseline from a hidden inline probe
// (img.offsetTop - span.offsetTop + 2). In this layout that number overshoots the
// font's own ascent by roughly half a line, so every run of text lands lower in
// the exported PNG than in the live sheet — inside short table cells it reads as
// "not vertically centered". Both numbers are measurable, so the clone can cancel
// the gap exactly instead of guessing a constant.
function baselineOvershoot(doc: Document, fontFamily: string, fontSize: string) {
  const holder = doc.createElement("div");
  holder.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;margin:0;padding:0;";
  holder.style.fontFamily = fontFamily;
  holder.style.fontSize = fontSize;
  const probe = doc.createElement("span");
  probe.style.cssText = "margin:0;padding:0;";
  probe.textContent = "Hidden Text";
  const marker = doc.createElement("img");
  marker.src = BLANK_GIF;
  marker.width = 1;
  marker.height = 1;
  marker.style.cssText = "margin:0;padding:0;vertical-align:baseline;";
  holder.append(probe, marker);
  doc.body.appendChild(holder);
  const baseline = marker.offsetTop - probe.offsetTop + 2;
  holder.remove();

  const ctx = doc.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${fontSize} ${fontFamily}`;
  const ascent = ctx.measureText(BASELINE_SAMPLE).fontBoundingBoxAscent;
  return Number.isFinite(ascent) ? baseline - ascent : 0;
}

// A relative `top` moves the paint only, so row heights and cell borders stay
// exactly where the browser laid them out.
function liftTextIntoPlace(doc: Document, root: Element) {
  const targets = [
    ...root.querySelectorAll<HTMLElement>(".tablex-sheet-head h2, .tablex-sheet-head p, .tablex-foot"),
    ...root.querySelectorAll<HTMLElement>(`.tablex-table .${CELL_CLASS}`),
  ];
  const view = doc.defaultView;
  if (!view) return;
  const measured = new Map<string, number>();
  targets.forEach((node) => {
    const styles = view.getComputedStyle(node);
    const key = `${styles.fontFamily}|${styles.fontSize}`;
    if (!measured.has(key)) measured.set(key, baselineOvershoot(doc, styles.fontFamily, styles.fontSize));
    const shift = measured.get(key) ?? 0;
    if (shift <= 0.5) return;
    node.style.position = "relative";
    node.style.top = `${-shift}px`;
  });
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

  const addGroup = () => {
    const nextIndex = rows.length;
    setState((prev) => ({ ...prev, rows: [...prev.rows, { id: makeId(prev.rows.length), kind: "group", label: "新分组", cells: [] }] }));
    setActive(nextIndex);
    setPage(Math.floor(nextIndex / pageSize));
  };

  const removeRow = () => {
    if (!current || !window.confirm(`删除第 ${active + 1} 行？`)) return;
    setState((prev) => ({ ...prev, rows: prev.rows.filter((_, index) => index !== active) }));
    setActive((value) => Math.max(0, Math.min(value, rows.length - 2)));
  };

  const updateCell = (cellIndex: number, value: string) =>
    current?.kind === "group" ? undefined :
    setState((prev) => ({ ...prev, rows: prev.rows.map((row, index) => (index === active ? { ...row, cells: row.cells.map((cell, i) => (i === cellIndex ? value : cell)) } : row)) }));

  const updateGroupLabel = (value: string) =>
    setState((prev) => ({ ...prev, rows: prev.rows.map((row, index) => (index === active ? { ...row, label: value } : row)) }));

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
      onclone: (doc) => {
        const cloned = doc.querySelector(".tablex-sheet");
        if (cloned) liftTextIntoPlace(doc, cloned);
      },
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
          <button className="midautumn-command" type="button" onClick={addGroup}><ListPlus size={15} />新增分组</button>
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
              <span><strong>{row.kind === "group" ? (row.label || "分组") : (row.cells[0] || "未填写")}</strong><span>{row.kind === "group" ? "分组标题行" : (row.cells[1] || "未填写")}</span></span>
            </button>
          ))}
          {rows.length === 0 && <div className="midautumn-empty-card">还没有数据行</div>}
        </div>

        <div className="midautumn-section-label"><span>当前行</span><span>{current ? `第 ${active + 1} 行` : "无数据"}</span></div>
        {current ? (
          <form className="midautumn-form" onSubmit={(event) => event.preventDefault()} autoComplete="off">
            {current.kind === "group" ? (
              <label className="midautumn-field"><span>分组标题</span><input value={current.label ?? ""} onChange={(event) => updateGroupLabel(event.target.value)} placeholder="如：西湖区 · 共 13 家" /></label>
            ) : columns.map((column, cellIndex) => (
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
                  <tr>{columns.map((column) => <th key={column.id} style={{ background: headerColor }}><span className={CELL_CLASS}>{column.name}</span></th>)}</tr>
                </thead>
                <tbody>
                  {group.length > 0 ? group.map((row, offset) => (
                    row.kind === "group" ? (
                      <tr key={row.id} className="tablex-group-row">
                        <td colSpan={columns.length}><span className={CELL_CLASS}>{row.label}</span></td>
                      </tr>
                    ) : (
                      <tr key={row.id}>
                        {columns.map((column, cellIndex) => (
                          <td key={column.id} style={{ textAlign: column.align, background: zebra && offset % 2 === 1 ? "#eef2f9" : undefined }}><span className={CELL_CLASS}>{row.cells[cellIndex] ?? ""}</span></td>
                        ))}
                      </tr>
                    )
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
