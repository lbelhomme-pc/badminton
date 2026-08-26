"use client";

import { useEffect } from "react";

function scrollToCurrentHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const target = document.getElementById(decodeURIComponent(hash));
  target?.scrollIntoView({ block: "start" });
}

export function HashAnchorScroller() {
  useEffect(() => {
    const initialScroll = window.setTimeout(scrollToCurrentHash, 0);
    const delayedScroll = window.setTimeout(scrollToCurrentHash, 300);
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.clearTimeout(initialScroll);
      window.clearTimeout(delayedScroll);
      window.removeEventListener("hashchange", scrollToCurrentHash);
    };
  }, []);

  return null;
}
