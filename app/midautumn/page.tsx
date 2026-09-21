"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Flower2,
  ImagePlus,
  MapPin,
  Plus,
  RotateCcw,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const storageKey = "toolio-activity-editor-v1";
const legacyStorageKey = "hangzhou-midautumn-editor-v1";
const settingsStorageKey = "toolio-activity-editor-settings-v1";
const defaultTitle = "活动信息";
const defaultSubtitle = "活动参考";
const defaultImage = (index: number) => `${basePath}/midautumn/posters/image${index}.png`;

type SeedRow = readonly [string, string, string, string, string, string, number];
type EditableField = "name" | "when" | "place" | "highlight" | "ticket";

type Activity = {
  id: string;
  name: string;
  when: string;
  place: string;
  highlight: string;
  ticket: string;
  image: string;
};

const SEED: SeedRow[] = [
  ["新物集SPACE中秋灯会", "9月17日-30日", "10:00-21:00", "滨江区 游卡文化公园", "中秋灯会与夜间节日装置，可拍灯笼、夜景和现场布置。", "免票参与", 1],
  ["天目里茑屋书店文具手帐季", "9月18日-20日", "12:00-20:00", "西湖区 天目里茑屋书店", "文具、手帐与阅读主题活动，可逛书店空间与纸品摊位。", "免票参与", 2],
  ["麦当劳 燕云十六声 中秋雅集", "9月24日-10月3日", "以门店公告为准", "上城区 中山中路鼓楼小广场店", "联名主题门店活动，可关注门店装置、联名物料及参与规则。", "套餐或周边按品牌规则", 3],
  ["京杭大运河水上流动市集", "预计9月18日-10月18日", "以现场时间为准", "运河水上巴士及沿线码头", "水上巴士、运河夜游与流动摊位结合，可从船上看运河夜景。", "市集及乘船规则以现场为准", 4],
  ["上城里玩月集", "9月22日-27日", "以现场安排为准", "上城区 上城里数字时尚产业园", "围绕玩月主题的节日市集，可逛摊位、月亮元素与街区夜景。", "免票参与", 5],
  ["湘湖雅韵", "每日开放", "以演出场次为准", "湘湖景区相关演出空间", "湘湖山水与传统文化主题演出活动，可关注水岸、舞台与国风画面。", "票务或预约以官方渠道为准", 6],
  ["2026做書图书市集杭州", "9月24日-27日", "预展14:00-18:00 开放日11:00-18:00", "拱墅区 武林921数字文化产业园", "出版社、书店、设计工作室与文创品牌参与，可逛图书和设计摊位。", "购票入场，规则以售票页为准", 7],
  ["天目里银盐复古市集", "9月24日-27日", "12:00-21:00", "天目里", "银盐摄影、复古物件与生活方式摊位，适合记录胶片感与建筑空间。", "免票参与，体验或商品另计", 8],
  ["西湖月亮船夜游", "9月24日-27日", "19:00-21:00", "光华复旦码头或中山码头出发", "湖上夜游途经湖心亭、三潭印月，可拍月色与西湖夜景。", "需预约或购票，以官方渠道为准", 9],
  ["宝可梦城市漫游杭州站", "8月21日-9月27日", "以点位安排为准", "杭州城市公共空间及合作点位", "主题城市漫游与收集活动，中秋期间为活动尾段，可看主题装置。", "部分点位免票，联动消费按规则", 10],
  ["富义仓富義滿倉集", "9月25日-27日", "以现场安排为准", "富义仓", "仓储遗址、运河空间与节日市集结合，可逛建筑、河岸与摊位。", "部分活动需预约，以现场信息为准", 11],
  ["云阙秋会", "9月19日-10月7日", "以公园安排为准", "拱墅区 小河公园", "市集、拜月、互动与非遗手作等内容，可按现场安排参与。", "免票参与，体验项目可能收费", 12],
  ["大兜路北关市集", "9月25日-27日", "以街区安排为准", "拱墅区 大兜路历史文化街区及北关", "运河老街与文创、餐饮摊位结合，可沿河散步看夜景。", "免票参与，消费自理", 13],
  ["好奇里环球风物集", "9月25日-10月9日", "9:00-21:00", "拱墅区 西湖文化广场", "各地风味、美食、特产和生活好物集合，可按喜好逛展。", "免票参与，无需预约", 14],
  ["新天地食糖冰市糖水市集", "9月25日-27日", "以现场安排为准", "拱墅区 新天地购物中心", "糖水主题市集，含音乐演出、鳌鱼灯巡游与互动内容。", "免票参与，消费自理", 15],
  ["滨江天街甜品节", "9月25日-27日", "以商场安排为准", "杭州滨江天街", "甜品主题联动与节日陈列，可逛橱窗、甜品及商场装置。", "通常免票参与，消费自理", 16],
  ["杭州NGD超星游戏节", "9月25日-26日", "9:30-17:00", "良渚芯云艺术中心", "独立游戏、桌游、赛事与分享活动，可看试玩和游戏展陈。", "单日票价格以售票页为准", 17],
  ["钱塘江中秋大潮", "9月25日-29日", "潮时以预报为准", "钱塘江沿岸观潮点", "中秋前后可在合规观潮点看潮，建议留意潮汐与安全提示。", "部分点位免票，按现场规则", 18],
  ["2026满觉陇桂花节中秋市集", "9月22日-29日", "以现场安排为准", "西湖区 满觉陇核心街区", "手作、器皿、在地风物与植物染等内容，可感受桂花季街区氛围。", "免票参与，体验或消费按现场规则", 19],
  ["献丑了艺术策展", "9月12日-27日", "10:00-19:00", "天目里16号楼2F-3F 丑术馆", "互动装置与趣味展陈，可按预约要求进场参观。", "免票参与，需提前预约", 20],
  ["办公桌甜品主题活动", "9月25日-27日", "13:00-21:00", "上城区 龙湖杭州上城天街 茶话巷", "办公桌与甜品主题活动，现场互动内容以实际安排为准。", "免票参与，无需预约", 21],
  ["哈利波特主题快闪店杭州站", "9月24日-10月25日", "以商场营业时间为准", "杭州大悦城L1东中庭", "主题装置、周边和拍照场景，可按商场指引入场。", "免票进入，商品或部分活动按规则", 22],
  ["FUNDAY手帐集市", "9月25日-27日", "10:00-20:00，末日提前撤场", "拱墅区 新天地购物中心一楼中庭", "原创手作、插画、分装与手帐摊位，可逛纸品和现场陈列。", "免票参与，无需预约", 23],
  ["松弛面包节6.0", "9月25日-27日", "14:00-21:00", "萧山区 奥体印象城L1外街", "多地面包品牌与节日互动，可看屋顶装置、花灯及音乐会安排。", "免票参与，餐饮消费自理", 24],
  ["大樟树青春市集", "9月25日-27日", "全天", "西湖区 大樟树青春市集", "原创手作、文创、花艺香薰和非遗摊位集合。", "免票参与，无需预约", 25],
  ["她掌灶女子碳水节", "9月25日-27日及10月1日-3日", "以现场安排为准", "西湖区 银泰百货西湖店", "面包、饭团、面条等餐饮摊位集合，可作为中秋美食行程参考。", "免票参与，餐饮消费自理", 26],
  ["珍棒手帐集市", "9月30日-10月3日", "以现场安排为准", "拱墅区 杭州大厦B2 ZPARK3展区", "手帐主题市集，可逛贴纸、印章、纸品及摊位陈列。", "免票参与，无需预约", 27],
  ["糖衣爆弹酸甜市集", "9月25日-27日及10月1日-3日", "以商场安排为准", "上城区 银泰百货庆春店", "甜品、烘焙和饮品品牌聚集，可按现场指引参与。", "免票参与，餐饮消费自理", 28],
  ["杭州AI加红楼文化市集", "9月25日-27日", "以现场安排为准", "滨江区 中国杭州低碳科技馆", "科技互动与红楼文化主题市集结合，可看互动展项与文化摊位。", "免票参与，无需预约", 29],
  ["萧山万象汇咖啡节", "9月25日-10月4日", "12:00-21:00", "萧山区 萧山万象汇L1户外南广场", "桂花风味与秋日咖啡主题活动，可逛咖啡、甜品和商场陈列。", "免票参与，餐饮消费自理", 30],
  ["游耕秋造", "9月24日-27日", "以现场安排为准", "余杭区 玉鸟集谷仓广场及大屋顶入口柏油路", "造物、采收与民艺美学主题活动，可看手作与自然材料布置。", "免票参与，无需预约", 31],
];

function makeId(index = 0) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${index}`;
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .replaceAll("免票参与", "Free")
    .replaceAll("免票进入", "Free")
    .replaceAll("免票", "Free")
    .replaceAll("Free参与", "Free")
    .replaceAll("Free进入", "Free")
    .replaceAll("消费", "💰");
}

function normalizeImage(value: unknown, fallback = 1) {
  const image = String(value ?? "");
  if (image.startsWith("data:")) return image;
  const match = image.match(/image\d+\.png$/);
  return match ? `${basePath}/midautumn/posters/${match[0]}` : defaultImage(fallback);
}

function seedActivities() {
  return SEED.map((row, index): Activity => ({
    id: makeId(index),
    name: normalizeText(row[0]),
    when: normalizeText([row[1], row[2]].filter(Boolean).join("  ·  ")),
    place: normalizeText(row[3]),
    highlight: normalizeText(row[4]),
    ticket: normalizeText(row[5]),
    image: defaultImage(row[6]),
  }));
}

function normalizeActivity(value: Partial<Activity>, index: number): Activity {
  return {
    id: value.id || makeId(index),
    name: normalizeText(value.name),
    when: normalizeText(value.when),
    place: normalizeText(value.place),
    highlight: normalizeText(value.highlight),
    ticket: normalizeText(value.ticket),
    image: normalizeImage(value.image, (index % 31) + 1),
  };
}

function FlowerLine({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <span className={`midautumn-floral${mirrored ? " is-mirrored" : ""}`} aria-hidden="true">
      <Flower2 /><Flower2 /><Flower2 />
    </span>
  );
}

export default function MidautumnPage() {
  const [activities, setActivities] = useState<Activity[]>(seedActivities);
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(0);
  const [pageTitle, setPageTitle] = useState(defaultTitle);
  const [pageSubtitle, setPageSubtitle] = useState(defaultSubtitle);
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef<HTMLElement | null>(null);

  const totalPages = Math.max(1, Math.ceil(activities.length / 3));
  const current = activities[active];
  const displayTitle = pageTitle.trim() || defaultTitle;
  const displaySubtitle = pageSubtitle.trim() || defaultSubtitle;
  const group = useMemo(() => activities.slice(page * 3, page * 3 + 3), [activities, page]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey) || window.localStorage.getItem(legacyStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setActivities(parsed.map((item, index) => normalizeActivity(item, index)));
      }
      const savedSettings = window.localStorage.getItem(settingsStorageKey);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings && typeof parsedSettings === "object") {
          if (typeof parsedSettings.title === "string") setPageTitle(parsedSettings.title);
          if (typeof parsedSettings.subtitle === "string") setPageSubtitle(parsedSettings.subtitle);
        }
      }
    } catch {
      // Keep the bundled seed data if local storage is unavailable or malformed.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(activities));
      window.localStorage.setItem(settingsStorageKey, JSON.stringify({ title: pageTitle, subtitle: pageSubtitle }));
    } catch {
      // A replacement image can exceed localStorage limits; the in-memory edit still works.
    }
  }, [activities, hydrated, pageTitle, pageSubtitle]);

  useEffect(() => {
    if (activities.length === 0) {
      setActive(0);
      setPage(0);
      return;
    }
    setActive((value) => Math.min(value, activities.length - 1));
    setPage((value) => Math.min(value, Math.max(0, Math.ceil(activities.length / 3) - 1)));
  }, [activities.length]);

  const updateField = (field: EditableField, value: string) => {
    if (!current) return;
    const nextValue = normalizeText(value);
    setActivities((items) => items.map((item, index) => (index === active ? { ...item, [field]: nextValue } : item)));
  };

  const selectActivity = (index: number) => {
    setActive(index);
    setPage(Math.floor(index / 3));
  };

  const addActivity = () => {
    setActivities((items) => [
      ...items,
      { id: makeId(items.length), name: "新活动", when: "日期与时间待确认", place: "地点待确认", highlight: "补充活动亮点。", ticket: "以现场规则为准", image: defaultImage(1) },
    ]);
    const nextIndex = activities.length;
    setActive(nextIndex);
    setPage(Math.floor(nextIndex / 3));
  };

  const removeActivity = () => {
    if (!current || !window.confirm(`删除“${current.name}”？`)) return;
    setActivities((items) => items.filter((_, index) => index !== active));
    setActive((value) => Math.max(0, Math.min(value, activities.length - 2)));
  };

  const resetActivities = () => {
    if (!window.confirm("恢复为初始活动清单？当前编辑内容会被覆盖。")) return;
    setActivities(seedActivities());
    setActive(0);
    setPage(0);
    setPageTitle(defaultTitle);
    setPageSubtitle(defaultSubtitle);
  };

  const replacePoster = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !current) return;
    const reader = new FileReader();
    reader.onload = () => {
      setActivities((items) => items.map((item, index) => (index === active ? { ...item, image: String(reader.result) } : item)));
    };
    reader.readAsDataURL(file);
  };

  const exportPage = async () => {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(sheetRef.current, { scale: 3, useCORS: true, backgroundColor: "#fffdfa", logging: false });
      const link = document.createElement("a");
      const filename = displayTitle.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80);
      link.download = `${filename}-${String(page + 1).padStart(2, "0")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="midautumn-app">
      <header className="midautumn-header">
        <a href={`${basePath}/`} className="midautumn-header-icon" aria-label="返回工具集"><ArrowLeft size={22} /></a>
        <div className="midautumn-brand-mark"><span>TOOLIO / 02</span><strong>活动海报</strong></div>
        <div className="midautumn-header-spacer" aria-hidden="true" />
      </header>
      <aside className="midautumn-editor">
        <div className="midautumn-brand">
          <div>
            <h1>活动海报编辑器</h1>
            <p>通用内容与成图编辑</p>
          </div>
          <button className="midautumn-icon-button" type="button" onClick={resetActivities} title="恢复初始内容" aria-label="恢复初始内容"><RotateCcw size={15} /></button>
        </div>

        <div className="midautumn-toolbar">
          <button className="midautumn-command" type="button" onClick={addActivity}><Plus size={15} />新增活动</button>
          <button className="midautumn-command is-primary" type="button" onClick={exportPage} disabled={exporting}><Download size={15} />{exporting ? "生成中" : "导出本页"}</button>
        </div>

        <div className="midautumn-section-label"><span>页面设置</span><span>可编辑</span></div>
        <div className="midautumn-form midautumn-page-settings">
          <label className="midautumn-field"><span>主标题</span><input value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} placeholder={defaultTitle} /></label>
          <label className="midautumn-field"><span>副标题</span><input value={pageSubtitle} onChange={(event) => setPageSubtitle(event.target.value)} placeholder={defaultSubtitle} /></label>
        </div>

        <div className="midautumn-section-label"><span>活动列表</span><span>{activities.length} 条</span></div>
        <div className="midautumn-event-list">
          {activities.map((activity, index) => (
            <button className={`midautumn-event-choice${index === active ? " is-active" : ""}`} type="button" key={activity.id} onClick={() => selectActivity(index)}>
              <span className="midautumn-event-number">{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{activity.name || "未命名活动"}</strong><span>{activity.when || "未填写时间"}</span></span>
            </button>
          ))}
        </div>

        <div className="midautumn-section-label"><span>当前活动</span><span>{current ? `第 ${active + 1} 条` : "无活动"}</span></div>
        <form className="midautumn-form" onSubmit={(event) => event.preventDefault()} autoComplete="off">
          <label className="midautumn-field"><span>活动名称</span><input value={current?.name || ""} onChange={(event) => updateField("name", event.target.value)} /></label>
          <label className="midautumn-field"><span>日期与时间</span><input value={current?.when || ""} onChange={(event) => updateField("when", event.target.value)} /></label>
          <label className="midautumn-field"><span>地点</span><input value={current?.place || ""} onChange={(event) => updateField("place", event.target.value)} /></label>
          <label className="midautumn-field"><span>看点</span><textarea value={current?.highlight || ""} onChange={(event) => updateField("highlight", event.target.value)} /></label>
          <label className="midautumn-field"><span>🎫</span><input value={current?.ticket || ""} onChange={(event) => updateField("ticket", event.target.value)} /></label>
          <div className="midautumn-field"><span>活动海报</span><div className="midautumn-image-row"><span>{current?.image?.startsWith("data:") ? "已替换本地图片" : (current?.image?.split("/").pop() || "未选择图片")}</span><label className="midautumn-file-button" htmlFor="midautumn-poster-file"><ImagePlus size={14} />更换海报</label><input id="midautumn-poster-file" type="file" accept="image/*" hidden onChange={replacePoster} /></div></div>
        </form>
        <button className="midautumn-danger" type="button" onClick={removeActivity} disabled={!current}><X size={14} />删除当前活动</button>
      </aside>

      <section className="midautumn-workspace">
        <div className="midautumn-topbar">
          <div className="midautumn-page-nav"><button type="button" onClick={() => { const nextPage = Math.max(0, page - 1); setPage(nextPage); setActive(Math.min(activities.length - 1, nextPage * 3)); }} disabled={page === 0} title="上一页" aria-label="上一页"><ChevronLeft size={17} /></button><span>{page + 1} / {totalPages}</span><button type="button" onClick={() => { const nextPage = Math.min(totalPages - 1, page + 1); setPage(nextPage); setActive(Math.min(activities.length - 1, nextPage * 3)); }} disabled={page >= totalPages - 1} title="下一页" aria-label="下一页"><ChevronRight size={17} /></button></div>
          <button className="midautumn-export" type="button" onClick={exportPage} disabled={exporting}><Download size={15} />{exporting ? "生成中" : "导出 PNG"}</button>
        </div>
        <div className="midautumn-canvas-wrap">
          <article className="midautumn-sheet" ref={sheetRef}>
            <FlowerLine /><FlowerLine mirrored />
            <header className="midautumn-sheet-head"><h2>{displayTitle}</h2><p>{displaySubtitle}&nbsp; | &nbsp;第 {String(page + 1).padStart(2, "0")} 页</p><div /></header>
            <div className="midautumn-items">
              {group.length > 0 ? group.map((activity, index) => (
                <section className="midautumn-item" key={activity.id}>
                  <div className="midautumn-item-copy">
                    <h3>{page * 3 + index + 1}. {activity.name}</h3>
                    <div className="midautumn-details">
                      <div className="midautumn-detail is-temporal"><span><CalendarDays size={10} /></span><p>{activity.when}</p></div>
                      <div className="midautumn-detail"><span><MapPin size={10} /></span><p>{activity.place}</p></div>
                      <div className="midautumn-detail is-highlight"><span><Sparkles size={10} /></span><p>{activity.highlight}</p></div>
                      <div className="midautumn-detail is-participation"><span><Ticket size={10} /></span><p>🎫&nbsp; {activity.ticket}</p></div>
                    </div>
                  </div>
                  <img className="midautumn-poster" src={activity.image} alt={`${activity.name} 海报`} />
                </section>
              )) : <div className="midautumn-empty-card">本页还没有活动</div>}
            </div>
            <footer className="midautumn-sheet-foot">活动安排可能调整，出发前请通过主办方官方渠道确认</footer>
          </article>
        </div>
      </section>
    </main>
  );
}
