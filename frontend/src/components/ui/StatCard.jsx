const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colors = {
    primary: 'bg-blue-50 text-primary',
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
