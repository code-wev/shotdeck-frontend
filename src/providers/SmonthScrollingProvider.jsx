'use client'
import React from 'react'
import gsap from 'gsap'
import ScrollSmoother from "gsap/ScrollSmoother";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export default function SmonthScrollingProvider({children}) {
     useEffect(() => {
    ScrollSmoother.create({
      smooth: 1.0,
      effects: true,
    });
  }, []);
  return (
   <div id="smooth-wrapper">
<div id="smooth-content">

 {children}
</div>
</div>
  )
}
