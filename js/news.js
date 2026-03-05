document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const newsFeed = document.getElementById('newsFeed');
    const paginationContainer = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const filterContainer = document.getElementById('categoryFilter');

    // --- Global State ---
    let allNews = [];
    let displayedNews = [];
    const itemsPerPage = 6;
    let currentPage = 1;
    let currentLabel = 'Tất cả';

    // --- 1. Hiệu ứng Typewriter cho Search ---
    const searchSuggestions = [
        "Lừa đảo Telegram...",
        "Giả danh Công an...",
        "Mã độc Cổng dịch vụ công...",
        "Deepfake lừa đảo video...",
        "Tuyển CTV việc nhẹ lương cao..."
    ];
    let suggestionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        if (!searchInput) return;
        const currentWord = searchSuggestions[suggestionIndex];
        const baseText = "Tìm kiếm thủ đoạn (vd: ";
        
        if (!isDeleting) {
            searchInput.placeholder = baseText + currentWord.substring(0, charIndex++) + ")";
            if (charIndex > currentWord.length) {
                isDeleting = true;
                setTimeout(typeEffect, 1500); // Dừng lại để người dùng đọc
                return;
            }
        } else {
            searchInput.placeholder = baseText + currentWord.substring(0, charIndex--) + ")";
            if (charIndex < 0) {
                isDeleting = false;
                suggestionIndex = (suggestionIndex + 1) % searchSuggestions.length;
            }
        }
        setTimeout(typeEffect, isDeleting ? 30 : 60);
    }

    // --- 2. Khởi tạo và Lấy Dữ Liệu ---
    async function init() {
        try {
            const res = await fetch('./data/data.json');
            const data = await res.json();
            allNews = data.NEWS_DATA;
            
            initCategoryFilter();
            typeEffect();
            applyFilterAndSearch();
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
            if(newsFeed) newsFeed.innerHTML = `<p style="text-align:center; color:red;">Không thể tải dữ liệu.</p>`;
        }
    }

    // --- 3. Render Bộ Lọc (Filter) Động ---
    function initCategoryFilter() {
        if (!filterContainer) return;
        
        // Lấy danh sách label duy nhất từ data
        const labels = [...new Set(allNews.map(n => n.label))];
        
        let buttonsHTML = `<button class="news-filter__btn news-filter__btn--active" data-label="Tất cả">Tất cả</button>`;
        labels.forEach(label => {
            buttonsHTML += `<button class="news-filter__btn" data-label="${label}">${label}</button>`;
        });
        
        filterContainer.innerHTML = buttonsHTML;

        // Sự kiện click chọn Filter
        filterContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("news-filter__btn")) {
                document.querySelectorAll(".news-filter__btn").forEach(b => b.classList.remove("news-filter__btn--active"));
                e.target.classList.add("news-filter__btn--active");
                currentLabel = e.target.dataset.label;
                applyFilterAndSearch();
            }
        });
    }

    // --- 4. Logic Lọc và Tìm Kiếm ---
    function applyFilterAndSearch() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const isHomePage = window.location.pathname === "/" || window.location.pathname.endsWith("index.html");

        // Lọc data
        displayedNews = allNews.filter(item => {
            const matchesLabel = (currentLabel === 'Tất cả' || item.label === currentLabel);
            const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                                  item.desc.toLowerCase().includes(searchTerm);
            
            // Nếu ở trang chủ, có thể hiển thị bài theo rule riêng (ở đây giả sử lấy bài có chữ "giờ")
            const matchesHomeRule = isHomePage ? item.time.includes("giờ") : true;

            return matchesLabel && matchesSearch && matchesHomeRule;
        });

        // Nếu search trống ở trang chủ, sắp xếp theo ID
        if (isHomePage && searchTerm === "") {
            displayedNews.sort((a, b) => a.id - b.id);
        }

        renderNewsByPage(1);
    }

    // --- 5. Render Giao diện & Phân trang ---
    function renderNewsByPage(page) {
        currentPage = page;
        const isHomePage = window.location.pathname === "/" || window.location.pathname.endsWith("index.html");
        
        let pagedItems = [];
        if (isHomePage) {
            pagedItems = displayedNews.slice(0, 10); // Trang chủ giới hạn 10 bài
            if (paginationContainer) paginationContainer.style.display = "none";
        } else {
            const start = (page - 1) * itemsPerPage;
            pagedItems = displayedNews.slice(start, start + itemsPerPage);
            if (paginationContainer) paginationContainer.style.display = "flex";
        }

        if (pagedItems.length === 0) {
            newsFeed.innerHTML = `
                <div class="news-grid__empty">
                    <i class="fas fa-search" style="font-size: 40px; color: #cbd5e1; margin-bottom: 15px;"></i>
                    <p>Không tìm thấy kết quả phù hợp với từ khóa "${searchInput.value}"</p>
                </div>`;
            if (paginationContainer) paginationContainer.innerHTML = "";
            return;
        }

        newsFeed.innerHTML = pagedItems.map(item => `
            <article class="news-card ${isHomePage ? 'news-card--horizontal' : ''}">
                <div class="news-card__thumb-container">
                    <img src="${item.img}" class="news-card__thumb" alt="${item.title}" loading="lazy">
                </div>
                <div class="news-card__content">
                    <div class="news-card__meta">
                        <span class="news-card__tag ${item.tagClass}">${item.label}</span>
                        <span class="news-card__time"><i class="far fa-clock"></i> ${item.time}</span>
                    </div>
                    <h3 class="news-card__title">
                        <a href="/pages/chi-tiet-tin-tuc.html?id=${item.id}" class="news-card__link">${item.title}</a>
                    </h3>
                    <p class="news-card__desc">${item.desc}</p>
                    <div class="news-card__footer">
                        <a href="./thong-tin-chi-tiet.html?id=${item.id}" class="news-card__btn-detail">
                            CHI TIẾT BÀI VIẾT <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');

        if (!isHomePage) renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(displayedNews.length / itemsPerPage);
        if (totalPages <= 1) { paginationContainer.innerHTML = ""; return; }
        
        let html = "";
        if (currentPage > 1) html += `<button class="news-pagination__btn" onclick="changePage(${currentPage - 1})">←</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="news-pagination__btn ${i === currentPage ? 'news-pagination__btn--active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        if (currentPage < totalPages) html += `<button class="news-pagination__btn" onclick="changePage(${currentPage + 1})">→</button>`;
        
        paginationContainer.innerHTML = html;
    }

    // Bắt sự kiện chuyển trang (Global function)
    window.changePage = (page) => {
        renderNewsByPage(page);
        document.querySelector('.news-section').scrollIntoView({ top: 0, behavior: 'smooth' });
    };

    // Bắt sự kiện Search (Debounce)
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyFilterAndSearch, 300);
        });
    }

    init();
});