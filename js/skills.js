document.addEventListener('DOMContentLoaded', () => {

    const skillsFeed = document.getElementById('skillsFeed');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('skillSearchInput');

    let allSkills = [];
    let displayedSkills = [];
    const itemsPerPage = 6;
    let currentPage = 1;
    let currentLabel = 'Tất cả';

    // =========================
    // 1. TYPEWRITER EFFECT
    // =========================

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

    // GỌI TYPE EFFECT
    typeEffect();


    // =========================
    // 2. LOAD DATA
    // =========================

    async function init() {
        try {
            const res = await fetch('/data/skills.json');
            const data = await res.json();
            allSkills = data.SKILLS_DATA || [];
            applyFilterAndSearch();
        } catch (e) {
            console.error("Lỗi:", e);
        }
    }

    function applyFilterAndSearch() {

        const searchTerm = searchInput
            ? searchInput.value.toLowerCase()
            : "";

        displayedSkills = allSkills.filter(item => {

            const matchesLabel =
                (currentLabel === 'Tất cả' || item.label === currentLabel);

            const matchesSearch =
                item.title.toLowerCase().includes(searchTerm) ||
                item.desc.toLowerCase().includes(searchTerm);

            return matchesLabel && matchesSearch;
        });

        renderSkillsByPage(1);
    }


    // =========================
    // 3. RENDER & PAGINATION
    // =========================

    function renderSkillsByPage(page) {

        currentPage = page;

        const start = (page - 1) * itemsPerPage;
        const pagedItems =
            displayedSkills.slice(start, start + itemsPerPage);

        if (pagedItems.length === 0) {

            skillsFeed.innerHTML =
                `<div class="no-result">
                    Không tìm thấy kết quả phù hợp với từ khóa "${searchInput.value}"
                </div>`;

            paginationContainer.innerHTML = "";
            return;
        }

        skillsFeed.innerHTML = pagedItems.map(item => `
            <div class="skill-item" onclick="location.href='chi-tiet-ky-nang.html?id=${item.id}'">
                <div class="skill-thumb-container">
                    <img src="${item.img}" class="skill-thumb">
                </div>
                <div class="skill-content">
                    <span class="skill-tag ${item.tagClass}">${item.label}</span>
                    <h3 class="skill-title">${item.title}</h3>
                    <p class="skill-desc">${item.desc}</p>
                    <div class="btn-detail">Học ngay →</div>
                </div>
            </div>
        `).join('');

        renderPagination();
    }

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
                    class="page-node ${i === currentPage ? 'active' : ''}"
                    onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        }

        paginationContainer.innerHTML = html;
    }


    // =========================
    // 4. EVENTS
    // =========================

    window.filterByLabel = (label) => {
        currentLabel = label;

        document.querySelectorAll('.filter-btn')
            .forEach(btn =>
                btn.classList.toggle(
                    'active',
                    btn.innerText === label
                )
            );

        applyFilterAndSearch();
    };

    window.changePage = (page) => {
        renderSkillsByPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilterAndSearch);
    }

    init();
});