document.addEventListener("DOMContentLoaded", () => {

    const skillsFeed = document.getElementById("skillsFeed");
    const paginationContainer = document.getElementById("pagination");
    const searchInput = document.getElementById("skillSearchInput");

    let allSkills = [];
    let displayedSkills = [];

    const itemsPerPage = 6;
    let currentPage = 1;
    let currentLabel = "Tất cả";


    // ========================================
    // 1. TYPEWRITER EFFECT
    // ========================================

    const searchSuggestions = [
        "Kỹ năng bảo mật OTP...",
        "Cách nhận diện Website giả mạo...",
        "Phòng chống lừa đảo Telegram...",
        "Bí kíp đặt mật khẩu an toàn..."
    ];

    let suggestionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {

        if (!searchInput) return;

        const currentWord = searchSuggestions[suggestionIndex];
        const baseText = "Tìm kiếm kĩ năng (vd: ";

        if (!isDeleting) {

            searchInput.placeholder =
                baseText + currentWord.substring(0, charIndex) + ")";

            charIndex++;

            if (charIndex > currentWord.length) {
                isDeleting = true;
                setTimeout(typeEffect, 1500);
                return;
            }

        } else {

            searchInput.placeholder =
                baseText + currentWord.substring(0, charIndex) + ")";

            charIndex--;

            if (charIndex < 0) {
                isDeleting = false;
                suggestionIndex =
                    (suggestionIndex + 1) % searchSuggestions.length;
                charIndex = 0;
            }
        }

        setTimeout(typeEffect, isDeleting ? 30 : 60);
    }

    typeEffect();


    // ========================================
    // 2. LOAD DATA JSON
    // ========================================

    async function init() {

        try {

            const res = await fetch("/data/skills.json");
            const data = await res.json();

            allSkills = data.SKILLS_DATA || [];

            applyFilterAndSearch();

        } catch (error) {

            console.error("Lỗi load skills:", error);

            skillsFeed.innerHTML = `
                <div class="news-grid__empty">
                    <p>Không thể tải dữ liệu kỹ năng.</p>
                </div>
            `;
        }
    }


    // ========================================
    // 3. FILTER + SEARCH
    // ========================================

    function applyFilterAndSearch() {

        const searchTerm = searchInput
            ? searchInput.value.toLowerCase()
            : "";

        displayedSkills = allSkills.filter(item => {

            const matchLabel =
                currentLabel === "Tất cả" ||
                item.label === currentLabel;

            const matchSearch =
                item.title.toLowerCase().includes(searchTerm) ||
                item.desc.toLowerCase().includes(searchTerm);

            return matchLabel && matchSearch;

        });

        renderSkillsByPage(1);
    }


    // ========================================
    // 4. RENDER SKILLS
    // ========================================

    function renderSkillsByPage(page) {

        currentPage = page;

        const start = (page - 1) * itemsPerPage;

        const pagedItems =
            displayedSkills.slice(start, start + itemsPerPage);

        if (pagedItems.length === 0) {

            skillsFeed.innerHTML = `
                <div class="news-grid__empty">
                    <i class="fas fa-search"
                       style="font-size:40px;color:#cbd5e1;margin-bottom:15px;"></i>
                    <p>
                        Không tìm thấy kết quả phù hợp với từ khóa 
                        "${searchInput.value}"
                    </p>
                </div>
            `;

            paginationContainer.innerHTML = "";

            return;
        }

        skillsFeed.innerHTML = pagedItems.map(item => `

            <article class="news-card">

                <div class="news-card__thumb-container">
                    <img 
                        src="${item.img}" 
                        class="news-card__thumb"
                        alt="${item.title}"
                        loading="lazy">
                </div>

                <div class="news-card__content">

                    <div class="news-card__meta">

                        <span class="news-card__tag ${item.tagClass}">
                            ${item.label}
                        </span>

                        <span class="news-card__time">
                            <i class="far fa-clock"></i>
                            ${item.time}
                        </span>

                    </div>

                    <h3 class="news-card__title">
                        <a href="/pages/chi-tiet-ky-nang.html?id=${item.id}"
                           class="news-card__link">
                           ${item.title}
                        </a>
                    </h3>

                    <p class="news-card__desc">
                        ${item.desc}
                    </p>

                    <div class="news-card__footer">

                        <a href="./ki-nang-chi-tiet.html?id=${item.id}"
                           class="news-card__btn-detail">

                            XEM HƯỚNG DẪN

                            <i class="fas fa-arrow-right"></i>

                        </a>

                    </div>

                </div>

            </article>

        `).join("");

        renderPagination();
    }


    // ========================================
    // 5. PAGINATION
    // ========================================

    function renderPagination() {

        const totalPages =
            Math.ceil(displayedSkills.length / itemsPerPage);

        if (totalPages <= 1) {

            paginationContainer.innerHTML = "";

            return;
        }

        let html = "";

        for (let i = 1; i <= totalPages; i++) {

            html += `
                <button
                    class="page-node ${i === currentPage ? "active" : ""}"
                    onclick="changePage(${i})">

                    ${i}

                </button>
            `;
        }

        paginationContainer.innerHTML = html;
    }


    // ========================================
    // 6. EVENTS
    // ========================================

    window.filterByLabel = (label) => {

        currentLabel = label;

        document.querySelectorAll(".filter-btn")
            .forEach(btn =>
                btn.classList.toggle(
                    "active",
                    btn.innerText === label
                )
            );

        applyFilterAndSearch();
    };


    window.changePage = (page) => {

        renderSkillsByPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilterAndSearch
        );
    }


    // ========================================
    // START
    // ========================================

    init();

});