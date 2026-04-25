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

import { Users, Stethoscope, Calendar, DollarSign } from "lucide-react";

/* ===================== TOOLTIP ===================== */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border shadow-lg px-3 py-2 rounded-lg text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-teal-600 font-semibold">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  /* ===================== DATA ===================== */

  const stats = [
    {
      title: "Total Patients",
      value: "156",
      change: "+12%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Doctors",
      value: "24",
      change: "+3%",
      icon: Stethoscope,
      color: "bg-teal-100 text-teal-600",
    },
    {
      title: "Appointments",
      value: "89",
      change: "+8%",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Revenue",
      value: "$246k",
      change: "+15%",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
  ];

  const patientTrend = [
    { name: "Oct", value: 120 },
    { name: "Nov", value: 135 },
    { name: "Dec", value: 142 },
    { name: "Jan", value: 150 },
    { name: "Feb", value: 155 },
    { name: "Mar", value: 160 },
  ];

  const weeklyAppointments = [
    { day: "Mon", value: 12 },
    { day: "Tue", value: 15 },
    { day: "Wed", value: 18 },
    { day: "Thu", value: 14 },
    { day: "Fri", value: 16 },
    { day: "Sat", value: 8 },
    { day: "Sun", value: 6 },
  ];

  const pieData = [
    { name: "ICU", value: 40 },
    { name: "General Ward", value: 35 },
    { name: "Emergency", value: 25 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  const patients = [
    { name: "Rahul Das", disease: "Diabetes", status: "In Treatment" },
    { name: "Tumpa Sen", disease: "Flu", status: "Admitted" },
    { name: "Suman Ghosh", disease: "Heart Issue", status: "In Treatment" },
    { name: "Mita Roy", disease: "Fever", status: "Discharged" },
  ];

  const appointments = [
    { name: "Rahul Das", doctor: "Dr. Tumpa Sen", time: "09:00 AM", status: "Scheduled" },
    { name: "Tumpa Sen", doctor: "Dr. Mita Roy", time: "02:00 PM", status: "In Progress" },
    { name: "Suman Ghosh", doctor: "Dr. Rahul Das", time: "11:30 AM", status: "Completed" },
  ];

  const statusStyle = (status: string) => {
    if (status === "Admitted") return "bg-blue-100 text-blue-600";
    if (status === "In Treatment") return "bg-yellow-100 text-yellow-700";
    if (status === "Discharged") return "bg-green-100 text-green-600";
    return "bg-gray-100";
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-500">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <span className="text-sm text-green-600 font-medium animate-pulse">
          ● Live
        </span>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-md border hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-lg ${s.color}`}>
                  <Icon size={20} />
                </div>

                <span className="text-green-600 text-sm font-medium">
                  ↗ {s.change}
                </span>
              </div>

              <h2 className="text-2xl font-bold">{s.value}</h2>
              <p className="text-gray-500">{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-3 gap-6">

        {/* LINE */}
        <div className="bg-white p-6 rounded-xl shadow-md border col-span-2">
          <h2 className="font-semibold mb-4">Patient Trends</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={patientTrend}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="font-semibold mb-4">Department Usage</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ percent }: any) =>
                  `${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BAR */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="font-semibold mb-4">Weekly Appointments</h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeklyAppointments}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#14b8a6"
              radius={[8, 8, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-2 gap-6">

        {/* APPOINTMENTS */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="font-semibold mb-4">Recent Appointments</h2>

          {appointments.map((item, i) => (
            <div
              key={i}
              className="flex justify-between py-3 border-b border-gray-200/70 hover:bg-gray-50 px-2 rounded transition cursor-pointer"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.doctor}</p>
              </div>

              <div className="text-right">
                <p>{item.time}</p>
                <span className="text-blue-600 text-sm">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* PATIENTS */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="font-semibold mb-4">Recent Patients</h2>

          {patients.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-gray-200/70 hover:bg-gray-50 px-2 rounded transition cursor-pointer"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.disease}</p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full ${statusStyle(
                  p.status
                )}`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;