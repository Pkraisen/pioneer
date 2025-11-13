const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);

const notes = ["🎵", "♪", "♫", "🎶"];
let hue = 0;

document.addEventListener("mousemove", (e) => {
  // Move cursor
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;

  // Change color smoothly
  hue = (hue + 3) % 360;
  cursor.style.background = `hsl(${hue}, 100%, 60%)`;

  // Create floating music note
  const note = document.createElement("div");
  note.classList.add("note");
  note.style.left = `${e.clientX}px`;
  note.style.top = `${e.clientY}px`;
  note.textContent = notes[Math.floor(Math.random() * notes.length)];
  note.style.color = `hsl(${hue}, 100%, 70%)`;
  document.body.appendChild(note);

  // Remove note after animation
  setTimeout(() => note.remove(), 1500);
});

// Requires GSAP + ScrollTrigger already loaded on the page:
// gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById("scrollVideo");
const wrapper = document.querySelector(".scroll-video-wrapper");

if (!video || !wrapper) {
  console.warn("scrollVideo or .scroll-video-wrapper not found.");
} else {
  // Ensure seeking/autoplay is allowed
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  // Try to give the browser a playback intent to allow seeking in some browsers.
  function primePlayback() {
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        video.pause();
      }).catch(() => {
        // autoplay blocked — muted helps, but continue anyway
      });
    }
  }

  function setupScrollScrub() {
    const duration = Math.max(video.duration || 1, 0.001);

    // Compute an end distance relative to wrapper height (adjust multiplier as needed)
    const endPx = Math.round(
      Math.max(wrapper.offsetHeight * 2, window.innerHeight * 1.5)
    );

    // Kill any existing ScrollTriggers on this wrapper (helpful during dev/hot-reload)
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === wrapper) st.kill();
    });

    const isSmallScreen = window.innerWidth <= 768;

    ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: `+=${endPx}`, // scroll distance controls how fast video plays
      pin: !isSmallScreen, // avoid pin on small screens if you prefer
      scrub: isSmallScreen ? 0 : 0.3,
      anticipatePin: 1,
      onUpdate(self) {
        // Map progress [0..1] -> video.currentTime
        try {
          video.currentTime = self.progress * duration;
        } catch (e) {
          // ignore intermittent DOM exceptions
        }
      },
      onEnter: () => {
        // ensure initial frame is set
        try {
          video.currentTime = 0;
        } catch (e) {}
      },
      onLeaveBack: () => {
        // reset when scrolling back past the section
        try {
          video.currentTime = 0;
        } catch (e) {}
      },
    });

    // Force a refresh after a short delay to allow layout to settle
    setTimeout(() => ScrollTrigger.refresh(), 120);
  }

  // Initialize once metadata is available
  function init() {
    primePlayback();
    setupScrollScrub();
  }

  if (video.readyState >= 1) {
    init();
  } else {
    video.addEventListener("loadedmetadata", init, { once: true });
  }

  // Refresh on resize/orientation changes
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
}

