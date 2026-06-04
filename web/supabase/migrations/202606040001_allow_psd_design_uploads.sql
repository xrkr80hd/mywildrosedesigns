update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/vnd.adobe.photoshop',
    'application/pdf',
    'application/postscript',
    'application/psd',
    'application/x-photoshop',
    'application/vnd.adobe.illustrator',
    'application/octet-stream'
  ]
where id = 'design-uploads';
