import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createPartyAddress,
  deletePartyAddress,
  fetchPartyAddresses,
  setDefaultShippingAddress,
  updatePartyAddress,
} from '../api/partyApi';
import { useAuth } from '../auth/AuthContext';
import {
  ADDRESS_TYPES,
  addressDtoToForm,
  addressFormToPayload,
  emptyAddressForm,
  formatAddressLine,
} from '../utils/partyAddressForm';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

function AddressForm({ form, onChange, onSubmit, onCancel, submitLabel, disabled }) {
  return (
    <form
      className="form-grid party-address-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label>
        Address type *
        <select
          value={form.addressType}
          onChange={(e) => onChange({ ...form, addressType: e.target.value })}
          disabled={disabled}
        >
          <option value={ADDRESS_TYPES.SHIPPING}>Shipping</option>
          <option value={ADDRESS_TYPES.BILLING}>Billing</option>
        </select>
      </label>
      <label>
        Contact name
        <input
          value={form.toName}
          onChange={(e) => onChange({ ...form, toName: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label>
        Attention
        <input
          value={form.attnName}
          onChange={(e) => onChange({ ...form, attnName: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label>
        Phone
        <input
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label className="span-2">
        Address line 1 *
        <input
          value={form.address1}
          onChange={(e) => onChange({ ...form, address1: e.target.value })}
          required
          disabled={disabled}
        />
      </label>
      <label className="span-2">
        Address line 2
        <input
          value={form.address2}
          onChange={(e) => onChange({ ...form, address2: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label>
        City *
        <input
          value={form.city}
          onChange={(e) => onChange({ ...form, city: e.target.value })}
          required
          disabled={disabled}
        />
      </label>
      <label>
        State / Province
        <input
          value={form.stateProvinceGeoId}
          onChange={(e) => onChange({ ...form, stateProvinceGeoId: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label>
        Postal code
        <input
          value={form.postalCode}
          onChange={(e) => onChange({ ...form, postalCode: e.target.value })}
          disabled={disabled}
        />
      </label>
      <label>
        Country
        <input
          value={form.countryGeoId}
          onChange={(e) => onChange({ ...form, countryGeoId: e.target.value })}
          disabled={disabled}
        />
      </label>
      {form.addressType === ADDRESS_TYPES.SHIPPING && (
        <label className="checkbox-label span-2">
          <input
            type="checkbox"
            checked={form.defaultShipping}
            onChange={(e) => onChange({ ...form, defaultShipping: e.target.checked })}
            disabled={disabled}
          />
          Default shipping address
        </label>
      )}
      <div className="form-actions span-2">
        <button type="submit" className="btn-primary" disabled={disabled}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={disabled}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function AddressTable({ title, rows, canWrite, onEdit, onDelete, onSetDefault, busyId }) {
  return (
    <div className="screenlet">
      <div className="screenlet-title">{title}</div>
      <div className="screenlet-body table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Default</th>
              {canWrite && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="empty-row">
                  No {title.toLowerCase()} on file.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.partyAddressId}>
                  <td>{row.toName || row.attnName || '—'}</td>
                  <td>{formatAddressLine(row)}</td>
                  <td>{row.phone || '—'}</td>
                  <td>
                    {row.addressType === ADDRESS_TYPES.SHIPPING && row.defaultShipping
                      ? 'Yes'
                      : '—'}
                  </td>
                  {canWrite && (
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onEdit(row)}
                        disabled={Boolean(busyId)}
                      >
                        Edit
                      </button>
                      {row.addressType === ADDRESS_TYPES.SHIPPING && !row.defaultShipping && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onSetDefault(row)}
                          disabled={busyId === row.partyAddressId}
                        >
                          Set default
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-link-danger"
                        onClick={() => onDelete(row)}
                        disabled={busyId === row.partyAddressId}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PartyAddressesPage() {
  const { partyId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddressForm());
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(emptyAddressForm());

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchPartyAddresses(partyId);
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const billing = addresses.filter((a) => a.addressType === ADDRESS_TYPES.BILLING);
  const shipping = addresses.filter((a) => a.addressType === ADDRESS_TYPES.SHIPPING);

  async function handleAdd() {
    setError('');
    setSuccess('');
    setBusyId('add');
    try {
      await createPartyAddress(partyId, addressFormToPayload(addForm));
      setSuccess('Address added.');
      setAddForm(emptyAddressForm());
      setShowAddForm(false);
      await loadAddresses();
    } catch (err) {
      setError(err.message || 'Failed to add address');
    } finally {
      setBusyId('');
    }
  }

  function startEdit(row) {
    setEditingId(row.partyAddressId);
    setEditForm(addressDtoToForm(row));
    setSuccess('');
    setError('');
  }

  function cancelEdit() {
    setEditingId('');
    setEditForm(emptyAddressForm());
  }

  async function handleUpdate() {
    setError('');
    setSuccess('');
    setBusyId(editingId);
    try {
      await updatePartyAddress(partyId, editingId, addressFormToPayload(editForm));
      setSuccess('Address updated.');
      setEditingId('');
      await loadAddresses();
    } catch (err) {
      setError(err.message || 'Failed to update address');
    } finally {
      setBusyId('');
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete address ${row.partyAddressId}?`)) return;
    setError('');
    setSuccess('');
    setBusyId(row.partyAddressId);
    try {
      await deletePartyAddress(partyId, row.partyAddressId);
      if (editingId === row.partyAddressId) cancelEdit();
      setSuccess('Address deleted.');
      await loadAddresses();
    } catch (err) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setBusyId('');
    }
  }

  async function handleSetDefault(row) {
    setError('');
    setSuccess('');
    setBusyId(row.partyAddressId);
    try {
      await setDefaultShippingAddress(partyId, row.partyAddressId);
      setSuccess('Default shipping address updated.');
      await loadAddresses();
    } catch (err) {
      setError(err.message || 'Failed to set default shipping address');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Manage Addresses</span>
          {canWrite && !showAddForm && !editingId && (
            <button type="button" className="add-product-link" onClick={() => setShowAddForm(true)}>
              <span className="add-product-icon" aria-hidden="true">
                +
              </span>
              Add Address
            </button>
          )}
        </div>
        <div className="screenlet-body">
          <p className="hint">
            Maintain billing and shipping addresses for this party. One shipping address may be marked as the default.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && canWrite && (
        <div className="screenlet">
          <div className="screenlet-title">Add Address</div>
          <div className="screenlet-body">
            <AddressForm
              form={addForm}
              onChange={setAddForm}
              onSubmit={handleAdd}
              onCancel={() => {
                setShowAddForm(false);
                setAddForm(emptyAddressForm());
              }}
              submitLabel={busyId === 'add' ? 'Saving…' : 'Save address'}
              disabled={busyId === 'add'}
            />
          </div>
        </div>
      )}

      {editingId && canWrite && (
        <div className="screenlet">
          <div className="screenlet-title">Edit Address — {editingId}</div>
          <div className="screenlet-body">
            <AddressForm
              form={editForm}
              onChange={setEditForm}
              onSubmit={handleUpdate}
              onCancel={cancelEdit}
              submitLabel={busyId === editingId ? 'Saving…' : 'Update address'}
              disabled={busyId === editingId}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="hint">Loading addresses…</p>
      ) : (
        <>
          <AddressTable
            title="Shipping Addresses"
            rows={shipping}
            canWrite={canWrite}
            onEdit={startEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            busyId={busyId}
          />
          <AddressTable
            title="Billing Addresses"
            rows={billing}
            canWrite={canWrite}
            onEdit={startEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            busyId={busyId}
          />
        </>
      )}
    </div>
  );
}
