export default function PlaceholderPage({ title, description }) {
  return (
    <div className="screenlet">
      <div className="screenlet-title">{title}</div>
      <div className="screenlet-body">
        <p>{description}</p>
      </div>
    </div>
  );
}
