import FormField from './FormField';

export const ORDER_MATCH_MODES = [
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'EQUALS', label: 'Equals' },
  { value: 'STARTS_WITH', label: 'Starts With' },
  { value: 'ENDS_WITH', label: 'Ends With' },
  { value: 'INCLUDE', label: 'Include' },
];

export default function OrdersMatchField({ label, value, matchMode, onValueChange, onMatchModeChange }) {
  return (
    <div className="search-criteria-row">
      <FormField label={label}>
        <div className="search-criteria-controls">
          <select
            value={matchMode}
            onChange={(e) => onMatchModeChange(e.target.value)}
            aria-label={`${label} match mode`}
          >
            {ORDER_MATCH_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Search value"
            aria-label={`${label} value`}
          />
        </div>
      </FormField>
    </div>
  );
}
