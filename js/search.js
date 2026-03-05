/* =========================================================
   GLOBAL STATE
========================================================= */

let BLACKLIST = { phones: [], emails: [], links: [] };
let NEWS_DATA = [];
let dataReady = false;


/* =========================================================
   NORMALIZE FUNCTIONS
========================================================= */

// Chuẩn hóa số điện thoại
function normalizePhone(phone) {
  return phone
    .replace(/\D/g, "")     // bỏ ký tự không phải số
    .replace(/^84/, "0")    // đổi 84 -> 0
    .trim();
}

// Chuẩn hóa email
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// Chuẩn hóa url
function normalizeUrl(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
}


/* =========================================================
   LOAD JSON DATA
========================================================= */

async function loadExternalData() {
  try {

    console.log("Đang tải JSON...");

    const response = await fetch("/data/data.json");

    console.log("Status:", response.status);

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();

    console.log("JSON loaded:", data);

    BLACKLIST = {
      phones: (data.BLACKLIST.phones || []).map(normalizePhone),
      emails: (data.BLACKLIST.emails || []).map(normalizeEmail),
      links: (data.BLACKLIST.links || []).map(normalizeUrl)
    };

    NEWS_DATA = data.NEWS_DATA || [];

    dataReady = true;

    console.log("BLACKLIST:", BLACKLIST);

    initNews();

  } catch (error) {

    console.error("Lỗi khi tải dữ liệu:", error);

  }
}


/* =========================================================
   CHECK INPUT
========================================================= */

function handleCheck() {

  const inputElement = document.getElementById("checkInput");
  const rawInput = inputElement.value.trim();
  const input = rawInput.toLowerCase();

  const area = document.getElementById("resultArea");

  if (!input) {
    area.innerHTML = "";
    return;
  }

  area.innerHTML = `
  <div class="result-card" style="color:white;">
      <div class="spinner"></div>
      Đang kiểm tra dữ liệu...
  </div>`;

  setTimeout(() => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|84)[0-9]{9}$/;
    const urlRegex = /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/.*)?$/;

    let type = "";

    if (emailRegex.test(input)) type = "email";
    else if (phoneRegex.test(input)) type = "phone";
    else if (urlRegex.test(input)) type = "url";


    if (type === "") {

      inputElement.classList.add("shake");

      setTimeout(() => inputElement.classList.remove("shake"), 400);

      area.innerHTML = `
        <div class="result-card warning">
            <i class="fas fa-info-circle"></i>
            <span>Định dạng không hợp lệ. Vui lòng nhập đúng SĐT, Email hoặc Link web.</span>
        </div>`;

      return;

    }


    let isScam = false;
    let label = "";


    if (type === "email") {

      const email = normalizeEmail(input);

      isScam = BLACKLIST.emails.includes(email);
      label = "Email";

    }


    else if (type === "phone") {

      const phone = normalizePhone(input);

      isScam = BLACKLIST.phones.includes(phone);
      label = "Số điện thoại";

    }


    else if (type === "url") {

      const url = normalizeUrl(input);

      isScam = BLACKLIST.links.some((l) => url.includes(l));
      label = "Liên kết";

    }


    console.log("BLACKLIST:", BLACKLIST);
    console.log("Phones:", BLACKLIST.phones.length);
    console.log("Emails:", BLACKLIST.emails.length);
    console.log("Links:", BLACKLIST.links.length);


    if (isScam) {

      area.innerHTML = `
        <div class="result-card danger">
            <i class="fas fa-exclamation-triangle"></i>
            <span>CẢNH BÁO: ${label} này nằm trong danh sách lừa đảo!</span>
        </div>`;

    } else {

      area.innerHTML = `
        <div class="result-card success">
            <i class="fas fa-shield-check"></i>
            <span>AN TOÀN: ${label} này chưa bị báo cáo xấu.</span>
        </div>`;

    }

  }, 600);
}


/* =========================================================
   NEWS SYSTEM
========================================================= */

function initNews() {

  const feed = document.getElementById("newsFeed");

  if (!feed) return;

  const newsCards = NEWS_DATA.map((n) => `

        <div class="news-item">

            <div class="news-img-container">
                <img src="${n.img}" class="news-img">
            </div>

            <div class="news-content">

                <div style="margin-bottom: 8px;">
                    <span class="tag ${n.tagClass}">${n.label}</span>
                    <small style="color:var(--text-muted); font-weight: 500;">${n.time}</small>
                </div>

                <h3><a href="#">${n.title}</a></h3>

                <p>${n.desc}</p>

                <a href="#"
                   style="color:var(--color-primary); font-weight:700; text-decoration:none; font-size:13px;">
                   Chi tiết bài viết →
                </a>

            </div>

        </div>

    `).join("");

  feed.innerHTML = newsCards;

}


/* =========================================================
   INIT
========================================================= */

window.onload = loadExternalData;