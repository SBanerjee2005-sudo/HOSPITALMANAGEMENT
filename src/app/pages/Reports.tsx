import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";

/* ===================== DATA ===================== */

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 68000 },
];

const deptData = [
  { name: "Cardiology", value: 45 },
  { name: "Neurology", value: 32 },
  { name: "Pediatrics", value: 28 },
  { name: "Orthopedics", value: 38 },
  { name: "General", value: 55 },
];

const statusData = [
  { name: "Admitted", value: 27 },
  { name: "In Treatment", value: 44 },
  { name: "Discharged", value: 22 },
  { name: "Waiting", value: 7 },
];

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

/* ===================== TOOLTIP ===================== */

const CurrencyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border shadow px-3 py-2 rounded text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-green-600 font-semibold">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border shadow px-3 py-2 rounded text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600 font-semibold">
          {payload[0].value} Patients
        </p>
      </div>
    );
  }
  return null;
};

/* ===================== COMPONENT ===================== */

export default function Reports() {
  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-gray-500">Analytics and insights</p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition">
          Export All Reports
        </button>
      </div>

      {/* REPORT CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card
          icon={<DollarSign size={20} />}
          color="bg-green-100 text-green-600"
          title="Monthly Revenue Report"
          desc="Detailed revenue breakdown"
        />

        <Card
          icon={<Users size={20} />}
          color="bg-blue-100 text-blue-600"
          title="Patient Statistics"
          desc="Comprehensive patient analysis"
        />

        <Card
          icon={<Calendar size={20} />}
          color="bg-purple-100 text-purple-600"
          title="Appointment Summary"
          desc="Overview of appointments"
        />

        <Card
          icon={<TrendingUp size={20} />}
          color="bg-teal-100 text-teal-600"
          title="Performance Metrics"
          desc="Hospital performance indicators"
        />
      </div>

      {/* FILTER (NEW REALISTIC ADDITION) */}
      <div className="mb-6 flex justify-end">
        <select className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option>This Month</option>
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* LINE */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-3 font-medium">
            Monthly Revenue Trends ($)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CurrencyTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-3 font-medium">
            Patients by Department
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-2 gap-6">

        {/* PIE */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-3 font-medium">
            Patient Status Distribution
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* METRICS */}
        <div className="space-y-4">
          <Metric
            title="Average Daily Patients"
            value="42"
            color="bg-blue-100 text-blue-600"
          />

          <Metric
            title="Success Rate"
            value="94.5%"
            color="bg-green-100 text-green-600"
          />

          <Metric
            title="Avg. Appointment Duration"
            value="28 min"
            color="bg-purple-100 text-purple-600"
          />

          <Metric
            title="Monthly Revenue"
            value="$67,000"
            color="bg-teal-100 text-teal-600"
          />
        </div>
      </div>
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

function Card({ icon, color, title, desc }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">
      <div className={`w-10 h-10 flex items-center justify-center rounded-lg mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}

function Metric({ title, value, color }: any) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <p className="text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}