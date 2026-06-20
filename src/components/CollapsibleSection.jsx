import { useState } from 'react';

export default function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="fieldgroup">
      <button type="button" className="fieldgroup-header" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="fieldgroup-body">{children}</div>}
    </section>
  );
}
