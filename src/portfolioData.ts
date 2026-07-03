export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  googleDriveLink: string;
  type: 'image' | 'video';
};

// Function to extract file ID from various Google Drive link formats
function extractDriveId(link: string): string | null {
  const match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Convert a Google Drive share link into an embeddable format
export function getEmbedUrl(item: PortfolioItem): string {
  const driveId = extractDriveId(item.googleDriveLink);
  
  if (!driveId) {
    // Fallback if not a standard drive link, just return as is (might be direct)
    return item.googleDriveLink;
  }

  if (item.type === 'video') {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  } else {
    // For images, using uc?export=view is the most reliable way to display in an <img> tag
    return `https://drive.google.com/uc?export=view&id=${driveId}`;
  }
}

// ==========================================
// PASTE YOUR GOOGLE DRIVE LINKS BELOW
// ==========================================
// Instructions:
// 1. Upload your image or video to Google Drive.
// 2. Right-click the file and select "Share".
// 3. Under "General access", change it to "Anyone with the link".
// 4. Click "Copy link" and paste it in the \`googleDriveLink\` field below.
// 5. Make sure to set the \`type\` field to either 'image' or 'video'.
export const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Neon Brand Identity',
    category: 'Branding',
    type: 'image',
    googleDriveLink: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop', // Replace with your Drive link
  },
  {
    id: '2',
    title: 'Urban Streetwear Campaign',
    category: 'Photography',
    type: 'image',
    googleDriveLink: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop', // Replace with your Drive link
  },
  {
    id: '3',
    title: 'Future Tech Commercial',
    category: 'Video Production',
    type: 'image', // Change to video if using a drive video link
    googleDriveLink: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop', // Replace with your Drive link
  },
  {
    id: '4',
    title: 'Abstract 3D Motion',
    category: 'Motion Graphics',
    type: 'image',
    googleDriveLink: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', // Replace with your Drive link
  },
];
