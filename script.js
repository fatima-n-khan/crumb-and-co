gsap.registerPlugin(ScrollTrigger);

// Smooth scrolling (Lenis) wired into GSAP
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  // 1. Background + text colour change per chapter
  document.querySelectorAll("[data-bg]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 55%",
      refreshPriority: -1,
      onToggle: (self) => {
        if (self.isActive) {
          gsap.to("body", {
            backgroundColor: section.dataset.bg,
            color: section.dataset.ink,
            duration: 0.8,
          });
        }
      },
    });
  });

  // 2. Headline reveal, word by word
  gsap.utils.toArray(".chapter:not(.hero) .reveal").forEach((el) => {
    gsap.from(el.querySelectorAll("span"), {
      clipPath: "inset(0 0 100% 0)",
      y: 40,
      stagger: 0.15,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", refreshPriority: -1 },
    });
  });

  // 3. Cake: pinned. Layers drop, cherry bounces on, sprinkles fall, cake settles
const stack = document.querySelector(".cake-stack");
const sprinkleColors = ["#fff", "#ffd23f", "#2a1710", "#8fd3a8", "#f6b4c4"];
for (let i = 0; i < 24; i++) {
  const s = document.createElement("i");
  s.className = "sprinkle";
  s.style.left = 30 + Math.random() * 40 + "%";
  s.style.top = 34 + Math.random() * 26 + "px";
  s.style.background = sprinkleColors[i % 5];
  s.style.rotate = Math.random() * 180 + "deg";
  stack.appendChild(s);
}
const cakeTl = gsap.timeline({
  scrollTrigger: { trigger: ".cake", start: "top top", end: "+=1800", scrub: true, pin: true },
});
gsap.utils.toArray(".layer").reverse().forEach((layer) => cakeTl.from(layer, { y: -500, opacity: 0 }));
cakeTl
  .from(".cherry", { y: -400, opacity: 0, ease: "bounce.out", duration: 1.2 })
  .from(".sprinkle", { y: -300, opacity: 0, stagger: { each: 0.04, from: "random" } }, "<0.3")
  .to(stack, { scaleY: 0.95, transformOrigin: "50% 100%", duration: 0.4, yoyo: true, repeat: 1, ease: "power2.inOut" });
}

// 4. Images: gentle parallax inside each frame, plus hero photo intro
if (!reduceMotion) {
  gsap.utils.toArray(".frame").forEach((frame) => {
    gsap.fromTo(frame.querySelector("img"), { yPercent: -8 }, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

// 5. Intro animation (preloader): letters rise, curtain lifts, hero reveals
const loader = document.querySelector(".loader");
if (reduceMotion) {
  loader.remove();
} else {
  lenis.stop();
  const word = loader.querySelector(".loader-word");
  word.innerHTML = [...word.textContent]
    .map((c) => `<i>${c === " " ? "&nbsp;" : c}</i>`)
    .join("");

  gsap.timeline({
    delay: 0.2,
    onComplete: () => { loader.remove(); lenis.start(); },
  })
    .from(".loader-word i", { yPercent: 120, opacity: 0, stagger: 0.06, duration: 0.7, ease: "power3.out" })
    .to(".loader-word", { opacity: 0, duration: 0.3 }, "+=0.5")
    .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
    .from(".hero h1 span", { clipPath: "inset(0 0 100% 0)", y: 40, stagger: 0.15, duration: 1, ease: "power3.out" }, "-=0.3")
    .from(".hero p", { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
    .from(".hero-frame", { scale: 0.85, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=1");
}

// 6. Custom cursor (only on devices with a mouse)
if (!reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = document.querySelector(".cursor");
  document.body.classList.add("has-cursor");
  const moveX = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
  const moveY = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
  addEventListener("mousemove", (e) => { moveX(e.clientX); moveY(e.clientY); });
  document.querySelectorAll("a, .frame, .thumb").forEach((el) => {
    el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 3.5, duration: 0.3 }));
    el.addEventListener("mouseleave", () => gsap.to(cursor, { scale: 1, duration: 0.3 }));
  });
}

// 7. Menu: pinned horizontal scroll (cards slide sideways while you scroll down)
const track = document.querySelector(".track");
if (!reduceMotion) {
  gsap.to(track, {
    x: () => -Math.max(0, track.scrollWidth + track.offsetLeft * 2 - innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: ".menu",
      start: "top top",
      end: () => "+=" + Math.max(1, track.scrollWidth + track.offsetLeft * 2 - innerWidth),
      scrub: true,
      pin: true,
      invalidateOnRefresh: true,
    },
  });
}

// 8. Marquee strip
const marqueeTrack = document.querySelector(".marquee-track");
const marqueeText = "Cakes • Brownies • Cupcakes • Fresh daily • ".repeat(2);
marqueeTrack.innerHTML = `<span>${marqueeText}</span>`.repeat(2);
if (!reduceMotion) gsap.to(marqueeTrack, { xPercent: -50, duration: 20, ease: "none", repeat: -1 });

// 9. 3D tilt on photos (mouse devices only)
if (!reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".frame").forEach((frame) => {
    gsap.set(frame, { transformPerspective: 800 });
    const rotX = gsap.quickTo(frame, "rotationX", { duration: 0.4, ease: "power2" });
    const rotY = gsap.quickTo(frame, "rotationY", { duration: 0.4, ease: "power2" });
    frame.addEventListener("mousemove", (e) => {
      const r = frame.getBoundingClientRect();
      rotY(((e.clientX - r.left) / r.width - 0.5) * 14);
      rotX(-((e.clientY - r.top) / r.height - 0.5) * 14);
    });
    frame.addEventListener("mouseleave", () => { rotX(0); rotY(0); });
  });
}

// 10. New sections: gallery, reviews, numbers, order photo
document.querySelectorAll(".count").forEach((el) => {
  if (reduceMotion) return;
  const to = Number(el.dataset.to);
  const suffix = el.dataset.suffix || "";
  const counter = { v: 0 };
  el.textContent = "0" + suffix;
  gsap.to(counter, {
    v: to, duration: 2, ease: "power2.out",
    onUpdate: () => { el.textContent = Math.round(counter.v).toLocaleString("en-US") + suffix; },
    scrollTrigger: { trigger: el, start: "top 85%", once: true },
  });
});

if (!reduceMotion) {
  gsap.from(".grid .frame", {
    y: 60, opacity: 0, stagger: 0.15, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".grid", start: "top 85%" },
  });
  gsap.from("blockquote", {
    y: 50, opacity: 0, stagger: 0.15, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".review-row", start: "top 85%" },
  });
  gsap.fromTo(".order-bg", { yPercent: -6 }, {
    yPercent: 6, ease: "none",
    scrollTrigger: { trigger: "#order", start: "top bottom", end: "bottom top", scrub: true },
  });
}

// 11. Scroll progress bar
gsap.to(".progress", {
  scaleX: 1, ease: "none",
  scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true, refreshPriority: -1 },
});

// Recalculate scroll positions once all photos have loaded
addEventListener("load", () => ScrollTrigger.refresh());
