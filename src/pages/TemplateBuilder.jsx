import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, GripVertical, FileUp, Type, CheckSquare, ArrowUp, ArrowDown, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthProvider';

const TaskIcon = ({ type }) => {
  switch (type) {
    case 'FILE_UPLOAD': return <FileUp size={20} className="text-blue-500" />;
    case 'TEXT_INPUT': return <Type size={20} className="text-green-500" />;
    case 'CHECKBOX': return <CheckSquare size={20} className="text-purple-500" />;
    default: return <FileUp size={20} />;
  }
}

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orgId } = useAuth();
  const [templateName, setTemplateName] = useState('New Template');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('FILE_UPLOAD');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    const { data: templateData } = await supabase.from('templates').select('*').eq('id', id).single();
    if (templateData) setTemplateName(templateData.name);

    const { data: taskData } = await supabase.from('template_tasks').select('*').eq('template_id', id).order('order_index', { ascending: true });
    if (taskData) setTasks(taskData);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!templateName.trim()) return alert("Please enter a template name");
    setSaving(true);
    let currentTemplateId = id;

    if (currentTemplateId) {
      await supabase.from('templates').update({ name: templateName }).eq('id', currentTemplateId);
      await supabase.from('template_tasks').delete().eq('template_id', currentTemplateId);
    } else {
      const { data, error } = await supabase.from('templates').insert([{ name: templateName, org_id: orgId }]).select().single();
      if (error) { alert('Failed to save template: ' + error.message); setSaving(false); return; }
      currentTemplateId = data.id;
    }

    if (tasks.length > 0) {
      const payload = tasks.map((t, index) => ({
        template_id: currentTemplateId,
        title: t.title,
        type: t.type,
        order_index: index
      }));
      await supabase.from('template_tasks').insert(payload);
    }
    setSaving(false);
    navigate('/admin/templates');
  };


  const moveTask = (index, direction) => {
    const newTasks = [...tasks];
    if (direction === 'up' && index > 0) {
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
    } else if (direction === 'down' && index < newTasks.length - 1) {
      [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];
    }
    setTasks(newTasks);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      type: newTaskType,
      title: newTaskTitle
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto xl:px-4 pb-20">
      <div className="mb-6">
        <Link to="/admin/templates" className="text-sm font-semibold text-textMuted hover:text-textMain flex items-center gap-2 w-max">
          <ArrowLeft size={16} /> Back to Templates
        </Link>
      </div>

      <div className="mb-8 border-b border-accent/10 pb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Template Builder</h1>
        <p className="text-textMuted">Design your reusable onboarding checklists.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-primary rounded-3xl border border-accent/5 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-textMain mb-6">{templateName || 'Untitled Template'}</h2>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex items-center gap-4 p-4 border border-accent/10 rounded-2xl bg-background/30 group hover:border-accent/30 transition-colors">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveTask(index, 'up')} disabled={index === 0} className="text-textMuted hover:text-textMain disabled:opacity-30"><ArrowUp size={16} /></button>
                    <button onClick={() => moveTask(index, 'down')} disabled={index === tasks.length - 1} className="text-textMuted hover:text-textMain disabled:opacity-30"><ArrowDown size={16} /></button>
                  </div>

                  <div className="p-2 bg-primary rounded-lg border border-accent/5">
                    <TaskIcon type={task.type} />
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-textMain text-sm">{task.title}</div>
                    <div className="text-xs text-textMuted font-medium uppercase tracking-wider mt-1">{task.type.replace('_', ' ')}</div>
                  </div>

                  <button onClick={() => removeTask(task.id)} className="text-textMuted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-10 border-2 border-dashed border-accent/10 rounded-2xl flex flex-col justify-center items-center">
                <Loader2 className="animate-spin text-accent mb-2" size={24} />
                <p className="text-textMuted font-medium">Loading schema...</p>
              </div>
            ) : tasks.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-accent/10 rounded-2xl">
                <p className="text-textMuted font-medium">No tasks added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary rounded-3xl border border-accent/5 p-6 shadow-sm">
            <h3 className="font-bold text-textMain mb-4">Template Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textMain mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Standard Setup"
                  className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent/40"
                />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-accent text-textMain py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-70">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>

          <div className="bg-primary rounded-3xl border border-accent/5 p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-textMain mb-4">Add New Task</h3>

            <form onSubmit={addTask} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textMain mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Upload your logo"
                  className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent/40"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textMain mb-2">Task Type</label>
                <div className="space-y-2">
                  {['FILE_UPLOAD', 'TEXT_INPUT', 'CHECKBOX'].map(type => (
                    <label key={type} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${newTaskType === type ? 'border-accent bg-accent/5' : 'border-accent/10 hover:border-accent/30'}`}>
                      <input
                        type="radio"
                        name="taskType"
                        value={type}
                        checked={newTaskType === type}
                        onChange={() => setNewTaskType(type)}
                        className="hidden"
                      />
                      <TaskIcon type={type} />
                      <span className="ml-3 text-sm font-medium text-textMain">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-accent text-textMain font-bold hover:opacity-90 transition-opacity">
                <Plus size={18} /> Add Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
