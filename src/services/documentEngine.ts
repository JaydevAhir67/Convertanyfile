// ConvertAnyFile Executive Document Engine
// Generates publication-grade, print-ready PDFs and Word (.docx) documents with zero required edits

import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Header,
  Footer,
  PageNumber
} from 'docx';

export class DocumentEngine {
  /**
   * Extract text from PDF documents with spatial paragraph reconstruction.
   * Groups words on the same line and detects paragraph breaks based on Y-coordinates.
   */
  public static async extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      const pdfjs = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      }
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let fullDocumentText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        if (items.length === 0) continue;

        let pageStr = '';
        let lastY: number | undefined;
        let lastX: number | undefined;
        let lastHeight: number = 12;

        for (const item of items) {
          if (item.str === undefined) continue;
          const currentY = item.transform[5];
          const currentX = item.transform[4];
          const itemHeight = Math.abs(item.transform[3]) || 12;

          if (lastY !== undefined) {
            const yDiff = Math.abs(currentY - lastY);
            if (yDiff > itemHeight * 1.6) {
              // Big vertical jump -> new paragraph
              pageStr += '\n\n';
            } else if (yDiff > itemHeight * 0.4) {
              // Standard line wrap within paragraph
              pageStr += '\n';
            } else if (lastX !== undefined && currentX - lastX > 5 && !pageStr.endsWith(' ') && !item.str.startsWith(' ')) {
              pageStr += ' ';
            }
          }

          pageStr += item.str;
          lastY = currentY;
          lastX = currentX + (item.width || 0);
          lastHeight = itemHeight;
        }

        if (pageStr.trim()) {
          fullDocumentText += (fullDocumentText ? '\n\n' : '') + pageStr.trim();
        }
      }

      if (fullDocumentText.trim().length > 0) {
        return fullDocumentText;
      }
    } catch (err) {
      console.warn('PDF text extraction notice, checking stream fallback:', err);
    }

    // Fallback: search for text blocks inside PDF binary
    try {
      const uint8 = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8);
      const matches = text.match(/\(([^)]+)\)\s*Tj/g);
      if (matches && matches.length > 0) {
        const words = matches
          .map(m => m.replace(/^[(\s]+|[)\sTj]+$/g, ''))
          .filter(w => w.length > 0);
        if (words.length > 5) {
          return words.join(' ');
        }
      }
    } catch {
      // ignore
    }

    return '';
  }

  /**
   * Convert Word (.docx) ArrayBuffer to an executive, publication-grade PDF.
   * Renders headers, footers, typography hierarchy, lists, and formatted tables.
   */
  public static async docxToPdf(arrayBuffer: ArrayBuffer, docTitle: string = 'Document'): Promise<Blob> {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      if (html && html.trim().length > 0) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxLineWidth = pageWidth - margin * 2;
        const cleanTitle = docTitle.replace(/\.[^/.]+$/, '');

        // Executive Top Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(cleanTitle, margin, margin + 4);

        // Subtle accent bar under title (Red/Rose accent)
        doc.setDrawColor(225, 29, 72); // rose-600
        doc.setLineWidth(0.8);
        doc.line(margin, margin + 7, margin + 35, margin + 7);

        // Divider rule
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(margin, margin + 11, pageWidth - margin, margin + 11);

        let cursorY = margin + 19;
        const childNodes = Array.from(tempDiv.children);

        if (childNodes.length === 0) {
          const rawText = tempDiv.innerText || tempDiv.textContent || '';
          return this.textToPdf(rawText, docTitle);
        }

        for (const node of childNodes) {
          const tag = node.tagName.toLowerCase();
          const text = (node.textContent || '').trim();
          if (!text) continue;

          // Check page break
          if (cursorY > pageHeight - margin - 15) {
            doc.addPage();
            cursorY = margin + 8;
          }

          if (tag === 'h1') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            cursorY += 4;
            const split = doc.splitTextToSize(text, maxLineWidth);
            for (const s of split) {
              if (cursorY > pageHeight - margin - 10) { doc.addPage(); cursorY = margin + 8; }
              doc.text(s, margin, cursorY);
              cursorY += 6.5;
            }
            cursorY += 3;
          } else if (tag === 'h2') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            cursorY += 3;
            const split = doc.splitTextToSize(text, maxLineWidth);
            for (const s of split) {
              if (cursorY > pageHeight - margin - 10) { doc.addPage(); cursorY = margin + 8; }
              doc.text(s, margin, cursorY);
              cursorY += 5.5;
            }
            cursorY += 2;
          } else if (tag === 'h3') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(51, 65, 85);
            cursorY += 2;
            const split = doc.splitTextToSize(text, maxLineWidth);
            for (const s of split) {
              if (cursorY > pageHeight - margin - 10) { doc.addPage(); cursorY = margin + 8; }
              doc.text(s, margin, cursorY);
              cursorY += 5;
            }
            cursorY += 1.5;
          } else if (tag === 'ul' || tag === 'ol') {
            const listItems = Array.from(node.querySelectorAll('li'));
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            for (let idx = 0; idx < listItems.length; idx++) {
              const li = listItems[idx];
              const itemText = (li.textContent || '').trim();
              const prefix = tag === 'ol' ? `${idx + 1}.  ` : '•   ';
              const split = doc.splitTextToSize(`${prefix}${itemText}`, maxLineWidth - 6);
              for (const s of split) {
                if (cursorY > pageHeight - margin - 10) {
                  doc.addPage();
                  cursorY = margin + 8;
                }
                doc.text(s, margin + 4, cursorY);
                cursorY += 5;
              }
            }
            cursorY += 2.5;
          } else if (tag === 'table') {
            const rows = Array.from(node.querySelectorAll('tr'));
            doc.setFontSize(9);
            for (let rIdx = 0; rIdx < rows.length; rIdx++) {
              const row = rows[rIdx];
              const cells = Array.from(row.querySelectorAll('th, td')).map(c => (c.textContent || '').trim());
              const isHeader = rIdx === 0 || row.querySelector('th') !== null;

              if (cursorY > pageHeight - margin - 12) {
                doc.addPage();
                cursorY = margin + 8;
              }

              // Row background
              if (isHeader) {
                doc.setFillColor(241, 245, 249); // slate-100
                doc.rect(margin, cursorY - 4, maxLineWidth, 7, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
              } else {
                if (rIdx % 2 === 1) {
                  doc.setFillColor(248, 250, 252);
                  doc.rect(margin, cursorY - 4, maxLineWidth, 6.5, 'F');
                }
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(51, 65, 85);
              }

              // Subtle bottom border
              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.2);
              doc.line(margin, cursorY + 2.5, pageWidth - margin, cursorY + 2.5);

              // Render cells with even columns
              const colWidth = maxLineWidth / Math.max(cells.length, 1);
              cells.forEach((cell, cIdx) => {
                const truncated = doc.splitTextToSize(cell, colWidth - 4)[0] || '';
                doc.text(truncated, margin + cIdx * colWidth + 2, cursorY);
              });

              cursorY += isHeader ? 7.5 : 6.5;
            }
            cursorY += 3;
          } else {
            // Standard Paragraph
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            const split = doc.splitTextToSize(text, maxLineWidth);
            for (const s of split) {
              if (cursorY > pageHeight - margin - 10) {
                doc.addPage();
                cursorY = margin + 8;
              }
              doc.text(s, margin, cursorY);
              cursorY += 5.2;
            }
            cursorY += 2.5;
          }
        }

        // Clean Corporate Footers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(cleanTitle, margin, pageHeight - 7);
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 18, pageHeight - 7);
        }

        return doc.output('blob');
      }
    } catch (err) {
      console.warn('Mammoth docx parse notice:', err);
    }

    return this.textToPdf(`Document: ${docTitle}\nConverted via Universal Document Engine.`, docTitle);
  }

  /**
   * Convert Plain Text to a formatted, publication-ready PDF.
   * Auto-detects headings, bullet items, and key-value pairs.
   */
  public static textToPdf(text: string, title: string = 'Document'): Blob {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    const cleanTitle = title.replace(/\.[^/.]+$/, '');

    // Executive Header Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(cleanTitle, margin, margin + 4);

    // Accent line
    doc.setDrawColor(225, 29, 72); // rose-600
    doc.setLineWidth(0.8);
    doc.line(margin, margin + 7, margin + 35, margin + 7);

    // Subtle divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 11, pageWidth - margin, margin + 11);

    let cursorY = margin + 19;
    const lines = (text || '').split('\n');

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line) {
        cursorY += 3.5;
        continue;
      }

      if (cursorY > pageHeight - margin - 15) {
        doc.addPage();
        cursorY = margin + 8;
      }

      // Check Heading 1: starts with # or ALL CAPS short line
      if (line.startsWith('# ') || (line.length < 50 && line === line.toUpperCase() && !line.includes(':') && line.length > 3)) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13.5);
        doc.setTextColor(15, 23, 42);
        cursorY += 3;
        const headingText = line.replace(/^#\s*/, '');
        const split = doc.splitTextToSize(headingText, maxLineWidth);
        for (const s of split) {
          doc.text(s, margin, cursorY);
          cursorY += 6;
        }
        cursorY += 2;
      }
      // Heading 2: starts with ##
      else if (line.startsWith('## ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        cursorY += 2;
        const headingText = line.replace(/^##\s*/, '');
        const split = doc.splitTextToSize(headingText, maxLineWidth);
        for (const s of split) {
          doc.text(s, margin, cursorY);
          cursorY += 5.5;
        }
        cursorY += 1.5;
      }
      // Heading 3: starts with ###
      else if (line.startsWith('### ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(51, 65, 85);
        cursorY += 1.5;
        const headingText = line.replace(/^###\s*/, '');
        const split = doc.splitTextToSize(headingText, maxLineWidth);
        for (const s of split) {
          doc.text(s, margin, cursorY);
          cursorY += 5;
        }
        cursorY += 1;
      }
      // Bullet items: starts with -, *, • or number.
      else if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const bulletText = line.replace(/^[-*•]\s+/, '•   ');
        const split = doc.splitTextToSize(bulletText, maxLineWidth - 6);
        for (const s of split) {
          if (cursorY > pageHeight - margin - 10) { doc.addPage(); cursorY = margin + 8; }
          doc.text(s, margin + 4, cursorY);
          cursorY += 5;
        }
        cursorY += 1;
      }
      // Key-Value pair: e.g. "Author: Jaydev", "Status: Verified"
      else if (/^[A-Za-z\s]{2,25}:\s+.+/.test(line) && line.indexOf(':') < 28) {
        const colonIdx = line.indexOf(':');
        const key = line.substring(0, colonIdx + 1);
        const val = line.substring(colonIdx + 1).trim();

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(key, margin, cursorY);

        const keyWidth = doc.getTextWidth(key);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);

        const valSplit = doc.splitTextToSize(val, maxLineWidth - keyWidth - 3);
        if (valSplit.length > 0) {
          doc.text(valSplit[0], margin + keyWidth + 2, cursorY);
          for (let v = 1; v < valSplit.length; v++) {
            cursorY += 5;
            if (cursorY > pageHeight - margin - 10) { doc.addPage(); cursorY = margin + 8; }
            doc.text(valSplit[v], margin + keyWidth + 2, cursorY);
          }
        }
        cursorY += 5.2;
      }
      // Standard body paragraph
      else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        const split = doc.splitTextToSize(line, maxLineWidth);
        for (const s of split) {
          if (cursorY > pageHeight - margin - 10) { doc.addPage(); cursorY = margin + 8; }
          doc.text(s, margin, cursorY);
          cursorY += 5.2;
        }
        cursorY += 2;
      }
    }

    // Clean Corporate Footers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(cleanTitle, margin, pageHeight - 7);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 18, pageHeight - 7);
    }

    return doc.output('blob');
  }

  /**
   * Convert Image (JPG, PNG, WEBP) to an executive, centered A4 PDF document.
   */
  public static async imageToPdf(fileOrBlob: File | Blob, title: string = 'Image Document'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fileOrBlob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const doc = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 15;
          const cleanTitle = title.replace(/\.[^/.]+$/, '');

          // Top subtle title bar
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          doc.text(cleanTitle, margin, margin);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`${img.width} × ${img.height} px`, pageWidth - margin - 22, margin);

          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin, margin + 3, pageWidth - margin, margin + 3);

          // Calculate scaled dimensions to preserve aspect ratio
          const maxImgWidth = pageWidth - margin * 2;
          const maxImgHeight = pageHeight - margin * 2 - 14;
          const imgAspect = img.width / img.height;
          let drawWidth = maxImgWidth;
          let drawHeight = drawWidth / imgAspect;

          if (drawHeight > maxImgHeight) {
            drawHeight = maxImgHeight;
            drawWidth = drawHeight * imgAspect;
          }

          const posX = margin + (maxImgWidth - drawWidth) / 2;
          const posY = margin + 8 + (maxImgHeight - drawHeight) / 2;

          // Draw image on canvas to get clean JPEG/PNG data URL
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            doc.addImage(dataUrl, 'JPEG', posX, posY, drawWidth, drawHeight);
          }

          // Footer
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Converted via ConvertAnyFile`, margin, pageHeight - 6);

          resolve(doc.output('blob'));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for PDF conversion'));
      };

      img.src = url;
    });
  }

  /**
   * Convert Text / Markdown / Extracted PDF stream to an authentic Microsoft Word (.docx) OpenXML document.
   * Features:
   * - Intelligent Paragraph Reconstruction: Recombines broken visual PDF lines into natural flowing paragraphs.
   * - Automatic Heading Hierarchy: Detects `#`, `##`, `###`, ALL-CAPS headers, and numbered sections.
   * - Key-Value Formatting: Bolds labels in metadata fields (`Date: ...`, `Status: ...`).
   * - Native Word OpenXML Bullet Lists and Table structures.
   * - Native Word Headers and Footers with dynamic `PageNumber.CURRENT` and `PageNumber.TOTAL_PAGES`.
   */
  public static async textToDocx(textContent: string, docTitle: string = 'Converted Document'): Promise<Blob> {
    const cleanTitle = docTitle.replace(/\.[^/.]+$/, '');
    const docChildren: (Paragraph | Table)[] = [];

    // Executive Document Title Block
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { before: 180, after: 120 },
        children: [
          new TextRun({
            text: cleanTitle,
            bold: true,
            size: 38, // 19pt
            color: '0F172A',
            font: 'Calibri'
          })
        ]
      })
    );

    // Subtle horizontal divider line under title
    docChildren.push(
      new Paragraph({
        spacing: { after: 240 },
        border: {
          bottom: {
            color: 'E11D48', // rose-600 accent
            size: 12,
            style: BorderStyle.SINGLE
          }
        },
        children: []
      })
    );

    // 1. Group lines into coherent logical paragraphs
    const rawLines = (textContent || '').split('\n');
    const logicalBlocks: { type: 'heading' | 'bullet' | 'keyvalue' | 'table' | 'paragraph'; level?: number; text: string }[] = [];

    let currentParagraph = '';

    const flushCurrentParagraph = () => {
      if (currentParagraph.trim()) {
        logicalBlocks.push({ type: 'paragraph', text: currentParagraph.trim() });
        currentParagraph = '';
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();

      if (!line) {
        flushCurrentParagraph();
        continue;
      }

      // Check Heading 1
      if (line.startsWith('# ') || (line.length < 60 && line === line.toUpperCase() && !line.includes(':') && line.length > 3)) {
        flushCurrentParagraph();
        logicalBlocks.push({ type: 'heading', level: 1, text: line.replace(/^#\s*/, '') });
      }
      // Check Heading 2
      else if (line.startsWith('## ')) {
        flushCurrentParagraph();
        logicalBlocks.push({ type: 'heading', level: 2, text: line.replace(/^##\s*/, '') });
      }
      // Check Heading 3
      else if (line.startsWith('### ')) {
        flushCurrentParagraph();
        logicalBlocks.push({ type: 'heading', level: 3, text: line.replace(/^###\s*/, '') });
      }
      // Check Bullet Item
      else if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        flushCurrentParagraph();
        logicalBlocks.push({ type: 'bullet', text: line.replace(/^[-*•]\s+/, '') });
      }
      // Check Key-Value Pair
      else if (/^[A-Za-z\s]{2,25}:\s+.+/.test(line) && line.indexOf(':') < 28) {
        flushCurrentParagraph();
        logicalBlocks.push({ type: 'keyvalue', text: line });
      }
      // Check Table Row (pipes or tabbed)
      else if (line.includes('|') && line.split('|').length >= 3) {
        flushCurrentParagraph();
        logicalBlocks.push({ type: 'table', text: line });
      }
      // Otherwise: regular paragraph line -> merge with current paragraph
      else {
        if (currentParagraph.length > 0) {
          // If previous didn't end with hyphen, join with space
          if (currentParagraph.endsWith('-')) {
            currentParagraph = currentParagraph.slice(0, -1) + line;
          } else {
            currentParagraph += ' ' + line;
          }
        } else {
          currentParagraph = line;
        }
      }
    }
    flushCurrentParagraph();

    // 2. Build OpenXML Paragraphs & Tables
    for (let b = 0; b < logicalBlocks.length; b++) {
      const block = logicalBlocks[b];

      if (block.type === 'heading') {
        const level = block.level === 1 ? HeadingLevel.HEADING_1 : block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
        const size = block.level === 1 ? 28 : block.level === 2 ? 24 : 22; // 14pt, 12pt, 11pt
        const color = block.level === 1 ? '0F172A' : block.level === 2 ? '1E293B' : '334155';

        docChildren.push(
          new Paragraph({
            heading: level,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: block.text,
                bold: true,
                size,
                color,
                font: 'Calibri'
              })
            ]
          })
        );
      } else if (block.type === 'bullet') {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80, line: 276 },
            children: [
              new TextRun({
                text: block.text,
                size: 22, // 11pt
                color: '334155',
                font: 'Calibri'
              })
            ]
          })
        );
      } else if (block.type === 'keyvalue') {
        const colonIdx = block.text.indexOf(':');
        const key = block.text.substring(0, colonIdx + 1);
        const val = block.text.substring(colonIdx + 1);

        docChildren.push(
          new Paragraph({
            spacing: { after: 100, line: 276 },
            children: [
              new TextRun({
                text: key + ' ',
                bold: true,
                size: 22,
                color: '1E293B',
                font: 'Calibri'
              }),
              new TextRun({
                text: val.trim(),
                size: 22,
                color: '475569',
                font: 'Calibri'
              })
            ]
          })
        );
      } else if (block.type === 'table') {
        // Collect consecutive table rows
        const tableRowsText: string[] = [block.text];
        while (b + 1 < logicalBlocks.length && logicalBlocks[b + 1].type === 'table') {
          b++;
          tableRowsText.push(logicalBlocks[b].text);
        }

        const tableRows: TableRow[] = [];
        for (let r = 0; r < tableRowsText.length; r++) {
          const rawRow = tableRowsText[r];
          // Skip markdown divider row like |---|---|
          if (/^\|?(\s*:?-+:?\s*\|?)+$/.test(rawRow)) continue;

          const cells = rawRow
            .split('|')
            .map(c => c.trim())
            .filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || c.length > 0);

          if (cells.length === 0) continue;

          const isHeaderRow = r === 0;
          tableRows.push(
            new TableRow({
              tableHeader: isHeaderRow,
              children: cells.map(cellText => {
                return new TableCell({
                  width: { size: Math.floor(100 / cells.length), type: WidthType.PERCENTAGE },
                  shading: isHeaderRow ? { fill: 'F1F5F9' } : undefined,
                  margins: { top: 120, bottom: 120, left: 140, right: 140 },
                  children: [
                    new Paragraph({
                      spacing: { line: 240 },
                      children: [
                        new TextRun({
                          text: cellText,
                          bold: isHeaderRow,
                          size: 20,
                          color: isHeaderRow ? '0F172A' : '334155',
                          font: 'Calibri'
                        })
                      ]
                    })
                  ]
                });
              })
            })
          );
        }

        if (tableRows.length > 0) {
          docChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows
            })
          );
          docChildren.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
        }
      } else {
        // Natural Paragraph
        docChildren.push(
          new Paragraph({
            spacing: { after: 160, line: 276 }, // 1.15 line spacing, 8pt after
            children: [
              new TextRun({
                text: block.text,
                size: 22, // 11pt
                color: '334155',
                font: 'Calibri'
              })
            ]
          })
        );
      }
    }

    // Authentic Microsoft Word Document Package
    const doc = new Document({
      title: cleanTitle,
      description: 'Converted via ConvertAnyFile Universal Document Engine',
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: cleanTitle,
                      size: 18, // 9pt
                      color: '94A3B8',
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: 'Page ',
                      size: 18,
                      color: '94A3B8',
                      font: 'Calibri'
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 18,
                      color: '94A3B8',
                      font: 'Calibri'
                    }),
                    new TextRun({
                      text: ' of ',
                      size: 18,
                      color: '94A3B8',
                      font: 'Calibri'
                    }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      size: 18,
                      color: '94A3B8',
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          },
          children: docChildren
        }
      ]
    });

    return await Packer.toBlob(doc);
  }

  /**
   * HTML to PDF
   */
  public static htmlToPdf(htmlString: string, title: string = 'HTML Document'): Blob {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const plainText = tempDiv.innerText || tempDiv.textContent || '';
    return this.textToPdf(plainText, title);
  }
}
