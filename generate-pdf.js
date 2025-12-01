const fs = require('fs');
const { marked } = require('marked');

// Read the markdown file
const markdown = fs.readFileSync('PROJECT_DOCUMENTATION.md', 'utf8');

// Configure marked for better HTML output
marked.setOptions({
    breaks: false,
    gfm: true,
    headerIds: true,
    mangle: false
});

// Convert markdown to HTML
const htmlContent = marked.parse(markdown);

// Create a professional PDF-ready HTML document
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechCorp Solutions - Project Documentation</title>
    <style>
        @page {
            size: A4;
            margin: 2cm 2.5cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            font-size: 11pt;
            background: #ffffff;
        }
        
        /* Cover Page Styling */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            page-break-after: always;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px;
        }
        
        .cover-page h1 {
            font-size: 48pt;
            margin-bottom: 30px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-page .subtitle {
            font-size: 24pt;
            margin-bottom: 50px;
            font-weight: 300;
        }
        
        .cover-page .authors {
            font-size: 18pt;
            margin-top: 80px;
            font-weight: 400;
        }
        
        .cover-page .date {
            font-size: 14pt;
            margin-top: 30px;
            opacity: 0.9;
        }
        
        /* Main Content */
        .content {
            max-width: 100%;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 24pt;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            page-break-after: avoid;
        }
        
        h2 {
            color: #34495e;
            font-size: 18pt;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #95a5a6;
            page-break-after: avoid;
        }
        
        h3 {
            color: #555;
            font-size: 14pt;
            margin-top: 25px;
            margin-bottom: 12px;
            font-weight: 600;
            page-break-after: avoid;
        }
        
        h4 {
            color: #666;
            font-size: 12pt;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: 600;
            page-break-after: avoid;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
            line-height: 1.8;
        }
        
        ul, ol {
            margin-left: 25px;
            margin-bottom: 15px;
            line-height: 1.8;
        }
        
        li {
            margin-bottom: 6px;
        }
        
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 10pt;
            color: #e74c3c;
            border: 1px solid #e0e0e0;
        }
        
        pre {
            background: #2d3436;
            color: #dfe6e9;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            font-size: 9pt;
            line-height: 1.5;
            page-break-inside: avoid;
            border-left: 4px solid #667eea;
        }
        
        pre code {
            background: transparent;
            color: #dfe6e9;
            padding: 0;
            border: none;
            font-size: 9pt;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 10px 12px;
            text-align: left;
        }
        
        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tr:hover {
            background: #e3f2fd;
        }
        
        blockquote {
            border-left: 4px solid #667eea;
            padding-left: 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
            background: #f9f9f9;
            padding: 15px 20px;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }
        
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        /* Page numbers */
        @media print {
            body {
                counter-reset: page;
            }
            
            .content {
                counter-increment: page;
            }
            
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
            }
            
            pre, table, img {
                page-break-inside: avoid;
            }
            
            ul, ol {
                page-break-inside: avoid;
            }
        }
        
        /* Section styling */
        .section {
            margin-bottom: 30px;
        }
        
        /* Footer for print */
        @media print {
            @page {
                @bottom-right {
                    content: counter(page);
                }
            }
        }
    </style>
</head>
<body>
    <div class="cover-page">
        <h1>TechCorp Solutions</h1>
        <div class="subtitle">Web Programming 2 - Final Project Documentation</div>
        <div style="margin-top: 100px;">
            <svg width="150" height="150" viewBox="0 0 100 100" style="opacity: 0.9;">
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="2"/>
                <path d="M 30 50 L 45 65 L 70 35" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="authors">
            <strong>Mikhael Nabil Salama Rezk</strong><br>
            <strong>Szabó Lilla</strong>
        </div>
        <div class="date">November 28, 2025</div>
    </div>
    
    <div class="content">
        ${htmlContent}
    </div>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync('PROJECT_DOCUMENTATION_PRINTABLE.html', html, 'utf8');

console.log('✓ Professional HTML document generated: PROJECT_DOCUMENTATION_PRINTABLE.html');
console.log('');
console.log('To generate PDF:');
console.log('1. Open PROJECT_DOCUMENTATION_PRINTABLE.html in your browser');
console.log('2. Press Ctrl+P (or Cmd+P on Mac)');
console.log('3. Select "Save as PDF" as the printer');
console.log('4. Set margins to "Default" or "None"');
console.log('5. Enable "Background graphics"');
console.log('6. Save as PROJECT_DOCUMENTATION.pdf');
console.log('');
console.log('The document includes:');
console.log('  ✓ Professional cover page with gradient background');
console.log('  ✓ Student names: Mikhael Nabil Salama Rezk & Szabó Lilla');
console.log('  ✓ Optimized typography for PDF printing');
console.log('  ✓ Styled tables, code blocks, and headings');
console.log('  ✓ Page break optimization');
