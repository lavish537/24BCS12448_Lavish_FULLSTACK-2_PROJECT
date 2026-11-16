#!/usr/bin/env python3
"""
Generates PROJECT_REPORT.docx for "Hospital Management System"
following the Chandigarh University BE project report format.
Author: Ujjwal Gupta (24BCS12567)
Also draws two PIL diagrams and embeds them in the report.
"""
import os
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
DIAGRAM1 = os.path.join(BASE, "diagram1_graphical_abstract.png")
DIAGRAM2 = os.path.join(BASE, "diagram2_module_diagram.png")
OUTPUT = os.path.join(BASE, "PROJECT_REPORT.docx")

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
F_SANS = os.path.join(FONT_DIR, "DejaVuSans.ttf")
F_SANS_B = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")

BLUE = (31, 78, 121)        # #1f4e79
DARK = (0, 0, 0)
LIGHT_FILL = (255, 255, 255)


# ----------------------------------------------------------------------------
# Diagram helpers
# ----------------------------------------------------------------------------
def font(size, bold=False):
    return ImageFont.truetype(F_SANS_B if bold else F_SANS, size)


def draw_box(draw, xy, lines, fill=LIGHT_FILL, outline=BLUE, width=4,
             title_size=34, sub_size=26):
    """Draw a rectangle and centre the given (text, bold, size) lines in it."""
    x0, y0, x1, y1 = xy
    draw.rectangle(xy, fill=fill, outline=outline, width=width)
    metrics = []
    for text, bold, size in lines:
        f = font(size, bold)
        bbox = draw.textbbox((0, 0), text, font=f)
        metrics.append((f, bbox, bbox[2] - bbox[0], bbox[3] - bbox[1]))
    total = sum(m[3] for m in metrics) + 8 * (len(lines) - 1)
    cy = y0 + (y1 - y0 - total) / 2
    for (text, bold, size), (f, bbox, tw, th) in zip(lines, metrics):
        draw.text((x0 + (x1 - x0 - tw) / 2 - bbox[0], cy - bbox[1]),
                  text, font=f, fill=DARK)
        cy += th + 8


def arrow(draw, x0, y0, x1, y1, width=5):
    """Axis-aligned or diagonal arrow from (x0, y0) to (x1, y1)."""
    import math
    draw.line([x0, y0, x1, y1], fill=DARK, width=width)
    dx, dy = x1 - x0, y1 - y0
    dist = math.hypot(dx, dy) or 1
    ux, uy = dx / dist, dy / dist
    px, py = -uy, ux
    hl, hw = 24, 11
    bx, by = x1 - ux * hl, y1 - uy * hl
    pts = [(x1, y1), (bx + px * hw, by + py * hw), (bx - px * hw, by - py * hw)]
    draw.polygon(pts, fill=DARK)


def edge_point(cx, cy, hw, hh, dx, dy):
    """Point where the ray from (cx, cy) in direction (dx, dy) exits a box
    of half-width hw and half-height hh centred at (cx, cy)."""
    import math
    tx = hw / abs(dx) if dx else math.inf
    ty = hh / abs(dy) if dy else math.inf
    t = min(tx, ty)
    return cx + dx * t, cy + dy * t


def make_diagram1():
    W, H = 1760, 780
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    d.text((40, 30), "System Flow of the Hospital Management System",
           font=font(38, True), fill=DARK)

    boxes = [
        ("Admin", None),
        ("Web Browser", None),
        ("React Frontend", "(User Interface)"),
        ("REST API", "(Express, Node.js)"),
        ("Data Store", ("(Doctors, Patients,", "Appointments)")),
    ]
    bw, bh, y0 = 288, 134, 122
    gap = 52
    xs = []
    x = 36
    for _ in boxes:
        xs.append(x)
        x += bw + gap
    for (title, sub), bx in zip(boxes, xs):
        lines = [(title, True, 32)]
        if isinstance(sub, tuple):
            for s in sub:
                lines.append((s, False, 24))
        elif sub:
            lines.append((sub, False, 24))
        draw_box(d, (bx, y0, bx + bw, y0 + bh), lines)
    for i in range(len(boxes) - 1):
        arrow(d, xs[i] + bw, y0 + bh // 2, xs[i + 1] - 4, y0 + bh // 2)

    # return path: down from Data Store, left under the boxes, up into React Frontend
    ret_y = y0 + bh + 110
    ds_cx = xs[4] + bw // 2
    fe_cx = xs[2] + bw // 2
    d.line([ds_cx, y0 + bh, ds_cx, ret_y], fill=DARK, width=5)
    d.line([ds_cx, ret_y, fe_cx, ret_y], fill=DARK, width=5)
    arrow(d, fe_cx, ret_y, fe_cx, y0 + bh + 4)
    label = "JSON response"
    f = font(28)
    bbox = d.textbbox((0, 0), label, font=f)
    d.text(((fe_cx + ds_cx) / 2 - (bbox[2] - bbox[0]) / 2, ret_y + 14),
           label, font=f, fill=DARK)

    # side box for the double booking check done at booking time
    draw_box(d, (36, 560, 900, 690),
             [("Double Booking Check", True, 30),
              ("Same doctor, same date and time", False, 28),
              ("is not allowed", False, 28)],
             fill=(222, 235, 247))
    img.save(DIAGRAM1)


def make_diagram2():
    W, H = 1700, 940
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    d.text((40, 28), "Module Diagram of the Hospital Management System",
           font=font(38, True), fill=DARK)

    # central box
    centre = (560, 400, 1140, 560)
    draw_box(d, centre, [("REST API + Data Store", True, 36),
                         ("(Express, Node.js)", False, 26)],
             fill=(222, 235, 247))
    ccx, ccy = 850, 480

    modules = [
        ((50, 110, 470, 240), [("Authentication", True, 32),
                               ("(Login and Token)", False, 24)]),
        ((1230, 110, 1650, 240), [("Dashboard", True, 32),
                                  ("(Statistics and Lists)", False, 24)]),
        ((50, 415, 470, 545), [("Doctor Management", True, 32),
                               ("(CRUD, Search, CSV Export)", False, 24)]),
        ((1230, 415, 1650, 545), [("Patient Management", True, 32),
                                  ("(CRUD and Records)", False, 24)]),
        ((640, 730, 1060, 860), [("Appointments", True, 32),
                                 ("(Book, Complete, Cancel)", False, 24)]),
    ]
    for (x0, y0, x1, y1), lines in modules:
        draw_box(d, (x0, y0, x1, y1), lines)
        mcx, mcy = (x0 + x1) // 2, (y0 + y1) // 2
        dx, dy = ccx - mcx, ccy - mcy
        # start on the module box edge, end on the central box edge,
        # so the connector never crosses any box text
        sx, sy = edge_point(mcx, mcy, (x1 - x0) / 2, (y1 - y0) / 2, dx, dy)
        ex, ey = edge_point(ccx, ccy, (centre[2] - centre[0]) / 2,
                            (centre[3] - centre[1]) / 2, -dx, -dy)
        arrow(d, sx, sy, ex, ey)
    img.save(DIAGRAM2)


# ----------------------------------------------------------------------------
# DOCX helpers
# ----------------------------------------------------------------------------
def set_cell_borders_none(table):
    tbl = table._tbl
    tblPr = tbl.tblPr
    borders = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        el = OxmlElement('w:' + edge)
        el.set(qn('w:val'), 'none')
        el.set(qn('w:sz'), '0')
        el.set(qn('w:space'), '0')
        el.set(qn('w:color'), 'auto')
        borders.append(el)
    tblPr.append(borders)


def add_para(doc, text="", size=12, bold=False, italic=False, align="justify",
             underline=False, space_after=6, space_before=0, font_name="Times New Roman"):
    p = doc.add_paragraph()
    p.alignment = {"justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
                   "center": WD_ALIGN_PARAGRAPH.CENTER,
                   "left": WD_ALIGN_PARAGRAPH.LEFT,
                   "right": WD_ALIGN_PARAGRAPH.RIGHT}[align]
    pf = p.paragraph_format
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before)
    pf.line_spacing = 1.15
    if text:
        r = p.add_run(text)
        r.font.name = font_name
        r.font.size = Pt(size)
        r.bold = bold
        r.italic = italic
        r.underline = underline
    return p


def chapter_heading(doc, text, size=16, underline=False):
    return add_para(doc, text, size=size, bold=True, align="center",
                    underline=underline, space_before=6, space_after=12)


def section_heading(doc, text, size=13):
    return add_para(doc, text, size=size, bold=True, align="left",
                    space_before=10, space_after=4)


def body(doc, text):
    return add_para(doc, text, size=12, align="justify", space_after=6)


def bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style="List Bullet")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r = p.add_run(bold_prefix)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p


def numbered(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style="List Number")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r = p.add_run(bold_prefix)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p


def set_cell(cell, text, bold=False, size=11, align="left"):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = {"left": WD_ALIGN_PARAGRAPH.LEFT,
                   "center": WD_ALIGN_PARAGRAPH.CENTER}[align]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(size)
    r.bold = bold


def add_data_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        set_cell(table.rows[0].cells[i], h, bold=True, size=11, align="center")
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            set_cell(cells[i], val, size=11)
    if widths:
        for i, w in enumerate(widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    return table


# ----------------------------------------------------------------------------
# Document construction
# ----------------------------------------------------------------------------
TEAM = [("Ujjwal Gupta", "24BCS12567")]
TITLE = "Hospital Management System"


def build():
    make_diagram1()
    make_diagram2()

    doc = Document()
    # Page setup: A4, normal (1 inch) margins
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(2.54)
    sec.bottom_margin = Cm(2.54)
    sec.left_margin = Cm(2.54)
    sec.right_margin = Cm(2.54)

    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)

    # ---------------------------- TITLE PAGE ----------------------------
    add_para(doc, "", space_after=6)
    _logo_p = doc.add_paragraph()
    _logo_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _logo_p.add_run().add_picture(os.path.join(BASE, "cu_logo.png"), width=Cm(6.8))
    add_para(doc, "", space_after=10)
    add_para(doc, TITLE, size=26, bold=True, align="center", space_after=18)
    add_para(doc, "A PROJECT REPORT", size=16, bold=True, align="center", space_after=24)
    add_para(doc, "Submitted by", size=14, align="center", space_after=8)
    for name, uid in TEAM:
        add_para(doc, "%s - %s" % (name, uid), size=14, bold=True,
                 align="center", space_after=4)
    add_para(doc, "", space_after=18)
    add_para(doc, "in partial fulfillment for the award of the degree of",
             size=13, align="center", space_after=8)
    add_para(doc, "Bachelor of Engineering", size=16, bold=True, align="center", space_after=2)
    add_para(doc, "IN", size=14, bold=True, align="center", space_after=2)
    add_para(doc, "Computer Science & Engineering", size=16, bold=True,
             align="center", space_after=30)
    add_para(doc, "Chandigarh University", size=18, bold=True, align="center", space_after=8)
    add_para(doc, "November 2026", size=14, align="center", space_after=0)
    doc.add_page_break()

    # ------------------------- BONAFIDE CERTIFICATE -------------------------
    chapter_heading(doc, "BONAFIDE CERTIFICATE", size=16, underline=True)
    add_para(doc, "", space_after=12)
    names_text = " and ".join(
        "\u201C%s (%s)\u201D" % (n, u) for n, u in TEAM)
    body(doc, "Certified that this project report \u201CHospital Management System\u201D "
              "is the Bonafide work of %s who carried out the project work under "
              "my/our supervision." % names_text)
    add_para(doc, "", space_after=36)

    sig1 = doc.add_table(rows=1, cols=2)
    set_cell_borders_none(sig1)
    c = sig1.rows[0].cells
    set_cell(c[0], "SIGNATURE", size=12)
    set_cell(c[1], "SIGNATURE", size=12)
    row = sig1.add_row().cells
    set_cell(row[0], "", size=12)
    set_cell(row[1], "", size=12)
    row = sig1.add_row().cells
    set_cell(row[0], "_______________", size=12)
    set_cell(row[1], "_______________", size=12)
    row = sig1.add_row().cells
    set_cell(row[0], "SUPERVISOR", bold=True, size=12)
    set_cell(row[1], "HEAD OF DEPARTMENT", bold=True, size=12)

    add_para(doc, "", space_after=24)
    body(doc, "Submitted for the project viva-voce examination held on _______________ .")
    add_para(doc, "", space_after=36)

    sig2 = doc.add_table(rows=1, cols=2)
    set_cell_borders_none(sig2)
    c = sig2.rows[0].cells
    set_cell(c[0], "SIGNATURE", size=12)
    set_cell(c[1], "SIGNATURE", size=12)
    row = sig2.add_row().cells
    set_cell(row[0], "", size=12)
    set_cell(row[1], "", size=12)
    row = sig2.add_row().cells
    set_cell(row[0], "_______________", size=12)
    set_cell(row[1], "_______________", size=12)
    row = sig2.add_row().cells
    set_cell(row[0], "INTERNAL EXAMINER", bold=True, size=12)
    set_cell(row[1], "EXTERNAL EXAMINER", bold=True, size=12)
    doc.add_page_break()

    # ------------------------------- ABSTRACT -------------------------------
    chapter_heading(doc, "ABSTRACT", size=16, underline=True)
    body(doc, "In many small hospitals and clinics, the records of doctors and patients "
              "and the daily appointment list are still maintained in registers or on "
              "paper slips at the reception. In such a system, searching for a doctor or "
              "a patient is slow, it is not known which doctor is free at what time, and "
              "sometimes the same time slot of a doctor is given to two patients by "
              "mistake. This project, Hospital Management System, is a web based "
              "application developed to digitise this daily working of a small hospital. "
              "The system provides a secure login for the administrator and separate "
              "modules for managing the doctors, the patients and the appointments. The "
              "frontend is developed in React and runs in the web browser, while the "
              "backend is a REST API developed in Node.js with Express. Both parts "
              "communicate with each other through JSON messages over HTTP. At the time "
              "of booking, the system checks that the doctor does not already have an "
              "appointment at the same date and time, so double booking is stopped by "
              "the system itself. The consultation fee of the doctor is copied on the "
              "appointment at booking time, and the fee is counted as collected only "
              "when the appointment is marked completed. A dashboard presents the main "
              "figures of the hospital, including total patients, total doctors, "
              "appointments of today, scheduled and completed appointments and the "
              "total consultation fees collected. The complete application runs from a "
              "single server, and the project is kept ready for deployment on the "
              "Vercel cloud platform.")
    add_para(doc, "", space_after=12)

    # -------------------------- GRAPHICAL ABSTRACT --------------------------
    chapter_heading(doc, "GRAPHICAL ABSTRACT", size=16, underline=True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(DIAGRAM1, width=Cm(15.8))
    add_para(doc, "Figure: Graphical Abstract of the Hospital Management System",
             size=11, italic=True, align="center", space_after=6)
    doc.add_page_break()

    # ----------------------------- ABBREVIATIONS -----------------------------
    chapter_heading(doc, "ABBREVIATIONS/SYMBOLS", size=16, underline=True)
    abbr = [
        ("API", "Application Programming Interface"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("CSS", "Cascading Style Sheets"),
        ("HMS", "Hospital Management System"),
        ("HTML", "HyperText Markup Language"),
        ("HTTP", "HyperText Transfer Protocol"),
        ("JSON", "JavaScript Object Notation"),
        ("REST", "Representational State Transfer"),
        ("SPA", "Single Page Application"),
        ("UI", "User Interface"),
        ("URL", "Uniform Resource Locator"),
    ]
    at = doc.add_table(rows=0, cols=2)
    set_cell_borders_none(at)
    for short, full in abbr:
        row = at.add_row().cells
        set_cell(row[0], short, bold=True, size=12)
        set_cell(row[1], full, size=12)
        row[0].width = Cm(3.5)
        row[1].width = Cm(12.0)
    doc.add_page_break()

    # ------------------------------ CHAPTER 1 ------------------------------
    chapter_heading(doc, "CHAPTER 1. INTRODUCTION")
    section_heading(doc, "1.1 Identification of Client/Need")
    body(doc, "The client for this project is a small hospital or clinic. In such a "
              "hospital, one person at the reception or the administrator handles the "
              "complete work of keeping the doctor records, registering the patients "
              "and fixing the appointments of the day. Even today, a large number of "
              "these hospitals maintain their records in registers or in simple "
              "computer files, and the appointment list is written in a diary. The "
              "reception needs a system in which the record of every doctor and every "
              "patient is available at one place, the appointments of a doctor on a "
              "date are known immediately, and the fee collected for the day can be "
              "seen without adding up the slips by hand. The patients also benefit, "
              "because the reception can tell them the correct time of their "
              "appointment in a few seconds. This need of the client is the starting "
              "point of the present project.")

    section_heading(doc, "1.2 Identification of Problem")
    body(doc, "From the study of the manual system, the following problems were "
              "identified:")
    bullet(doc, "Searching a doctor or a patient in a register is slow, and it becomes "
                "slower as the number of records increases.",
           bold_prefix="Slow search: ")
    bullet(doc, "At any moment it is not known which doctor has how many appointments "
                "on a date, because the appointments are noted at different places in "
                "the diary.",
           bold_prefix="No clear appointment position: ")
    bullet(doc, "The same date and time of a doctor is sometimes given to two patients, "
                "and the mistake is found only when both patients reach the hospital.",
           bold_prefix="Double booking: ")
    bullet(doc, "The consultation fee collected in a day is added up by hand from the "
                "slips, which leads to differences and mistakes.",
           bold_prefix="Fee calculation errors: ")
    bullet(doc, "All the records exist in only one register or diary. If it is lost or "
                "damaged, the complete record of the hospital is lost with it.",
           bold_prefix="Single copy of records: ")
    bullet(doc, "The same doctor or patient is sometimes entered two times, and such "
                "duplicate entries create confusion in the records.",
           bold_prefix="Duplicate entries: ")

    section_heading(doc, "1.3 Identification of Tasks")
    body(doc, "To solve the above problem, the following tasks were identified for this "
              "project:")
    tasks = [
        "Study the existing manual and computer based hospital record systems and note their good and weak points.",
        "Design the data model for doctors, patients and appointments.",
        "Build the user interface in React with separate pages for login, dashboard, doctors, patients and appointments.",
        "Implement the REST API in Express for all the operations of the system.",
        "Implement the logic for booking, completing and cancelling appointments, along with the double booking check and the fee collection.",
        "Test all the flows of the system, including the wrong password case and the case of double booking of a doctor.",
        "Keep the complete application ready to run from a single server and to deploy on a cloud platform.",
        "Prepare the documentation and the project report.",
    ]
    for t in tasks:
        bullet(doc, t)

    section_heading(doc, "1.4 Timeline")
    body(doc, "The project work was completed in the following phases. In the first phase, "
              "the existing systems were studied and the requirements of the hospital were "
              "listed. In the second phase, the design of the system was prepared, which "
              "includes the data model, the list of API endpoints and the layout of the "
              "pages. In the third phase, the actual implementation was done module by "
              "module, first the backend API and then the frontend pages. In the fourth "
              "phase, every flow of the system was tested and the mistakes found were "
              "corrected. In the last phase, the documentation and this report were prepared.")

    section_heading(doc, "1.5 Organization of the Report")
    body(doc, "This report is organised in five chapters. Chapter 1 gives the introduction "
              "of the project. It identifies the client and his need, the problems of the "
              "present system, the tasks taken up in the project and the timeline of the "
              "work. Chapter 2 presents the literature review and background study. It "
              "describes how the reported problem has developed with time, studies the "
              "existing solutions, and then states the problem definition and the goals "
              "and objectives of the project. Chapter 3 describes the design flow and "
              "process of the system. It explains the selection of features, the design "
              "constraints, the design approach that was selected and the implementation "
              "plan, and it presents the working prototype of the system. Chapter 4 gives "
              "the results and validation of the project, with the output of the tests "
              "that were performed on the system. Chapter 5 presents the conclusion of "
              "the work and the improvements that can be taken up in the future.")
    doc.add_page_break()

    # ------------------------------ CHAPTER 2 ------------------------------
    chapter_heading(doc, "CHAPTER 2. LITERATURE REVIEW/BACKGROUND STUDY")
    section_heading(doc, "2.1 Timeline of the Reported Problem")
    body(doc, "The problem of keeping hospital records has changed its form with time. In "
              "the beginning, all the records of patients were written by hand in "
              "registers, and the appointments of the day were noted in a diary at the "
              "reception. With the arrival of personal computers, standalone desktop "
              "software came into use, in which the records were kept on a single "
              "computer of the hospital. This removed some writing work, but the system "
              "could be used only on that one computer and the data could not be shared. "
              "In the next stage, systems working on a local area network and then web "
              "based systems were developed, in which the records are kept on a server "
              "and used through a browser from any computer. At present, the direction "
              "is towards cloud hosted hospital systems, which need no local server and "
              "check appointment clashes and fee totals automatically. The present "
              "project belongs to this latest stage.")

    section_heading(doc, "2.2 Existing Solutions")
    bullet(doc, "The oldest method. All entries are written by hand in registers and the "
                "appointments in a diary. It costs almost nothing, but searching is "
                "slow, the appointment position is not clear, and the records exist in "
                "a single copy only.",
           bold_prefix="Register and diary based system: ")
    bullet(doc, "Records are typed in a spreadsheet file. Searching is faster than a "
                "register, but there is no automatic check for double booking, no "
                "appointment status and no control on wrong entries.",
           bold_prefix="Spreadsheet based system: ")
    bullet(doc, "Software installed on one computer of the hospital, for example small "
                "billing and record packages made for a single desk. These give proper "
                "forms for entry, but the system is tied to one machine and cannot be "
                "opened from outside.",
           bold_prefix="Desktop hospital software: ")
    bullet(doc, "Complete hospital information systems used by large hospitals. Such "
                "systems cover wards, pharmacy, laboratory and billing also, but they "
                "are costly and heavy to install and maintain for a small hospital, and "
                "they need a separate server and technical support.",
           bold_prefix="Large hospital information system: ")

    section_heading(doc, "2.3 Bibliometric Analysis")
    body(doc, "The existing solutions were compared on the basis of their features and "
              "drawbacks. The comparison is given in Table 2.1.")
    add_data_table(
        doc,
        ["Solution Type", "Features", "Drawbacks"],
        [
            ["Manual Registers and Diary",
             "Very low cost; no computer or training required",
             "Slow search; appointment position not clear; double booking happens; records exist in a single copy"],
            ["Spreadsheet (Excel)",
             "Faster search than registers; simple to start; data can be copied",
             "No double booking check; no appointment status; fee total is added by hand; duplicate and wrong entries are common"],
            ["Desktop Software",
             "Proper entry forms; records stored in a database; faster reports",
             "Works on one computer only; no access from outside; installation and backup are manual"],
            ["Web-Based System (Proposed)",
             "Live appointment position; automatic double booking check and fee collection total; accessible through a browser; records at one place",
             "Needs internet connection; data security has to be taken care of"],
        ],
        widths=[3.6, 6.0, 6.2])
    add_para(doc, "Table 2.1: Comparison of Existing Solutions", size=11,
             italic=True, align="center", space_after=8)

    section_heading(doc, "2.4 Review Summary")
    body(doc, "From the review it is clear that manual and spreadsheet based systems are "
              "cheap but fail on appointment checking and fee accounts, while complete "
              "hospital information systems are powerful but too heavy and costly for a "
              "small hospital. There is a clear need for a light web based system that "
              "covers the daily work of a small hospital and can run on the cloud "
              "without any local server.")

    section_heading(doc, "2.5 Problem Definition")
    body(doc, "To design and implement a web based hospital management system with "
              "complete doctor and patient records, appointment booking with an "
              "automatic double booking check, and automatic calculation of the "
              "consultation fees collected, which is accessible from any browser.")

    section_heading(doc, "2.6 Goals/Objectives")
    body(doc, "The goals and objectives of the project are as follows:")
    objectives = [
        "To digitise the doctor records with search and specialization filter facilities.",
        "To maintain the complete records of the patients of the hospital.",
        "To book appointments with a fixed date and time, and to complete or cancel them as required.",
        "To stop the double booking of a doctor at the same date and time automatically.",
        "To calculate the total consultation fees collected from the completed appointments.",
        "To provide a dashboard showing the main figures of the hospital and the appointments of today.",
    ]
    for o in objectives:
        bullet(doc, o)
    doc.add_page_break()

    # ------------------------------ CHAPTER 3 ------------------------------
    chapter_heading(doc, "CHAPTER 3. DESIGN FLOW/PROCESS")
    section_heading(doc, "3.1 Evaluation & Selection of Specifications/Features")
    body(doc, "Keeping the needs of the client in view, the following features were "
              "evaluated and finally selected for the system:")
    features = [
        "Admin login, so that the records of the hospital can be changed only by the authorised person.",
        "A dashboard showing the total patients, total doctors, appointments of today, scheduled appointments, completed appointments and the total consultation fees collected, along with the count of doctors by specialization and a separate list of the appointments of today.",
        "Complete management of doctors (add, view, edit and delete), with search, specialization filter, sorting and export of the list in CSV format.",
        "Complete management of patients (add, view, edit and delete), with search and the number of appointments taken by each patient.",
        "Booking of appointments for a patient with a doctor on a date and time, with a check that the same doctor is not booked again at the same date and time.",
        "Mark Completed and Cancel options for appointments, in which the fee of a completed appointment is counted in the fees collected.",
        "Detail views, in which the complete appointment history of a doctor and all the appointments of a patient can be seen at one place.",
    ]
    for f in features:
        bullet(doc, f)

    section_heading(doc, "3.2 Design Constraints")
    body(doc, "The design of the system was carried out under the following constraints:")
    constraints = [
        "The cost of the project should be almost zero, so only free tiers of services and open source tools were used.",
        "The scope of the system for this semester is a single administrator; separate logins for doctors and patients are not included at this stage.",
        "The data is kept in an in-memory data store, which is within the scope of the course. The store is kept as a separate module so that it can be replaced by MongoDB later without changing the rest of the system.",
        "The system should run in any modern web browser without installing anything on the client side.",
        "Only simple and proven technology should be used, so that the system can be completed and demonstrated within the semester time.",
    ]
    for ctext in constraints:
        bullet(doc, ctext)

    section_heading(doc, "3.3 Analysis of Features and Finalization Subject to Constraints")
    body(doc, "The final list of features was prepared by balancing three things: the "
              "usefulness of the feature for the hospital, the cost of the services "
              "required, and the time available for implementation. Features that are used "
              "in the daily work of the hospital, such as booking and the appointment "
              "list of the day, were given first priority. One important design decision "
              "taken at this stage is that values such as the number of appointments of "
              "today and the fees collected are not stored in the records. They are "
              "derived, that is, calculated from the stored appointments whenever they "
              "are required. Because of this, these values can never go out of step with "
              "the actual records. A second decision is that the consultation fee is "
              "copied on the appointment at the time of booking. If the fee of the "
              "doctor is changed later, the fees of the old appointments do not change.")

    section_heading(doc, "3.4 Design Flow")
    body(doc, "Two approaches were considered for the design of the system. In the first "
              "approach, the traditional server rendered design, the server prepares the "
              "complete page and sends it to the browser for every action of the user. "
              "This approach is simple, but the whole page is loaded again and again, and "
              "the frontend and backend remain tightly joined. In the second approach, "
              "the frontend is a Single Page Application which runs in the browser, and "
              "it talks to the backend through a REST API. Data is exchanged in JSON "
              "format, and only the required part of the page changes. The second "
              "approach was selected for this project, because the interface remains fast "
              "and the same API can be used later by any other client, such as a mobile "
              "application.")
    body(doc, "The flow of one request in the selected design is as follows. The admin "
              "performs an action on a page, for example booking an appointment. The React "
              "frontend sends an HTTP request to the corresponding API endpoint. The "
              "Express backend receives the request, checks the rules of the system, "
              "such as the double booking check, reads or updates the data in the "
              "data store, and prepares the result. Values such as the fees collected "
              "are calculated at this stage. The backend then sends the "
              "result back as a JSON response, and the frontend shows it on the page "
              "without loading the whole page again.")

    section_heading(doc, "3.5 Design Selection")
    body(doc, "On the basis of the above flow, the following selections were made:")
    bullet(doc, "for making the user interface, because it builds fast interfaces "
                "from small components and is widely used for web applications. Vite is "
                "used as the build tool with it.",
           bold_prefix="React with Vite ")
    bullet(doc, "for the backend API, because Express is a light framework on Node.js "
                "and REST APIs can be made in it in a simple and clear way.",
           bold_prefix="Express on Node.js ")
    bullet(doc, "for keeping the data in this version of the system. All records are "
                "kept in one separate store module, so the design allows a database to "
                "be connected later at the same place.",
           bold_prefix="In-memory store module ")
    bullet(doc, "kept ready for deployment, because the frontend and the API of the "
                "project can be hosted together on it and its free tier is sufficient "
                "for this project.",
           bold_prefix="Vercel ")

    section_heading(doc, "3.6 Implementation Plan/Methodology")
    body(doc, "The system was implemented module by module. The working of each module "
              "is described below.")
    bullet(doc, "The admin enters the email and password on the login page. The backend "
                "checks them and, if they are correct, returns a token. This token is "
                "stored in the browser, and the internal pages of the system open only "
                "when the token is present. On a wrong password, the backend returns an "
                "error with HTTP status 401.",
           bold_prefix="Authentication module: ")
    bullet(doc, "This module keeps the record of every doctor: name, specialization, "
                "qualification, experience in years, consultation fee, phone number and "
                "email. Doctors can be added, edited, deleted and searched by name or "
                "specialization, and the list can be filtered by specialization. The "
                "list can be sorted by name, fee or experience and downloaded in CSV "
                "format. The detail view of a doctor shows his complete appointment "
                "history.",
           bold_prefix="Doctor management module: ")
    bullet(doc, "This module keeps the record of every patient: name, email, phone "
                "number, age, gender and blood group. Patients can be added, edited, "
                "deleted and searched by name or email. The number of appointments "
                "taken by a patient is shown with his record, and the detail view "
                "shows all his appointments.",
           bold_prefix="Patient management module: ")
    bullet(doc, "This is the main working module of the hospital. For booking an "
                "appointment, the admin selects the patient and the doctor and gives "
                "the date, time and reason. The system first checks that the doctor "
                "does not already have a scheduled appointment at the same date and "
                "time; if such an appointment is present, the booking is not allowed "
                "and an error message is shown. The consultation fee of the doctor is "
                "copied on the appointment at this time. A scheduled appointment can "
                "be marked completed or can be cancelled.",
           bold_prefix="Appointments module: ")
    bullet(doc, "The fee of an appointment is counted as collected only when the "
                "appointment is marked completed. The total fees collected is the sum "
                "of the fees of all the completed appointments, and it is calculated "
                "by the backend whenever the dashboard is opened. The fees of "
                "scheduled and cancelled appointments are not counted.",
           bold_prefix="Fee collection: ")
    bullet(doc, "The dashboard collects the figures from all the modules and shows "
                "them at one place: total patients, total doctors, appointments of "
                "today, scheduled appointments, completed appointments and the total "
                "fees collected, together with the count of doctors by specialization "
                "and a separate list of the appointments of today.",
           bold_prefix="Dashboard module: ")

    section_heading(doc, "3.7 Prototype")
    body(doc, "The prototype of the system is fully developed and working. It contains "
              "five screens. The Login screen takes the email and password of the admin. "
              "The Dashboard screen shows the main figures of the hospital, the count of "
              "doctors by specialization and the list of the appointments of today. The "
              "Doctors screen shows the doctor records with search, specialization "
              "filter, sorting and CSV export, and the details and appointment history "
              "of any doctor can be opened from it. The Patients screen shows the "
              "patient records with the number of appointments of each patient. The "
              "Appointments screen is used for booking appointments and for marking "
              "them completed or cancelled. The system starts with sample data of 10 "
              "doctors, 8 patients and 8 appointments, out of which 2 appointments are "
              "of today, 5 are scheduled and 2 are completed, so that every feature can "
              "be seen working immediately. The module diagram of the system is shown "
              "in Figure 3.1.")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(DIAGRAM2, width=Cm(15.2))
    add_para(doc, "Figure 3.1: Module Diagram of the Hospital Management System",
             size=11, italic=True, align="center", space_after=6)
    doc.add_page_break()

    # ------------------------------ CHAPTER 4 ------------------------------
    chapter_heading(doc, "CHAPTER 4. RESULTS & VALIDATION", underline=True)
    body(doc, "The complete system was tested after development on the local machine, "
              "after the production build of the frontend, so that the complete "
              "application ran from a single server. The main results obtained are "
              "given below:")
    results = [
        "The production build of the frontend was completed successfully, and the complete application ran from a single server on port 5000.",
        "On entering the correct email and password (admin@hospital.com / admin123), the login returned a token and opened the dashboard. On a wrong password, the login was rejected with HTTP status 401.",
        "The dashboard showed the correct figures of the starting data: 8 patients, 10 doctors, 2 appointments of today, 5 scheduled appointments and 2 completed appointments.",
        "The total consultation fees collected was shown as \u20B91,100, which is the sum of the fees of the 2 completed appointments (\u20B9700 and \u20B9400).",
        "Search and specialization filter of doctors gave correct results, the list could be sorted by name, fee and experience, and the doctor list was downloaded successfully in CSV format.",
        "A new doctor was added from the doctors page and was then deleted; both operations worked correctly and the list was updated at once.",
        "A new patient was added, and a new appointment was booked for a patient with a doctor on a free date and time. The fee of the doctor was copied on the appointment at booking time.",
        "When the same doctor was booked again at the same date and time, the system blocked the booking and returned the message \u201CDoctor already has an appointment at this date and time\u201D with HTTP status 400.",
        "On marking a scheduled appointment of \u20B9700 as completed, its status changed to completed and the total fees collected increased from \u20B91,100 to \u20B91,800.",
        "The detail view of a doctor showed his complete appointment history, and the detail view of a patient showed all the appointments taken by him.",
    ]
    for rtext in results:
        bullet(doc, rtext)
    add_para(doc, "", space_after=6)
    body(doc, "The summary of the test cases is given in Table 4.1.")
    add_data_table(
        doc,
        ["Test Case", "Expected Result", "Obtained Result", "Result"],
        [
            ["Login", "Correct credentials give a token; wrong password is rejected with 401",
             "Token received on correct login; 401 error on wrong password", "Pass"],
            ["Doctor Search and Filter", "Only the doctors matching the search word or specialization are shown",
             "Matching doctors shown correctly for name and specialization search", "Pass"],
            ["Add and Delete Doctor", "A new doctor is added to the list and can be deleted",
             "Doctor added and deleted successfully, list updated at once", "Pass"],
            ["Book Appointment", "Appointment is booked with the fee of the doctor copied on it",
             "Appointment booked and the consultation fee was attached to it", "Pass"],
            ["Double Booking Guard", "Booking the same doctor at the same date and time is rejected with 400",
             "Booking rejected with 400 and the message \u201CDoctor already has an appointment at this date and time\u201D", "Pass"],
            ["Mark Completed and Fee Collection", "Fees collected increase from \u20B91,100 to \u20B91,800 on completing a \u20B9700 appointment",
             "Appointment marked completed and fees collected became \u20B91,800", "Pass"],
        ],
        widths=[3.0, 5.4, 5.4, 1.6])
    add_para(doc, "Table 4.1: Test Cases and Results", size=11, italic=True,
             align="center", space_after=8)

    body(doc, "The screenshots of the working application are shown in Figures "
              "4.1 to 4.5 below.")
    _shots = [
        ("screenshots/1-login.png", "Figure 4.1: Login Screen"),
        ("screenshots/2-dashboard.png", "Figure 4.2: Dashboard"),
        ("screenshots/3-doctors.png", "Figure 4.3: Doctors Management Screen"),
        ("screenshots/4-patients.png", "Figure 4.4: Patients Screen"),
        ("screenshots/5-appointments.png", "Figure 4.5: Appointments (Booking and Status) Screen"),
    ]
    for _rel, _cap in _shots:
        _p = doc.add_paragraph()
        _p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _p.add_run().add_picture(os.path.join(BASE, _rel), width=Cm(15.2))
        add_para(doc, _cap, size=11, italic=True, align="center", space_after=10)
    doc.add_page_break()

    # ------------------------------ CHAPTER 5 ------------------------------
    chapter_heading(doc, "CHAPTER 5. CONCLUSION & FUTURE IMPROVEMENTS")
    section_heading(doc, "5.1 Conclusion")
    body(doc, "In this project, a web based Hospital Management System has been designed "
              "and implemented for a small hospital or clinic. The system has digitised "
              "the records of doctors and patients and the daily appointment list, which "
              "were earlier maintained in registers and a diary. The appointments of any "
              "doctor on any date can be seen at once, and the double booking of a "
              "doctor is stopped by the system at the time of booking itself, so the "
              "mistakes of the manual diary are removed. The fee account of the hospital "
              "is also kept by the system: the consultation fee is fixed on the "
              "appointment at booking time, and the fees collected are calculated from "
              "the completed appointments only. The dashboard gives the complete "
              "position of the hospital at one place. The application is built as a "
              "full stack system, with a React frontend and an Express REST API, and it "
              "runs from a single server. All the objectives set for the project have "
              "been achieved and verified by testing.")

    section_heading(doc, "5.2 Future Improvements")
    body(doc, "The following improvements can be taken up in the future:")
    future = [
        "Connecting a permanent database such as MongoDB, so that the data does not reset when the server restarts.",
        "Giving a separate login to the patients, so that they can book and see their own appointments themselves.",
        "Giving a separate login to the doctors, so that they can see their appointment list of the day.",
        "Sending email or SMS reminders to patients before the date of their appointment.",
        "Preparing fee collection reports, so that the hospital can keep an account of the fees collected in a period.",
        "Adding wards and bed records, so that the admission of patients can also be managed in the same system.",
    ]
    for ftext in future:
        bullet(doc, ftext)

    doc.save(OUTPUT)
    print("Saved:", OUTPUT)


if __name__ == "__main__":
    build()
