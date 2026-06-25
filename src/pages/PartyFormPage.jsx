import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  addUserLoginSecurityGroup,
  createPerson,
  fetchAllSecurityGroups,
  fetchEmploymentStatuses,
  fetchMaritalStatuses,
  fetchPartyCurrencies,
  fetchPartyStatuses,
  fetchPerson,
  fetchResidenceStatuses,
  fetchRoleTypes,
  removeUserLoginSecurityGroup,
  updatePerson,
} from '../api/partyApi';
import { useAuth } from '../auth/AuthContext';
import CollapsibleSection from '../components/CollapsibleSection';
import FormField from '../components/FormField';
import { initialPartyForm, partyFormToPayload, personDtoToForm } from '../utils/partyForm';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

function YesNoSelect({ value, onChange, disabled, allowEmpty = true }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {allowEmpty && <option value="">—</option>}
      <option value="Y">Yes</option>
      <option value="N">No</option>
    </select>
  );
}

export default function PartyFormPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);
  const isEdit = Boolean(partyId);

  const [form, setForm] = useState(initialPartyForm);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  const [residenceStatuses, setResidenceStatuses] = useState([]);
  const [partyStatuses, setPartyStatuses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [roleTypes, setRoleTypes] = useState([]);
  const [securityGroups, setSecurityGroups] = useState([]);
  const [securityGroupOptions, setSecurityGroupOptions] = useState([]);
  const [addSecurityGroupId, setAddSecurityGroupId] = useState('');
  const [savedUserLoginId, setSavedUserLoginId] = useState('');
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingParty, setLoadingParty] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReferences() {
      try {
        const [marital, employment, residence, statuses, curr, roles, groups] = await Promise.all([
          fetchMaritalStatuses(),
          fetchEmploymentStatuses(),
          fetchResidenceStatuses(),
          fetchPartyStatuses(),
          fetchPartyCurrencies(),
          fetchRoleTypes(),
          fetchAllSecurityGroups(),
        ]);
        setMaritalStatuses(marital);
        setEmploymentStatuses(employment);
        setResidenceStatuses(residence);
        setPartyStatuses(statuses);
        setCurrencies(curr);
        setRoleTypes(roles);
        setSecurityGroupOptions(groups.content || []);
      } catch (err) {
        setError(err.message || 'Failed to load reference data');
      } finally {
        setLoadingRefs(false);
      }
    }
    loadReferences();
  }, []);

  useEffect(() => {
    if (!isEdit || !partyId) return;

    async function loadParty() {
      setLoadingParty(true);
      setError('');
      try {
        const person = await fetchPerson(partyId);
        setForm(personDtoToForm(person));
        setSavedUserLoginId(person.userLoginId || '');
        setSecurityGroups(person.securityGroups || []);
      } catch (err) {
        setError(err.message || 'Failed to load party');
      } finally {
        setLoadingParty(false);
      }
    }
    loadParty();
  }, [isEdit, partyId]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddSecurityGroup() {
    if (!canWrite || !savedUserLoginId || !addSecurityGroupId) return;
    setError('');
    setSuccess('');
    try {
      await addUserLoginSecurityGroup(savedUserLoginId, { groupId: addSecurityGroupId });
      const person = await fetchPerson(partyId);
      setSecurityGroups(person.securityGroups || []);
      setAddSecurityGroupId('');
      setSuccess('Security group assigned to user login.');
    } catch (err) {
      setError(err.message || 'Failed to assign security group');
    }
  }

  async function handleRemoveSecurityGroup(row) {
    if (!canWrite || !savedUserLoginId) return;
    if (!window.confirm(`Remove security group ${row.groupId}?`)) return;
    setError('');
    setSuccess('');
    try {
      await removeUserLoginSecurityGroup(savedUserLoginId, {
        groupId: row.groupId,
        fromDate: row.fromDate,
      });
      const person = await fetchPerson(partyId);
      setSecurityGroups(person.securityGroups || []);
      setSuccess('Security group removed from user login.');
    } catch (err) {
      setError(err.message || 'Failed to remove security group');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setError('');
    setSuccess('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updatePerson(partyId, partyFormToPayload(form, true));
        setSavedUserLoginId(updated.userLoginId || '');
        setSuccess(`Party updated: ${updated.firstName} ${updated.lastName} (${updated.partyId})`);
      } else {
        const created = await createPerson(partyFormToPayload(form, false));
        setSuccess(`Party created: ${created.firstName} ${created.lastName} (${created.partyId})`);
        setTimeout(() => navigate(`/party/person/edit/${encodeURIComponent(created.partyId)}`), 1000);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} party`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingParty) {
    return <p>Loading personal information…</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? 'Edit Personal Information' : 'Add Personal Information'}</h2>
        <p className="hint">
          OFBiz Party Manager — Person party with optional user login for registration and access management.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="screenlet full-width">
          <div className="screenlet-title">Personal Information</div>
          <div className="screenlet-body form-grid">
            <FormField label="Party ID" hint={isEdit ? 'Read-only party identifier.' : 'Leave blank to auto-generate.'}>
              {isEdit ? (
                <input value={form.partyId} readOnly disabled />
              ) : (
                <input
                  value={form.partyId}
                  onChange={(e) => updateField('partyId', e.target.value)}
                  disabled={!canWrite}
                  placeholder="Auto-generated if empty"
                />
              )}
            </FormField>

            <FormField label="First Name *">
              <input
                required
                maxLength={60}
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                disabled={!canWrite}
              />
            </FormField>

            <FormField label="Last Name *">
              <input
                required
                maxLength={60}
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                disabled={!canWrite}
              />
            </FormField>

            <FormField label="Salutation">
              <input value={form.salutation} onChange={(e) => updateField('salutation', e.target.value)} disabled={!canWrite} />
            </FormField>

            <FormField label="Middle Name">
              <input value={form.middleName} onChange={(e) => updateField('middleName', e.target.value)} disabled={!canWrite} />
            </FormField>

            <FormField label="Personal Title">
              <input value={form.personalTitle} onChange={(e) => updateField('personalTitle', e.target.value)} disabled={!canWrite} />
            </FormField>

            <FormField label="Suffix">
              <input value={form.suffix} onChange={(e) => updateField('suffix', e.target.value)} disabled={!canWrite} />
            </FormField>

            <FormField label="Nickname">
              <input value={form.nickname} onChange={(e) => updateField('nickname', e.target.value)} disabled={!canWrite} />
            </FormField>

            <FormField label="Gender">
              <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} disabled={!canWrite}>
                <option value="">—</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </FormField>

            <FormField label="Birth Date">
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
                disabled={!canWrite}
              />
            </FormField>

            <FormField label="Marital Status">
              <select
                value={form.maritalStatusTypeId}
                onChange={(e) => updateField('maritalStatusTypeId', e.target.value)}
                disabled={!canWrite || loadingRefs}
              >
                <option value="">—</option>
                {maritalStatuses.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Employment Status">
              <select
                value={form.employmentStatusEnumId}
                onChange={(e) => updateField('employmentStatusEnumId', e.target.value)}
                disabled={!canWrite || loadingRefs}
              >
                <option value="">—</option>
                {employmentStatuses.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Residence Status">
              <select
                value={form.residenceStatusEnumId}
                onChange={(e) => updateField('residenceStatusEnumId', e.target.value)}
                disabled={!canWrite || loadingRefs}
              >
                <option value="">—</option>
                {residenceStatuses.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Existing Customer">
              <YesNoSelect value={form.existingCustomer} onChange={(v) => updateField('existingCustomer', v)} disabled={!canWrite} />
            </FormField>

            <FormField label="Preferred Currency">
              <select
                value={form.preferredCurrencyUomId}
                onChange={(e) => updateField('preferredCurrencyUomId', e.target.value)}
                disabled={!canWrite || loadingRefs}
              >
                {currencies.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </FormField>

            {isEdit && (
              <FormField label="Status">
                <select
                  value={form.statusId}
                  onChange={(e) => updateField('statusId', e.target.value)}
                  disabled={!canWrite || loadingRefs}
                >
                  {partyStatuses.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Occupation">
              <input value={form.occupation} onChange={(e) => updateField('occupation', e.target.value)} disabled={!canWrite} />
            </FormField>

            <FormField label="Comments" className="full-width">
              <textarea
                rows={3}
                value={form.comments}
                onChange={(e) => updateField('comments', e.target.value)}
                disabled={!canWrite}
              />
            </FormField>
          </div>
        </div>

        <CollapsibleSection title="Party Role" defaultOpen>
          <FormField label="Role Type">
            <select
              value={form.roleTypeId}
              onChange={(e) => updateField('roleTypeId', e.target.value)}
              disabled={!canWrite || loadingRefs}
            >
              {roleTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </FormField>
        </CollapsibleSection>

        <CollapsibleSection title="User Login (optional)" defaultOpen={!isEdit}>
          <div className="form-grid">
            <FormField label="User Login ID" hint="Create login credentials for this party.">
              <input
                value={form.userLoginId}
                onChange={(e) => updateField('userLoginId', e.target.value)}
                disabled={!canWrite}
              />
            </FormField>
            <FormField label={isEdit ? 'New Password' : 'Password'} hint={isEdit ? 'Leave blank to keep current password.' : ''}>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => updateField('currentPassword', e.target.value)}
                disabled={!canWrite}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Password Hint">
              <input
                value={form.passwordHint}
                onChange={(e) => updateField('passwordHint', e.target.value)}
                disabled={!canWrite}
              />
            </FormField>
            <FormField label="Enabled">
              <YesNoSelect
                value={form.enabled}
                onChange={(v) => updateField('enabled', v)}
                disabled={!canWrite}
                allowEmpty={false}
              />
            </FormField>
          </div>
        </CollapsibleSection>

        <div className="form-actions full-width">
          {canWrite && (
            <button className="btn-primary" type="submit" disabled={submitting || loadingRefs}>
              {submitting ? 'Saving…' : isEdit ? 'Save' : 'Create Party'}
            </button>
          )}
          <Link to="/party/person/find" className="btn-secondary">Back to Find Party</Link>
        </div>
      </form>

      {isEdit && savedUserLoginId && (
        <CollapsibleSection title="User Login Security Groups" defaultOpen>
          {!canWrite && (
            <p className="hint">You do not have permission to modify security group assignments.</p>
          )}
          {canWrite && (
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <FormField label="Security Group">
                <select
                  value={addSecurityGroupId}
                  onChange={(e) => setAddSecurityGroupId(e.target.value)}
                >
                  <option value="">Select security group…</option>
                  {securityGroupOptions.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.groupId} — {g.groupName || g.description}
                    </option>
                  ))}
                </select>
              </FormField>
              <div className="form-actions">
                <button
                  className="btn-primary"
                  type="button"
                  disabled={!addSecurityGroupId}
                  onClick={handleAddSecurityGroup}
                >
                  Add
                </button>
              </div>
            </div>
          )}
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group ID</th>
                  <th>Name</th>
                  <th>From Date</th>
                  <th>Thru Date</th>
                  {canWrite && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {securityGroups.length === 0 ? (
                  <tr>
                    <td colSpan={canWrite ? 5 : 4} className="empty-row">No security groups assigned.</td>
                  </tr>
                ) : (
                  securityGroups.map((row) => (
                    <tr key={`${row.groupId}-${row.fromDate}`}>
                      <td>{row.groupId}</td>
                      <td>{row.groupName || '—'}</td>
                      <td>{row.fromDate || '—'}</td>
                      <td>{row.thruDate || '—'}</td>
                      {canWrite && (
                        <td>
                          <button type="button" className="btn-secondary" onClick={() => handleRemoveSecurityGroup(row)}>
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
        </CollapsibleSection>
      )}

      {isEdit && !savedUserLoginId && (
        <p className="hint">Save the party with a user login (login ID and password) before assigning security groups.</p>
      )}
    </div>
  );
}
