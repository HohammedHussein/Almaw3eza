let fixedNav = document.querySelector(".header");
window.addEventListener("scroll", () => {
  window.scrollY > 100
    ? fixedNav.classList.add("active")
    : fixedNav.classList.remove("active");
});

// variables
let hadithContainer = document.querySelector(".hadith-container p"),
  next = document.querySelector(".buttons .next"),
  prev = document.querySelector(".buttons .prev"),
  numbers = document.querySelector(".buttons .numbers");

let total = document.querySelector(".hadith .number .total"),
  current = document.querySelector(".hadith .number .current");

// handle get data
let hadithIndex = 0;
const loadCount = 20;
const totalHadiths = 300;

// cached data
let cachedHadiths = [];
let currentBatch = -1;

async function fetchData() {
  const requiredBatch = Math.floor(hadithIndex / loadCount);

  if (requiredBatch === currentBatch && cachedHadiths.length > 0) {
    displayCurrentHadith();
    return;
  }

  const start = requiredBatch * loadCount + 1;
  const end = Math.min(start + loadCount - 1, totalHadiths);

  const Api_link = `https://api.hadith.gading.dev/books/muslim?range=${start}-${end}`;

  try {
    const response = await fetch(Api_link);
    const data = await response.json();

    if (data.data && data.data.hadiths) {
      cachedHadiths = data.data.hadiths;
      currentBatch = requiredBatch;
      displayCurrentHadith();
    }
  } catch (error) {
    console.log("لا توجد احاديث", error);
  }
}

function displayCurrentHadith() {
  const indexInBatch = hadithIndex % loadCount;

  if (cachedHadiths[indexInBatch]) {
    hadithContainer.textContent = cachedHadiths[indexInBatch].arab;
  }

  total.textContent = totalHadiths;
  current.textContent = hadithIndex + 1;

  prev.disabled = hadithIndex === 0;
  next.disabled = hadithIndex === totalHadiths - 1;
}

window.addEventListener("DOMContentLoaded", fetchData);
