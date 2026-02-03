export default function StatCard({ title, value, icon, hint, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${gradient || 'bg-linear-to-br from-blue-500 to-blue-600'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white opacity-5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white/90">{title}</p>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <div className="text-white">{icon}</div>
          </div>
        </div>

        <p className="text-3xl font-bold text-white mb-1">
          {value}
        </p>

        {hint && (
          <p className="text-sm text-white/80 font-medium">{hint}</p>
        )}
      </div>
    </div>
  );
}
