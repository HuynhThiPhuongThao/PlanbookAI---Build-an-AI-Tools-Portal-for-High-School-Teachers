export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlDocument(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #111827;
      margin: 32px;
    }
    h1, h2, h3 {
      margin: 0 0 12px;
      color: #0f172a;
    }
    h1 {
      font-size: 24px;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 18px;
      margin-top: 24px;
    }
    h3 {
      font-size: 15px;
      margin-top: 18px;
    }
    p, li {
      font-size: 14px;
    }
    ul, ol {
      margin: 8px 0 0 20px;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 12px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      font-size: 14px;
    }
    .muted {
      color: #6b7280;
      font-size: 13px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    .section {
      margin-top: 20px;
    }
    .page-break {
      page-break-before: always;
    }
    @media print {
      body {
        margin: 16mm;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function htmlToParagraphs(text: string) {
  return escapeHtml(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join('');
}

export function exportWordDocument(filename: string, title: string, bodyHtml: string) {
  const html = buildHtmlDocument(title, bodyHtml);
  triggerDownload(
    filename.endsWith('.doc') ? filename : `${filename}.doc`,
    new Blob([html], { type: 'application/msword;charset=utf-8' }),
  );
}

export function openPrintPreview(title: string, bodyHtml: string) {
  const html = buildHtmlDocument(title, bodyHtml);
  const previewWindow = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');

  if (!previewWindow) {
    alert('Trình duyệt đang chặn cửa sổ in. Hãy cho phép pop-up để xuất PDF.');
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(html);
  previewWindow.document.close();
  previewWindow.focus();

  previewWindow.onload = () => {
    previewWindow.print();
  };
}

export function exportPdfDocument(title: string, bodyHtml: string) {
  const html = buildHtmlDocument(title, bodyHtml);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const frameDocument = iframe.contentWindow?.document;
  if (!frameDocument) {
    document.body.removeChild(iframe);
    openPrintPreview(title, bodyHtml);
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    cleanup();
  };
}

export function exportCsv(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(','))
    .join('\n');

  triggerDownload(
    filename.endsWith('.csv') ? filename : `${filename}.csv`,
    new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8' }),
  );
}
