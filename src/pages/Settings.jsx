import React, { useState } from 'react';
import { Upload, Building2, Lock, Save } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="max-w-5xl mx-auto xl:px-4 pb-20">
      <div className="mb-8 border-b border-accent/10 pb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Organization Settings</h1>
        <p className="text-textMuted">Manage your team profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Navigation / Sections */}
        <div className="col-span-1 space-y-2 font-medium">
          <button 
            onClick={() => setActiveTab('company')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'company' 
                ? 'bg-accent text-textMain' 
                : 'text-textMuted hover:bg-black/5 hover:text-textMain'
            }`}
          >
            <Building2 size={18} /> Company Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'security' 
                ? 'bg-accent text-textMain' 
                : 'text-textMuted hover:bg-black/5 hover:text-textMain'
            }`}
          >
            <Lock size={18} /> Password & Security
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          
          {/* Company Profile Tab */}
          {activeTab === 'company' && (
            <>
              {/* Logo Section */}
              <section className="bg-primary p-8 rounded-3xl border border-accent/5 shadow-sm">
                <h2 className="text-xl font-bold text-textMain mb-6">Company Logo</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-accent/20 flex inset-0 justify-center items-center shrink-0">
                    <Building2 size={32} className="text-textMuted/50" />
                  </div>
                  <div className="flex-1 w-full">
                    <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-background border border-accent/20 px-5 py-2.5 rounded-xl font-semibold text-textMain hover:bg-black/5 transition-colors text-sm mb-2">
                      <Upload size={16} /> Upload New Logo
                    </button>
                    <p className="text-xs text-textMuted">We recommend an image of at least 400x400px. PNG or JPG.</p>
                  </div>
                </div>
              </section>

              {/* Details Section */}
              <section className="bg-primary p-8 rounded-3xl border border-accent/5 shadow-sm">
                <h2 className="text-xl font-bold text-textMain mb-6">Profile Information</h2>
                
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-textMain mb-2">Company Name</label>
                      <input 
                        type="text" 
                        defaultValue="Acme Corp"
                        className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-textMain mb-2">Industry</label>
                      <input 
                        type="text" 
                        defaultValue="Logistics"
                        className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-textMain mb-2">Primary Support Email</label>
                    <input 
                      type="email" 
                      defaultValue="support@acme.com"
                      className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
                    />
                    <p className="text-xs text-textMuted mt-2">This email will be visible to your clients in the onboarding portal.</p>
                  </div>
                </form>
              </section>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <section className="bg-primary p-8 rounded-3xl border border-accent/5 shadow-sm">
              <h2 className="text-xl font-bold text-textMain mb-6">Change Password</h2>
              
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-semibold text-textMain mb-2">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-textMain mb-2">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textMain mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full p-3 rounded-xl border border-accent/20 bg-background text-sm text-textMain focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* Action Footer */}
          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-accent text-textMain px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md">
              <Save size={18} /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
