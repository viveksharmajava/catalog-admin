import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  downloadProdCatalogExport,
  downloadProdCatalogImportTemplate,
  importProdCatalogs,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CatalogImportPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!canWrite) {
    return <p>You do not have permission to import catalogs.</p>;
  }

  async function handleDownloadTemplate() {
    setError('');
    try {
      await downloadProdCatalogImportTemplate();
    } catch (err) {
      setError(err.message || 'Failed to download template');
    }
  }

  async function handleImport(event) {
    event.preventDefault();
    if (!selectedFile) {
      setError('Select an Excel file to import.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await importProdCatalogs(selectedFile);
      setResult(response);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Bulk Catalog Import</span>
          <div className="title-bar-actions">
            <button type="button" className="add-product-link" onClick={handleDownloadTemplate}>
              Download Template
            </button>
            <button
              type="button"
              className="add-product-link"
              onClick={() => downloadProdCatalogExport().catch((err) => setError(err.message))}
            >
              Export Catalogs
            </button>
            <Link to="/catalog/find" className="add-product-link">
              Back to Find Catalog
            </Link>
          </div>
        </div>
        <div className="screenlet-body">
          <p>
            Import product catalogs from Excel (.xlsx). Use the <strong>Catalogs</strong> sheet for catalog master data
            and the <strong>CatalogCategories</strong> sheet to link categories to catalogs.
            <strong> Do not delete row 1</strong> on either sheet.
            <code>catalog_name</code> is required on the Catalogs sheet.
            On CatalogCategories, <code>prod_catalog_id</code> and <code>product_category_id</code> are required.
            <code>prod_catalog_category_type_id</code> defaults to PCCT_BROWSE_ROOT when blank.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleImport} className="form-grid">
            <label className="full-width">
              Excel file (.xlsx)
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading || !selectedFile}>
                {loading ? 'Importing…' : 'Import Catalogs'}
              </button>
            </div>
          </form>

          {result && (
            <div className="screenlet" style={{ marginTop: '1rem' }}>
              <div className="screenlet-title">Import Results</div>
              <div className="screenlet-body">
                <p>
                  Total rows: {result.totalRows} · Created: {result.created} · Updated: {result.updated} · Failed:{' '}
                  {result.failed}
                </p>
                {result.errors?.length > 0 && (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Catalog ID</th>
                          <th>Category ID</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((row) => (
                          <tr key={`${row.rowNumber}-${row.message}`}>
                            <td>{row.rowNumber}</td>
                            <td>{row.productId || '—'}</td>
                            <td>{row.sku || '—'}</td>
                            <td>{row.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
