import { ArrowRight, ArrowUpRight } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const tools = [
  { href: "/wheel", eyebrow: "01 / DECISION", title: "决策转盘", description: "把多个选项交给一次明确的转动。" },
  { href: "/activity", eyebrow: "02 / EDITOR", title: "活动海报编辑器", description: "整理内容，并导出可分享的海报。" },
];

export default function Home() {
  return (
    <main className="portal-page min-h-screen overflow-hidden bg-[#F4F1EA] text-[#16252E]">
      <div className="page-grain" />
      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-10 lg:px-16">
        <a href={`${basePath}/`} className="flex items-center gap-3" aria-label="Toolio 首页"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#142B36] text-[11px] font-semibold tracking-[0.18em] text-[#F4E3BA]">T</span><span className="font-serif text-xl tracking-[0.08em]">TOOLIO</span></a>
        <nav className="hidden items-center gap-8 text-sm text-[#53616A] md:flex"><a href={`${basePath}/#tools`} className="border-b border-[#AD9363] pb-1 text-[#16252E]">工具集</a><a href={`${basePath}/#about`} className="transition-colors hover:text-[#16252E]">关于我们</a><a href={`${basePath}/#tools`} className="inline-flex items-center gap-1 transition-colors hover:text-[#16252E]">开始使用 <ArrowUpRight size={14} /></a></nav>
        <a href={`${basePath}/#tools`} className="inline-flex items-center gap-1 border-b border-[#AD9363] pb-1 text-xs text-[#16252E] md:hidden">开始使用 <ArrowUpRight size={13} /></a>
      </header>

      <section id="tools" className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1440px] grid-rows-[1fr_auto] px-6 pb-6 pt-10 md:px-10 md:pb-8 md:pt-16 lg:px-16 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-24">
          <div className="max-w-3xl"><p className="mb-7 flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-[#9B7A43]"><span className="h-px w-8 bg-[#9B7A43]" /> TOOLIO / COLLECTION</p><h1 className="max-w-3xl font-serif text-5xl leading-[1.08] text-[#142B36] md:text-7xl">给日常工具，<br /><span className="text-[#8D7650]">一点审美。</span></h1><p className="mt-8 max-w-xl text-[15px] leading-7 text-[#66737B]">一组克制、好用、值得反复打开的小工具。为思考留出空间，也为行动找到方向。</p><a href={`${basePath}/#tools`} className="mt-10 inline-flex items-center gap-3 bg-[#142B36] px-5 py-3 text-sm font-medium text-[#F4F1EA] transition-transform hover:-translate-y-0.5">浏览工具集 <ArrowRight size={16} /></a></div>
          <div className="border-l border-[#C8BDAA] pl-6 md:pl-10"><div className="flex items-end justify-between border-b border-[#D8D0C2] pb-4"><p className="text-xs font-medium tracking-[0.18em] text-[#9B7A43]">THE COLLECTION</p><span className="font-serif text-5xl leading-none text-[#C6B69A]">02</span></div><div className="divide-y divide-[#D8D0C2]">{tools.map((tool) => <a key={tool.title} href={`${basePath}${tool.href}/`} className="group flex items-center justify-between gap-5 py-6"><div><p className="text-xs tracking-[0.14em] text-[#9B7A43]">{tool.eyebrow}</p><h2 className="mt-2 font-serif text-2xl text-[#142B36]">{tool.title}</h2><p className="mt-2 text-sm leading-6 text-[#68757A]">{tool.description}</p></div><ArrowUpRight className="shrink-0 text-[#9B7A43] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" size={19} /></a>)}</div></div>
        </div>
        <div id="about" className="flex items-center justify-between gap-5 border-t border-[#D8D0C2] pt-5 text-xs tracking-[0.12em] text-[#7A8587]"><div className="flex items-center gap-5"><span>TOOLS FOR A QUIETER DAY</span><span className="hidden h-px w-24 bg-[#C8BDAA] sm:block" /><span>02 AVAILABLE</span></div><div className="hidden text-[#8F9997] sm:block">A SMALL COLLECTION <span className="px-2">·</span> 2026</div></div>
      </section>
    </main>
  );
}
