const provider = (import.meta.env.VITE_BACKEND_PROVIDER || 'local').toLowerCase();

export const backendAdapter = {
  provider,

  isRemoteEnabled() {
    return provider !== 'local';
  },

  isFirebase() {
    return provider === 'firebase';
  },

  async sync() {
    if (provider === 'local') {
      return { synced: false, reason: 'provider-local' };
    }

    if (provider === 'firebase') {
      return { synced: true, reason: 'provider-firebase' };
    }

    return { synced: false, reason: 'provider-not-supported' };
  },
};
