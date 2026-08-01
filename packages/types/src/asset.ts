import type { Id, Timestamps } from './common';

export interface AssetThumbnail {
  size: string;
  /** Kept alongside `url` (mirroring the parent `Asset`'s own `s3Key`/`url` pair) so a thumbnail
   * can be deleted from storage later without having to reverse-parse its key back out of a URL. */
  s3Key: string;
  url: string;
}

export interface AssetReplacementEntry {
  s3Key: string;
  url: string;
  replacedAt: string;
}

/** Aggregate counts for the Dashboard — a single Mongo aggregation, since summing `size` client-
 * side across paginated `GET /assets` pages would be both expensive and (missing thumbnail/
 * replacement-history bytes) inaccurate. */
export interface AssetStats {
  total: number;
  totalSizeBytes: number;
}

export interface Asset extends Timestamps {
  id: Id;
  folderId?: Id;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  url: string;
  thumbnails: AssetThumbnail[];
  dimensions?: { width: number; height: number };
  tags: string[];
  altText?: string;
  /** replace-in-place history — distinct from template content-versioning */
  replacementHistory: AssetReplacementEntry[];
  uploadedBy: Id;
}
