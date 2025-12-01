const fs = require('fs');
const { marked } = require('marked');
const pdf = require('html-pdf');

console.log('📄 Generating homework documentation PDF...');

// Read the markdown documentation
const markdown = fs.readFileSync('HOMEWORK_DOCUMENTATION.md', 'utf8');

// Convert to HTML
const content = marked.parse(markdown);

// Professional HTML template
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web Programming II - Homework Documentation</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            font-size: 10pt;
            margin: 0;
            padding: 20px;
        }
        
        h1 {
            color: #667eea;
            font-size: 24pt;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-top: 30px;
            page-break-before: always;
        }
        
        h1:first-of-type {
            page-break-before: avoid;
            font-size: 32pt;
            text-align: center;
            color: #764ba2;
            border: none;
        }
        
        h2 {
            color: #764ba2;
            font-size: 16pt;
            margin-top: 25px;
            border-left: 4px solid #667eea;
            padding-left: 10px;
        }
        
        h3 {
            color: #555;
            font-size: 13pt;
            margin-top: 20px;
        }
        
        h4 {
            color: #666;
            font-size: 11pt;
            margin-top: 15px;
        }
        
        p {
            margin: 10px 0;
            text-align: justify;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9pt;
            page-break-inside: avoid;
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: 600;
        }
        
        td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 9pt;
            color: #e83e8c;
        }
        
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 8pt;
            line-height: 1.4;
            page-break-inside: avoid;
        }
        
        pre code {
            background: transparent;
            color: #f8f8f2;
            padding: 0;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        
        li {
            margin: 5px 0;
        }
        
        blockquote {
            border-left: 4px solid #667eea;
            padding-left: 15px;
            margin: 15px 0;
            color: #555;
            font-style: italic;
            background: #f8f9fa;
            padding: 10px 15px;
        }
        
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        .success-box {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        .warning-box {
            background: #fff3e0;
            border-left: 4px solid #FF9800;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ddd;
            margin: 30px 0;
        }
        
        a {
            color: #667eea;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8pt;
            color: #999;
            padding: 10px;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
    </style>
</head>
<body>
    ${content}
    <div class="footer">
        Web Programming II Homework - Student206 - December 2025
    </div>
</body>
</html>`;

// PDF options
const options = {
    format: 'A4',
    border: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
    },
    footer: {
        height: '15mm',
        contents: {
            default: '<div style="text-align: center; font-size: 9pt; color: #999;">Page {{page}} of {{pages}}</div>'
        }
    }
};

// Generate PDF
pdf.create(html, options).toFile('HOMEWORK_DOCUMENTATION.pdf', (err, res) => {
    if (err) {
        console.error('❌ Error generating PDF:', err);
        process.exit(1);
    }
    
    console.log('✅ PDF generated successfully!');
    console.log('📁 File:', res.filename);
    
    // Check file size
    const stats = fs.statSync(res.filename);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`📊 Size: ${fileSizeInMB.toFixed(2)} MB`);
    
    // Count pages (approximate)
    const pageCount = Math.ceil(markdown.length / 3000);
    console.log(`📄 Estimated pages: ${pageCount}`);
    
    if (pageCount >= 15) {
        console.log('✅ Meets 15+ page requirement!');
    } else {
        console.log(`⚠️  Warning: Only ${pageCount} pages, requirement is 15+`);
    }
});
