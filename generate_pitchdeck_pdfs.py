#!/usr/bin/env python3
"""
Professional Pitch Deck PDF Generator for Bazodiac.space
Converts markdown pitch decks to high-quality PDF presentations
"""

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re
import os

# Professional color scheme
COLORS = {
    'primary': HexColor('#0A2540'),      # Deep navy blue
    'secondary': HexColor('#00D4FF'),    # Cyan accent
    'accent': HexColor('#FF6B35'),       # Orange accent
    'text': HexColor('#1A1A2E'),         # Dark text
    'light_text': HexColor('#6B7280'),   # Light gray text
    'background': HexColor('#F8FAFC'),   # Light background
    'white': white,
    'black': black
}

def create_custom_styles():
    """Create custom styles for professional pitch deck"""
    styles = getSampleStyleSheet()
    
    # Custom title style
    if 'TitleSlide' not in styles:
        styles.add(ParagraphStyle(
            name='TitleSlide',
            fontName='Helvetica-Bold',
            fontSize=32,
            textColor=COLORS['primary'],
            alignment=TA_CENTER,
            spaceAfter=0.5*cm,
            leading=40
        ))
    
    # Subtitle style
    if 'Subtitle' not in styles:
        styles.add(ParagraphStyle(
            name='Subtitle',
            fontName='Helvetica',
            fontSize=18,
            textColor=COLORS['light_text'],
            alignment=TA_CENTER,
            spaceAfter=1*cm,
            leading=24
        ))
    
    # Slide title style
    if 'SlideTitle' not in styles:
        styles.add(ParagraphStyle(
            name='SlideTitle',
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=COLORS['primary'],
            alignment=TA_LEFT,
            spaceAfter=0.3*cm,
            leading=30
        ))
    
    # Custom bullet point style (avoid conflict with standard Bullet)
    if 'CustomBullet' not in styles:
        styles.add(ParagraphStyle(
            name='CustomBullet',
            fontName='Helvetica',
            fontSize=12,
            textColor=COLORS['text'],
            alignment=TA_LEFT,
            spaceAfter=0.2*cm,
            leftIndent=0.5*cm,
            leading=18
        ))
    
    # Emphasis style
    if 'Emphasis' not in styles:
        styles.add(ParagraphStyle(
            name='Emphasis',
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=COLORS['secondary'],
            alignment=TA_LEFT,
            spaceAfter=0.3*cm,
            leading=20
        ))
    
    # Footer style
    if 'CustomFooter' not in styles:
        styles.add(ParagraphStyle(
            name='CustomFooter',
            fontName='Helvetica',
            fontSize=9,
            textColor=COLORS['light_text'],
            alignment=TA_CENTER,
            leading=12
        ))
    
    return styles

def parse_markdown_to_slides(markdown_content):
    """Parse markdown content into slides"""
    slides = []
    current_slide = {'title': '', 'content': []}
    
    lines = markdown_content.split('\n')
    for line in lines:
        line = line.strip()
        
        # Slide separator (---)
        if line == '---':
            if current_slide['title'] or current_slide['content']:
                slides.append(current_slide)
            current_slide = {'title': '', 'content': []}
            continue
        
        # Slide title (##)
        elif line.startswith('## '):
            current_slide['title'] = line[3:]
        
        # Main title (#)
        elif line.startswith('# '):
            current_slide['title'] = line[2:]
            current_slide['content'].append(('title', line[2:]))
        
        # Bullet points (- or *)
        elif line.startswith('- ') or line.startswith('* '):
            current_slide['content'].append(('bullet', line[2:]))
        
        # Emphasis (**text**)
        elif line.startswith('**') and line.endswith('**'):
            current_slide['content'].append(('emphasis', line[2:-2]))
        
        # Regular text
        elif line and not line.startswith('#'):
            current_slide['content'].append(('text', line))
    
    # Add last slide
    if current_slide['title'] or current_slide['content']:
        slides.append(current_slide)
    
    return slides

def create_header_footer(canvas, doc, slide_number, total_slides, deck_info):
    """Create professional header and footer"""
    canvas.saveState()
    
    # Header with accent line
    canvas.setFillColor(COLORS['primary'])
    canvas.rect(0, doc.height + 1.5*cm, doc.width, 0.3*cm, fill=1, stroke=0)
    
    # Footer with page number
    canvas.setFillColor(COLORS['light_text'])
    canvas.setFont('Helvetica', 9)
    footer_text = f"{deck_info} | Slide {slide_number}/{total_slides}"
    canvas.drawCentredString(doc.width/2, 1*cm, footer_text)
    
    canvas.restoreState()

def create_title_slide(canvas, doc, title, subtitle, deck_info):
    """Create professional title slide"""
    canvas.saveState()
    
    # Background gradient effect
    canvas.setFillColor(COLORS['background'])
    canvas.rect(0, 0, doc.width, doc.height, fill=1, stroke=0)
    
    # Accent line at top
    canvas.setFillColor(COLORS['secondary'])
    canvas.rect(0, doc.height - 2*cm, doc.width, 0.5*cm, fill=1, stroke=0)
    
    # Main title
    canvas.setFillColor(COLORS['primary'])
    canvas.setFont('Helvetica-Bold', 36)
    canvas.drawCentredString(doc.width/2, doc.height/2 + 2*cm, title)
    
    # Subtitle
    canvas.setFillColor(COLORS['light_text'])
    canvas.setFont('Helvetica', 18)
    canvas.drawCentredString(doc.width/2, doc.height/2 + 0.5*cm, subtitle)
    
    # Deck info
    canvas.setFillColor(COLORS['secondary'])
    canvas.setFont('Helvetica-Bold', 14)
    canvas.drawCentredString(doc.width/2, doc.height/2 - 1.5*cm, deck_info)
    
    # Footer
    canvas.setFillColor(COLORS['light_text'])
    canvas.setFont('Helvetica', 9)
    canvas.drawCentredString(doc.width/2, 1.5*cm, deck_info)
    
    canvas.restoreState()

def generate_pdf_from_markdown(markdown_file, output_pdf, deck_info):
    """Generate professional PDF from markdown"""
    # Read markdown content
    with open(markdown_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Parse slides
    slides = parse_markdown_to_slides(markdown_content)
    
    # Create PDF with landscape A4
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=landscape(A4),
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    styles = create_custom_styles()
    story = []
    
    # Generate slides
    for i, slide in enumerate(slides, 1):
        # Add page break for new slide (except first)
        if i > 1:
            story.append(PageBreak())
        
        # Slide title
        if slide['title']:
            story.append(Paragraph(slide['title'], styles['SlideTitle']))
            story.append(Spacer(1, 0.3*cm))
        
        # Slide content
        for content_type, content in slide['content']:
            if content_type == 'title':
                # Title slide content
                continue
            elif content_type == 'bullet':
                story.append(Paragraph(f"• {content}", styles['CustomBullet']))
            elif content_type == 'emphasis':
                story.append(Paragraph(content, styles['Emphasis']))
            elif content_type == 'text':
                story.append(Paragraph(content, styles['CustomBullet']))
        
        # Add spacer at bottom
        story.append(Spacer(1, 1*cm))
    
    # Build PDF with custom page breaks
    doc.build(story)
    
    return len(slides)

def main():
    """Generate all three pitch deck PDFs"""
    base_dir = '/home/dyai/wuphf-agency-output'
    
    # Define pitch decks
    pitch_decks = [
        {
            'input': 'bazodiac-pitchdeck-v1-seed.md',
            'output': 'Bazodiac_PitchDeck_V1_Seed_Round.pdf',
            'info': 'Bazodiac.space - Seed Round 2026'
        },
        {
            'input': 'bazodiac-pitchdeck-v2-series-a.md',
            'output': 'Bazodiac_PitchDeck_V2_Series_A_2027.pdf',
            'info': 'Bazodiac.space - Series A 2027'
        },
        {
            'input': 'bazodiac-pitchdeck-v3-series-b.md',
            'output': 'Bazodiac_PitchDeck_V3_Series_B_2028.pdf',
            'info': 'Bazodiac.space - Series B 2028'
        }
    ]
    
    print("🚀 Starting Professional Pitch Deck PDF Generation...")
    print("=" * 60)
    
    for deck in pitch_decks:
        input_path = os.path.join(base_dir, deck['input'])
        output_path = os.path.join(base_dir, deck['output'])
        
        print(f"\n📊 Processing: {deck['input']}")
        print(f"   Output: {deck['output']}")
        
        try:
            slide_count = generate_pdf_from_markdown(input_path, output_path, deck['info'])
            print(f"   ✅ Success! Generated {slide_count} slides")
            print(f"   📍 Location: {output_path}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("🎉 Pitch Deck PDF Generation Complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()