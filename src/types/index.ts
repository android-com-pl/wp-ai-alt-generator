import type { Attachment } from '@wordpress/core-data';

export interface AltGenerationDetails {
  status: '' | 'generating' | 'generated' | 'skipped' | 'error';
  message?: string;
  alt: Attachment<'view'>['alt_text'];
  title?: Attachment<'view'>['title']['rendered'];
  thumbnail?: {
    width: number;
    height: number;
    source_url: string;
  };
  source_url?: Attachment<'view'>['source_url'];
}

export type AltGenerationMap = Map<number, AltGenerationDetails>;
