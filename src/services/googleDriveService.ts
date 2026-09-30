import { AuthService } from './authService';
import { GoogleDriveFile, DriveUploadResult } from '../types';

export class GoogleDriveService {
  private static cachedFolderId: string | null = null;

  /**
   * Checks whether the user is authenticated with a valid Google Drive access token.
   */
  public static async isDriveConnected(): Promise<boolean> {
    const token = await AuthService.getAccessToken();
    return !!token;
  }

  /**
   * Finds or creates a dedicated application folder in Google Drive ("ConvertAnyFile Documents")
   */
  public static async getOrCreateAppFolder(folderName = 'ConvertAnyFile Documents'): Promise<string> {
    if (this.cachedFolderId) {
      return this.cachedFolderId;
    }

    const token = await AuthService.getAccessToken();
    if (!token) {
      throw new Error('Google Drive access token not available. Please click "Continue with Google".');
    }

    try {
      // 1. Search for existing folder
      const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!searchRes.ok) {
        throw new Error(`Failed to query Google Drive folder: ${searchRes.statusText}`);
      }

      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        this.cachedFolderId = searchData.files[0].id;
        return searchData.files[0].id;
      }

      // 2. Create folder if not found
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          description: 'Created by ConvertAnyFile for document storage and exports.'
        })
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create Google Drive folder: ${createRes.statusText}`);
      }

      const createData = await createRes.json();
      this.cachedFolderId = createData.id;
      return createData.id;
    } catch (err) {
      console.warn('Google Drive folder lookup fallback to root:', err);
      return '';
    }
  }

  /**
   * Uploads any file or document blob directly to Google Drive using multipart upload.
   */
  public static async uploadFileToDrive(params: {
    name: string;
    blob: Blob;
    mimeType?: string;
    description?: string;
  }): Promise<DriveUploadResult> {
    const token = await AuthService.getAccessToken();
    if (!token) {
      throw new Error('Please sign in with Google to save documents to Google Drive.');
    }

    // Attempt to put files inside ConvertAnyFile folder
    let folderId = '';
    try {
      folderId = await this.getOrCreateAppFolder();
    } catch {}

    const resolvedMime =
      params.mimeType ||
      params.blob.type ||
      this.detectMimeType(params.name) ||
      'application/octet-stream';

    const metadata: Record<string, any> = {
      name: params.name,
      mimeType: resolvedMime,
      description: params.description || `Exported from ConvertAnyFile on ${new Date().toLocaleString()}`
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const boundary = '-------ConvertAnyFileBoundary' + Math.random().toString(36).substring(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${resolvedMime}\r\n\r\n`;

    const multipartBlob = new Blob([metadataPart, params.blob, closeDelimiter], {
      type: `multipart/related; boundary=${boundary}`
    });

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,createdTime',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: multipartBlob
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Google Drive upload failed (${response.status}): ${errBody || response.statusText}`);
    }

    const data = await response.json();

    return {
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      size: data.size
    };
  }

  /**
   * Stores user application data (conversion history, user preferences, metrics) in Google Drive
   */
  public static async saveUserDataToDrive(userData: any, filename = 'ConvertAnyFile_User_Data.json'): Promise<DriveUploadResult> {
    const jsonStr = JSON.stringify(
      {
        app: 'ConvertAnyFile',
        savedAt: new Date().toISOString(),
        version: '2.5.0',
        data: userData
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    return this.uploadFileToDrive({
      name: filename,
      blob,
      mimeType: 'application/json',
      description: 'ConvertAnyFile User Data, Preferences & Job Record Backup'
    });
  }

  /**
   * Lists files saved by the app in Google Drive
   */
  public static async listAppDriveFiles(): Promise<GoogleDriveFile[]> {
    const token = await AuthService.getAccessToken();
    if (!token) return [];

    try {
      const folderId = await this.getOrCreateAppFolder().catch(() => '');
      let query = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";
      if (folderId) {
        query = `'${folderId}' in parents and trashed = false`;
      }

      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink)&orderBy=createdTime desc&pageSize=50`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // If folder-specific query failed, fallback to listing general files
        const fallbackRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent('trashed = false')}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink)&orderBy=createdTime desc&pageSize=30`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!fallbackRes.ok) return [];
        const fallbackData = await fallbackRes.json();
        return fallbackData.files || [];
      }

      const data = await responseToJson(res);
      return data.files || [];
    } catch (err) {
      console.error('Error fetching Google Drive files:', err);
      return [];
    }
  }

  /**
   * Deletes a file from Google Drive.
   * MANDATORY: The calling UI MUST prompt the user with a confirmation dialog before calling this!
   */
  public static async deleteFileFromDrive(fileId: string): Promise<boolean> {
    const token = await AuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive.');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok && res.status !== 204 && res.status !== 404) {
      throw new Error(`Failed to delete file from Google Drive: ${res.statusText}`);
    }

    return true;
  }

  /**
   * Helper to detect MIME types from common extensions
   */
  private static detectMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'csv':
        return 'text/csv';
      case 'txt':
        return 'text/plain';
      case 'json':
        return 'application/json';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'mp4':
        return 'video/mp4';
      default:
        return 'application/octet-stream';
    }
  }
}

async function responseToJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}
