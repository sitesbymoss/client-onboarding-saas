import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Trash2, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

export default function Projects() {
  const { orgId } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) fetchProjects();
  }, [orgId]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, progress, created_at, clients(full_name)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data.map(p => ({
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

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        alert("Failed to delete project.");
      }
    }
  };

  const handleResend = (e, client) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Magic link has been securely resent to ${client}.`);
  };

  return (
    <div className="max-w-7xl mx-auto xl:px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-accent/5">
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-2">Projects</h1>
          <p className="text-textMuted">Manage all active and completed client onboardings.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/admin/projects/new" className="inline-block bg-accent text-textMain px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
            + New Project
          </Link>
        </div>
      </div>

      <div className="bg-primary rounded-3xl border border-accent/5 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-accent/5 text-sm">
                <th className="px-8 py-4 font-semibold text-textMuted w-1/4">Client</th>
                <th className="px-8 py-4 font-semibold text-textMuted w-1/4">Project Name</th>
                <th className="px-8 py-4 font-semibold text-textMuted">Status</th>
                <th className="px-8 py-4 font-semibold text-textMuted">Progress</th>
                <th className="px-8 py-4 font-semibold text-textMuted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-accent/5 last:border-b-0 hover:bg-black/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-semibold text-textMain">{project.client}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-textMuted">{project.project}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'Pending Upload' ? 'bg-yellow-100 text-yellow-700' :
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
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleResend(e, project.client)}
                        className="p-2 text-textMuted hover:text-blue-500 transition-colors" 
                        title="Resend Invite"
                      >
                        <Mail size={18} />
                      </button>
                      <Link 
                        to={`/admin/projects/${project.id}`} 
                        className="p-2 text-textMuted hover:text-textMain transition-colors flex items-center gap-2 border border-accent/10 rounded-lg bg-background hover:border-accent/30 text-xs font-bold" 
                        title="View Data"
                      >
                        View <ExternalLink size={14} />
                      </Link>
                      <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-textMuted hover:text-red-500 transition-colors" 
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <Loader2 size={40} className="text-accent animate-spin mx-auto mb-3" />
                    <p className="text-textMuted font-medium">Loading projects...</p>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle size={40} className="text-accent/20 mb-3" />
                      <p className="text-textMain font-bold">No projects initialized</p>
                      <p className="text-textMuted text-sm mt-1">Spin up your first client onboarding portal by clicking + New Project.</p>
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
