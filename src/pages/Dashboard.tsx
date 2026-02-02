import { Users, Calendar, TrendingUp, Star, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, StatCard } from '../components/Card';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';

export function Dashboard() {
  const { patients, appointments, invoices, patientDevices, hearingAids, currentUser } = useApp();

  // Calculate statistics
  const thisMonth = new Date();
  const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);

  const newPatientsThisMonth = patients.filter(p =>
    new Date(p.createdAt) >= lastMonth
  ).length;

  const upcomingAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    return isAfter(aptDate, new Date()) &&
      isBefore(aptDate, addDays(new Date(), 7));
  }).length;

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  const avgSatisfaction = patientDevices.reduce((sum, pd) => {
    const lastAdj = pd.adjustments[pd.adjustments.length - 1];
    return sum + (lastAdj?.satisfaction || 0);
  }, 0) / (patientDevices.length || 1); // Avoid division by zero

  // Device usage stats
  const deviceStats = hearingAids.map(ha => {
    const count = patientDevices.filter(pd => pd.hearingAidId === ha.id).length;
    return { name: ha.brand, count };
  }).filter(d => d.count > 0);

  // Appointments by type
  const appointmentsByType = [
    { name: 'Bilan', count: appointments.filter(a => a.type === 'bilan').length },
    { name: 'Essai', count: appointments.filter(a => a.type === 'essai').length },
    { name: 'Réglage', count: appointments.filter(a => a.type === 'reglage').length },
    { name: 'Contrôle', count: appointments.filter(a => a.type === 'controle').length },
  ];

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bonjour, {currentUser?.name || 'Docteur'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
            Voici un aperçu de votre activité aujourd'hui, {format(new Date(), 'EEEE d MMMM', { locale: fr })}.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients Totaux"
          value={patients.length}
          icon={<Users className="w-6 h-6" />}
          trend={newPatientsThisMonth.toString()}
          trendUp={true}
          color="indigo"
        />
        <StatCard
          title="RDV cette semaine"
          value={upcomingAppointments}
          icon={<Calendar className="w-6 h-6" />}
          trend="2"
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="12%"
          trendUp={true}
          color="emerald"
        />
        <StatCard
          title="Satisfaction"
          value={avgSatisfaction.toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          trend="4.8"
          trendUp={true}
          color="amber"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité par type de rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsByType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - 1/3 width */}
        <Card>
          <CardHeader>
            <CardTitle>Marques préférées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {deviceStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {deviceStats.reduce((acc, curr) => acc + curr.count, 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments Table */}
      <Card noPadding>
        <CardHeader>
          <CardTitle>Prochains Rendez-vous</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Date & Heure</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Durée</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {appointments
                .filter(a => isAfter(new Date(a.date), new Date()))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <tr key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${patient?.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                            {patient?.firstName.charAt(0)}{patient?.lastName.charAt(0)}
                          </div>
                          {patient?.firstName} {patient?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {format(new Date(appointment.date), 'dd MMM', { locale: fr })}
                          <span className="text-slate-300">|</span>
                          <Clock className="w-4 h-4 text-slate-400" />
                          {format(new Date(appointment.date), 'HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${appointment.type === 'bilan' ? 'bg-indigo-100 text-indigo-800' : ''}
                          ${appointment.type === 'controle' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${appointment.type === 'essai' ? 'bg-amber-100 text-amber-800' : ''}
                          ${appointment.type === 'reglage' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {appointment.duration} min
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                          Gérer
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
