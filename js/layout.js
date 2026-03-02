/**
 * =============================================================
 * HỆ THỐNG QUẢN LÝ GIAO DIỆN & TƯƠNG TÁC (SCAM REPORT PROJECT)
 * =============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Header: Sau khi load xong thì khởi tạo Navbar và Active Link
  loadComponent("#header", "/partials/header.html", () => {
    initNavbar();
    setActiveNavLink();
  });

  // 2. Load Footer: Sau khi load xong thì chạy logic liên quan đến Footer
  loadComponent("#footer", "/partials/footer.html", initFooter);

  // 3. Khởi tạo Form báo cáo: Chỉ chạy nếu form tồn tại trên trang
  initScamReportForm();
});

/**
 * Hàm load các thành phần HTML dùng chung (Header, Footer)
 */
async function loadComponent(selector, url, callback) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Lỗi kết nối: ${response.status}`);

    const html = await response.text();
    const container = document.querySelector(selector);

    if (container) {
      container.innerHTML = html;
      if (typeof callback === "function") callback();
    }
  } catch (err) {
    console.error(`Không thể tải component từ ${url}:`, err);
  }
}

/**
 * ===============================
 * NAVBAR LOGIC (MOBILE MENU)
 * ===============================
 */
function initNavbar() {
  const toggleBtn = document.getElementById("navbarToggle");
  const mobileMenu = document.getElementById("navbarMobile");

  if (!toggleBtn || !mobileMenu) return;

  const icon = toggleBtn.querySelector("i");

  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    if (icon) {
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    }
  });
}

/**
 * ===============================
 * SET ACTIVE NAV LINK
 * ===============================
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    try {
      const linkPath = new URL(link.href).pathname;
      const isHomePage =
        (currentPath === "/" || currentPath === "/index.html") &&
        (linkPath === "/" || linkPath === "/index.html");

      if (linkPath === currentPath || isHomePage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    } catch (e) {
      // Bỏ qua các link không hợp lệ
    }
  });
}

/**
 * ===============================
 * SCAM REPORT FORM LOGIC
 * ===============================
 */
function initScamReportForm() {
  const form = document.getElementById("scamReportForm");
  if (!form) return;

  const uploadBox = document.getElementById("uploadBox");
  const evidenceInput = document.getElementById("evidence");
  const fileName = document.getElementById("fileName");

  // ===== Render danh sách file =====
  function renderFiles(files) {
    if (!files || files.length === 0) {
      fileName.innerHTML =
        "(Ảnh chụp màn hình, ghi âm cuộc gọi, file liên quan)";
      uploadBox.classList.remove("active");
      return;
    }

    uploadBox.classList.add("active");

    fileName.innerHTML = `
      <strong>Đã chọn ${files.length} file:</strong>
      <ul>
        ${Array.from(files)
          .map(
            (f) =>
              `<li>${f.name} (${(f.size / 1024).toFixed(1)} KB)</li>`,
          )
          .join("")}
      </ul>
    `;
  }

  // ===== Click chọn file =====
  evidenceInput.addEventListener("change", function () {
    renderFiles(this.files);
  });

  // ===== Drag & Drop =====
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("dragover");
  });

  uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("dragover");
  });

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    evidenceInput.files = files; // rất quan trọng để submit được
    renderFiles(files);
  });

  // ===== Submit =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const contact = this.scammerContact.value.trim();
    const type = this.scamType.value;
    const desc = this.description.value.trim();

    if (!contact || !type || desc.length < 20) {
      alert("Vui lòng nhập đầy đủ thông tin và mô tả tối thiểu 20 ký tự.");
      return;
    }

    alert(
      "Báo cáo đã được ghi nhận. Cảm ơn bạn đã chung tay phòng chống lừa đảo!",
    );

    this.reset();
    renderFiles(null);
    window.location.href = "/index.html";
  });
}

// Gọi khi DOM load
// document.addEventListener("DOMContentLoaded", initScamReportForm);

/**
 * ===============================
 * FOOTER LOGIC
 * ===============================
 */
function initFooter() {
  const socialIcons = document.querySelectorAll(".footer-social .icon");
  socialIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      console.log("Người dùng tương tác với social icon.");
    });
  });
}
