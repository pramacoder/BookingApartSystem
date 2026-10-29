/**
 * Image Optimizer Utility
 * Mengonversi gambar JPG/PNG menjadi WebP secara on-the-fly melalui CDN/Image Proxy
 * sehingga browser pengguna hanya men-download file WebP yang jauh lebih ringan.
 */

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Mengubah URL gambar apa pun (JPG/PNG/Unsplash/Supabase/Eksternal) menjadi URL WebP
 */
export function getOptimizedImageUrl(url: string, options?: OptimizeImageOptions): string {
  if (!url || typeof url !== 'string') return url;

  // Lewati data-uri, svg, atau file yang sudah webp
  if (url.startsWith('data:') || url.includes('.svg') || url.includes('output=webp')) {
    return url;
  }

  // 1. Kasus Khusus: Unsplash CDN (banyak digunakan di katalog & fasilitas project ini)
  // Unsplash memiliki image engine bawaan (Imgix), cukup set fm=webp
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('fm', 'webp');
      parsed.searchParams.set('auto', 'format');
      if (options?.width) parsed.searchParams.set('w', String(options.width));
      if (options?.quality) parsed.searchParams.set('q', String(options.quality));
      return parsed.toString();
    } catch {
      // Jika parsing gagal, gunakan replace query string
      let optimized = url.replace(/fm=(jpg|jpeg|png)/g, 'fm=webp');
      if (!optimized.includes('fm=')) {
        optimized += (optimized.includes('?') ? '&' : '?') + 'fm=webp';
      }
      return optimized;
    }
  }

  // 2. Kasus Khusus: Supabase Storage
  // Supabase mendukung image transformation via render endpoint
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    let renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const separator = renderUrl.includes('?') ? '&' : '?';
    renderUrl += `${separator}format=webp&quality=${options?.quality || 80}`;
    if (options?.width) renderUrl += `&width=${options.width}`;
    return renderUrl;
  }

  // 3. Gambar Eksternal Umum: Gunakan wsrv.nl (Image CDN Proxy Gratis & Open Source)
  // Tidak memerlukan pendaftaran akun / API Key, ditenagai Cloudflare Global Edge & libvips
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const widthParam = options?.width ? `&w=${options.width}` : '';
    const heightParam = options?.height ? `&h=${options.height}` : '';
    const qualityParam = options?.quality ? `&q=${options.quality}` : '&q=80';
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp${widthParam}${heightParam}`;
  }

  return url;
}

