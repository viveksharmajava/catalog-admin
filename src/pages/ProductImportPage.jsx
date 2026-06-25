import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  downloadProductExport,
  downloadProductImportTemplate,
  importProducts,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function ProductImportPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!canWrite) {
    return <p>You do not have permission to import products.</p>;
  }

  async function handleDownloadTemplate() {
    setError('');
    try {
      await downloadProductImportTemplate();
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
      const response = await importProducts(selectedFile);
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
          <span>Bulk Product Import</span>
          <div className="title-bar-actions">
            <button type="button" className="add-product-link" onClick={handleDownloadTemplate}>
              Download Template
            </button>
            <button type="button" className="add-product-link" onClick={() => downloadProductExport().catch((err) => setError(err.message))}>
              Export Products
            </button>
            <Link to="/products/find" className="add-product-link">
              Back to Find Product
            </Link>
          </div>
        </div>
        <div className="screenlet-body">
          <p>
            Import products from Excel (.xlsx). Open the <strong>Products</strong> sheet in the template.
            <strong> Do not delete row 1</strong> — it contains required column headers.
            Enter each product on a new row below the optional sample row (from row 2 or 3).
            Use <code>category_ids</code> with comma-separated category IDs (first is primary), e.g. <code>CAT-ELECTRONICS,CAT-ROOT</code>.
            Image columns use relative paths: <code>product_id/image_type/file_name</code> (e.g. <code>PROD-001/small/hero.jpg</code>).
            Pricing: <code>currency</code>, <code>AVERAGE_COST</code> (purchase price) with <code>average_cost_tax</code>,
            <code>DEFAULT_PRICE</code> with <code>tax_rate</code> for sale prices, then other price type columns.
            <code>tax_in_price</code> is calculated automatically on import.
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
                {loading ? 'Importing…' : 'Import Products'}
              </button>
            </div>
          </form>

          {result && (
            <div className="screenlet" style={{ marginTop: '1rem' }}>
              <div className="screenlet-title">Import Results</div>
              <div className="screenlet-body">
                <p>
                  Total rows: {result.totalRows} · Created: {result.created} · Updated: {result.updated} · Failed: {result.failed}
                </p>
                {result.errors?.length > 0 && (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Product ID</th>
                          <th>SKU</th>
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
