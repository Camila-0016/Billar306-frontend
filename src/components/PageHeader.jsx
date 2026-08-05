export default function PageHeader({ Icon, title }) {
  return (
    <div className="bg-fieltro text-marfil px-4 py-3.5 -mx-4 -mt-4 mb-4 font-bold text-base flex items-center gap-2 border-b-4 border-dorado">
      {Icon && <Icon size={20} strokeWidth={2} />}
      <span>{title}</span>
    </div>
  );
}