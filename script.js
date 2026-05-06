const navToggle = document.querySelector("#navToggle");
const siteNav = document.querySelector("#siteNav");
const splashScreen = document.querySelector("#splashScreen");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const splashStorageKey = "rkaIntroSeenV3";

const hideSplashScreen = (delay = 0) => {
  if (!splashScreen) {
    document.body.classList.remove("is-intro-lock");
    return;
  }

  window.setTimeout(() => {
    splashScreen.classList.add("is-hidden");
    document.body.classList.remove("is-intro-lock");
    window.setTimeout(() => splashScreen.remove(), 820);
  }, delay);
};

const shouldSkipSplash = () => {
  try {
    return reduceMotion || window.sessionStorage.getItem(splashStorageKey) === "true";
  } catch {
    return reduceMotion;
  }
};

if (shouldSkipSplash()) {
  splashScreen?.remove();
  document.body.classList.remove("is-intro-lock");
} else {
  try {
    window.sessionStorage.setItem(splashStorageKey, "true");
  } catch {
    /* Session storage can be unavailable in strict local browser contexts. */
  }

  hideSplashScreen(4000);
}

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const typewriterElements = document.querySelectorAll("[data-typewriter]");
const photoRiver = document.querySelector("#photoRiver");
const scrollVideo = document.querySelector("[data-scroll-video]");
const soundButton = document.querySelector("[data-sound-button]");

const galleryPhotos = Array.from({ length: 27 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    src: `assets/media/photos/photo-${number}.jpg`,
    alt: `Фотография мероприятия Российской криминологической ассоциации ${number}`,
  };
});

const createPhotoCard = (photo, isClone = false) => {
  const figure = document.createElement("figure");
  const image = document.createElement("img");

  figure.className = "photo-card";
  if (isClone) {
    figure.setAttribute("aria-hidden", "true");
  }

  image.src = photo.src;
  image.alt = isClone ? "" : photo.alt;
  image.loading = "lazy";
  image.decoding = "async";

  figure.append(image);
  return figure;
};

const createPhotoTrack = (photos, modifier) => {
  const track = document.createElement("div");
  const strip = document.createElement("div");
  const clone = document.createElement("div");

  track.className = `photo-track ${modifier}`;
  strip.className = "photo-strip";
  clone.className = "photo-strip";
  clone.setAttribute("aria-hidden", "true");

  photos.forEach((photo) => {
    strip.append(createPhotoCard(photo));
    clone.append(createPhotoCard(photo, true));
  });

  track.append(strip, clone);
  return track;
};

if (photoRiver) {
  const splitIndex = Math.ceil(galleryPhotos.length / 2);
  photoRiver.append(
    createPhotoTrack(galleryPhotos.slice(0, splitIndex), "photo-track--one"),
    createPhotoTrack(galleryPhotos.slice(splitIndex), "photo-track--two")
  );
}

const typeText = (element) => {
  const text = element.textContent.replace(/\s+/g, " ").trim();
  const speed = Number(element.dataset.typeSpeed || 18);
  const delay = Number(element.dataset.typeDelay || 0);

  element.setAttribute("aria-label", text);
  element.style.minHeight = `${Math.ceil(element.getBoundingClientRect().height)}px`;
  element.textContent = "";

  window.setTimeout(() => {
    let index = 0;
    element.classList.add("is-typing");

    const tick = () => {
      element.textContent = text.slice(0, index);
      index += 1;

      if (index <= text.length) {
        window.setTimeout(tick, speed);
        return;
      }

      element.classList.remove("is-typing");
      element.style.minHeight = "";
    };

    tick();
  }, delay);
};

if (!reduceMotion) {
  if (scrollVideo) {
    let hasTriedScrollPlay = false;

    const playVideoWithSound = async () => {
      scrollVideo.muted = false;
      scrollVideo.volume = 1;

      try {
        await scrollVideo.play();
        soundButton.hidden = true;
      } catch {
        scrollVideo.muted = true;
        soundButton.hidden = false;
        scrollVideo.play().catch(() => {});
      }
    };

    soundButton?.addEventListener("click", async () => {
      scrollVideo.muted = false;
      scrollVideo.volume = 1;

      try {
        await scrollVideo.play();
        soundButton.hidden = true;
      } catch {
        soundButton.hidden = false;
      }
    });

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriedScrollPlay) {
          hasTriedScrollPlay = true;
          playVideoWithSound();
          videoObserver.unobserve(scrollVideo);
        }
      },
      { threshold: 0.48, rootMargin: "0px 0px -12% 0px" }
    );

    videoObserver.observe(scrollVideo);
  }

  typewriterElements.forEach(typeText);

  const revealItems = document.querySelectorAll(
    ".identity-card, .letter-block, .days-module__heading, .day-card, .day-bridge, .facts > div, .document-list > article, .contacts__grid > a"
  );

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 220)}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = Math.round((event.clientX / window.innerWidth) * 100);
      const y = Math.round((event.clientY / window.innerHeight) * 100);
      document.body.style.setProperty("--pointer-x", `${x}%`);
      document.body.style.setProperty("--pointer-y", `${y}%`);
    },
    { passive: true }
  );
}
