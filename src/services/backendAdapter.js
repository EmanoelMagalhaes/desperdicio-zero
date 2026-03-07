const provider = import.meta.env.VITE_BACKEND_PROVIDER || 'local';

export const backendAdapter = {
  provider,

  isRemoteEnabled() {
    return provider !== 'local';
  },

  async sync() {
    if (provider === 'local') {
      return { synced: false, reason: 'provider-local' };
    }

    // Placeholder para futura integracao Firebase/Supabase.
    return { synced: false, reason: 'not-implemented' };
  },
};