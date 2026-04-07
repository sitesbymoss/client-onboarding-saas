import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Edit2, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

export default function Templates() {
  const { orgId } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) fetchTemplates();
  }, [orgId]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, created_at, template_tasks(id)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map(t => ({
        id: t.id,
        name: t.name,
        taskCount: t.template_tasks ? t.template_tasks.length : 0,
        lastUpdated: new Date(t.created_at).toLocaleDateString()
      }));
      setTemplates(formatted);
    }
    setLoading(false);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this template?')) {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (!error) {
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        alert("Failed to delete template.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto xl:px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-accent/5">
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-2">Templates</h1>
          <p className="text-textMuted">Manage pre-built onboarding checklists and requirements.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/admin/templates/new" className="inline-block bg-accent text-textMain px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
            + New Template
          </Link>
        </div>
      </div>

      <div className="bg-primary rounded-3xl border border-accent/5 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-accent/5 text-sm">
                <th className="px-8 py-4 font-semibold text-textMuted w-1/2">Template Name</th>
                <th className="px-8 py-4 font-semibold text-textMuted">Data Points</th>
                <th className="px-8 py-4 font-semibold text-textMuted text-right">Last Updated</th>
                <th className="px-8 py-4 font-semibold text-textMuted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-accent/5 last:border-b-0 hover:bg-black/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background border border-accent/5 rounded-xl">
                        <FileText size={20} className="text-accent" />
                      </div>
                      <div className="font-semibold text-textMain">{template.name}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-medium text-textMuted bg-background border border-accent/5 px-3 py-1 rounded-full w-max">
                      {template.taskCount} defined tasks
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right text-sm text-textMuted">
                    {template.lastUpdated}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/admin/templates/${template.id}`} 
                        className="p-2 text-textMuted hover:text-textMain transition-colors flex items-center gap-2 border border-accent/10 rounded-lg bg-background hover:border-accent/30 text-xs font-bold" 
                        title="Edit Template"
                      >
                        Edit <Edit2 size={14} />
                      </Link>
                      <button 
                        onClick={(e) => handleDelete(e, template.id)}
                        className="p-2 text-textMuted hover:text-red-500 transition-colors" 
                        title="Delete Template"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <Loader2 size={40} className="text-accent animate-spin mx-auto mb-3" />
                    <p className="text-textMuted font-medium">Loading templates...</p>
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle size={40} className="text-accent/20 mb-3" />
                      <p className="text-textMain font-bold">No templates created</p>
                      <p className="text-textMuted text-sm mt-1">Spin up your first reusable workflow by clicking + New Template.</p>
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
