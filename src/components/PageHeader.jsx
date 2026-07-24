import "./PageHeader.css";

export default function PageHeader({ Icon, title }) {
  return (
    <div className="page-header">
      {Icon && <Icon size={20} strokeWidth={2} />}
      <span>{title}</span>
    </div>
  );
}