import FormField from './FormField';

export const SEARCH_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'like', label: 'Begins With' },
  { value: 'contains', label: 'Contains' },
  { value: 'empty', label: 'Is Empty' },
  { value: 'notEmpty', label: 'Is Not Empty' },
  { value: 'notEqual', label: 'Not Equal' },
];

export default function SearchCriteriaField({ label, criteria, onChange, disabledValue = false }) {
  const operator = criteria?.operator || 'contains';
  const valueDisabled = disabledValue || operator === 'empty' || operator === 'notEmpty';

  return (
    <div className="search-criteria-row">
      <FormField label={label}>
        <div className="search-criteria-controls">
          <select
            value={operator}
            onChange={(e) => onChange({ ...criteria, operator: e.target.value })}
            aria-label={`${label} operator`}
          >
            {SEARCH_OPERATORS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={criteria?.value || ''}
            disabled={valueDisabled}
            onChange={(e) => onChange({ ...criteria, value: e.target.value })}
            placeholder="Search value"
            aria-label={`${label} value`}
          />
          <label className="ignore-case">
            <input
              type="checkbox"
              checked={criteria?.ignoreCase !== false}
              disabled={valueDisabled}
              onChange={(e) => onChange({ ...criteria, ignoreCase: e.target.checked })}
            />
            Ignore Case
          </label>
        </div>
      </FormField>
    </div>
  );
}
