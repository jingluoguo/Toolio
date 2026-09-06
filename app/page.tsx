import { ArrowRight, ArrowUpRight, Clock3, Sparkles, Zap } from "lucide-react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const tools = [
  { href: "/wheel", eyebrow: "01 / DECISION", title: "决策转盘", description: "把脑海里的多个选项，交给一次轻盈而明确的转动。", meta: "适合 2 - 36 个选项", icon: Sparkles, featured: true },
  { eyebrow: "02 / FOCUS", title: "专注计时", description: "为一段不被打扰的时间，留出清晰边界。", meta: "即将上线", icon: Clock3, featured: false },
  { eyebrow: "03 / START", title: "行动起点", description: "把一个模糊的念头，拆成今天可以完成的一步。", meta: "即将上线", icon: Zap, featured: false },
];

export default function Home() {
  return (
    <main className="portal-page min-h-screen overflow-hidden bg-[#F4F1EA] text-[#16252E]">
      <div className="page-grain" />
      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-10 lg:px-16">
        <a href={`${basePath}/`} className="flex items-center gap-3" aria-label="Toolio 首页"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#142B36] text-[11px] font-semibold tracking-[0.18em] text-[#F4E3BA]">T</span><span className="font-serif text-xl tracking-[0.08em]">TOOLIO</span></a>
        <nav className="hidden items-center gap-8 text-sm text-[#53616A] md:flex"><a href={`${basePath}/#tools`} className="border-b border-[#AD9363] pb-1 text-[#16252E]">工具集</a><a href={`${basePath}/#about`} className="transition-colors hover:text-[#16252E]">关于我们</a><a href={`${basePath}/wheel/`} className="inline-flex items-center gap-1 transition-colors hover:text-[#16252E]">打开转盘 <ArrowUpRight size={14} /></a></nav>
        <button className="grid h-10 w-10 place-items-center border border-[#D2CCC0] text-[#16252E] md:hidden" aria-label="打开导航"><span className="h-px w-4 bg-current" /></button>
      </header>

      <section className="relative z-10 mx-auto max-w-[1440px] px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24 lg:px-16 lg:pt-28">
        <div className="max-w-3xl"><p className="mb-7 flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-[#9B7A43]"><span className="h-px w-8 bg-[#9B7A43]" /> TOOLIO / COLLECTION</p><h1 className="max-w-3xl font-serif text-5xl leading-[1.08] text-[#142B36] md:text-7xl">给日常工具，<br /><span className="text-[#8D7650]">一点审美。</span></h1><p className="mt-8 max-w-xl text-[15px] leading-7 text-[#66737B]">一组克制、好用、值得反复打开的小工具。为思考留出空间，也为行动找到方向。</p></div>
        <div className="mt-16 flex items-center gap-5 text-xs tracking-[0.12em] text-[#7A8587] md:mt-24"><span>TOOLS FOR A QUIETER DAY</span><span className="h-px w-24 bg-[#C8BDAA]" /><span>01 AVAILABLE</span></div>
      </section>

      <section id="tools" className="relative z-10 border-y border-[#DED8CC] bg-[#ECE8DE]/70"><div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16 lg:px-16"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="text-xs font-medium tracking-[0.18em] text-[#9B7A43]">THE TOOL SHELF</p><h2 className="mt-3 font-serif text-3xl text-[#142B36]">从一个小决定开始</h2></div><span className="hidden text-xs text-[#7B8585] sm:block">03 件工具</span></div><div className="grid gap-5 lg:grid-cols-2">{tools.map((tool) => { const Icon = tool.icon; const content = <><div className="flex items-start justify-between"><span className="text-xs tracking-[0.14em] text-[#9B7A43]">{tool.eyebrow}</span><Icon size={20} strokeWidth={1.4} className="text-[#A98D5C]" /></div><div className="mt-20"><h3 className="font-serif text-3xl text-[#142B36]">{tool.title}</h3><p className="mt-4 max-w-md text-sm leading-6 text-[#6B777D]">{tool.description}</p><div className="mt-8 flex items-center justify-between border-t border-[#D4CDC0] pt-4 text-xs text-[#7B8585]"><span>{tool.meta}</span>{tool.featured && <span className="inline-flex items-center gap-2 text-[#142B36]">进入工具 <ArrowRight size={15} /></span>}</div></div></>; return tool.featured ? <a href={`${basePath}${tool.href}/`} key={tool.title} className="tool-card featured-tool block min-h-[330px] bg-[#142E38] p-7 text-[#F4F1EA] transition-transform hover:-translate-y-1 md:p-9">{content}</a> : <div key={tool.title} className="tool-card min-h-[330px] border border-[#D7D0C4] bg-[#F4F1EA] p-7 md:p-9">{content}</div>; })}</div></div></section>

      <section id="about" className="relative z-10 mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24 lg:px-16"><div className="grid gap-10 md:grid-cols-[.8fr_1.2fr] md:items-end"><p className="text-xs font-medium tracking-[0.18em] text-[#9B7A43]">A SMALL COLLECTION</p><p className="max-w-xl font-serif text-2xl leading-relaxed text-[#43545B] md:text-3xl">好的工具不需要制造噪音。它们只在恰当的时刻，帮你更清楚地看见下一步。</p></div></section>

      <footer className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-5 border-t border-[#DED8CC] px-6 py-8 text-xs text-[#7A8382] md:flex-row md:items-center md:justify-between md:px-10 lg:px-16"><p><span className="font-serif tracking-[0.1em] text-[#42535A]">TOOLIO</span> &nbsp; A quieter way to decide.</p><span>2026</span></footer>
    </main>
  );
}
