import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchProductImages,
  resolveProductImageSrc,
  uploadProductImage,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function ProductImagesPage() {
  const { productId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingSize, setUploadingSize] = useState('');
  const [selectedFiles, setSelectedFiles] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadImages();
  }, [productId]);

  async function loadImages() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProductImages(productId);
      setImages(data);
    } catch (err) {
      setError(err.message || 'Failed to load product images');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(size, file) {
    setSelectedFiles((prev) => ({ ...prev, [size]: file || null }));
    setSuccess('');
    setError('');
  }

  async function handleUpload(size) {
    const file = selectedFiles[size];
    if (!file) {
      setError('Choose an image file before uploading.');
      return;
    }

    setUploadingSize(size);
    setError('');
    setSuccess('');
    try {
      const updated = await uploadProductImage(productId, size, file);
      setImages((prev) => prev.map((img) => (img.size === size ? updated : img)));
      setSelectedFiles((prev) => ({ ...prev, [size]: null }));
      setSuccess(`${updated.label} image uploaded.`);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingSize('');
    }
  }

  return (
    <div className="screenlet">
      <div className="screenlet-title">Product Images</div>
      <div className="screenlet-body">
        <p>
          Upload product images stored on the catalog server filesystem. Each size maps to the
          standard OFBiz product image fields and returns a public URL for other services.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p>Loading images…</p>
        ) : (
          <div className="product-images-list">
            {images.map((image) => (
              <div key={image.size} className="product-image-card">
                <div className="product-image-card-header">
                  <h3>{image.label} Image</h3>
                  <span className={`product-image-status ${image.uploaded ? 'uploaded' : 'missing'}`}>
                    {image.uploaded ? 'Uploaded' : 'Not uploaded'}
                  </span>
                </div>

                <div className="product-image-preview">
                  {image.url ? (
                    <img
                      src={resolveProductImageSrc(image.url)}
                      alt={`${image.label} product`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder">No image</div>
                  )}
                </div>

                <dl className="product-image-meta">
                  <div>
                    <dt>Public URL</dt>
                    <dd>{image.url || '—'}</dd>
                  </div>
                  <div>
                    <dt>Storage path</dt>
                    <dd>{image.storagePath || '—'}</dd>
                  </div>
                  <div>
                    <dt>File name</dt>
                    <dd>{image.fileName || '—'}</dd>
                  </div>
                </dl>

                {canWrite && (
                  <div className="product-image-upload">
                    <FormField label="Upload / replace" hint="JPG, PNG, GIF, or WebP (max 5 MB).">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={(e) => handleFileChange(image.size, e.target.files?.[0])}
                      />
                    </FormField>
                    <button
                      className="btn-primary"
                      type="button"
                      disabled={!selectedFiles[image.size] || uploadingSize === image.size}
                      onClick={() => handleUpload(image.size)}
                    >
                      {uploadingSize === image.size ? 'Uploading…' : image.uploaded ? 'Update Image' : 'Upload Image'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
