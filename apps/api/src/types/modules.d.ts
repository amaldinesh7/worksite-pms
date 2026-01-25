/**
 * Type declarations for modules without @types packages in production
 * These are needed because devDependencies are skipped in production builds
 */

declare module 'adm-zip' {
  class AdmZip {
    constructor(filePathOrBuffer?: string | Buffer);
    getEntries(): AdmZip.IZipEntry[];
    readAsText(entry: AdmZip.IZipEntry | string): string;
    readFile(entry: AdmZip.IZipEntry | string): Buffer | null;
    extractAllTo(targetPath: string, overwrite?: boolean): void;
    addFile(entryName: string, content: Buffer, comment?: string): void;
    addLocalFile(localPath: string, zipPath?: string): void;
    writeZip(targetFileName?: string): void;
    toBuffer(): Buffer;
  }

  namespace AdmZip {
    interface IZipEntry {
      entryName: string;
      rawEntryName: Buffer;
      extra: Buffer;
      comment: string;
      isDirectory: boolean;
      header: {
        made: number;
        version: number;
        flags: number;
        method: number;
        time: Date;
        crc: number;
        compressedSize: number;
        size: number;
      };
      getData(): Buffer;
      getDataAsync(callback: (data: Buffer) => void): void;
    }
  }

  export = AdmZip;
}

declare module 'bcrypt' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function hashSync(data: string, saltOrRounds: string | number): string;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function compareSync(data: string, encrypted: string): boolean;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
  export function getRounds(encrypted: string): number;
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }

  interface PDFOptions {
    pagerender?: (pageData: unknown) => string;
    max?: number;
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  export = pdfParse;
}
