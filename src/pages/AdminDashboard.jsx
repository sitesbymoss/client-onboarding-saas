import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

const MetricCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-primary p-6 rounded-3xl border border-accent/5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-background rounded-full">
        <Icon size={24} className="text-accent" />
      </div>
      {trend && <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <h3 className="text-textMuted text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-textMain">{value}</div>
  </div>
);

export default function AdminDashboard() {
  const { orgId } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) fetchRecentProjects();
  }, [orgId]);

  const fetchRecentProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('id, name, status, progress, created_at, clients(full_name)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentProjects(data.map(p => ({
        id: p.id,
        client: p.clients?.full_name || 'Unknown Client',
        project: p.name,
        status: p.status,
        progress: p.progress || 0,
        lastUpdated: new Date(p.created_at).toLocaleDateString()
      })));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto xl:px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-2">Dashboard</h1>
          <p className="text-textMuted">Welcome back. Here is what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/admin/projects/new" className="inline-block bg-accent text-textMain px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
            + New Project
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard title="Active Projects" value="24" icon={Activity} trend="+12%" />
        <MetricCard title="Pending Client Uploads" value="7" icon={Clock} trend="-3" />
        <MetricCard title="Completed Projects" value="142" icon={CheckCircle} />
      </div>

      {/* Details Table Section */}
      <div className="bg-primary rounded-3xl border border-accent/5 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-accent/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-textMain">Recent Onboardings</h2>
          <button className="text-sm font-medium text-textMuted hover:text-textMain">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-accent/5 text-sm">
                <th className="px-8 py-4 font-semibold text-textMuted w-1/4">Client</th>
                <th className="px-8 py-4 font-semibold text-textMuted w-1/4">Project Name</th>
                <th className="px-8 py-4 font-semibold text-textMuted">Status</th>
                <th className="px-8 py-4 font-semibold text-textMuted">Progress</th>
                <th className="px-8 py-4 font-semibold text-textMuted text-right">Last Updated</th>
                <th className="px-8 py-4 font-semibold text-textMuted"></th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => (
                <tr key={project.id} className="border-b border-accent/5 last:border-b-0 hover:bg-black/[0.02] transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="font-semibold text-textMain">{project.client}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-textMuted group-hover:text-textMain transition-colors">{project.project}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'Pending Upload' ? 'bg-yellow-100 text-yellow-700' :
                        project.status === 'Action Required' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-textMuted w-8">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right text-sm text-textMuted">
                    {project.lastUpdated}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link to={`/admin/projects/${project.id}`} className="text-textMuted hover:text-textMain p-2 inline-block">
                      <MoreHorizontal size={20} />
                    </Link>
                  </td>
                </tr>
              ))}

              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-14 text-center border-t border-accent/5">
                    <Loader2 size={40} className="text-accent animate-spin mx-auto mb-3" />
                  </td>
                </tr>
              ) : recentProjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-14 text-center border-t border-accent/5">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle size={40} className="text-accent/20 mb-3" />
                      <p className="text-textMain font-bold">No active onboardings found</p>
                      <p className="text-textMuted text-sm mt-1">Get started by creating a new project above.</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
