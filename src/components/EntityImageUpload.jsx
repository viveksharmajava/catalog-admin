import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import FormField from './FormField';
import { resolveCatalogMediaSrc } from '../api/catalogApi';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

/**
 * Single-image upload for category / catalog admin forms.
 */
export default function EntityImageUpload({
  entityId,
  imageUrl,
  onImageUrlChange,
  uploadImage,
  pendingFile,
  onPendingFileChange,
  uploadOnSubmit = false,
  label = 'Image',
  hint = 'JPG, PNG, GIF, or WebP.',
  disabled = false,
}) {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [internalFile, setInternalFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const file = pendingFile !== undefined ? pendingFile : internalFile;
  const setFile = onPendingFileChange || setInternalFile;

  const previewSrc = file
    ? URL.createObjectURL(file)
    : resolveCatalogMediaSrc(imageUrl);

  async function handleUpload() {
    if (!entityId) {
      setError('Save the record first to obtain an ID, then upload the image.');
      return;
    }
    if (!file) {
      setError('Choose an image file first.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const result = await uploadImage(entityId, file);
      onImageUrlChange?.(result.url || '');
      setFile(null);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="entity-image-upload">
      <FormField label={label} hint={hint} className="full-width">
        <div className="entity-image-preview">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="product-image-placeholder">No image uploaded</div>
          )}
        </div>

        {imageUrl && !file && (
          <p className="entity-image-url">
            <span className="entity-image-url-label">URL:</span> {imageUrl}
          </p>
        )}

        {!entityId && uploadOnSubmit && (
          <p className="entity-image-note">
            Selected image will upload when you save the new record.
          </p>
        )}

        {!entityId && !uploadOnSubmit && (
          <p className="entity-image-note">Image upload is available after the record is saved.</p>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {canWrite && !disabled && (
          <div className="entity-image-controls">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError('');
              }}
            />
            {!uploadOnSubmit && (
              <button
                type="button"
                className="btn-secondary"
                disabled={!entityId || !file || uploading}
                onClick={handleUpload}
              >
                {uploading ? 'Uploading…' : imageUrl ? 'Replace Image' : 'Upload Image'}
              </button>
            )}
          </div>
        )}
      </FormField>
    </div>
  );
}
