export default function FormField({ label, hint, children, className = '' }) {
  return (
    <div className={`form-field ${className}`.trim()}>
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
