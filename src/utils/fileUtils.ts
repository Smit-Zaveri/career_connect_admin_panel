import toast from "react-hot-toast";

// Base URL for images in production
const BASE_URL = "https://career-connect-admin-panel.vercel.app";
// Check if we're in development mode
const isDevelopment = window.location.hostname === "localhost";

// Storage key for mock uploads
const MOCK_UPLOADS_STORAGE_KEY = "mock_image_uploads";

/**
 * Helper function to handle local file processing
 * In development: Creates a mock storage for images with blob URLs
 * In production: Assumes files are already in the correct location
 */
export const processLocalFile = async (
  file: File,
  communityId: string
): Promise<{
  imageUrl: string;
  width: number;
  height: number;
}> => {
  try {
    // Sanitize filename to prevent issues
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");

    // Create the path where the file will be saved
    const relativeFilePath = `/uploads/${communityId}${sanitizedFileName}`;
    const fullLocalPath = `public${relativeFilePath}`;

    // Get dimensions of the image
    const dimensions = await getImageDimensions(file);

    if (isDevelopment) {
      // Create a persistent blob URL that we'll store in localStorage
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const blobUrl = URL.createObjectURL(blob);

      // Store this blob URL in localStorage to persist between refreshes
      storeMockUpload(communityId, sanitizedFileName, blobUrl);

      // Development mode - provide clear instructions for manual file saving
      console.log(
        "%c=== IMAGE UPLOAD INSTRUCTIONS ===",
        "background: #f7df1e; color: black; font-weight: bold; padding: 4px;"
      );
      console.log(`📁 Save image to: ${fullLocalPath}`);
      console.log(
        `🔗 It will be accessible at: ${window.location.origin}${relativeFilePath}`
      );

      // Create simple toast notifications instead of custom DOM elements
      toast.success("Image uploaded successfully!");
      toast(`Save file to: public/uploads/${communityId}${sanitizedFileName}`, {
        duration: 5000,
        icon: "📁",
      });

      // Create a download link
      downloadFile(file, sanitizedFileName);

      // Create a persistent download button that doesn't use React
      createPersistentDownloadButton(file, sanitizedFileName, communityId);

      // Use the development blob URL for preview but return the "production" URL for storage
      // This way the database has the correct URL, but the UI shows the development version
      return {
        imageUrl: `${window.location.origin}${relativeFilePath}`,
        width: dimensions.width,
        height: dimensions.height,
      };
    }

    // For production, use the actual URL pattern
    const imageUrl = `${BASE_URL}${relativeFilePath}`;

    return {
      imageUrl,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    console.error("Error processing local file:", error);
    toast.error("Error processing image file");
    throw error;
  }
};

/**
 * Helper to download a file
 */
const downloadFile = (file: File, fileName: string): void => {
  try {
    const blobUrl = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

/**
 * Store a mock upload in localStorage for development
 */
const storeMockUpload = (
  communityId: string,
  fileName: string,
  blobUrl: string
) => {
  try {
    // Get existing uploads
    const existingUploads = JSON.parse(
      localStorage.getItem(MOCK_UPLOADS_STORAGE_KEY) || "{}"
    );

    // Add this new upload
    existingUploads[`/uploads/${communityId}${fileName}`] = blobUrl;

    // Store back in localStorage
    localStorage.setItem(
      MOCK_UPLOADS_STORAGE_KEY,
      JSON.stringify(existingUploads)
    );

    // Set up the mock service worker if it's not already set up
    setupMockImageService();
  } catch (error) {
    console.error("Error storing mock upload:", error);
  }
};

/**
 * Set up a service worker to intercept image requests and serve blob URLs during development
 */
const setupMockImageService = () => {
  // Only do this once
  if (window._mockServiceInitialized) return;
  window._mockServiceInitialized = true;

  // Override fetch for image URLs during development
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    // Only intercept GET requests
    if (init?.method && init.method !== "GET") {
      return originalFetch(input, init);
    }

    const url = input.toString();
    // Check if this is an image URL we might have mocked
    if (url.includes("/uploads/")) {
      // Get the path part
      const path = new URL(url).pathname;

      // Get our mock uploads
      const mockUploads = JSON.parse(
        localStorage.getItem(MOCK_UPLOADS_STORAGE_KEY) || "{}"
      );

      // Check if we have this image mocked
      if (mockUploads[path]) {
        console.log("🔄 Serving mocked image:", path);
        // Create a response with the blob URL
        const response = await originalFetch(mockUploads[path]);
        return response;
      }
    }

    // Default: use the original fetch
    return originalFetch(input, init);
  };

  // Also patch the Image loading
  const originalImageSrc = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "src"
  );
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    get: function () {
      return originalImageSrc.get.call(this);
    },
    set: function (url) {
      if (url.includes("/uploads/")) {
        // Get the path part
        const path = url.includes("http") ? new URL(url).pathname : url;

        // Get our mock uploads
        const mockUploads = JSON.parse(
          localStorage.getItem(MOCK_UPLOADS_STORAGE_KEY) || "{}"
        );

        // Check if we have this image mocked
        if (mockUploads[path]) {
          console.log("🖼️ Serving mocked image src:", path);
          originalImageSrc.set.call(this, mockUploads[path]);
          return;
        }
      }

      originalImageSrc.set.call(this, url);
    },
    configurable: true,
  });

  console.log("🚀 Mock image service initialized for development");
};

// Helper to get image dimensions
const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image for dimensions"));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Creates a persistent download button that stays visible
 */
const createPersistentDownloadButton = (
  file: File,
  fileName: string,
  communityId: string
): void => {
  try {
    // Remove any existing persistent buttons first
    const existingBtn = document.getElementById("persistent-download-btn");
    if (existingBtn) {
      document.body.removeChild(existingBtn);
    }

    // Create a blob URL for the file - needed for download
    const blobUrl = URL.createObjectURL(file);

    // Create a styled floating button
    const container = document.createElement("div");
    container.id = "persistent-download-btn";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.padding = "12px";
    container.style.backgroundColor = "white";
    container.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    container.style.borderRadius = "8px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";

    const title = document.createElement("div");
    title.textContent = "Image Upload Helper";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "4px";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "📥 Download Image";
    downloadBtn.style.padding = "6px 12px";
    downloadBtn.style.backgroundColor = "#4f46e5";
    downloadBtn.style.color = "white";
    downloadBtn.style.border = "none";
    downloadBtn.style.borderRadius = "4px";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.style.width = "100%";

    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Image downloaded! Save to public/uploads/${fileName}`);
    };

    const pathText = document.createElement("div");
    pathText.textContent = `public/uploads/${communityId}${fileName}`;
    pathText.style.fontSize = "12px";
    pathText.style.wordBreak = "break-all";
    pathText.style.maxWidth = "200px";

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 Copy Path";
    copyBtn.style.padding = "6px 12px";
    copyBtn.style.backgroundColor = "#6b7280";
    copyBtn.style.color = "white";
    copyBtn.style.border = "none";
    copyBtn.style.borderRadius = "4px";
    copyBtn.style.cursor = "pointer";
    copyBtn.style.width = "100%";

    copyBtn.onclick = () => {
      copyTextToClipboard(`public/uploads/${communityId}${fileName}`);
      toast.success("Path copied to clipboard");
    };

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "❌";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "8px";
    closeBtn.style.right = "8px";
    closeBtn.style.backgroundColor = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "12px";

    closeBtn.onclick = () => {
      document.body.removeChild(container);
      URL.revokeObjectURL(blobUrl);
    };

    container.appendChild(title);
    container.appendChild(pathText);
    container.appendChild(downloadBtn);
    container.appendChild(copyBtn);
    container.appendChild(closeBtn);

    document.body.appendChild(container);

    // Auto cleanup after 5 minutes
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      URL.revokeObjectURL(blobUrl);
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error("Error creating persistent download button:", error);
  }
};

/**
 * Helper to copy text to clipboard
 */
const copyTextToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Unable to copy to clipboard", err);
    }

    document.body.removeChild(textArea);
  }
};

// Add the type definition to window for our service flag
declare global {
  interface Window {
    _mockServiceInitialized?: boolean;
  }
}
