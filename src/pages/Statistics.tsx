import { Users, Euro, Wallet } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, StatCard } from '../components/Card';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, subMonths, startOfDay, endOfDay, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, subDays, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';

import { useState } from 'react';

type TimeRange = 'day' | 'week' | 'month' | '6months' | '12months';

export function Statistics() {
  const { patients, appointments, invoices, patientDevices, expenses } = useApp();
  const [range, setRange] = useState<TimeRange>('6months');

  // Calculate date intervals based on range
  const getIntervals = () => {
    const end = new Date();
    switch (range) {
      case 'day':
        return { start: startOfDay(end), end: endOfDay(end), type: 'day' as const };
      case 'week':
        return { start: subDays(end, 6), end, type: 'day' as const };
      case 'month':
        return { start: subMonths(end, 1), end, type: 'week' as const };
      case '12months':
        return { start: subMonths(end, 11), end, type: 'month' as const };
      case '6months':
      default:
        return { start: subMonths(end, 5), end, type: 'month' as const };
    }
  };

  const { start: startDate, end: endDate, type: intervalType } = getIntervals();

  const dataPoints = () => {
    if (intervalType === 'day') {
      return eachDayOfInterval({ start: startDate, end: endDate }).map(d => ({
        date: d,
        label: format(d, 'dd MMM', { locale: fr })
      }));
    } else if (intervalType === 'week') {
      return eachWeekOfInterval({ start: startDate, end: endDate }).map(d => ({
        date: d,
        label: `Sem ${format(d, 'w')}`
      }));
    } else {
      return eachMonthOfInterval({ start: startDate, end: endDate }).map(d => ({
        date: d,
        label: format(d, 'MMM', { locale: fr })
      }));
    }
  };

  const filteredData = dataPoints().map(point => {
    let pStart: Date, pEnd: Date;
    if (intervalType === 'day') {
      pStart = startOfDay(point.date);
      pEnd = endOfDay(point.date);
    } else if (intervalType === 'week') {
      pStart = startOfWeek(point.date);
      pEnd = endOfWeek(point.date);
    } else {
      pStart = startOfMonth(point.date);
      pEnd = endOfMonth(point.date);
    }

    const interval = { start: pStart, end: pEnd };

    const rev = invoices
      .filter(inv => isWithinInterval(new Date(inv.date), interval))
      .reduce((sum, inv) => sum + inv.amount, 0);

    const exp = expenses
      .filter(ex => isWithinInterval(new Date(ex.date), interval))
      .reduce((sum, ex) => sum + ex.amount, 0);

    const apts = appointments.filter(a => isWithinInterval(new Date(a.date), interval)).length;

    return {
      name: point.label,
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
      appointments: apts
    };
  });

  const rangeInterval = { start: startDate, end: endDate };

  const totalRevenue = invoices
    .filter(inv => isWithinInterval(new Date(inv.date), rangeInterval))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpenses = expenses
    .filter(exp => isWithinInterval(new Date(exp.date), rangeInterval))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netProfit = totalRevenue - totalExpenses;


  const filteredExpenses = expenses.filter(exp => isWithinInterval(new Date(exp.date), rangeInterval));
  const expensesByCategory = filteredExpenses.reduce((acc: any, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  })).sort((a: any, b: any) => b.value - a.value);

  const satisfactionData = patientDevices.map(pd => {
    const lastAdj = pd.adjustments[pd.adjustments.length - 1];
    return lastAdj?.satisfaction || 0;
  });

  const avgSatisfaction = satisfactionData.length > 0
    ? satisfactionData.reduce((a: number, b: number) => a + b, 0) / satisfactionData.length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Statistiques</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyses détaillées de la performance de votre cabinet
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="range" className="text-sm font-medium text-slate-700 dark:text-slate-300">Période:</label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value as TimeRange)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="6months">6 derniers mois</option>
            <option value="12months">12 derniers mois</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(totalRevenue)}
          icon={<Euro className="h-6 w-6" />}
          color="emerald"
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Total des Dépenses"
          value={formatCurrency(totalExpenses)}
          icon={<Wallet className="h-6 w-6" />}
          color="rose"
          trend="+4%"
          trendUp={false}
        />
        <StatCard
          title="Bénéfice Net"
          value={formatCurrency(netProfit)}
          icon={<Wallet className="h-6 w-6" />}
          color={netProfit >= 0 ? "indigo" : "rose"}
          trend={netProfit >= 0 ? "+8%" : "-15%"}
          trendUp={netProfit >= 0}
        />
        <StatCard
          title="Patients Enregistrés"
          value={patients.length}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          trend="+5%"
          trendUp={true}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus vs Dépenses (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    formatter={(value) => `${value} DA`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    name="Revenus"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    name="Dépenses"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous par mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    dataKey="appointments"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {avgSatisfaction.toFixed(1)}
              </div>
              <div className="text-slate-500 mb-4">sur 5 étoiles</div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-8 w-8 ${i < Math.round(avgSatisfaction) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux d'Appareillage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {((patientDevices.length / (patients.length || 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-slate-500 mb-6">
                {patientDevices.length} / {patients.length} patients
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 max-w-[200px]">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(patientDevices.length / (patients.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 5)} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => `${value} DA`}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
