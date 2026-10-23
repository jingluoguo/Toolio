"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, RefreshCw, Send, Share } from "lucide-react";
import { NOTES, type Note, hashTags, noteContentToText, noteTitleToText, pickNote } from "./copybank";
import {
  DEFAULT_ENV,
  type Env,
  XHS_CREATOR,
  XHS_WEB_PUBLISH,
  copyText,
  detectEnv,
  launchApp,
  storeUrl,
} from "./launch";

type Status = "idle" | "opening" | "copied" | "failed" | "blocked" | "wechat" | "notOpened";

export default function XhsPage() {
  // SSR 固定渲染第一篇，客户端挂载后再随机，避免 hydration 不一致
  const [note, setNote] = useState<Note>(NOTES[0]);
  // 环境同样要挂载后再检测，保证首屏 HTML 一致
  const [env, setEnv] = useState<Env | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [titleCopied, setTitleCopied] = useState(false);
  const titleTimer = useRef<number | null>(null);

  useEffect(() => {
    setNote(pickNote());
    setEnv(detectEnv());
    return () => {
      if (titleTimer.current) window.clearTimeout(titleTimer.current);
    };
  }, []);

  const swap = useCallback(() => {
    setNote((current) => {
      const next = pickNote();
      return next.id === current.id ? pickNote() : next;
    });
    setStatus("idle");
    setTitleCopied(false);
    if (titleTimer.current) window.clearTimeout(titleTimer.current);
  }, []);

  // 标题单独复制，只带纯标题，粘进小红书标题框即可
  const copyTitle = useCallback(async () => {
    const ok = await copyText(noteTitleToText(note));
    setTitleCopied(ok);
    if (titleTimer.current) window.clearTimeout(titleTimer.current);
    titleTimer.current = window.setTimeout(() => setTitleCopied(false), 1800);
  }, [note]);

  const publish = useCallback(async () => {
    // 只带正文 + 话题，标题由上方单独的复制按钮处理
    const text = noteContentToText(note);
    const envNow = env ?? detectEnv();

    // 微信内置浏览器会拦截 scheme，只能引导用户去浏览器打开
    if (envNow.isWeChat) {
      await copyText(text);
      setStatus("wechat");
      return;
    }

    // 桌面端：直接打开发布页网页版
    if (!envNow.isMobile) {
      const win = window.open(XHS_WEB_PUBLISH, "_blank", "noopener,noreferrer");
      const ok = await copyText(text);
      setStatus(ok ? (win ? "copied" : "blocked") : "failed");
      return;
    }

    // 手机端：先复制，再唤起 App；跳不起来就给出下载 / 网页版出口
    setStatus("opening");
    let left = false;
    const markLeft = () => {
      if (document.visibilityState === "hidden") left = true;
    };
    document.addEventListener("visibilitychange", markLeft);
    window.addEventListener("pagehide", markLeft);

    await copyText(text);
    launchApp(envNow);

    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", markLeft);
      window.removeEventListener("pagehide", markLeft);
      if (!left && document.visibilityState === "visible") {
        setStatus("notOpened");
      } else {
        setStatus("copied");
      }
    }, 2200);
  }, [env, note]);

  // 这个页面是扫码进来的，主场景就是手机端：env 未检测出来时（首屏）也按移动端给文案
  const ctaMain =
    status === "opening" ? "正在打开小红书…" : env && !env.isMobile ? "一键发布到小红书" : "复制正文并打开小红书";
  // 唤起用的是 xhsdiscover://post，进 App 就直接落在发布页，不用再让用户自己点「+」
  const idleHint = "正文（含话题）会自动复制到剪贴板，在正文框长按粘贴；标题点标题右边的复制按钮。";

  return (
    <main className="xhs-scan-page">
      <div className="xhs-scan-wrap">
        <header className="xhs-scan-head">
          <span className="xhs-scan-logo" aria-hidden="true">🌿</span>
          <div>
            <strong>漢方樂妝</strong>
            <span>草本美学 · 一键分享</span>
          </div>
        </header>

        <h1 className="xhs-scan-title">
          点一下，<br />把这篇笔记发到<em>小红书</em>
        </h1>

        <article className="xhs-note-card" key={note.id}>
          <div className="xhs-note-top">
            <i className="xhs-note-dot" aria-hidden="true" />
            <span>笔记预览</span>
            <button type="button" className="xhs-swap" onClick={swap}>
              <RefreshCw size={12} />换一篇
            </button>
          </div>
          <div className="xhs-note-title-row">
            <h2>{note.title}</h2>
            <button
              type="button"
              className={`xhs-copy-title${titleCopied ? " is-done" : ""}`}
              onClick={copyTitle}
              aria-label="复制标题"
            >
              {titleCopied ? <Check size={13} /> : <Copy size={13} />}
              {titleCopied ? "已复制" : "复制标题"}
            </button>
          </div>
          <div className="xhs-note-body">
            {note.body.split("\n").map((line, index) => (
              <p key={index}>{line || " "}</p>
            ))}
          </div>
          <ul className="xhs-note-tags">
            {hashTags(note.tags).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className="xhs-note-foot">
            <span>
              正文 <b>{note.body.replace(/\s/g, "").length}</b> 字
            </span>
            <span>
              话题 <b>{note.tags.length}</b> 个 · 复制即带 #
            </span>
          </div>
        </article>

        <button
          type="button"
          className={`xhs-big-cta${status === "opening" ? " is-loading" : ""}`}
          onClick={publish}
          disabled={status === "opening"}
        >
          <span>
            <Send size={16} />
            {ctaMain}
          </span>
        </button>

        <div className={`xhs-scan-note${status === "failed" || status === "notOpened" ? " is-error" : ""}`}>
          {status === "idle" && <span>{idleHint}</span>}
          {status === "opening" && <span>正在唤起小红书，如果没有跳转，稍等两秒会给出下载入口。</span>}
          {status === "copied" && (
            <span className="xhs-scan-note-ok">
              <Check size={14} />正文已复制，在小红书正文框里粘贴就能发。
            </span>
          )}
          {status === "blocked" && (
            <span>
              浏览器拦住了新窗口，正文已经复制好了。
              <a href={XHS_WEB_PUBLISH} target="_blank" rel="noopener noreferrer">手动打开发布页</a>
            </span>
          )}
          {status === "failed" && (
            <span>
              复制失败了，请长按上方正文手动复制，再
              <a href={XHS_WEB_PUBLISH} target="_blank" rel="noopener noreferrer">打开发布页</a>。
            </span>
          )}
          {status === "notOpened" && <span>没能唤起小红书，可能是没安装或被浏览器拦了一下。选下面任意一种方式继续：</span>}
        </div>

        {status === "notOpened" && (
          <div className="xhs-fallback">
            <button type="button" className="xhs-fallback-btn" onClick={publish}>
              <RefreshCw size={13} />再试一次
            </button>
            <a className="xhs-fallback-btn" href={storeUrl(env ?? DEFAULT_ENV)} target="_blank" rel="noopener noreferrer">
              <Download size={13} />下载小红书
            </a>
            <a className="xhs-fallback-btn" href={XHS_WEB_PUBLISH} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} />用网页版发布
            </a>
          </div>
        )}

        <p className="xhs-scan-tiny">
          网页版入口：<a href={XHS_CREATOR} target="_blank" rel="noopener noreferrer">小红书创作中心</a>
        </p>
      </div>

      {status === "wechat" && (
        <div className="xhs-wechat-mask" role="dialog" aria-modal="true" aria-label="请在浏览器中打开">
          <div className="xhs-wechat-arrow" aria-hidden="true">↗</div>
          <div className="xhs-wechat-box">
            <strong>微信里打不开小红书 App</strong>
            <p>
              正文已经复制好了。点右上角 <b>···</b>，选择「在浏览器打开」，
              再点一次「复制正文并打开小红书」就能直接拉起来。
            </p>
            <p className="xhs-wechat-tip">
              如果没复制成功，回到页面长按正文手动复制，标题用标题旁的复制按钮。
            </p>
            <button type="button" onClick={() => setStatus("idle")}>
              <Share size={14} />我知道了
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
