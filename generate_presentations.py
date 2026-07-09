import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def apply_background(slide, color):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color

def create_title_slide(prs, title_text, subtitle_text, sub_info_lines, is_rtl=True):
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    apply_background(slide, RGBColor(13, 15, 23)) # Dark slate bg
    
    # Golden horizontal line accent
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(1.5), Inches(2.2), Inches(10.33), Inches(0.04)
    )
    line.fill.solid()
    line.fill.fore_color.rgb = RGBColor(197, 168, 128) # Gold accent
    line.line.fill.background()

    # Main Title
    txBox = slide.shapes.add_textbox(Inches(1.5), Inches(2.5), Inches(10.33), Inches(2))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = 'Arial'
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    if is_rtl:
        p.alignment = PP_ALIGN.RIGHT
    else:
        p.alignment = PP_ALIGN.LEFT
        
    # Subtitle
    p2 = tf.add_paragraph()
    p2.text = subtitle_text
    p2.font.name = 'Arial'
    p2.font.size = Pt(20)
    p2.font.color.rgb = RGBColor(197, 168, 128)
    p2.space_before = Pt(12)
    if is_rtl:
        p2.alignment = PP_ALIGN.RIGHT
    else:
        p2.alignment = PP_ALIGN.LEFT

    # Sub-info lines (Submitter details)
    txBoxInfo = slide.shapes.add_textbox(Inches(1.5), Inches(4.8), Inches(10.33), Inches(2))
    tfInfo = txBoxInfo.text_frame
    tfInfo.word_wrap = True
    for idx, line_text in enumerate(sub_info_lines):
        p_info = tfInfo.add_paragraph() if idx > 0 else tfInfo.paragraphs[0]
        p_info.text = line_text
        p_info.font.name = 'Arial'
        p_info.font.size = Pt(14)
        p_info.font.color.rgb = RGBColor(160, 174, 192) # Muted grey
        p_info.space_before = Pt(6)
        if is_rtl:
            p_info.alignment = PP_ALIGN.RIGHT
        else:
            p_info.alignment = PP_ALIGN.LEFT

def create_content_slide(prs, part_title, slide_title, bullets, is_rtl=True):
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    apply_background(slide, RGBColor(13, 15, 23)) # Dark bg

    # Tiny top header (Part number)
    txPart = slide.shapes.add_textbox(Inches(1.0), Inches(0.4), Inches(11.33), Inches(0.4))
    tfPart = txPart.text_frame
    pPart = tfPart.paragraphs[0]
    pPart.text = part_title
    pPart.font.name = 'Arial'
    pPart.font.size = Pt(12)
    pPart.font.bold = True
    pPart.font.color.rgb = RGBColor(197, 168, 128) # Gold
    if is_rtl:
        pPart.alignment = PP_ALIGN.RIGHT
    else:
        pPart.alignment = PP_ALIGN.LEFT

    # Slide Title
    txTitle = slide.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.33), Inches(0.8))
    tfTitle = txTitle.text_frame
    pTitle = tfTitle.paragraphs[0]
    pTitle.text = slide_title
    pTitle.font.name = 'Arial'
    pTitle.font.size = Pt(28)
    pTitle.font.bold = True
    pTitle.font.color.rgb = RGBColor(255, 255, 255) # White
    if is_rtl:
        pTitle.alignment = PP_ALIGN.RIGHT
    else:
        pTitle.alignment = PP_ALIGN.LEFT

    # Content Area
    txContent = slide.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.33), Inches(5.0))
    tfContent = txContent.text_frame
    tfContent.word_wrap = True

    for idx, bullet in enumerate(bullets):
        p = tfContent.add_paragraph() if idx > 0 else tfContent.paragraphs[0]
        
        # Indent management
        if bullet.startswith("  * ") or bullet.startswith("    * "):
            clean_text = bullet.replace("  * ", "").replace("    * ", "")
            p.level = 1
            p.font.size = Pt(16)
            p.font.color.rgb = RGBColor(160, 174, 192) # Muted text
        else:
            clean_text = bullet.replace("* ", "").replace("- ", "")
            p.level = 0
            p.font.size = Pt(20)
            p.font.bold = True if ":" in clean_text or clean_text.startswith("בתור") else False
            p.font.color.rgb = RGBColor(255, 255, 255) # White text

        p.text = clean_text
        p.font.name = 'Arial'
        p.space_after = Pt(12)
        if is_rtl:
            p.alignment = PP_ALIGN.RIGHT
        else:
            p.alignment = PP_ALIGN.LEFT

def create_table_slide(prs, part_title, slide_title, table_headers, table_rows, is_rtl=True):
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    apply_background(slide, RGBColor(13, 15, 23)) # Dark bg

    # Tiny top header
    txPart = slide.shapes.add_textbox(Inches(1.0), Inches(0.4), Inches(11.33), Inches(0.4))
    tfPart = txPart.text_frame
    pPart = tfPart.paragraphs[0]
    pPart.text = part_title
    pPart.font.name = 'Arial'
    pPart.font.size = Pt(12)
    pPart.font.bold = True
    pPart.font.color.rgb = RGBColor(197, 168, 128)
    if is_rtl:
        pPart.alignment = PP_ALIGN.RIGHT
    else:
        pPart.alignment = PP_ALIGN.LEFT

    # Slide Title
    txTitle = slide.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.33), Inches(0.8))
    tfTitle = txTitle.text_frame
    pTitle = tfTitle.paragraphs[0]
    pTitle.text = slide_title
    pTitle.font.name = 'Arial'
    pTitle.font.size = Pt(28)
    pTitle.font.bold = True
    pTitle.font.color.rgb = RGBColor(255, 255, 255)
    if is_rtl:
        pTitle.alignment = PP_ALIGN.RIGHT
    else:
        pTitle.alignment = PP_ALIGN.LEFT

    # Add Table
    rows = len(table_rows) + 1
    cols = len(table_headers)
    
    # Table bounds
    left = Inches(1.0)
    top = Inches(2.0)
    width = Inches(11.33)
    height = Inches(4.5)
    
    table_shape = slide.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table
    
    # Column styling widths
    col_widths = [Inches(2.5), Inches(3.0), Inches(1.5), Inches(1.5), Inches(2.83)] if cols == 5 else [Inches(3.33)] * cols
    for idx, w in enumerate(col_widths):
        if idx < len(table.columns):
            table.columns[idx].width = w

    # Format Headers
    for col_idx, header in enumerate(table_headers):
        cell = table.cell(0, col_idx)
        cell.text = header
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(197, 168, 128) # Gold headers
        # Text styling
        for paragraph in cell.text_frame.paragraphs:
            paragraph.font.name = 'Arial'
            paragraph.font.size = Pt(13)
            paragraph.font.bold = True
            paragraph.font.color.rgb = RGBColor(13, 15, 23) # Dark text on gold
            if is_rtl:
                paragraph.alignment = PP_ALIGN.RIGHT
            else:
                paragraph.alignment = PP_ALIGN.LEFT

    # Format Body Rows
    for row_idx, row_data in enumerate(table_rows):
        for col_idx, cell_value in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            cell.text = cell_value
            cell.fill.solid()
            # Alternating row background for modern premium feel
            if row_idx % 2 == 0:
                cell.fill.fore_color.rgb = RGBColor(22, 27, 38)
            else:
                cell.fill.fore_color.rgb = RGBColor(17, 20, 28)
            # Text styling
            for paragraph in cell.text_frame.paragraphs:
                paragraph.font.name = 'Arial'
                paragraph.font.size = Pt(11)
                paragraph.font.color.rgb = RGBColor(255, 255, 255)
                if is_rtl:
                    paragraph.alignment = PP_ALIGN.RIGHT
                else:
                    paragraph.alignment = PP_ALIGN.LEFT

# ==========================================
# HEBREW PPTX BUILDER
# ==========================================
def build_hebrew_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # 1. Slide 1 (Title)
    create_title_slide(
        prs,
        "גשר אל-קודס (JLM Legal Bridge)",
        "פלטפורמת אינטייק דיגיטלית חכמה ומותאמת תרבותית למזרח ירושלים",
        ["פרויקט גמר בניהול מוצר 2026", "הקריה האקדמית אונו", "מגיש: עורך דין גשר אל-קודס"],
        is_rtl=True
    )

    # 2. Slide 2 (Part 1 - Problem Definition)
    create_content_slide(
        prs,
        "חלק 1: הגדרת הבעיה והשערות",
        "הגדרת הבעיה והצורך בשוק",
        [
            "הבעיה המרכזית: חסמים קריטיים בנגישות לצדק ומימוש פיצויים רפואיים לנפגעי תאונות עבודה במזרח ירושלים.",
            "נקודות כאב בשוק:",
            "  * חשש כלכלי: פחד של עובדים מעלויות ייעוץ משפטי ראשוניות גבוהות.",
            "  * מחסום שפה ותרבות: חוקים וטפסים של ביטוח לאומי כתובים בעברית משפטית מורכבת בלבד.",
            "  * חשש אישי ותעסוקתי: פחד של פועלים מפיטורין או פגיעה במקום העבודה עקב תביעה.",
            "  * סרבול ביורוקרטי: קושי משמעותי באיסוף והבנת מסמכים רפואיים ראשוניים לאחר פגיעה.",
            "השערות המפתח שהוגדרו בתחילת התהליך (Hypotheses):",
            "  * השערת ערך (Value): שאלון דיגיטלי אינטראקטיבי בשפת האם ובחינם יעלה את ההיענות ב-40%.",
            "  * השערת שמישות (Usability): ממשק קלט קולי (Voice-to-Text) בנייד ימנע נטישה בשל קשיי הקלדה.",
            "  * השערת קיום (Viability): מודל 'תשלום מבוסס הצלחה בלבד' (No Win = No Fee) יסיר לחץ פיננסי."
        ],
        is_rtl=True
    )

    # 3. Slide 3 (Part 2 - User Research Summary)
    create_content_slide(
        prs,
        "חלק 2: סיכום מחקר משתמשים ותובנות",
        "פרסונות, JTBD וסיפורי משתמש",
        [
            "פרסונות המפתח שנחקרו במחקר השמישות:",
            "  * עאדל (פועל בניין פצוע, 42, עיסאוויה): אינו שולט בעברית, חושש מעלויות, פועל אך ורק מהטלפון הנייד.",
            "  * עו\"ד יוסף (שותף במשרד נזיקין, 35): מבזבז 60% מזמנו על סינון ידני של פניות שאין בהן עילה משפטית.",
            "ניתוח Done Be To Jobs (JTBD) מרכזיים:",
            "  * משימה 1 (בדיקת זכאות): קבלת הערכת סיכויי תביעה בצורה אמינה וחינמית תוך 2 דקות מתוך הבית.",
            "  * משימה 2 (העברת פרטים): הקלטת גרסת התאונה בקולו בשפת האם ושליטה מוחלטת בפרטיות (השמדת המידע).",
            "סיפור משתמש מרכזי (User Story):",
            "  * בתור פועל פצוע שאינו שולט בעברית, כאשר אני שוכב בבית לאחר תאונה, אני רוצה לענות על שאלון דינמי קצר בשפת האם שלי (ערבית), כדי שאדע מיידית אם יש לי סיכוי לקבל פיצוי ללא התחייבות כספית."
        ],
        is_rtl=True
    )

    # 4. Slide 4 (Part 3 - Market Research)
    create_content_slide(
        prs,
        "חלק 3: סיכום מחקר שוק ומגמות",
        "פתרונות קיימים בשוק, מגמות וניתוח SWOT",
        [
            "פתרונות קיימים בשוק ופערים מרכזיים:",
            "  * טפסים סטטיים באתרים: קרים, ארוכים, בעברית בלבד, שיעור נטישה מעל 70% במובייל.",
            "  * פנייה והגעה פיזית למשרד: חסם פסיכולוגי גבוה, הוצאות נסיעה וצורך בתיאום פגישה מראש.",
            "  * הפער בשוק: היעדר כלי דינמי, מותאם מובייל (Mobile-First), דו-לשוני עם תמיכה מובנית בהקלטה קולית.",
            "מגמות מובילות בעידן ה-LegalTech וה-AI:",
            "  * Conversational Intake: מעבר של משרדים מובילים בעולם מטפסים קשיחים לצ'אט-בוטים אינטראקטיביים.",
            "  * Voice User Interfaces: עליית השימוש בממשקי קול באוכלוסיות שמתקשות בהקלדה בנייד.",
            "ניתוח SWOT של המוצר:",
            "  * חוזקות (S): לוקליזציה דו-לשונית מלאה, המרת דיבור לטקסט מובנית, ניתוב שאלות חכם ומותאם תרחיש.",
            "  * חולשות (W): תלות של המשתמש בחיבור אינטרנט יציב של הטלפון הנייד.",
            "  * הזדמנויות (O): שילוב עתידי של WhatsApp Business API להנגשה מקסימלית ללא צורך בכניסה לאתר.",
            "  * איומים (T): העתקה על ידי חברות LegalTech גדולות בשוק הישראלי או שינויי רגולציה."
        ],
        is_rtl=True
    )

    # 5. Slide 5 (Part 4 - Product Vision & Value Prop)
    create_content_slide(
        prs,
        "חלק 4: חזון המוצר והצעת הערך",
        "חזון, הצעת ערך ייחודית ואימות השערות",
        [
            "חזון המוצר: להסיר חסמי שפה ופחד כלכלי, ולהוות את הגשר הדיגיטלי הנגיש והאמין ביותר שמחבר בין נפגעי גוף במזרח ירושלים לבין קבלת פיצוי הוגן.",
            "הצעת הערך הייחודית (Unique Value Proposition):",
            "  * הערכת זכאות משפטית ורפואית תוך 2 דקות בלבד, בשפת האם שלך, ללא עלות מראש וללא כל התחייבות – עם שליטה מלאה בפרטיות המידע שלך.",
            "אימות השערות המחקר בשטח (Validation):",
            "  * השערה 1 (מיקום פרטי קשר בסוף): אומתה. העברת שאלת הטלפון לסוף התהליך העלתה את אמון המשתמשים.",
            "  * השערה 2 (העדפת קול על הקלדה): אומתה. פועלים ציינו כי הקלטת נסיבות התאונה בקולם חסכה מאמץ רב."
        ],
        is_rtl=True
    )

    # 6. Slide 6 (Part 5 - Business Model Canvas)
    create_content_slide(
        prs,
        "חלק 5: קנבס מודל עסקי - שלבים 1-4 בלבד",
        "ניתוח ארבעת השלבים המובילים ב-Business Model Canvas",
        [
            "1. פלחי לקוחות (Customer Segments):",
            "  * נפגעי תאונות עבודה ודרכים במזרח ירושלים דוברי ערבית/עברית.",
            "  * משרדי עורכי דין לנזקי גוף בירושלים המחפשים לקוחות מסוננים ואיכותיים מראש.",
            "2. הצעת ערך (Value Propositions):",
            "  * למשתמש: בדיקה מהירה, אנונימית, בשפת האם ובממשק קולי ללא סיכון פיננסי.",
            "  * למשרד עורכי דין: קבלת תיק לקוח מסווג, מאורגן ומסונן היטב ללא עבודת איסוף ידנית.",
            "3. ערוצים (Channels):",
            "  * פרסום ממומן ואורגני במנועי חיפוש (SEO/SEM) בערבית, פורומים וקבוצות פייסבוק של עובדים בירושלים.",
            "4. קשרי לקוחות (Customer Relationships):",
            "  * קשר מבוסס אמון ודיסקרטיות (אפשרות להשמדת נתונים מיידית), ליווי בצ'אט קשוב ללא לחץ."
        ],
        is_rtl=True
    )

    # 7. Slide 7 (Part 6 - Feature Spec & Prioritization)
    table_headers = ["שם הפיצ'ר", "ערך למשתמש", "עדיפות", "זמן (הערכה)", "מדד הצלחה"]
    table_rows = [
        ["צ'אט דינמי", "התאמת שאלות ומניעת סרבול", "Must Have", "15 שעות", "אחוז השלמה מעל 85%"],
        ["זיהוי והקלטה קולית", "מניעת הקלדה קשה בנייד", "Must Have", "20 שעות", "שימוש קולי ב-50% מהתשובות"],
        ["מסך הסכמה וביטחון", "הסרת חשש משפטי ופיננסי", "Must Have", "5 שעות", "ירידה בנטישה בשלב אישור הקשר"],
        ["לוח בקרה לעורך דין", "ארגון מובנה וחיסכון בזמן", "Must Have", "10 שעות", "זמן קריאת תיק פחות מ-3 דקות"],
        ["העלאת מסמכים חכמה", "העלאת אישורים בקלות", "Should Have", "8 שעות", "העלאת מסמך ב-40% מהמקרים"]
    ]
    create_table_slide(
        prs,
        "חלק 6: אפיון ותעדוף פיצ'רים (MVP)",
        "טבלת תעדוף ואפיון פיצ'רים (MoSCoW)",
        table_headers,
        table_rows,
        is_rtl=True
    )

    # 8. Slide 8 (Part 7 - Functional Prototype)
    create_content_slide(
        prs,
        "חלק 7: הפרוטוטייפ הפונקציונלי",
        "זרימת המשתמש בפרוטוטייפ הפעיל (User Flow)",
        [
            "קישורים לפרוטוטייפ הפעיל:",
            "  * פורטל המשתמש / אינטייק דיגיטלי: http://localhost:8000/client_intake.html",
            "  * לוח הבקרה וניהול משרד עו\"ד: http://localhost:8000/lawyer_dashboard.html",
            "זרימת המשתמש במערכת (User Flow):",
            "  1. המשתמש בוחר שפה (ערבית/עברית) ועובר לצ'אט-בוט אינטראקטיבי.",
            "  2. ניתוב דינמי של השאלות בהתאם לסוג הפגיעה (מדלג על שאלות מיותרות).",
            "  3. המשתמש מזין את נסיבות התאונה בהקלטה קולית בשפתו (Web Speech API).",
            "  4. מוצגת הערכת זכאות חינמית מלווה בשסתום ביטחון (הבהרת תנאי 0 ש\"ח מראש).",
            "  5. שליחת המידע ישירות ללוח הבקרה של עורך הדין עם סנכרון לפורטל Outlook המובנה.",
            "התפתחות המוצר: מעבר מ-Wireframes בסיסיים לממשק קולי משופר ולוח ניהול מלא התומך במעברי שפות דינמיים."
        ],
        is_rtl=True
    )

    # 9. Slide 9 (Part 8 - Usability & Measurement)
    create_content_slide(
        prs,
        "חלק 8: דוח שמישות ומדידה",
        "תוצאות סבב הבדיקות והשוואת מדדים כמותיים",
        [
            "מתודולוגיית הבדיקה: 2 סבבי בדיקות שמישות (Moderated) על 6 משתתפים שונים מקבוצת היעד + עורך דין.",
            "שיפורים שבוצעו בעקבות סבב הבדיקות הראשון:",
            "  * פתרון נטישת הטלפון: הצגת שסתום ביטחון מפורט ('0 ש\"ח עלות') לפני בקשת פרטי הקשר בסיום.",
            "  * תיקון לוקליזציה: כפתור האישור ('OK') מתורגם כעת אוטומטית בכל מעבר שפות בהתאם לממשק.",
            "  * שדרוג תמלול קולי: מעבר ללולאת תמלול רציפה שמונעת מחיקת טקסט בעת הפסקות דיבור קצרות.",
            "השוואת מדדים כמותיים (סבב 1 מול סבב 2):",
            "  * שיעור השלמת שאלון (Completion Rate): עלה מ-60% (סבב 1) ל-90% (סבב 2) בזכות מסך הביטחון.",
            "  * זמן ממוצע להשלמה (Time to Complete): ירד מ-5 דקות ל-2 דקות בלבד הודות לממשק הקולי המשופר.",
            "המלצות לגרסה הבאה (Next Steps):",
            "  1. מעבר לבוט מבוסס WhatsApp Business API להנגשה מקסימלית ללא צורך בכניסה לאתר.",
            "  2. מנוע AI לניתוח וסיווג אוטומטי של תמלול קול הלקוח לצורך קישורו לסעיפי נכות של ביטוח לאומי."
        ],
        is_rtl=True
    )

    prs.save("final_presentation_slides_he.pptx")
    print("Hebrew presentation saved successfully.")

# ==========================================
# ARABIC PPTX BUILDER
# ==========================================
def build_arabic_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # 1. Slide 1 (Title)
    create_title_slide(
        prs,
        "جسر القدس القانوني (JLM Legal Bridge)",
        "منصة استبيان رقمية ذكية ومتوافقة ثقافياً للعمال في القدس الشرقية",
        ["مشروع التخرج في مساق إدارة المنتجات 2026", "الكلية الأكاديمية أونو (OAC)", "تقديم: فريق مشروع جسر القدس"],
        is_rtl=True
    )

    # 2. Slide 2 (Part 1 - Problem Definition)
    create_content_slide(
        prs,
        "جزء 1: تعريف المشكلة والفرضيات",
        "تعريف المشكلة والاحتياج في السوق",
        [
            "المشكلة الرئيسية: عوائق حاسمة في الوصول إلى العدالة ونيل التعويضات الطبية لعمال القدس الشرقية المصابين.",
            "نقاط الألم الرئيسية في السوق:",
            "  * الخوف المالي: خوف العمال المستمر من تكاليف الاستشارة القانونية المرتفعة مسبقاً.",
            "  * حاجز اللغة والثقافة: القوانين والمعلومات مكتوبة باللغة العبرية القانونية المعقدة فقط.",
            "  * الخوف الشخصي والوظيفي: خوف الفلاحين والعمال من الفصل أو التعرض للمضايقات عند رفع قضية.",
            "  * التعقيد البيروقراطي: صعوبة جمع وفهم التقارير والمستندات الطبية المطلوبة بعد الإصابة مباشرة.",
            "الفرضيات الأساسية التي تم تبنيها في بداية المشروع (Hypotheses):",
            "  * فرضية القيمة (Value): توفير استبيان رقمي تفاعلي بلغة الأم ومجاناً سيزيد من التجاوب بنسبة 40%.",
            "  * فرضية سهولة الاستخدام (Usability): واجهة الإدخال والتسجيل الصوتي (Voice-to-Text) ستمنع الهجر وصعوبة الكتابة.",
            "  * فرضية البقاء التجاري (Viability): مبدأ 'الدفع عند النجاح فقط' (No Win = No Fee) سيزيل الخوف المالي تماماً."
        ],
        is_rtl=True
    )

    # 3. Slide 3 (Part 2 - User Research Summary)
    create_content_slide(
        prs,
        "جزء 2: ملخص بحث المستخدمين والرؤى المستخلصة",
        "نماذج المستخدمين (Personas) والـ JTBD وقصص المستخدم",
        [
            "نماذج العملاء المستهدفين (Personas):",
            "  * عادل (عامل بناء مصاب، 42 عاماً، العيساوية): لغته العبرية ضعيفة، متخوف من التكاليف، يستخدم الهاتف فقط.",
            "  * المحامي يوسف (شريك في مكتب تعويضات، 35 عاماً): يضيع 60% من وقته في التصفية اليدوية لقضايا لا أمل قانوني فيها.",
            "تحليل المهام المطلوبة للمستخدمين (Jobs-To-Be-Done):",
            "  * المهمة 1 (فحص الأهلية): الحصول على تقييم فوري لأهلية القضية خلال دقيقتين بلمسة واحدة من هاتف العميل بالمنزل.",
            "  * المهمة 2 (مشاركة التفاصيل): شرح ملابسات الحادثة صوتياً بلغة الأم مع تحكم مطلق بالخصوصية (خيار مسح الملف).",
            "قصة المستخدم الأساسية (User Story):",
            "  * بصفتي عاملاً مصاباً لا يتقن اللغة العبرية، عندما أكون مستلقياً في المنزل بعد حادثة عمل، أريد إجابة استبيان تفاعلي باللغة العربية، لأعرف فوراً فرصة حصولي على تعويض دون التزامات مالية مسبقة."
        ],
        is_rtl=True
    )

    # 4. Slide 4 (Part 3 - Market Research)
    create_content_slide(
        prs,
        "جزء 3: ملخص دراسة السوق والتوجهات",
        "الحلول الحالية في السوق، التوجهات التقنية وتحليل SWOT",
        [
            "الحلول الحالية في السوق والفجوات الرئيسية:",
            "  * النماذج الثابتة بالمواقع: باللغة العبرية فقط، طويلة ومعقدة، تؤدي لمعدل هجر يفوق 70% على الهواتف.",
            "  * الزيارات الفعلية للمكاتب: عائق نفسي ومالي كبير، وتتطلب مصاريف مواصلات وتنسيق مواعيد مسبق.",
            "  * الفجوة في السوق: غياب حل تفاعلي مرن داعم للهواتف الذكية، ثنائي اللغة مع إدخال صوتي مدمج لقضايا الإصابات.",
            "التوجهات التقنية الرائدة (LegalTech & AI):",
            "  * Conversational Intake: تحول المكاتب العالمية من النماذج الكلاسيكية إلى الدردشة التفاعلية لتسهيل جمع البيانات.",
            "  * Voice User Interfaces: انتشار الواجهات الصوتية لخدمة الفئات العمالية التي تواجه صعوبة في الكتابة.",
            "تحليل SWOT للمشروع:",
            "  * نقاط القوة (S): دعم ثنائي اللغة متكامل، تحويل الصوت لنصوص، توجيه وتخصيص ذكي للأسئلة.",
            "  * نقاط الضعف (W): اعتماد العميل الكامل على جودة اتصال الإنترنت في هاتف المحمول.",
            "  * الفرص (O): دمج الخدمة مع WhatsApp Business API للوصول إلى أكبر شريحة عمالية ممكنة.",
            "  * التهديدات (T): قيام مكاتب المحاماة الكبرى بنسخ الفكرة التقنية أو حدوث تغييرات في قوانين التأمين."
        ],
        is_rtl=True
    )

    # 5. Slide 5 (Part 4 - Product Vision & Value Prop)
    create_content_slide(
        prs,
        "جزء 4: رؤية المنتج وقيمة العرض الفريدة",
        "الرؤية، وقيمة العرض الفريدة (UVP) وتثبيت الفرضيات",
        [
            "رؤية المنتج: إزالة عوائق اللغة والخوف المالي ليكون المنصة الرقمية الأكثر أماناً وموثوقية لربط المصابين بالقدس بحقوقهم والتعويضات العادلة.",
            "قيمة العرض الفريدة (Unique Value Proposition):",
            "  * فحص وتقييم أهلية التعويض القانوني خلال دقيקתين فقط، بلغة الأم الخاصة بك، مجاناً وبدون التزامات مسبقة – مع تحكم كامل بخصوصية بياناتك.",
            "التحقق من الفرضيات وتثبيتها من خلال البحث (Validation):",
            "  * فرضية 1 (طلب رقم الهاتف في النهاية): أثبتت صحتها كعامل مانع لهجر الاستبيان وزيادة معدل الثقة.",
            "  * فرضية 2 (تفضيل الصوت على الكتابة): أثبتت صحتها بتسهيل إدخال البيانات للعمال وتقليل عقبات تعبئة التقارير."
        ],
        is_rtl=True
    )

    # 6. Slide 6 (Part 5 - Business Model Canvas)
    create_content_slide(
        prs,
        "جزء 5: نموذج العمل التجاري Canvas (المراحل 1-4 فقط)",
        "تحليل المراحل الأربعة الأساسية لنموذج العمل التجاري (BMC)",
        [
            "1. شرائح العملاء (Customer Segments):",
            "  * العمال والمصابون في القدس الشرقية المتحدثون بالعربية أو العبرية.",
            "  * مكاتب المحاماة المتخصصة في قضايا التعويضات الباحثة عن ملفات عملاء مصفاة وجاهزة.",
            "2. القيمة المضافة (Value Propositions):",
            "  * للعميل: فحص فوري وسلس بلغة الأم وتصفية صوتية دون مخاطر مالية مسبقة.",
            "  * للمحامي: استلام ملف قضية متكامل ومبني قانونياً ومصنف دون جهد إدخال وتصفية يدوي.",
            "3. القنوات (Channels):",
            "  * التسويق المدفوع والمجاني على محركات البحث (SEO/SEM) باللغة العربية، المجموعات المهنية وتجمعات العمال في القدس.",
            "4. علاقات العملاء (Customer Relationships):",
            "  * علاقة مبنية على الخصوصية والمصداقية العالية (خيار الحذف الفوري للبيانات)، وتوجيه ودود وتفاعلي عبر الدردشة."
        ],
        is_rtl=True
    )

    # 7. Slide 7 (Part 6 - Feature Spec & Prioritization)
    table_headers_ar = ["اسم الميزة", "القيمة المضافة للمستخدم", "الأولوية", "تقدير الوقت", "مقياس النجاح"]
    table_rows_ar = [
        ["الدردشة التفاعلية", "تغيير الأسئلة لمنع التعقيد والتشتيت", "Must Have", "15 ساعة", "تجاوز نسبة إتمام الاستبيان لـ 85%"],
        ["التسجيل الصوتي", "إزالة عقبات الكتابة على شاشة الموبايل", "Must Have", "20 ساعة", "استخدام الصوت في 50% من الإجابات"],
        ["شاشة الخصوصية والأمان", "إزالة القلق المالي والقانوني للعملاء", "Must Have", "5 ساعات", "انخفاض هجر الاستبيان في خطوة الاتصال"],
        ["لوحة تحكم المحامي", "تنظيم الملفات وتوفير وقت المكتب", "Must Have", "10 ساعات", "تصفح ملف القضية بأقل من 3 دقائق"],
        ["رفع الملفات الذكي", "رفع المستندات والتقارير الطبية بسهولة", "Should Have", "8 ساعات", "رفع مستندات طبية في 40% من الحالات"]
    ]
    create_table_slide(
        prs,
        "جزء 6: مواصفات وتحديد أولويات الميزات (MVP)",
        "جدول تحديد وتفضيل الميزات الأساسية حسب نموذج MoSCoW",
        table_headers_ar,
        table_rows_ar,
        is_rtl=True
    )

    # 8. Slide 8 (Part 7 - Functional Prototype)
    create_content_slide(
        prs,
        "جزء 7: النموذج الأولي الفعال",
        "خطوات تدفق العميل في النموذج الأولي الفعال (User Flow)",
        [
            "روابط تجربة النموذج الأولي الفعال:",
            "  * واجهة الاستبيان الرقمي للعميل: http://localhost:8000/client_intake.html",
            "  * لوحة تحكم المحامي المدمجة: http://localhost:8000/lawyer_dashboard.html",
            "خطوات تدفق البيانات والعميل في النظام:",
            "  1. اختيار اللغة (العربية/العبرية) من صفحة الهبوط والبدء بالدردشة التفاعلية.",
            "  2. توجيه مخصص للأسئلة بناءً على اختيار نوع الحادثة (تخطي الأسئلة غير اللازمة).",
            "  3. شرح تفاصيل الإصابة صوتياً باستخدام ميزة تحويل الصوت لنصوص (Web Speech API).",
            "  4. الحصول على تقييم أولي مجاني للقضية مع شاشات طمأنة الخصوصية والأمان المالي (0 شيكل).",
            "  5. إرسال الطلب وظهوره فوراً في لوحة المحامي المحدثة مع مزامنتها مع Outlook المهام والمواعيد.",
            "تطور المنتج: الانتقال من تصميم أولي مبسط (Wireframes) إلى نظام متكامل يدعم التسجيل الصوتي وإدارة أرشيف العملاء."
        ],
        is_rtl=True
    )

    # 9. Slide 9 (Part 8 - Usability & Measurement)
    create_content_slide(
        prs,
        "جزء 8: تقرير سهولة الاستخدام والقياس",
        "نتائج جولتي الاختبارات ومقارنة القياسات الكمية",
        [
            "منهجية الفحص والمشاركون: جولتان من اختبارات سهولة الاستخدام الموجهة على 6 مشاركين من الشريحة المستهدفة + محامٍ واحد.",
            "العيوب المكتشفة في الجولة الأولى والحلول المطبقة:",
            "  * مشكلة هجر خطوة رقم الهاتف: تم حلها بتأخير الطلب للنهاية وعرض رسائل الأمان المالي ('0 شيكل') مسبقاً.",
            "  * أزرار غير معربة: قمنا بعمل لولكيزציה كاملة لزر التأكيد ('OK' / 'אישור' / 'موافق') بناءً على لغة الواجهة.",
            "  * توقف التسجيل الصوتي: تم تحديث كود الـ API لربط وتسجيل الصوت المتواصل دون مسح النصوص السابقة.",
            "مقارنة القياسات الكمية (الجولة الأولى مقابل الجولة الثانية):",
            "  * معدل إكمال الاستبيان (Completion Rate): ارتفع من 60% في الجولة الأولى إلى 90% في الثانية.",
            "  * متوسط وقت الإكمال (Time to Complete): انخفض من 5 دقائق في الجولة الأولى إلى دقيقتين فقط بفضل الإدخال الصوتي.",
            "التوصيات للمستقبل (Next Steps):",
            "  1. التوسع ونقل الميزة بالكامل نحو منصة WhatsApp Business API لزيادة الوصول وتسهيل الاستخدام.",
            "  2. تطوير محرك ذكاء اصطناعي لتصنيف نسبة العجز الطبي تلقائياً وربطها ببنود مؤسسة التأمين الوطني."
        ],
        is_rtl=True
    )

    prs.save("final_presentation_slides_ar.pptx")
    print("Arabic presentation saved successfully.")

if __name__ == '__main__':
    build_hebrew_presentation()
    build_arabic_presentation()
