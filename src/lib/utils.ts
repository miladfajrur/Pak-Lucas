export function getGoogleDriveDirectLink(url: string): string {
  // Check if it's already a direct link or not a Google Drive link
  if (!url.includes('drive.google.com') || url.includes('uc?export=download')) {
    return url;
  }

  try {
    // Handle standard view links: https://drive.google.com/file/d/FILE_ID/view
    const fileIdRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(fileIdRegex);
    
    if (match && match[1]) {
      const fileId = match[1];
      // Convert to format that triggers automatic download
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Handle shared folder or other links by just returning the original
    return url;
  } catch (error) {
    return url;
  }
}
