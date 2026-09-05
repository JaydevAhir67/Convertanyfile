import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface DataProfilingResult {
  rowCount: number;
  colCount: number;
  columns: string[];
  missingValues: { column: string; count: number }[];
  duplicateRows: number;
  previewRows: Record<string, any>[];
  columnStats: {
    column: string;
    type: 'numeric' | 'string' | 'boolean' | 'date';
    uniqueCount: number;
    nullCount: number;
  }[];
}

export class DataEngine {
  // CSV to JSON
  public static csvToJson(csvContent: string): { jsonString: string; profiling: DataProfilingResult } {
    const parsed = Papa.parse(csvContent.trim(), {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      throw new Error(`CSV Parsing Error: ${parsed.errors[0].message}`);
    }

    const data = parsed.data as Record<string, any>[];
    const profiling = this.profileDataset(data);
    const jsonString = JSON.stringify(data, null, 2);

    return { jsonString, profiling };
  }

  // JSON to CSV
  public static jsonToCsv(jsonContent: string): string {
    let data: any;
    try {
      data = JSON.parse(jsonContent);
    } catch {
      throw new Error('Invalid JSON format: Unable to parse JSON string.');
    }

    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        data = [data]; // convert single object to array of 1 record
      } else {
        throw new Error('JSON data must be an array of objects or a record object.');
      }
    }

    return Papa.unparse(data, {
      quotes: true,
      header: true
    });
  }

  // CSV to Excel (XLSX)
  public static csvToExcel(csvContent: string, sheetName: string = 'Sheet1'): Uint8Array {
    const parsed = Papa.parse(csvContent.trim(), { header: false, skipEmptyLines: true });
    const ws = XLSX.utils.aoa_to_sheet(parsed.data as any[][]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  }

  // Excel to CSV
  public static excelToCsv(arrayBuffer: ArrayBuffer): string {
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Excel workbook contains no readable sheets.');
    }
    const ws = wb.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_csv(ws);
  }

  // JSON to XML
  public static jsonToXml(jsonContent: string, rootElement: string = 'root'): string {
    const data = JSON.parse(jsonContent);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;

    const toXml = (obj: any, indent: string = '  '): string => {
      let str = '';
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          str += `${indent}<item>\n${toXml(item, indent + '  ')}${indent}</item>\n`;
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const validKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
          const val = obj[key];
          if (typeof val === 'object' && val !== null) {
            str += `${indent}<${validKey}>\n${toXml(val, indent + '  ')}${indent}</${validKey}>\n`;
          } else {
            const escaped = String(val ?? '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
            str += `${indent}<${validKey}>${escaped}</${validKey}>\n`;
          }
        });
      } else {
        str += `${indent}${obj}\n`;
      }
      return str;
    };

    xml += toXml(data);
    xml += `</${rootElement}>`;
    return xml;
  }

  // XML to JSON
  public static xmlToJson(xmlString: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML structure: Parser encountered an error.');
    }

    const xmlToObj = (node: Element): any => {
      const obj: any = {};
      if (node.children.length === 0) {
        return node.textContent || '';
      }

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const key = child.nodeName;
        const value = xmlToObj(child);

        if (obj[key]) {
          if (!Array.isArray(obj[key])) {
            obj[key] = [obj[key]];
          }
          obj[key].push(value);
        } else {
          obj[key] = value;
        }
      }
      return obj;
    };

    const result = xmlToObj(xmlDoc.documentElement);
    return JSON.stringify(result, null, 2);
  }

  // Dataset profiling: Detect rows, columns, null values, duplicates, column types
  public static profileDataset(data: Record<string, any>[]): DataProfilingResult {
    const rowCount = data.length;
    if (rowCount === 0) {
      return {
        rowCount: 0,
        colCount: 0,
        columns: [],
        missingValues: [],
        duplicateRows: 0,
        previewRows: [],
        columnStats: []
      };
    }

    const columns = Object.keys(data[0] || {});
    const colCount = columns.length;

    // Missing values
    const missingValues = columns.map(col => {
      let count = 0;
      data.forEach(row => {
        const val = row[col];
        if (val === null || val === undefined || val === '') count++;
      });
      return { column: col, count };
    });

    // Duplicate rows (using JSON hash of rows)
    const seen = new Set<string>();
    let duplicateRows = 0;
    data.forEach(row => {
      const str = JSON.stringify(row);
      if (seen.has(str)) {
        duplicateRows++;
      } else {
        seen.add(str);
      }
    });

    // Column stats
    const columnStats = columns.map(col => {
      const values = data.map(r => r[col]);
      const uniqueCount = new Set(values).size;
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;

      // Infer type
      let numericCount = 0;
      let dateCount = 0;
      const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');

      nonNull.forEach(v => {
        if (typeof v === 'number' || (!isNaN(Number(v)) && v !== '')) numericCount++;
        else if (typeof v === 'string' && !isNaN(Date.parse(v)) && v.length > 5) dateCount++;
      });

      let type: 'numeric' | 'string' | 'boolean' | 'date' = 'string';
      if (nonNull.length > 0 && numericCount === nonNull.length) type = 'numeric';
      else if (nonNull.length > 0 && dateCount === nonNull.length) type = 'date';
      else if (nonNull.length > 0 && nonNull.every(v => typeof v === 'boolean' || v === 'true' || v === 'false')) type = 'boolean';

      return {
        column: col,
        type,
        uniqueCount,
        nullCount
      };
    });

    return {
      rowCount,
      colCount,
      columns,
      missingValues,
      duplicateRows,
      previewRows: data.slice(0, 10),
      columnStats
    };
  }
}
