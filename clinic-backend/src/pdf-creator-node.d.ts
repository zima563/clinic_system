declare module "pdf-creator-node" {
  export interface PdfCreatorOptions {
    html: string;
    data?: any;
    path?: string;
  }

  export interface PdfCreatorResult {
    filename: string;
  }

  export function create(
    document: PdfCreatorOptions,
    options: object
  ): Promise<PdfCreatorResult>;
}
