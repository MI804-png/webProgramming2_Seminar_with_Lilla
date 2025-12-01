const fs = require('fs');
const marked = require('marked');

// Read the markdown file
const markdown = fs.readFileSync('PROJECT_DOCUMENTATION.md', 'utf8');

// Convert markdown to HTML
const htmlContent = marked.parse(markdown);

// Create a complete HTML document with styling
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechCorp Solutions - Project Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 60px;
            background: #fff;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 4px solid #3498db;
        }
        
        h2 {
            color: #34495e;
            font-size: 2em;
            margin-top: 35px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #95a5a6;
        }
        
        h3 {
            color: #7f8c8d;
            font-size: 1.5em;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        
        h4 {
            color: #555;
            font-size: 1.2em;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        code {
            background: #f4f4f4;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #e74c3c;
        }
        
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 20px 0;
            font-size: 0.9em;
            line-height: 1.6;
        }
        
        pre code {
            background: transparent;
            color: #ecf0f1;
            padding: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            font-size: 0.95em;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px 15px;
            text-align: left;
        }
        
        th {
            background: #3498db;
            color: white;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tr:hover {
            background: #e8f4f8;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 40px 0;
        }
        
        a {
            color: #3498db;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        @media print {
            body {
                padding: 20px;
                max-width: 100%;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
            
            pre, table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

// Write the HTML file
fs.writeFileSync('PROJECT_DOCUMENTATION.html', html, 'utf8');
console.log('✓ HTML file generated successfully: PROJECT_DOCUMENTATION.html');
console.log('✓ Open it in a browser and press Ctrl+P to save as PDF');
