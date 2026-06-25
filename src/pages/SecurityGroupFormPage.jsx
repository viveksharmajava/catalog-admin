import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addSecurityGroupPermission,
  fetchSecurityGroup,
  fetchSecurityGroupPermissions,
  findSecurityPermissions,
  removeSecurityGroupPermission,
  updateSecurityGroup,
} from '../api/partyApi';
import { useAuth } from '../auth/AuthContext';
import CollapsibleSection from '../components/CollapsibleSection';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function SecurityGroupFormPage() {
  const { groupId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [permissionOptions, setPermissionOptions] = useState([]);
  const [addPermissionId, setAddPermissionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAll();
  }, [groupId]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [group, perms, permPage] = await Promise.all([
        fetchSecurityGroup(groupId),
        fetchSecurityGroupPermissions(groupId),
        findSecurityPermissions({ page: 0, size: 500 }),
      ]);
      setGroupName(group.groupName || '');
      setDescription(group.description || '');
      setPermissions(perms);
      setPermissionOptions(permPage.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load security group');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateGroup(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await updateSecurityGroup(groupId, { groupName, description });
      setSuccess('Security group updated.');
    } catch (err) {
      setError(err.message || 'Failed to update security group');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddPermission(event) {
    event.preventDefault();
    if (!canWrite || !addPermissionId) return;
    setError('');
    setSuccess('');
    try {
      await addSecurityGroupPermission(groupId, { permissionId: addPermissionId });
      setSuccess('Permission added to security group.');
      setAddPermissionId('');
      setPermissions(await fetchSecurityGroupPermissions(groupId));
    } catch (err) {
      setError(err.message || 'Failed to add permission');
    }
  }

  async function handleRemovePermission(row) {
    if (!canWrite) return;
    if (!window.confirm(`Remove permission ${row.permissionId}?`)) return;
    setError('');
    setSuccess('');
    try {
      await removeSecurityGroupPermission(groupId, {
        permissionId: row.permissionId,
        fromDate: row.fromDate,
      });
      setSuccess('Permission removed.');
      setPermissions(await fetchSecurityGroupPermissions(groupId));
    } catch (err) {
      setError(err.message || 'Failed to remove permission');
    }
  }

  if (loading) {
    return <p>Loading security group…</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Edit Security Group — {groupId}</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="screenlet">
        <div className="screenlet-title">Security Group</div>
        <div className="screenlet-body">
          <form onSubmit={handleUpdateGroup} className="form-grid">
            <FormField label="Security Group ID">
              <input value={groupId} readOnly disabled />
            </FormField>
            <FormField label="Name">
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} disabled={!canWrite} />
            </FormField>
            <FormField label="Description">
              <input value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canWrite} />
            </FormField>
            {canWrite && (
              <div className="form-actions full-width">
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Updating…' : 'Update'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {canWrite && (
        <CollapsibleSection title="Add Permission to Security Group" defaultOpen>
          <form onSubmit={handleAddPermission} className="form-grid">
            <FormField label="Permission ID *">
              <select
                required
                value={addPermissionId}
                onChange={(e) => setAddPermissionId(e.target.value)}
              >
                <option value="">Select permission…</option>
                {permissionOptions.map((p) => (
                  <option key={p.permissionId} value={p.permissionId}>
                    {p.permissionId} — {p.description}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="form-actions">
              <button className="btn-primary" type="submit">Add</button>
            </div>
          </form>
        </CollapsibleSection>
      )}

      <div className="screenlet">
        <div className="screenlet-title">Permissions</div>
        <div className="screenlet-body table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Permission ID</th>
                <th>Description</th>
                <th>From Date</th>
                <th>Thru Date</th>
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 5 : 4} className="empty-row">No permissions assigned.</td>
                </tr>
              ) : (
                permissions.map((row) => (
                  <tr key={`${row.permissionId}-${row.fromDate}`}>
                    <td>{row.permissionId}</td>
                    <td>{row.permissionDescription || '—'}</td>
                    <td>{row.fromDate || '—'}</td>
                    <td>{row.thruDate || '—'}</td>
                    {canWrite && (
                      <td>
                        <button type="button" className="btn-secondary" onClick={() => handleRemovePermission(row)}>
                          Remove
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

      <p className="hint">
        <Link to="/party/security-group/find">Back to Find Security Group</Link>
      </p>
    </div>
  );
}
