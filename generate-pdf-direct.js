const fs = require('fs');
const { marked } = require('marked');
const html_to_pdf = require('html-pdf-node');

async function generatePDF() {
    console.log('📄 Starting PDF generation...');
    
    // Read the markdown file
    const markdown = fs.readFileSync('PROJECT_DOCUMENTATION.md', 'utf8');
    
    // Configure marked
    marked.setOptions({
        breaks: false,
        gfm: true,
        headerIds: true,
        mangle: false
    });
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(markdown);
    
    // Create professional HTML with styling
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 20mm 25mm;
        }
        
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            font-size: 11pt;
        }
        
        .cover-page {
            text-align: center;
            padding: 100px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            page-break-after: always;
        }
        
        .cover-page h1 {
            font-size: 48pt;
            margin-bottom: 30px;
            font-weight: 700;
        }
        
        .cover-page .subtitle {
            font-size: 24pt;
            margin-bottom: 50px;
            font-weight: 300;
        }
        
        .cover-page .authors {
            font-size: 18pt;
            margin-top: 80px;
            font-weight: 500;
            line-height: 2;
        }
        
        .cover-page .date {
            font-size: 14pt;
            margin-top: 40px;
            opacity: 0.9;
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
            font-family: 'Consolas', monospace;
            font-size: 10pt;
            color: #e74c3c;
            border: 1px solid #e0e0e0;
        }
        
        pre {
            background: #2d3436;
            color: #dfe6e9;
            padding: 15px;
            border-radius: 5px;
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
        
        blockquote {
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
            background: #f9f9f9;
            font-style: italic;
        }
        
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="cover-page">
        <h1>TechCorp Solutions</h1>
        <div class="subtitle">Web Programming 2 - Final Project Documentation</div>
        <div class="authors">
            <strong>Mikhael Nabil Salama Rezk</strong><br>
            <strong>Szabó Lilla</strong>
        </div>
        <div class="date">November 28, 2025</div>
    </div>
    ${htmlContent}
</body>
</html>`;

    // PDF options
    const options = {
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '25mm',
            bottom: '20mm',
            left: '25mm'
        }
    };

    const file = { content: htmlTemplate };

    try {
        console.log('🔄 Converting to PDF...');
        const pdfBuffer = await html_to_pdf.generatePdf(file, options);
        
        // Write PDF to file
        fs.writeFileSync('PROJECT_DOCUMENTATION.pdf', pdfBuffer);
        
        console.log('✅ SUCCESS!');
        console.log('');
        console.log('📄 PDF generated: PROJECT_DOCUMENTATION.pdf');
        console.log('📍 Location: ' + __dirname);
        console.log('');
        console.log('✓ Professional cover page included');
        console.log('✓ Student names: Mikhael Nabil Salama Rezk & Szabó Lilla');
        console.log('✓ Optimized for printing and submission');
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    }
}

generatePDF();
