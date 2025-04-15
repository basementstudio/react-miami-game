// Hack made by https://gsap.com/docs/v3/HelperFunctions/helpers/stopOverscroll/

/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

export function OverscrollPrevent() {
  const overscrollPreventedRef = useRef(false);
  useEffect(() => {
    if (typeof document !== "undefined" && !overscrollPreventedRef.current) {
      stopOverscroll(document.body);
      overscrollPreventedRef.current = true;
    }
  }, []);

  return null;
}

function stopOverscroll(e: HTMLElement | Window) {
  let element = e;

  if (e === document.body || e === document.documentElement) {
    element = window;
  }

  let lastScroll = 0;
  let lastTouch: number = 0;
  let forcing: boolean = false;
  let forward: boolean = true;
  const isRoot = element === window;
  const scroller = (
    isRoot ? document.scrollingElement : element
  ) as HTMLElement;
  const ua = window.navigator.userAgent + "";
  const getMax = isRoot
    ? () => scroller.scrollHeight - window.innerHeight
    : () => scroller.scrollHeight - scroller.clientHeight;
  const addListener = (type: string, func: any) =>
    element.addEventListener(type, func, { passive: false });
  const revert = () => {
    scroller.style.overflowY = "auto";
    forcing = false;
  };
  const kill = () => {
    forcing = true;
    scroller.style.overflowY = "hidden";
    !forward && scroller.scrollTop < 1
      ? (scroller.scrollTop = 1)
      : (scroller.scrollTop = getMax() - 1);
    setTimeout(revert, 1);
  };
  const handleTouch = (e: any) => {
    const evt = e.changedTouches ? e.changedTouches[0] : e,
      forward = evt.pageY <= lastTouch;
    if (
      ((!forward && scroller.scrollTop <= 1) ||
        (forward && scroller.scrollTop >= getMax() - 1)) &&
      e.type === "touchmove"
    ) {
      e.preventDefault();
    } else {
      lastTouch = evt.pageY;
    }
  };
  const handleScroll = (e: any) => {
    if (!forcing) {
      const scrollTop = scroller.scrollTop;
      forward = scrollTop > lastScroll;
      if (
        (!forward && scrollTop < 1) ||
        (forward && scrollTop >= getMax() - 1)
      ) {
        e.preventDefault();
        kill();
      }
      lastScroll = scrollTop;
    }
  };
  if ("ontouchend" in document && !!ua.match(/Version\/[\d\.]+.*Safari/)) {
    addListener("scroll", handleScroll);
    addListener("touchstart", handleTouch);
    addListener("touchmove", handleTouch);
  }
  if (scroller) {
    scroller.style.overscrollBehavior = "none";
  }
}
