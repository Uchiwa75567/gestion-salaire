import React, { useEffect, useMemo, useState } from 'react';
import { Mail, UserPlus, CheckCircle, XCircle, Info, Search, X } from 'lucide-react';
import api, { createAdmin, getUsers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Cashiers = () => {
  const { currentUser, impersonateCompanyId } = useAuth();
  const companyScopeId = currentUser.role === 'ADMIN' ? currentUser.companyId : (impersonateCompanyId ? Number(impersonateCompanyId) : null);
  const storageKey = companyScopeId ? `cashiers_company_${companyScopeId}` : null;

  // Listing
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [search, setSearch] = useState('');

  // Modal create
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCashiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role, impersonateCompanyId]);

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      setError('');
      setInfo('');

      if (currentUser.role === 'SUPERADMIN') {
        // SUPERADMIN: liste complète depuis /auth/users
        const res = await getUsers();
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = all.filter(u => u.role === 'CAISSIER');
        const scoped = impersonateCompanyId ? filtered.filter(u => u.companyId === Number(impersonateCompanyId)) : filtered;

        // Mise en cache par entreprise pour amélioration UX côté ADMIN
        try {
          if (impersonateCompanyId) {
            localStorage.setItem(`cashiers_company_${Number(impersonateCompanyId)}`, JSON.stringify(scoped));
          } else {
            const groups = filtered.reduce((acc, u) => {
              const cid = Number(u.companyId || 0);
              if (!cid) return acc;
              if (!acc[cid]) acc[cid] = [];
              acc[cid].push(u);
              return acc;
            }, {});
            Object.entries(groups).forEach(([cid, list]) => {
              localStorage.setItem(`cashiers_company_${cid}`, JSON.stringify(list));
            });
          }
        } catch (_) {}

        setCashiers(scoped);
        return;
      }

      // ADMIN: Pas d'endpoint direct -> tenter plusieurs sources
      let derived = [];

      // 1) Cache local préparé par le SUPERADMIN en impersonation
      if (storageKey) {
        try {
          const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
          if (Array.isArray(stored) && stored.length) {
            derived = stored;
          }
        } catch (_) {}
      }

      // 2) Heuristique: tenter d'inférer des caissiers via /payments/company/{companyId}
      // Si des paiements existent, on peut remonter createdByUser comme indice de caissier
      if (derived.length === 0 && companyScopeId) {
        try {
          const paymentsRes = await api.get(`/payments/company/${companyScopeId}`);
          const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
          const caissiersMap = new Map();
          payments.forEach(p => {
            const u = p.createdByUser;
            if (u && u.role === 'CAISSIER') {
              caissiersMap.set(u.id, { id: u.id, name: u.name, email: u.email, role: 'CAISSIER', companyId: companyScopeId });
            }
          });
          if (caissiersMap.size > 0) {
            derived = Array.from(caissiersMap.values());
            // persist minimal cache
            if (storageKey) localStorage.setItem(storageKey, JSON.stringify(derived));
          }
        } catch (_) {
          // ignore
        }
      }

      setCashiers(derived);
      if (derived.length === 0) {
        setInfo("Aucun listing direct disponible pour votre rôle. Demandez à un SUPERADMIN d'ouvrir ce compte en mode impersonation pour initialiser l'affichage, ou enregistrez un paiement pour voir le caissier lié.");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to load cashiers';
      if (err?.response?.status === 403) {
        setInfo("Listing des utilisateurs non autorisé pour ce rôle. Vous pouvez toujours créer des caissiers.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCashiers = useMemo(() => {
    if (!search.trim()) return cashiers;
    const q = search.toLowerCase();
    return cashiers.filter(c => (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || String(c.id).includes(q));
  }, [cashiers, search]);

  // Create
  const openCreate = () => {
    setFormData({ name: '', email: '' });
    setFieldErrors({});
    setSuccess('');
    setError('');
    setShowCreate(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Invalid email address';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setCreating(true);
      setError('');
      setSuccess('');
      // ADMIN: companyId sera fixé par le back; SUPERADMIN: si besoin, utiliser impersonation pour scope entreprise
      const res = await createAdmin({ name: formData.name.trim(), email: formData.email.trim(), role: 'CAISSIER' });
      setSuccess("Caissier créé avec succès. Un email de mot de passe temporaire lui a été envoyé.");
      setShowCreate(false);
      // Ajouter localement pour afficher immédiatement
      const newUser = res?.data?.user;
      if (newUser) {
        setCashiers(prev => [newUser, ...prev]);
        // Persist locally for ADMIN scope
        if (storageKey) {
          try {
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const next = [newUser, ...(Array.isArray(existing) ? existing : [])];
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch (_) {
            localStorage.setItem(storageKey, JSON.stringify([newUser]));
          }
        }
      } else {
        // Si l'API ne renvoie pas user, refetch (uniquement si SUPERADMIN)
        if (currentUser.role === 'SUPERADMIN') fetchCashiers();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to create cashier';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cashiers</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Cashier
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search cashiers by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {info && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5" />
          <span className="text-sm">{info}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading cashiers...</div>
      ) : filteredCashiers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No cashiers found</div>
      ) : (
        <div className="space-y-4">
          {filteredCashiers.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{c.name}</div>
                <div className="text-sm text-gray-600">{c.email}</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">CAISSIER</span>
                {c.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Cashier</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitCreate} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => { setFormData(f => ({ ...f, name: e.target.value })); setFieldErrors(fe => ({ ...fe, name: '' })); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter cashier full name"
                />
                {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => { setFormData(f => ({ ...f, email: e.target.value })); setFieldErrors(fe => ({ ...fe, email: '' })); }}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="name@example.com"
                  />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
              </div>

              {success && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-800 rounded flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${creating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {creating ? (<><UserPlus className="h-4 w-4 mr-2 animate-pulse" />Creating...</>) : (<><UserPlus className="h-4 w-4 mr-2" />Create Cashier</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashiers;
