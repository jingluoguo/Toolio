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
const guoqingStorageKey = "toolio-activity-editor-v1-guoqing";
const guoqingSettingsStorageKey = "toolio-activity-editor-settings-v1-guoqing";
const guoqingImageDir = "midautumn/杭州国庆活动";

type TabKey = "midautumn" | "guoqing";

type TabConfig = {
  key: TabKey;
  label: string;
  title: string;
  subtitle: string;
  storageKey: string;
  legacyStorageKeys: string[];
  settingsStorageKey: string;
};

const TABS: TabConfig[] = [
  { key: "midautumn", label: "中秋活动", title: "活动信息", subtitle: "活动参考", storageKey, legacyStorageKeys: [legacyStorageKey], settingsStorageKey },
  { key: "guoqing", label: "国庆活动", title: "国庆活动", subtitle: "杭州国庆参考", storageKey: guoqingStorageKey, legacyStorageKeys: [], settingsStorageKey: guoqingSettingsStorageKey },
];

const defaultTitle = "活动信息";
const defaultSubtitle = "活动参考";
const defaultImage = (index: number) => `${basePath}/midautumn/posters/image${index}.png`;
const guoqingImage = (file: string) => `${basePath}/${guoqingImageDir}/${file}`;

type SeedRow = readonly [string, string, string, string, string, string, number | string];
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

const GUOQING_SEED: SeedRow[] = [
  ["西湖景区·满觉陇桂花节", "10月1日-11日", "11:00-21:00", "西湖区 满觉陇路", "满陇桂雨、文创市集与山里咖啡茶馆，穿浅色或汉服拍照出片，杭州秋日松弛感天花板。", "免费", "满觉陇.jpg"],
  ["西溪湿地·火柿节", "9月下旬-10月中旬（国庆全程）", "以景区公告为准", "西湖区 天目山路 西溪湿地", "柿子采摘体验、渔事表演、摇橹船与秋日限定市集，亲子、闺蜜、摄影都适合。", "门票80元（杭州公园卡免费）", "西溪火柿节.jpg"],
  ["虎跑公园·泉颂华诞 山河安澜", "9月25日-10月7日（NPC互动10月1日-6日，快闪10月1日-7日）", "以公园安排为准", "西湖区 虎跑路39号", "听泉赏桂、宋韵市集、花神与卖花郎NPC巡游及民乐快闪，低预算文艺路线首选。", "门票15元", "虎跑公园.jpg"],
  ["杭钢公园·赛博漫游嘉年华", "主活动10月1日-7日，机器人展至10月18日", "10:00-18:30", "拱墅区 杭钢公园（焦炉/中央大草坪/二号高炉）", "宇树、智元等机器狗与机器人拳击（10月1日-2日）、跳舞（10月6日）、新能源车夜灯车库与亲子市集，科技博主和工业风拍照必去。", "机器人展早鸟22.8元起；焦炉迷宫28元；国庆套票双人85元/亲子69元", "杭钢公园.jpg"],
  ["东坡大剧院·国庆奇妙夜（机器人演唱会）", "10月1日-7日，每天三场", "14:00 / 16:00 / 19:00", "上城区 东坡大剧院（湖滨银泰in77）", "机器人鼓阵、机器狗醒狮、机器人武术、脱口秀与京剧选段，前厅还能免费和机器人对话。", "129-459元，优惠价90元起", "杭州大剧院.png"],
  ["中国动漫博物馆·国庆特展", "10月1日-7日", "9:30-16:30", "滨江区 白马湖路375号", "国产动画经典展、互动体验区与动漫市集，二次元和亲子必冲。", "免费（需提前预约）", "中国动漫博物馆.jpg"],
  ["湘湖雅韵·双节游园会+水上实景演出", "9月25日-10月7日，夜演19:40", "以演出场次为准", "萧山区 湘湖湖山广场/湘湖雅韵演艺中心", "国风巡游、风物市集、灯谜、水上实景大秀及无人机与激光水幕，约会和闺蜜夜游首选。", "101元起（单人101/双人188/三人268）", "湘湖.jpg"],
  ["钱江新城灯光秀·国庆特别版", "10月1日-7日，每晚18:30/19:30/20:30", "以官方发布为准", "上城区 钱江新城城市阳台", "高楼灯光秀与钱塘江夜景，国庆主题灯光，0元仪式感拉满。", "免费", "钱江新城.jpg"],
  ["天目里·沿山河集 赴桂5.0", "10月1日-5日", "以现场安排为准", "西湖区 天目里中心广场", "桂花主题市集与手作、香氛、植物、独立刊物，年轻人、探店博主和文艺风最适配。", "免费", "天目里沿山河集.jpg"],
  ["小河公园·罐罐计划", "市集9月25日-10月7日；10月1日15:00户外瑜伽", "12:00-21:00", "拱墅区 小河路118号 小河公园", "工业风老仓库、运河露营、竹编展与LIVEHOUSE，松弛感拉满。", "市集免费，部分展览单独购票", "小河公园.png"],
  ["小河直街·小河映月国潮夜游", "10月1日-7日", "以街区安排为准", "拱墅区 小河直街历史文化街区", "水上圆月、竹筏灯影、国风市集、江湖Bingo打卡与NPC互动，汉服党狂喜。", "免费（部分互动/游船另付）", "小河直街.jpg"],
  ["桥西历史文化街区·非遗市集", "10月1日-7日", "以街区安排为准", "拱墅区 桥西直街", "非遗手作体验、传统小吃与运河游船，适合带长辈的文化向行程。", "免费", "桥西历史文化街区.jpg"],
  ["星光大道·水岸音乐节", "10月1日-7日（10月4日除外）", "以现场安排为准", "滨江区 江南大道228号", "江风、音乐与落日组合，年轻人和学生党适合。", "免费", "星光大道.jpg"],
  ["杭州乐园·彩色狂欢", "10月1日-7日", "以园区公告为准", "萧山区 风情大道", "游乐设施、彩色演艺与巡游，年轻情侣和大学生组队合适。", "提前票138元/人，当日169元；双人提前258元", "彩色狂欢.jpeg"],
  ["烂苹果乐园·亲子狂欢", "10月1日-7日", "以园区公告为准", "萧山区 风情大道", "室内亲子乐园、魔法秀与互动剧，下雨天带娃备选。", "提前票98元/人，当日128元", "烂苹果乐园.jpeg"],
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
    .replaceAll("免费", "Free")
    .replaceAll("Free参与", "Free")
    .replaceAll("Free进入", "Free")
    .replaceAll("消费", "💰");
}

function normalizeTicket(value: unknown) {
  return normalizeText(value).replaceAll("元", "r");
}

function normalizeImage(value: unknown, fallback = 1) {
  const image = String(value ?? "");
  if (image.startsWith("data:")) return image;
  if (image.includes(guoqingImageDir)) return image;
  const match = image.match(/image\d+\.png$/);
  return match ? `${basePath}/midautumn/posters/${match[0]}` : defaultImage(fallback);
}

function seedActivities(tab: TabKey) {
  const rows = tab === "guoqing" ? GUOQING_SEED : SEED;
  return rows.map((row, index): Activity => ({
    id: makeId(index),
    name: normalizeText(row[0]),
    when: normalizeText([row[1], row[2]].filter(Boolean).join("  ·  ")),
    place: normalizeText(row[3]),
    highlight: normalizeText(row[4]),
    ticket: normalizeTicket(row[5]),
    image: typeof row[6] === "number" ? defaultImage(row[6]) : guoqingImage(row[6]),
  }));
}

function normalizeActivity(value: Partial<Activity>, index: number): Activity {
  return {
    id: value.id || makeId(index),
    name: normalizeText(value.name),
    when: normalizeText(value.when),
    place: normalizeText(value.place),
    highlight: normalizeText(value.highlight),
    ticket: normalizeTicket(value.ticket),
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

type TabState = { active: number; page: number; title: string; subtitle: string };

const initialTabState = (config: TabConfig): TabState => ({ active: 0, page: 0, title: config.title, subtitle: config.subtitle });

const initialTabRecord = () => Object.fromEntries(TABS.map((config) => [config.key, initialTabState(config)])) as Record<TabKey, TabState>;

export default function MidautumnPage() {
  const [tab, setTab] = useState<TabKey>("midautumn");
  const [lists, setLists] = useState<Record<TabKey, Activity[]>>({ midautumn: seedActivities("midautumn"), guoqing: seedActivities("guoqing") });
  const [tabState, setTabState] = useState<Record<TabKey, TabState>>(initialTabRecord);
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef<HTMLElement | null>(null);

  const tabConfig = TABS.find((config) => config.key === tab) || TABS[0];
  const activities = lists[tab];
  const { active, page, title: pageTitle, subtitle: pageSubtitle } = tabState[tab];

  const setActive = (value: number | ((prev: number) => number)) => {
    setTabState((state) => ({ ...state, [tab]: { ...state[tab], active: typeof value === "function" ? (value as (prev: number) => number)(state[tab].active) : value } }));
  };

  const setPage = (value: number | ((prev: number) => number)) => {
    setTabState((state) => ({ ...state, [tab]: { ...state[tab], page: typeof value === "function" ? (value as (prev: number) => number)(state[tab].page) : value } }));
  };

  const setPageTitle = (value: string) => setTabState((state) => ({ ...state, [tab]: { ...state[tab], title: value } }));
  const setPageSubtitle = (value: string) => setTabState((state) => ({ ...state, [tab]: { ...state[tab], subtitle: value } }));

  const setActivities = (updater: (items: Activity[]) => Activity[]) => {
    setLists((state) => ({ ...state, [tab]: updater(state[tab]) }));
  };

  const totalPages = Math.max(1, Math.ceil(activities.length / 3));
  const current = activities[active];
  const displayTitle = pageTitle.trim() || defaultTitle;
  const displaySubtitle = pageSubtitle.trim() || defaultSubtitle;
  const group = useMemo(() => activities.slice(page * 3, page * 3 + 3), [activities, page]);

  useEffect(() => {
    try {
      for (const config of TABS) {
        const saved = window.localStorage.getItem(config.storageKey) || config.legacyStorageKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setLists((state) => ({ ...state, [config.key]: parsed.map((item: Partial<Activity>, index: number) => normalizeActivity(item, index)) }));
          }
        }
        const savedSettings = window.localStorage.getItem(config.settingsStorageKey);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          if (parsedSettings && typeof parsedSettings === "object") {
            setTabState((state) => ({
              ...state,
              [config.key]: {
                ...state[config.key],
                title: typeof parsedSettings.title === "string" ? parsedSettings.title : state[config.key].title,
                subtitle: typeof parsedSettings.subtitle === "string" ? parsedSettings.subtitle : state[config.key].subtitle,
              },
            }));
          }
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
      for (const config of TABS) {
        window.localStorage.setItem(config.storageKey, JSON.stringify(lists[config.key]));
        window.localStorage.setItem(config.settingsStorageKey, JSON.stringify({ title: tabState[config.key].title, subtitle: tabState[config.key].subtitle }));
      }
    } catch {
      // A replacement image can exceed localStorage limits; the in-memory edit still works.
    }
  }, [lists, tabState, hydrated]);

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
    const nextValue = field === "ticket" ? normalizeTicket(value) : normalizeText(value);
    setActivities((items) => items.map((item, index) => (index === active ? { ...item, [field]: nextValue } : item)));
  };

  const selectActivity = (index: number) => {
    setActive(index);
    setPage(Math.floor(index / 3));
  };

  const addActivity = () => {
    const fallbackImage = tab === "guoqing" ? guoqingImage(GUOQING_SEED[0][6] as string) : defaultImage(1);
    setActivities((items) => [
      ...items,
      { id: makeId(items.length), name: "新活动", when: "日期与时间待确认", place: "地点待确认", highlight: "补充活动亮点。", ticket: "以现场规则为准", image: fallbackImage },
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
    if (!window.confirm(`恢复「${tabConfig.label}」初始活动清单？当前编辑内容会被覆盖。`)) return;
    setLists((state) => ({ ...state, [tab]: seedActivities(tab) }));
    setTabState((state) => ({ ...state, [tab]: initialTabState(tabConfig) }));
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

  const captureSheet = async () => {
    if (!sheetRef.current) return null;
    try {
      await document.fonts.ready;
    } catch {
      // Font availability check is best-effort; capture regardless.
    }
    // html2canvas ignores object-fit:cover, so capture each poster's live box and
    // natural size to rebuild the cover-crop manually inside the clone.
    const livePosters = Array.from(sheetRef.current.querySelectorAll<HTMLImageElement>("img.midautumn-poster")).map((img) => ({
      rect: img.getBoundingClientRect(),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
    const canvas = await html2canvas(sheetRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#fffdfa",
      logging: false,
      onclone: (doc) => {
        // html2canvas ignores box-shadow and mishandles the dotted radial-gradient strips;
        // patch the cloned document with renderable equivalents.
        const style = doc.createElement("style");
        style.textContent = [
          ".midautumn-sheet::before,.midautumn-sheet::after { background:none !important; height:3px; border-top:3px dotted #75bfc1; }",
          ".midautumn-poster { box-shadow:none !important; border-right:3px solid #f0e2d7; border-bottom:3px solid #f0e2d7; }",
          // html2canvas draws CJK text ~7px lower inside its line box than the browser;
          // nudge the text back up with a no-layout relative offset so boxes keep the
          // same height as the web view (icon margin compensation would inflate them).
          ".midautumn-detail > span { display:flex !important; align-items:center; justify-content:center; }",
          ".midautumn-detail > span svg { display:block; }",
          ".midautumn-detail p { position:relative; top:-7px; }",
        ].join("\n");
        doc.head.appendChild(style);
        // Rebuild object-fit:cover with an overflow-hidden wrapper sized to the live box.
        const clonedPosters = Array.from(doc.querySelectorAll<HTMLImageElement>("img.midautumn-poster"));
        clonedPosters.forEach((img, index) => {
          const live = livePosters[index];
          const boxWidth = live?.rect.width || 0;
          const boxHeight = live?.rect.height || 0;
          const naturalWidth = live?.naturalWidth || 0;
          const naturalHeight = live?.naturalHeight || 0;
          if (!boxWidth || !boxHeight || !naturalWidth || !naturalHeight) return;
          const coverScale = Math.max(boxWidth / naturalWidth, boxHeight / naturalHeight);
          const scaledWidth = naturalWidth * coverScale;
          const scaledHeight = naturalHeight * coverScale;
          const wrapper = doc.createElement("div");
          wrapper.style.cssText = `position:relative;width:${boxWidth}px;height:${boxHeight}px;overflow:hidden;`;
          img.style.cssText += `;position:absolute;left:${(boxWidth - scaledWidth) / 2}px;top:${(boxHeight - scaledHeight) / 2}px;width:${scaledWidth}px;height:${scaledHeight}px;max-width:none;object-fit:fill;`;
          if (img.parentNode) {
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
          }
        });
      },
    });
    return canvas.toDataURL("image/png");
  };

  const exportPage = async () => {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await captureSheet();
      if (!dataUrl) return;
      const link = document.createElement("a");
      const filename = displayTitle.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80);
      link.download = `${filename}-${String(page + 1).padStart(2, "0")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const exportAllPages = async () => {
    if (!sheetRef.current || exporting || activities.length === 0) return;
    setExporting(true);
    const restorePage = page;
    try {
      const pages = Math.ceil(activities.length / 3);
      const filename = displayTitle.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80);
      for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
        setPage(pageIndex);
        setActive(Math.min(activities.length - 1, pageIndex * 3));
        // Wait for React to re-render the sheet with the next page before capturing.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))));
        await new Promise((resolve) => setTimeout(resolve, 120));
        const dataUrl = await captureSheet();
        if (!dataUrl) continue;
        const link = document.createElement("a");
        link.download = `${filename}-${String(pageIndex + 1).padStart(2, "0")}.png`;
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

        <div className="midautumn-tabs" role="tablist">
          {TABS.map((config) => (
            <button key={config.key} type="button" role="tab" aria-selected={tab === config.key} className={`midautumn-tab${tab === config.key ? " is-active" : ""}`} onClick={() => setTab(config.key)}>{config.label}<span>{lists[config.key].length}</span></button>
          ))}
        </div>

        <div className="midautumn-toolbar">
          <button className="midautumn-command" type="button" onClick={addActivity}><Plus size={15} />新增活动</button>
          <button className="midautumn-command is-primary" type="button" onClick={exportAllPages} disabled={exporting}><Download size={15} />{exporting ? "生成中" : `导出全部（${totalPages} 页）`}</button>
        </div>

        <div className="midautumn-section-label"><span>页面设置</span><span>可编辑</span></div>
        <div className="midautumn-form midautumn-page-settings">
          <label className="midautumn-field"><span>主标题</span><input value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} placeholder={tabConfig.title} /></label>
          <label className="midautumn-field"><span>副标题</span><input value={pageSubtitle} onChange={(event) => setPageSubtitle(event.target.value)} placeholder={tabConfig.subtitle} /></label>
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
