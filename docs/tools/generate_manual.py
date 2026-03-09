import io
import math
import os
import textwrap
import zipfile
from xml.sax.saxutils import escape

INPUT_PATH = r"docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.md"
DOCX_PATH = r"docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.docx"
PDF_PATH = r"docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.pdf"
HTML_PATH = r"docs/MANUAL_COMPLETO_DESPERDICIO_ZERO.html"


def read_lines(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read().splitlines()


def classify_line(line, in_code):
    stripped = line.rstrip("\n")

    if stripped.strip().startswith("```"):
        return "fence", stripped

    if in_code:
        return "code", stripped

    if stripped.startswith("### "):
        return "h3", stripped[4:].strip()
    if stripped.startswith("## "):
        return "h2", stripped[3:].strip()
    if stripped.startswith("# "):
        return "h1", stripped[2:].strip()

    if stripped.startswith("- "):
        return "li", stripped[2:]

    if stripped.strip() == "---":
        return "rule", ""

    if stripped.strip() == "":
        return "blank", ""

    return "p", stripped


def paragraph_xml(text, *, bold=False, size_half_points=22, font=None, preserve=False):
    text = text if text is not None else ""
    t_attr = " xml:space=\"preserve\"" if preserve else ""
    rpr_parts = []
    if bold:
        rpr_parts.append("<w:b/>")
    if size_half_points:
        rpr_parts.append(f"<w:sz w:val=\"{size_half_points}\"/>")
        rpr_parts.append(f"<w:szCs w:val=\"{size_half_points}\"/>")
    if font:
        rpr_parts.append(
            f"<w:rFonts w:ascii=\"{font}\" w:hAnsi=\"{font}\" w:cs=\"{font}\"/>"
        )

    rpr = f"<w:rPr>{''.join(rpr_parts)}</w:rPr>" if rpr_parts else ""
    return f"<w:p><w:r>{rpr}<w:t{t_attr}>{escape(text)}</w:t></w:r></w:p>"


def build_docx(lines, out_path):
    in_code = False
    paragraphs = []

    for line in lines:
        kind, value = classify_line(line, in_code)

        if kind == "fence":
            in_code = not in_code
            paragraphs.append(paragraph_xml("", size_half_points=18))
            continue

        if kind == "h1":
            paragraphs.append(paragraph_xml(value, bold=True, size_half_points=36))
            continue
        if kind == "h2":
            paragraphs.append(paragraph_xml(value, bold=True, size_half_points=30))
            continue
        if kind == "h3":
            paragraphs.append(paragraph_xml(value, bold=True, size_half_points=26))
            continue
        if kind == "li":
            paragraphs.append(paragraph_xml(f"- {value}", size_half_points=22))
            continue
        if kind == "rule":
            paragraphs.append(paragraph_xml("----------------------------------------", size_half_points=20))
            continue
        if kind == "blank":
            paragraphs.append(paragraph_xml("", size_half_points=20))
            continue
        if kind == "code":
            paragraphs.append(paragraph_xml(value, size_half_points=20, font="Consolas", preserve=True))
            continue

        paragraphs.append(paragraph_xml(value, size_half_points=22))

    body_xml = "".join(paragraphs)
    document_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {body_xml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
'''

    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
'''

    rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
'''

    with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels)
        zf.writestr("word/document.xml", document_xml)


def pdf_escape(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap_text(text, max_chars):
    if text == "":
        return [""]
    return textwrap.wrap(text, width=max_chars, break_long_words=True, replace_whitespace=False) or [""]


def render_pdf_pages(lines):
    page_w = 595
    page_h = 842
    margin_x = 50
    margin_top = 50
    margin_bottom = 50
    usable_w = page_w - (2 * margin_x)

    pages = []
    page_cmds = []
    y = page_h - margin_top

    in_code = False

    for line in lines:
        kind, value = classify_line(line, in_code)

        if kind == "fence":
            in_code = not in_code
            continue

        if kind == "h1":
            font = "F2"
            size = 18
            leading = 24
            text_lines = wrap_text(value, int(usable_w / (size * 0.55)))
        elif kind == "h2":
            font = "F2"
            size = 15
            leading = 20
            text_lines = wrap_text(value, int(usable_w / (size * 0.55)))
        elif kind == "h3":
            font = "F2"
            size = 13
            leading = 18
            text_lines = wrap_text(value, int(usable_w / (size * 0.55)))
        elif kind == "li":
            font = "F1"
            size = 11
            leading = 15
            text_lines = wrap_text(f"- {value}", int(usable_w / (size * 0.53)))
        elif kind == "rule":
            font = "F1"
            size = 11
            leading = 16
            text_lines = ["------------------------------------------------------------"]
        elif kind == "blank":
            font = "F1"
            size = 11
            leading = 12
            text_lines = [""]
        elif kind == "code":
            font = "F3"
            size = 9
            leading = 12
            text_lines = wrap_text(value, int(usable_w / (size * 0.6)))
        else:
            font = "F1"
            size = 11
            leading = 15
            text_lines = wrap_text(value, int(usable_w / (size * 0.53)))

        for tl in text_lines:
            if y - leading < margin_bottom:
                pages.append(page_cmds)
                page_cmds = []
                y = page_h - margin_top

            cmd = f"BT /{font} {size} Tf {margin_x} {y} Td ({pdf_escape(tl)}) Tj ET"
            page_cmds.append(cmd)
            y -= leading

    if page_cmds:
        pages.append(page_cmds)

    return pages


def build_pdf(lines, out_path):
    pages_cmds = render_pdf_pages(lines)

    objects = []

    def add_obj(data):
        objects.append(data)
        return len(objects)

    catalog_id = add_obj("<< /Type /Catalog /Pages 2 0 R >>")
    pages_id = add_obj("<< /Type /Pages /Kids [] /Count 0 >>")
    font1_id = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font2_id = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font3_id = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    page_ids = []

    for cmds in pages_cmds:
        stream_data = "\n".join(cmds).encode("latin-1", errors="replace")
        content_id = add_obj(
            f"<< /Length {len(stream_data)} >>\nstream\n" + stream_data.decode("latin-1", errors="replace") + "\nendstream"
        )

        page_obj = (
            "<< /Type /Page "
            "/Parent 2 0 R "
            "/MediaBox [0 0 595 842] "
            f"/Contents {content_id} 0 R "
            f"/Resources << /Font << /F1 {font1_id} 0 R /F2 {font2_id} 0 R /F3 {font3_id} 0 R >> >> "
            ">>"
        )
        page_id = add_obj(page_obj)
        page_ids.append(page_id)

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>"

    out = io.BytesIO()
    out.write(b"%PDF-1.4\n")

    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(out.tell())
        out.write(f"{i} 0 obj\n".encode("latin-1"))
        out.write(obj.encode("latin-1", errors="replace"))
        out.write(b"\nendobj\n")

    xref_start = out.tell()
    out.write(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    out.write(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        out.write(f"{off:010d} 00000 n \n".encode("latin-1"))

    out.write(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF"
        ).encode("latin-1")
    )

    with open(out_path, "wb") as f:
        f.write(out.getvalue())


def markdown_to_html(lines):
    html = [
        "<!doctype html>",
        "<html lang='pt-BR'>",
        "<head>",
        "<meta charset='utf-8' />",
        "<meta name='viewport' content='width=device-width, initial-scale=1' />",
        "<title>Manual Completo - Desperdicio Zero</title>",
        "<style>",
        "body{font-family:Arial,Helvetica,sans-serif;line-height:1.55;max-width:980px;margin:32px auto;padding:0 16px;color:#111;}",
        "h1,h2,h3{margin-top:28px;}",
        "pre{background:#f5f5f5;border:1px solid #ddd;padding:12px;overflow:auto;}",
        "code{font-family:Consolas,monospace;}",
        "hr{margin:24px 0;}",
        "</style>",
        "</head>",
        "<body>",
    ]

    in_code = False
    in_ul = False

    for line in lines:
        kind, value = classify_line(line, in_code)

        if kind == "fence":
            if in_ul:
                html.append("</ul>")
                in_ul = False
            if not in_code:
                html.append("<pre><code>")
                in_code = True
            else:
                html.append("</code></pre>")
                in_code = False
            continue

        if in_code:
            html.append(escape(line))
            continue

        if kind == "h1":
            if in_ul:
                html.append("</ul>")
                in_ul = False
            html.append(f"<h1>{escape(value)}</h1>")
        elif kind == "h2":
            if in_ul:
                html.append("</ul>")
                in_ul = False
            html.append(f"<h2>{escape(value)}</h2>")
        elif kind == "h3":
            if in_ul:
                html.append("</ul>")
                in_ul = False
            html.append(f"<h3>{escape(value)}</h3>")
        elif kind == "li":
            if not in_ul:
                html.append("<ul>")
                in_ul = True
            html.append(f"<li>{escape(value)}</li>")
        elif kind == "rule":
            if in_ul:
                html.append("</ul>")
                in_ul = False
            html.append("<hr />")
        elif kind == "blank":
            if in_ul:
                html.append("</ul>")
                in_ul = False
            html.append("<p></p>")
        else:
            if in_ul:
                html.append("</ul>")
                in_ul = False
            html.append(f"<p>{escape(value)}</p>")

    if in_ul:
        html.append("</ul>")

    if in_code:
        html.append("</code></pre>")

    html.append("</body></html>")
    return "\n".join(html)


def main():
    lines = read_lines(INPUT_PATH)
    build_docx(lines, DOCX_PATH)
    build_pdf(lines, PDF_PATH)
    html = markdown_to_html(lines)
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"DOCX={DOCX_PATH}")
    print(f"PDF={PDF_PATH}")
    print(f"HTML={HTML_PATH}")


if __name__ == "__main__":
    main()
