import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrgId(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrgId(session.user.id);
      } else {
        setOrgId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrgId = async (userId) => {
    // The trigger might take a microsecond, so fetch with retry logic or just once
    setLoading(true);
    const { data: userRow } = await supabase.from('users').select('org_id').eq('id', userId).single();
    if (userRow) {
      setOrgId(userRow.org_id);
      await fetchOrgDetails(userRow.org_id);
    }
    setLoading(false);
  };

  const fetchOrgDetails = async (organizationId) => {
    const { data: orgRow } = await supabase.from('organizations').select('*').eq('id', organizationId).single();
    if (orgRow) {
      setOrgDetails(orgRow);
    }
  };

  const refreshOrg = async () => {
    if (orgId) {
      await fetchOrgDetails(orgId);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, orgId, orgDetails, refreshOrg, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
