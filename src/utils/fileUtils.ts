import toast from "react-hot-toast";

// Base URL for images in production
const BASE_URL = "https://career-connect-admin-panel.vercel.app";
// Check if we're in development mode
const isDevelopment = window.location.hostname === "localhost";

/**
 * Helper function to handle local file processing
 * In development: Guides the user to save the file manually
 * In production: Assumes files are already in the correct location
 */
export const processLocalFile = async (file: File, communityId: string): Promise<{ 
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
      // Development mode - provide clear instructions for manual file saving
      console.log("%c=== IMAGE UPLOAD INSTRUCTIONS ===", "background: #f7df1e; color: black; font-weight: bold; padding: 4px;");
      console.log(`📁 Save image to: ${fullLocalPath}`);
      console.log(`🔗 It will be accessible at: ${window.location.origin}${relativeFilePath}`);
      
      // Show download dialog to save the file
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = sanitizedFileName;
      
      // Display prominent instructions
      toast.custom((t) => {
        const container = document.createElement('div');
        container.style.padding = '16px';
        container.style.backgroundColor = 'white';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        container.style.margin = '8px';
        container.style.maxWidth = '400px';
        
        const title = document.createElement('p');
        title.textContent = '⚠️ Image Upload - Manual Action Required';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.style.color = '#e11d48';
        
        const instructions = document.createElement('ol');
        instructions.style.paddingLeft = '20px';
        instructions.style.marginBottom = '12px';
        
        const step1 = document.createElement('li');
        step1.textContent = 'Click "Download Image" below';
        step1.style.marginBottom = '4px';
        
        const step2 = document.createElement('li');
        step2.textContent = `Rename it to exactly: ${sanitizedFileName}`;
        step2.style.marginBottom = '4px';
        
        const step3 = document.createElement('li');
        step3.textContent = `Move it to: public/uploads/${communityId}${sanitizedFileName}`;
        
        instructions.appendChild(step1);
        instructions.appendChild(step2);
        instructions.appendChild(step3);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '8px';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Download Image';
        downloadBtn.style.padding = '8px 12px';
        downloadBtn.style.backgroundColor = '#4f46e5';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        
        downloadBtn.onclick = () => {
          a.click(); // Trigger download
          toast.success("Image downloaded! Now place it in the uploads folder");
        };
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Copy Path';
        copyBtn.style.padding = '8px 12px';
        copyBtn.style.backgroundColor = '#6b7280';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
        
        copyBtn.onclick = () => {
          copyTextToClipboard(`public/uploads/${communityId}${sanitizedFileName}`);
          toast.success("Path copied to clipboard");
        };
        
        const dismissBtn = document.createElement('button');
        dismissBtn.textContent = '❌ Dismiss';
        dismissBtn.style.padding = '8px 12px';
        dismissBtn.style.backgroundColor = '#ef4444';
        dismissBtn.style.color = 'white';
        dismissBtn.style.border = 'none';
        dismissBtn.style.borderRadius = '4px';
        dismissBtn.style.cursor = 'pointer';
        
        dismissBtn.onclick = () => {
          toast.dismiss(t.id);
        };
        
        buttonContainer.appendChild(downloadBtn);
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(dismissBtn);
        
        container.appendChild(title);
        container.appendChild(instructions);
        container.appendChild(buttonContainer);
        
        return container;
      }, { duration: 15000 });
      
      // Also create a floating persistent button for re-downloading if needed
      createPersistentDownloadButton(file, sanitizedFileName, communityId);
    }
    
    // Generate proper URL for storage in the database
    const imageUrl = isDevelopment 
      ? `${window.location.origin}${relativeFilePath}`
      : `${BASE_URL}${relativeFilePath}`;
      
    return {
      imageUrl,
      width: dimensions.width,
      height: dimensions.height
    };
  } catch (error) {
    console.error("Error processing local file:", error);
    toast.error("Error processing image file");
    throw error;
  }
};

/**
 * Helper to get image dimensions
 */
const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
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
const createPersistentDownloadButton = (file: File, fileName: string, communityId: string): void => {
  try {
    // Remove any existing persistent buttons first
    const existingBtn = document.getElementById('persistent-download-btn');
    if (existingBtn) {
      document.body.removeChild(existingBtn);
    }
    
    // Create a blob URL for the file
    const blob = new Blob([new Uint8Array(file.arrayBuffer())], { type: file.type });
    const blobUrl = URL.createObjectURL(file);
    
    // Create the download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.id = 'download-link';
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Create a styled floating button
    const container = document.createElement('div');
    container.id = 'persistent-download-btn';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.padding = '12px';
    container.style.backgroundColor = 'white';
    container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    container.style.borderRadius = '8px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    
    const title = document.createElement('div');
    title.textContent = 'Image Upload Helper';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '4px';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '📥 Download Image';
    downloadBtn.style.padding = '6px 12px';
    downloadBtn.style.backgroundColor = '#4f46e5';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.borderRadius = '4px';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.style.width = '100%';
    
    downloadBtn.onclick = () => {
      link.click();
      toast.success(`Image downloaded! Save to public/uploads/${fileName}`);
    };
    
    const pathText = document.createElement('div');
    pathText.textContent = `public/uploads/${communityId}${fileName}`;
    pathText.style.fontSize = '12px';
    pathText.style.wordBreak = 'break-all';
    pathText.style.maxWidth = '200px';
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy Path';
    copyBtn.style.padding = '6px 12px';
    copyBtn.style.backgroundColor = '#6b7280';
    copyBtn.style.color = 'white';
    copyBtn.style.border = 'none';
    copyBtn.style.borderRadius = '4px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.width = '100%';
    
    copyBtn.onclick = () => {
      copyTextToClipboard(`public/uploads/${communityId}${fileName}`);
      toast.success("Path copied to clipboard");
    };
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '8px';
    closeBtn.style.right = '8px';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '12px';
    
    closeBtn.onclick = () => {
      document.body.removeChild(container);
      document.body.removeChild(link);
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
      if (document.body.contains(link)) {
        document.body.removeChild(link);
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
      document.execCommand('copy');
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
    }
    
    document.body.removeChild(textArea);
  }
};