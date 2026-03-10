async function loadContent() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  if (!id) return;

  try {
    const res = await fetch("./data/skills.json");
    const data = await res.json();

    const skill = data.SKILLS_DATA.find((s) => s.id === id);

    if (!skill) return;

    let html = `
                <div class="article-header" style="margin-bottom:40px;text-align:center;">

                    <span class="tag ${skill.tagClass}">
                        ${skill.label}
                    </span>

                    <h1 style="font-size:42px;font-weight:800;margin:20px 0;">
                        ${skill.title}
                    </h1>

                    <p style="font-size:20px;color:#4b5563;font-weight:600;line-height:1.6;max-width:900px;margin:0 auto;">
                        ${skill.desc}
                    </p>

                    <div style="margin-top:20px;color:#999;">
                        📘 Thời lượng đọc: ${skill.time}
                    </div>

                </div>

                <img 
                    src="${skill.img}" 
                    style="width:100%;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.1);margin-bottom:40px;"
                >

                <div class="article-body"
                     style="font-size:18px;line-height:1.9;color:#333;max-width:800px;margin:0 auto;">
            `;

    if (skill.content && skill.content.length > 0) {
      skill.content.forEach((block) => {
        if (block.type === "paragraph") {
          html += `
                            <p style="margin-bottom:25px;">
                                ${block.text}
                            </p>
                        `;
        }

        if (block.type === "heading") {
          html += `
                            <h2 style="font-size:28px;font-weight:700;margin-top:50px;margin-bottom:20px;">
                                ${block.text}
                            </h2>
                        `;
        }

        if (block.type === "quote") {
          html += `
                            <div class="quote-block"
                                 style="border-left:5px solid #2563eb;
                                        padding:30px;
                                        background:#f0f7ff;
                                        font-style:italic;
                                        margin:40px 0;
                                        border-radius:0 12px 12px 0;">

                                ${block.text}

                            </div>
                        `;
        }

        if (block.type === "alert") {
          html += `
                            <div class="alert-block alert-${block.level}"
                                 style="padding:25px;
                                        border-radius:12px;
                                        margin:30px 0;
                                        font-weight:600;
                                        background:#fff3cd;">

                                ⚠️ ${block.text}

                            </div>
                        `;
        }

        if (block.type === "image") {
          html += `
                            <figure style="margin:40px 0; text-align:center;">
                                <img src="${block.src}" 
                                    alt="${block.caption || ""}" 
                                    style="width:100%; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,0.08);" 
                                    loading="lazy">
                                ${block.caption ? `<figcaption style="margin-top:10px; font-size:14px; color:#6b7280;">${block.caption}</figcaption>` : ""}
                            </figure>`;
        }

        if (block.type === "list") {
          const listItems = block.items
            .map(
              (item) =>
                `<li style="margin-bottom:10px; line-height:1.7;">${item}</li>`,
            )
            .join("");

          html += `
                            <ul style="margin:25px 0 35px 20px; padding-left:15px;">
                                ${listItems}
                            </ul>`;
        }

        if (block.type === "reference") {
          const refs = block.items
            .map(
              (ref) => `
                                    <li style="margin-bottom:8px;">
                                        <a href="${ref.url}" target="_blank" 
                                        style="color:#2563eb; text-decoration:none; font-weight:500;">
                                        ${ref.label}
                                        </a>
                                    </li>
                                `,
            )
            .join("");

          html += `
                                <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb;">
                                    <h3 style="font-size:18px; margin-bottom:12px;">Nguồn tham khảo</h3>
                                    <ul style="padding-left:18px;">
                                        ${refs}
                                    </ul>
                                </div>
                            `;
        }
      });
    } else {
      html += `
                    <p>
                        Nội dung đang được cập nhật...
                    </p>
                `;
    }

    html += `</div>`;

    document.getElementById("detailRender").innerHTML = html;
  } catch (err) {
    console.error("Lỗi tải kỹ năng:", err);

    document.getElementById("detailRender").innerHTML = `
                    <p style="text-align:center;">
                        Không thể tải nội dung kỹ năng.
                    </p>
                `;
  }
}

window.onload = loadContent;
