import React, { useState, useEffect } from 'react';
import { FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ClientPortal() {
  const { magic_token } = useParams();
  const [orgName, setOrgName] = useState('');
  const [orgLogo, setOrgLogo] = useState(null);
  const [clientName, setClientName] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [uploadingId, setUploadingId] = useState(null);
  const [textInputs, setTextInputs] = useState({});

  useEffect(() => {
    fetchPortalData();
  }, [magic_token]);

  const fetchPortalData = async () => {
    setLoading(true);
    // Fetch Project via magic_token joined with Client
    const { data: pData } = await supabase
      .from('projects')
      .select(`
        id, 
        clients ( full_name, organizations ( name, logo_url ) )
      `)
      .eq('magic_token', magic_token)
      .single();

    if (pData) {
      setProjectId(pData.id);
      setClientName(pData.clients?.full_name || 'Client');
      setOrgName(pData.clients?.organizations?.name || 'Partner Platform');
      setOrgLogo(pData.clients?.organizations?.logo_url || null);

      const { data: tData } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', pData.id)
        .order('order_index', { ascending: true });

      if (tData) setTasks(tData);
    }
    setLoading(false);
  };

  const handleTaskComplete = async (taskId, responseData = 'Done') => {
    setUploadingId(taskId);
    
    const { error } = await supabase
      .from('project_tasks')
      .update({ is_completed: true, response_data: responseData })
      .eq('id', taskId);

    if (!error) {
      // Refresh local state to avoid refetching
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, is_completed: true, response_data: responseData } : t);
      setTasks(updatedTasks);

      // Opportunistically update project overall progress
      const progress = Math.round((updatedTasks.filter(t => t.is_completed).length / updatedTasks.length) * 100);
      let status = 'In Progress';
      if (progress === 100) status = 'Completed';
      
      await supabase.from('projects').update({ progress, status }).eq('id', projectId);
    } else {
      alert("Failed to sync status securely.");
    }
    
    setUploadingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-textMain">
        <h2 className="text-2xl font-bold mb-2">Invalid Portal Link</h2>
        <p className="text-textMuted">This secure link is either expired or invalid.</p>
      </div>
    );
  }

  const progress = Math.round((tasks.filter(t => t.is_completed).length / (tasks.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-background text-textMain selection:bg-accent selection:text-white pb-20">
      {/* Portal Header */}
      <header className="bg-primary border-b border-accent/5 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {orgLogo && <img src={orgLogo} alt="Logo" className="w-8 h-8 rounded border border-accent/20 object-cover" />}
            <div className="text-xl font-bold tracking-tight">{orgName}</div>
          </div>
          <div className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">Secure Portal</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-4">Welcome back,<br/><span className="text-textMuted">{clientName}</span></h1>
          <p className="text-textMuted">Please complete the remaining items below to finalize your onboarding process.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-textMain">Completion</span>
            <span className="text-lg font-bold text-accent">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actionable Checklist */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-6 rounded-3xl border transition-all ${
                task.is_completed 
                  ? 'bg-primary border-green-500/30' 
                  : 'bg-primary border-accent/10 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className={`font-bold text-lg mb-1 leading-tight ${task.is_completed ? 'text-textMain/50 line-through' : 'text-textMain'}`}>
                    {task.title}
                  </h3>
                  <div className="text-xs font-bold text-textMuted tracking-wider uppercase">{task.type.replace('_', ' ')}</div>
                </div>

                {task.is_completed && (
                  <div className="bg-green-100 p-2 rounded-full shrink-0">
                    <CheckCircle2 size={24} className="text-green-600" />
                  </div>
                )}
              </div>

              {/* Interactive Area */}
              {!task.is_completed && task.type === 'FILE_UPLOAD' && (
                <button 
                  onClick={() => handleTaskComplete(task.id, 'mock_file_url.pdf')}
                  disabled={uploadingId === task.id}
                  className="w-full mt-2 py-4 rounded-2xl border-2 border-dashed border-accent/20 bg-background/50 hover:bg-black/5 transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uploadingId === task.id ? (
                    <>
                      <Loader2 size={24} className="text-accent animate-spin" />
                      <span className="text-sm font-semibold text-textMuted">Uploading secure file...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-primary rounded-full shadow-sm group-hover:scale-105 transition-transform"><FileUp size={24} className="text-accent" /></div>
                      <span className="text-sm font-bold text-textMain">Tap to browse files</span>
                      <span className="text-xs text-textMuted">PDF, JPG, or PNG (Max 10MB)</span>
                    </>
                  )}
                </button>
              )}

              {!task.is_completed && task.type === 'TEXT_INPUT' && (
                <div className="mt-2 flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={textInputs[task.id] || ''}
                    onChange={(e) => setTextInputs({ ...textInputs, [task.id]: e.target.value })}
                    className="w-full p-4 rounded-xl border border-accent/10 bg-background focus:outline-none focus:border-accent text-sm" 
                    placeholder="Enter value here..." 
                  />
                  <button 
                    onClick={() => handleTaskComplete(task.id, textInputs[task.id] || 'Submitted')}
                    disabled={uploadingId === task.id}
                    className="w-full flex justify-center items-center gap-2 py-4 rounded-xl bg-accent text-textMain font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-70"
                  >
                    {uploadingId === task.id ? <Loader2 size={16} className="animate-spin" /> : null}
                    Submit
                  </button>
                </div>
              )}
              
              {!task.is_completed && task.type === 'CHECKBOX' && (
                 <label className="flex items-center gap-3 mt-4 p-4 border border-accent/10 rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
                     <input 
                        type="checkbox" 
                        onChange={() => handleTaskComplete(task.id, 'Agreed')}
                        disabled={uploadingId === task.id}
                        className="w-5 h-5 rounded border-accent/20 text-accent focus:ring-accent" 
                     />
                     <span className="text-sm font-semibold text-textMain">I confirm & agree to this task</span>
                     {uploadingId === task.id && <Loader2 size={16} className="animate-spin ml-auto" />}
                 </label>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
