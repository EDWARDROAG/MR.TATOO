/**
 * ============================================================
 * ARCHIVO: uploadService.js
 * UBICACIÓN: frontend/src/services/
 * ROL: service
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Servicio de dominio / orquestación — uploadService.js.
 *
 * FUNCIONES / API (contrato exporta):
 *   uploadService (default)
 *
 * DEPENDENCIAS CLAVE:
 *   api
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: Revisar imports en el resto del proyecto
 *
 * NOTAS:
 *   Frontend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

// frontend/src/services/uploadService.js
import api from './api';

// Configuración del servicio de uploads
const uploadService = {
  // === Configuración ===
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  
  // === Subida de archivos general ===

  /**
   * Subir archivo genérico
   * @param {File} file - Archivo a subir
   * @param {Object} options - Opciones de subida
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadFile: async (file, options = {}, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Añadir campos adicionales
      if (options.folder) formData.append('folder', options.folder);
      if (options.name) formData.append('name', options.name);
      if (options.metadata) formData.append('metadata', JSON.stringify(options.metadata));
      
      const response = await api.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Subir múltiples archivos
   * @param {File[]} files - Array de archivos
   * @param {Object} options - Opciones de subida
   * @param {Function} onProgress - Callback de progreso por archivo
   * @returns {Promise<Object>}
   */
  uploadMultipleFiles: async (files, options = {}, onProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (options.folder) formData.append('folder', options.folder);
      if (options.metadata) formData.append('metadata', JSON.stringify(options.metadata));
      
      const response = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Subir archivo por partes (para archivos grandes)
   * @param {File} file - Archivo grande
   * @param {Object} options - Opciones de subida
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadLargeFile: async (file, options = {}, onProgress = null) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por chunk
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}-${file.name}`;
    
    try {
      // Iniciar subida
      const initResponse = await api.post('/upload/large/init', {
        fileName: file.name,
        fileSize: file.size,
        chunks,
        uploadId,
        ...options
      });
      
      const { uploadToken } = initResponse.data;
      
      // Subir cada chunk
      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const chunkFormData = new FormData();
        chunkFormData.append('chunk', chunk);
        chunkFormData.append('chunkIndex', i);
        chunkFormData.append('uploadId', uploadId);
        chunkFormData.append('uploadToken', uploadToken);
        
        await api.post('/upload/large/chunk', chunkFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (onProgress) {
          const percent = Math.round(((i + 1) / chunks) * 100);
          onProgress(percent);
        }
      }
      
      // Completar subida
      const completeResponse = await api.post('/upload/large/complete', {
        uploadId,
        uploadToken
      });
      
      return completeResponse.data;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  // === Subida de imágenes ===

  /**
   * Subir imagen
   * @param {File} file - Archivo de imagen
   * @param {Object} options - Opciones de imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadImage: async (file, options = {}, onProgress = null) => {
    // Validar tipo de imagen
    if (!uploadService.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Formatos permitidos: JPEG, PNG, GIF, WEBP');
    }
    
    // Validar tamaño
    if (file.size > uploadService.MAX_FILE_SIZE) {
      throw new Error(`El archivo no puede superar los ${uploadService.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    // Opciones de procesamiento de imagen
    if (options.resize) {
      formData.append('resize', JSON.stringify(options.resize));
    }
    if (options.crop) {
      formData.append('crop', JSON.stringify(options.crop));
    }
    if (options.quality) {
      formData.append('quality', options.quality);
    }
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    
    return response.data;
  },

  /**
   * Subir múltiples imágenes
   * @param {File[]} files - Array de imágenes
   * @param {Object} options - Opciones de imagen
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadMultipleImages: async (files, options = {}, onProgress = null) => {
    // Validar cada archivo
    for (const file of files) {
      if (!uploadService.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`Archivo ${file.name} no es una imagen válida`);
      }
      if (file.size > uploadService.MAX_FILE_SIZE) {
        throw new Error(`Archivo ${file.name} excede el tamaño máximo`);
      }
    }
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    if (options.folder) formData.append('folder', options.folder);
    if (options.createThumbnails) formData.append('createThumbnails', true);
    
    const response = await api.post('/upload/images/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    
    return response.data;
  },

  /**
   * Subir avatar de usuario
   * @param {File} file - Imagen de avatar
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadAvatar: async (file, onProgress = null) => {
    const options = {
      resize: { width: 300, height: 300, fit: 'cover' },
      folder: 'avatars',
      quality: 85
    };
    
    return uploadService.uploadImage(file, options, onProgress);
  },

  /**
   * Subir imagen de producto
   * @param {File} file - Imagen de producto
   * @param {string} productId - ID del producto
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadProductImage: async (file, productId, onProgress = null) => {
    const options = {
      resize: { width: 1200, height: 1200, fit: 'contain' },
      folder: `products/${productId}`,
      quality: 90
    };
    
    return uploadService.uploadImage(file, options, onProgress);
  },

  // === Subida de documentos ===

  /**
   * Subir documento
   * @param {File} file - Documento
   * @param {Object} options - Opciones
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadDocument: async (file, options = {}, onProgress = null) => {
    if (!uploadService.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error('Tipo de documento no permitido. Formatos permitidos: PDF, DOC, DOCX');
    }
    
    const formData = new FormData();
    formData.append('document', file);
    
    if (options.folder) formData.append('folder', options.folder);
    if (options.password) formData.append('password', options.password);
    
    const response = await api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    
    return response.data;
  },

  // === Subida de videos ===

  /**
   * Subir video
   * @param {File} file - Video
   * @param {Object} options - Opciones
   * @param {Function} onProgress - Callback de progreso
   * @returns {Promise<Object>}
   */
  uploadVideo: async (file, options = {}, onProgress = null) => {
    if (!uploadService.ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('Tipo de video no permitido. Formatos permitidos: MP4, MPEG, MOV');
    }
    
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`El video no puede superar los ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    }
    
    const formData = new FormData();
    formData.append('video', file);
    
    if (options.folder) formData.append('folder', options.folder);
    if (options.compress) formData.append('compress', true);
    if (options.thumbnail) formData.append('generateThumbnail', true);
    
    const response = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    
    return response.data;
  },

  // === Gestión de archivos ===

  /**
   * Obtener lista de archivos
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>}
   */
  getFiles: async (params = {}) => {
    try {
      const response = await api.get('/upload/files', { params });
      return response.data;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Obtener información de archivo
   * @param {string} fileId - ID del archivo
   * @returns {Promise<Object>}
   */
  getFileInfo: async (fileId) => {
    try {
      const response = await api.get(`/upload/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Eliminar archivo
   * @param {string} fileId - ID del archivo
   * @returns {Promise<void>}
   */
  deleteFile: async (fileId) => {
    try {
      await api.delete(`/upload/files/${fileId}`);
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Eliminar múltiples archivos
   * @param {string[]} fileIds - IDs de archivos
   * @returns {Promise<Object>}
   */
  deleteMultipleFiles: async (fileIds) => {
    try {
      const response = await api.post('/upload/files/delete-multiple', { fileIds });
      return response.data;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Obtener URL de descarga
   * @param {string} fileId - ID del archivo
   * @param {Object} options - Opciones (expires, download)
   * @returns {Promise<string>}
   */
  getDownloadUrl: async (fileId, options = {}) => {
    try {
      const response = await api.post(`/upload/files/${fileId}/url`, options);
      return response.data.url;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Descargar archivo
   * @param {string} fileId - ID del archivo
   * @param {string} filename - Nombre del archivo
   * @returns {Promise<void>}
   */
  downloadFile: async (fileId, filename) => {
    try {
      const response = await api.get(`/upload/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  // === Procesamiento de imágenes ===

  /**
   * Redimensionar imagen
   * @param {string} fileId - ID del archivo
   * @param {Object} dimensions - Dimensiones {width, height, fit}
   * @returns {Promise<string>}
   */
  resizeImage: async (fileId, dimensions) => {
    try {
      const response = await api.post(`/upload/images/${fileId}/resize`, dimensions);
      return response.data.url;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Aplicar filtro a imagen
   * @param {string} fileId - ID del archivo
   * @param {string} filter - Filtro (grayscale, sepia, blur, etc.)
   * @returns {Promise<string>}
   */
  applyImageFilter: async (fileId, filter) => {
    try {
      const response = await api.post(`/upload/images/${fileId}/filter`, { filter });
      return response.data.url;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  /**
   * Obtener imagen optimizada
   * @param {string} fileId - ID del archivo
   * @param {Object} options - Opciones de optimización
   * @returns {Promise<string>}
   */
  getOptimizedImage: async (fileId, options = {}) => {
    try {
      const response = await api.post(`/upload/images/${fileId}/optimize`, options);
      return response.data.url;
    } catch (error) {
      throw uploadService.handleError(error);
    }
  },

  // === Utilidades ===

  /**
   * Validar tipo de archivo
   * @param {File} file - Archivo a validar
   * @param {string} type - Tipo (image, document, video)
   * @returns {boolean}
   */
  validateFileType: (file, type) => {
    switch (type) {
      case 'image':
        return uploadService.ALLOWED_IMAGE_TYPES.includes(file.type);
      case 'document':
        return uploadService.ALLOWED_DOCUMENT_TYPES.includes(file.type);
      case 'video':
        return uploadService.ALLOWED_VIDEO_TYPES.includes(file.type);
      default:
        return true;
    }
  },

  /**
   * Validar tamaño de archivo
   * @param {File} file - Archivo a validar
   * @param {number} maxSize - Tamaño máximo en bytes
   * @returns {boolean}
   */
  validateFileSize: (file, maxSize = null) => {
    const limit = maxSize || uploadService.MAX_FILE_SIZE;
    return file.size <= limit;
  },

  /**
   * Obtener tamaño formateado
   * @param {number} bytes - Tamaño en bytes
   * @returns {string}
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Obtener extensión de archivo
   * @param {string} filename - Nombre del archivo
   * @returns {string}
   */
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * Generar nombre único para archivo
   * @param {string} originalName - Nombre original
   * @returns {string}
   */
  generateUniqueFilename: (originalName) => {
    const ext = uploadService.getFileExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}.${ext}`;
  },

  /**
   * Obtener icono según tipo de archivo
   * @param {string} mimeType - Tipo MIME
   * @returns {string}
   */
  getFileIcon: (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.startsWith('video/')) return '🎥';
    return '📁';
  },

  /**
   * Comprimir imagen antes de subir (cliente)
   * @param {File} file - Archivo de imagen
   * @param {number} maxWidth - Ancho máximo
   * @param {number} quality - Calidad (0-1)
   * @returns {Promise<File>}
   */
  compressImageClient: async (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  },

  /**
   * Manejar errores
   * @param {Error} error - Error de axios
   * @returns {Error}
   */
  handleError: (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          error.message = data.message || 'Archivo inválido';
          break;
        case 401:
          error.message = 'No autorizado';
          break;
        case 403:
          error.message = 'No tienes permisos para subir archivos';
          break;
        case 413:
          error.message = 'El archivo excede el tamaño máximo permitido';
          break;
        case 415:
          error.message = 'Tipo de archivo no soportado';
          break;
        default:
          error.message = data.message || 'Error al subir el archivo';
      }
    } else if (error.request) {
      error.message = 'Error de conexión';
    }
    
    return error;
  }
};

export default uploadService;