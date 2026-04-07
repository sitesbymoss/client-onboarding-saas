import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, ExternalLink, FileUp, CheckSquare, Type, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TaskIcon = ({ type }) => {
  switch(type) {
    case 'FILE_UPLOAD': return <FileUp size={20} className="text-textMuted" />;
    case 'TEXT_INPUT': return <Type size={20} className="text-textMuted" />;
    case 'CHECKBOX': return <CheckSquare size={20} className="text-textMuted" />;
    default: return <FileUp size={20} />;
  }
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const { data: pData } = await supabase
      .from('projects')
      .select('id, name, progress, magic_token, clients(full_name)')
      .eq('id', id)
      .single();

    if (pData) {
      setProject({
        id: pData.id,
        name: pData.name,
        client: pData.clients?.full_name || 'Unknown',
        magic_token: pData.magic_token,
        overallProgress: pData.progress || 0
      });
    }

    const { data: tData } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', id)
      .order('order_index', { ascending: true });

    if (tData) setTasks(tData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <Link to="/admin/projects" className="text-accent hover:underline mt-4 inline-block">Return to Projects</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto xl:px-4 pb-20">
      <div className="mb-6">
        <Link to="/admin/projects" className="text-sm font-semibold text-textMuted hover:text-textMain flex items-center gap-2 w-max">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-accent/10 pb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-accent/10 text-accent font-bold text-xs px-2.5 py-1 rounded-full">{project.client}</span>
          </div>
          <h1 className="text-3xl font-bold text-textMain">{project.name}</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-background border border-accent/20 px-5 py-2.5 rounded-full text-sm font-semibold text-textMain hover:bg-black/5 transition-colors shadow-sm">
            <Mail size={16} /> Resend Link
          </button>
          <Link to={`/portal/${project.magic_token}`} target="_blank" className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-accent text-textMain px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-accent/20">
            View Portal <ExternalLink size={16} />
          </Link>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-primary rounded-3xl border border-accent/5 p-8 shadow-sm mb-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-textMain">Client Progress</h2>
            <p className="text-sm text-textMuted">
              {tasks.filter(t => t.is_completed).length} of {tasks.length} tasks completed
            </p>
          </div>
          <div className="text-3xl font-bold text-textMain">{project.overallProgress}%</div>
        </div>
        <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-accent/5">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${project.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-primary rounded-3xl border border-accent/5 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-textMain mb-6">Task Status</h2>
        
        {tasks.length === 0 ? (
          <p className="text-textMuted italic text-sm">No tasks assigned to this project.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border ${task.is_completed ? 'border-green-500/20 bg-green-50/30' : 'border-accent/10 bg-background/30'}`}>
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="relative">
                    <div className="bg-primary p-2.5 rounded-xl shadow-sm border border-accent/5">
                      <TaskIcon type={task.type} />
                    </div>
                    {task.is_completed && (
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full">
                        <CheckCircle2 size={16} className="text-green-500 fill-green-100" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-textMain text-sm mb-1">{task.title}</div>
                    <div className="text-xs font-semibold text-textMuted tracking-wider uppercase">{task.type.replace('_', ' ')}</div>
                  </div>
                </div>

                <div>
                  {task.is_completed ? (
                    task.type === 'FILE_UPLOAD' ? (
                      <button className="w-full sm:w-auto text-sm font-semibold text-accent bg-accent/5 px-4 py-2 rounded-xl hover:bg-accent/10 transition-colors">
                        Download File
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-xl bg-background border border-accent/5 text-sm font-mono text-textMain truncate max-w-[200px]">
                        {task.response_data || 'Completed'}
                      </div>
                    )
                  ) : (
                    <span className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-yellow-100 text-yellow-700">
                      PENDING CLIENT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
