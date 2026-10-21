export type Env = {
  isIOS: boolean;
  isAndroid: boolean;
  isWeChat: boolean;
  isMobile: boolean;
};

export const DEFAULT_ENV: Env = {
  isIOS: false,
  isAndroid: false,
  isWeChat: false,
  isMobile: false,
};

export function detectEnv(): Env {
  if (typeof navigator === "undefined") return DEFAULT_ENV;
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  const isAndroid = /Android/i.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);
  return { isIOS, isAndroid, isWeChat, isMobile: isIOS || isAndroid };
}

/** 小红书 App 的发布入口（发布作品 / 相册） */
export const XHS_SCHEME = "xhsdiscover://post";
export const XHS_PACKAGE = "com.xingin.xhs";
/** 未安装或唤起失败时的网页版发布页 */
export const XHS_WEB_PUBLISH = "https://creator.xiaohongshu.com/publish/publish?target=article";
export const XHS_CREATOR = "https://creator.xiaohongshu.com/";
export const XHS_IOS_STORE = "https://apps.apple.com/cn/app/id741292507";
export const XHS_ANDROID_STORE = "https://a.app.qq.com/o/simple.jsp?pkgname=com.xingin.xhs";

/**
 * 双端唤起地址：
 * - Android 用 intent:// 并在未安装时自动回落到网页版发布页
 * - iOS 直接走自定义 scheme（未安装时系统只弹提示，需要页面自己给下载入口）
 */
export function buildLaunchUrl(env: Env): string {
  if (env.isAndroid) {
    const fallback = encodeURIComponent(XHS_WEB_PUBLISH);
    return `intent://post#Intent;scheme=xhsdiscover;package=${XHS_PACKAGE};S.browser_fallback_url=${fallback};end`;
  }
  return XHS_SCHEME;
}

export function launchApp(env: Env): void {
  window.location.href = buildLaunchUrl(env);
}

export function storeUrl(env: Env): string {
  return env.isAndroid ? XHS_ANDROID_STORE : XHS_IOS_STORE;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 继续走降级方案 */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
