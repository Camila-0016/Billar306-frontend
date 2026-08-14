export default function PageHeader({ Icon, title }) {
  return (
    <div className="bg-fieltro text-marfil px-4 lg:px-8 py-3.5 -mx-4 -mt-4 lg:-mx-8 lg:-mt-8 mb-4 font-bold text-base flex items-center gap-2 border-b-4 border-dorado">
      {Icon && <Icon size={20} strokeWidth={2} />}
      <span>{title}</span>
    </div>
  );
}