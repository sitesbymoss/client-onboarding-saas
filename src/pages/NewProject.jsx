import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

export default function NewProject() {
  const navigate = useNavigate();
  const { orgId } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [email, setEmail] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('templates').select('id, name').order('created_at', { ascending: false });
      if (data) setTemplates(data);
    };
    fetchTemplates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Create the Client Record
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([{ full_name: orgName, email, org_id: orgId }])
        .select()
        .single();

      if (clientError) throw new Error("Failed to create client record");

      // 2. Create the Project Record
      const magicToken = crypto.randomUUID().replace(/-/g, '');
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          client_id: client.id,
          org_id: orgId,
          name: projectName,
          magic_token: magicToken,
          status: 'Pending Upload'
        }])
        .select()
        .single();

      if (projectError) throw new Error("Failed to create project");

      // 3. Clone Template Tasks Data (If chosen)
      if (templateId) {
        const { data: tTasks } = await supabase
          .from('template_tasks')
          .select('*')
          .eq('template_id', templateId);

        if (tTasks && tTasks.length > 0) {
          const payload = tTasks.map(t => ({
            project_id: project.id,
            title: t.title,
            type: t.type,
            order_index: t.order_index
          }));
          await supabase.from('project_tasks').insert(payload);
        }
      }
      // 4. Send the Production Email via Edge Function
      const portalUrl = `${window.location.origin}/portal/${magicToken}`;
      const { error: invokeErr } = await supabase.functions.invoke('send-client-email', {
        body: { 
          clientEmail: email, 
          portalUrl, 
          orgName, 
          projectName 
        }
      });

      if (invokeErr) {
        alert("Project created, but email notification failed: " + invokeErr.message);
      } else {
        alert("Success! Project generated and secure portal dispatched to client inbox.");
      }

      navigate(`/admin/projects/${project.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto xl:px-4 pb-20">
      <div className="mb-6">
        <Link to="/admin/projects" className="text-sm font-semibold text-textMuted hover:text-textMain flex items-center gap-2 w-max">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      <div className="mb-8 border-b border-accent/10 pb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Create New Project</h1>
        <p className="text-textMuted">Initialize a new secure client portal from a template.</p>
      </div>

      <div className="bg-primary rounded-3xl border border-accent/5 shadow-sm p-8 md:p-10">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-textMain mb-2">Client / Organization Name</label>
              <input 
                type="text" 
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
                className="w-full p-4 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-textMain mb-2">Internal Project Name</label>
              <input 
                type="text" 
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g. Q3 Retainer Setup"
                required
                className="w-full p-4 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-textMain mb-2">Client Contact Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
              className="w-full p-4 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-textMuted mt-2">The initial magic link invitation will be sent to this address.</p>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-textMain mb-2">Select Onboarding Template</label>
            <select 
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              className="w-full p-4 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="">Blank (Custom Build)</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-accent/5 mt-8 flex justify-end gap-4">
            <Link to="/admin/projects" className="px-6 py-3 rounded-xl font-bold text-textMuted hover:bg-black/5 hover:text-textMain transition-colors">
              Cancel
            </Link>
            <button disabled={saving} type="submit" className="flex items-center gap-2 bg-accent text-textMain px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md disabled:opacity-70">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
              {saving ? 'Launching...' : 'Launch Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
