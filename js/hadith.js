let fixedNav = document.querySelector(".header");
let scroll_top = document.querySelector(".scroll-top");
window.addEventListener("scroll", () => {
  window.scrollY > 100
    ? fixedNav.classList.add("active")
    : fixedNav.classList.remove("active");

  window.scrollY > 500
    ? scroll_top.classList.add("active")
    : scroll_top.classList.remove("active");
});

scroll_top.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

let barsMobile = document.querySelector(".bars");
let linksMobile = document.querySelector(".nav-mobile");

barsMobile.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevents the click from reaching window
  linksMobile.classList.toggle("active");
});

window.addEventListener("click", function (event) {
  if (
    linksMobile &&
    linksMobile.classList.contains("active") &&
    !linksMobile.contains(event.target) &&
    !barsMobile.contains(event.target)
  ) {
    linksMobile.classList.remove("active");
  }
});

// variables
let hadithContainer = document.querySelector(".hadith-container p"),
  next = document.querySelector(".buttons .next"),
  prev = document.querySelector(".buttons .prev"),
  numbers = document.querySelector(".buttons .numbers");

let total = document.querySelector(".hadith .number .total"),
  current = document.querySelector(".hadith .number .current");

// get Hadiths from Server

let hadithIndex = 0;

function fetchData() {
  try {
    fetch(`https://api.hadith.gading.dev/books/muslim?range=1-300`)
      .then((response) => response.json())
      .then((data) => {
        const hadiths = data.data.hadiths;
        hadithContainer.textContent = hadiths[hadithIndex].arab;
        total.textContent = hadiths.length;
        current.textContent = hadithIndex + 1;

        if (hadithIndex == 0) {
          prev.disabled = true;
        } else {
          prev.disabled = false;
        }

        if (hadithIndex == hadiths.length - 1) {
          next.disabled = true;
        } else {
          next.disabled = false;
        }
      });
  } catch (error) {}
}

prev.addEventListener("click", () => {
  hadithIndex--;
  fetchData();
});

next.addEventListener("click", () => {
  hadithIndex++;
  fetchData();
});
document.addEventListener("DOMContentLoaded", fetchData);

// add Active to links
let sections = document.querySelectorAll("section");
let links = document.querySelectorAll("header ul li");

links.forEach((a) => {
  a.addEventListener("click", () => {
    links.forEach((a) => a.classList.remove("active"));
    a.classList.add("active");
    let target = a.dataset.filter;
    sections.forEach((section) => {
      if (section.classList.contains(target)) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
});

// Quran Section

function QuranApi() {
  // fetch surahs  meta  data {name of surahs}
  fetch(`https://api.alquran.cloud/v1/meta`)
    .then((res) => res.json())
    .then((data) => {
      data = data.data.surahs.references;
      displaySurahs(data);
    });
}

// display surahs in Dom

function displaySurahs(surahs) {
  const surahsContainer = document.querySelector(".surhasContainer");
  surahs.forEach((surah) => {
    surahsContainer.innerHTML += `
        <div class="surah">
          <p class="title">${surah.name}</p>
          <p>${surah.englishName}</p>
        </div>
      `;
  });
  // show ayat
  const surah = document.querySelectorAll(".Quran .surhasContainer .surah");
  let surah_popup = document.querySelector(".surah-popup");
  let close_popup = document.querySelector(".surah-popup .close");

  surah.forEach((item) => {
    item.addEventListener("click", () => {
      surah_popup.classList.add("active");
    });
  });

  close_popup.addEventListener("click", () => {
    surah_popup.classList.remove("active");
  });

  // get surah title
  let ayahs = document.querySelector(".surah-popup .ayah");

  surah.forEach((title, index) => {
    title.addEventListener("click", () => {
      ayahs.innerHTML = "";
      fetch(`https://api.alquran.cloud/v1/surah/${index + 1}`)
        .then((response) => response.json())
        .then((data) => {
          const ayahData = data.data.ayahs;

          ayahData.forEach((ayah) => {
            ayahs.innerHTML += `
                <p>  ${ayah.text} -  ${ayah.numberInSurah}  </p>
                
            `;
          });
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", QuranApi);

// animation
const fadeObserve = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // نوقف المراقبة بعد ما يظهر
    }
  });
});
document.querySelectorAll(".fade").forEach((el) => {
  fadeObserve.observe(el);
});
// pray Times

// return day dd-mm-yy
function getFormattedDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

const currentDay = getFormattedDate();
const cards = document.querySelector(".pray .cards");
function getPrayTime() {
  try {
    fetch(
      `https://api.aladhan.com/v1/timingsByCity/${currentDay}?city=Cairo&country=Egypt&method=8`
    )
      .then((res) => res.json())
      .then((data) => {
        const prayTime = data.data.timings;
        cards.innerHTML = "";
        for (time in prayTime) {
          cards.innerHTML += `
            <div class="card">
              <div class="circle">
                <svg>
                  <circle cx="100" cy="100" r="100"></circle>
                </svg>
                <div class="pray-time">${prayTime[time]}</div>
              </div>
              <p>${time}</p>
          </div>
          `;
        }
      });
  } catch (error) {
    console.log(error);
  }
}
getPrayTime();
