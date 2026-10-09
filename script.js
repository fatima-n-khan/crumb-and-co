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
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el.querySelectorAll("span"), {
      clipPath: "inset(0 0 100% 0)",
      y: 40,
      stagger: 0.15,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // 3. Cake: section is pinned, layers drop in while you scroll
  gsap.timeline({
    scrollTrigger: {
      trigger: ".cake",
      start: "top top",
      end: "+=1400",
      scrub: true,
      pin: true,
    },
  })
    .from(".layer:nth-child(5)", { y: -500, opacity: 0 })
    .from(".layer:nth-child(4)", { y: -500, opacity: 0 })
    .from(".layer:nth-child(3)", { y: -500, opacity: 0 })
    .from(".layer:nth-child(2)", { y: -500, opacity: 0 })
    .from(".layer:nth-child(1)", { y: -500, opacity: 0 });
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
  gsap.from(".hero-frame", { scale: 0.85, opacity: 0, duration: 1.2, delay: 0.4, ease: "power3.out" });
}
