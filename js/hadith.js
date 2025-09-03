if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((reg) => console.log("SW registered, scope:", reg.scope))
    .catch((err) => console.error("SW register failed:", err));
}

// ===== Scroll Behavior =====
const fixedNav = document.querySelector(".header");
const scrollTopBtn = document.querySelector(".scroll-top");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  fixedNav.classList.toggle("active", scrollY > 100);
  scrollTopBtn.classList.toggle("active", scrollY > 500);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Mobile Menu =====
const barsMobile = document.querySelector(".bars");
const linksMobile = document.querySelector(".nav-mobile");

// Keyboard accessibility for mobile menu
barsMobile.addEventListener("click", (e) => {
  e.stopPropagation();
  linksMobile.classList.toggle("active");
});

barsMobile.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    linksMobile.classList.toggle("active");
  }
});

window.addEventListener("click", (e) => {
  if (
    linksMobile.classList.contains("active") &&
    !linksMobile.contains(e.target) &&
    !barsMobile.contains(e.target)
  ) {
    linksMobile.classList.remove("active");
  }
});

// Close mobile menu with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && linksMobile.classList.contains("active")) {
    linksMobile.classList.remove("active");
  }
});

// ===== Hadith Section =====
const hadithContainer = document.querySelector(".hadith-container p");
const nextBtn = document.querySelector(".buttons .next");
const prevBtn = document.querySelector(".buttons .prev");
const totalEl = document.querySelector(".hadith .number .total");
const currentEl = document.querySelector(".hadith .number .current");

let hadiths = [];
let hadithIndex = 0;

function updateHadith() {
  if (!hadiths.length) return;

  hadithContainer.textContent = hadiths[hadithIndex].arab;
  totalEl.textContent = hadiths.length;
  currentEl.textContent = hadithIndex + 1;

  prevBtn.disabled = hadithIndex === 0;
  nextBtn.disabled = hadithIndex === hadiths.length - 1;
}

function fetchHadiths() {
  fetch("https://api.hadith.gading.dev/books/muslim?range=1-300")
    .then((res) => res.json())
    .then((data) => {
      hadiths = data.data.hadiths;
      updateHadith();
    })
    .catch((err) => console.error("Error fetching hadiths:", err));
}

prevBtn.addEventListener("click", () => {
  if (hadithIndex > 0) {
    hadithIndex--;
    updateHadith();
  }
});

nextBtn.addEventListener("click", () => {
  if (hadithIndex < hadiths.length - 1) {
    hadithIndex++;
    updateHadith();
  }
});

// ===== Nav Link Scroll & Active =====
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header ul li");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    const target = link.dataset.filter;
    const section = document.querySelector(`section.${target}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ===== Quran Section =====
function fetchSurahs() {
  fetch("https://api.alquran.cloud/v1/meta")
    .then((res) => res.json())
    .then((data) => displaySurahs(data.data.surahs.references))
    .catch((err) => console.error("Error fetching surahs:", err));
}

function displaySurahs(surahs) {
  const container = document.querySelector(".surhasContainer");
  const popup = document.querySelector(".surah-popup");
  const closeBtn = popup.querySelector(".close");
  const ayahsContainer = popup.querySelector(".ayah");

  container.innerHTML = surahs
    .map(
      (surah) => `
    <div class="surah">
      <p class="title">${surah.name}</p>
      <p>${surah.englishName}</p>
    </div>`
    )
    .join("");

  const surahElements = container.querySelectorAll(".surah");

  surahElements.forEach((element, index) => {
    element.addEventListener("click", () => {
      popup.classList.add("active");
      ayahsContainer.innerHTML = "<p>Loading...</p>";
      fetch(`https://api.alquran.cloud/v1/surah/${index + 1}`)
        .then((res) => res.json())
        .then((data) => {
          const ayahs = data.data.ayahs
            .map(
              (ayah) =>
                `<p>${ayah.text} - <small>${ayah.numberInSurah}</small></p>`
            )
            .join("");
          ayahsContainer.innerHTML = ayahs;
        });
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.remove("active");
  });
}

// ===== Prayer Times =====
function getFormattedDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function fetchPrayerTimes() {
  const currentDay = getFormattedDate();
  const cards = document.querySelector(".pray .cards");

  fetch(
    `https://api.aladhan.com/v1/timingsByCity/${currentDay}?city=Cairo&country=Egypt&method=8`
  )
    .then((res) => res.json())
    .then((data) => {
      const timings = data.data.timings;
      cards.innerHTML = Object.entries(timings)
        .map(
          ([name, time]) => `
        <div class="card">
          <div class="circle">
            <svg><circle cx="100" cy="100" r="100"></circle></svg>
            <div class="pray-time">${time}</div>
          </div>
          <p>${name}</p>
        </div>`
        )
        .join("");
    })
    .catch((err) => console.error("Error fetching prayer times:", err));
}

// ===== Initialize All functions =====
document.addEventListener("DOMContentLoaded", () => {
  fetchHadiths();
  fetchSurahs();
  fetchPrayerTimes();
});
