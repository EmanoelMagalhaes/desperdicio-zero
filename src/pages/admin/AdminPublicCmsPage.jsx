import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import SectionTitle from '../../components/common/SectionTitle';
import { useAppStore } from '../../hooks/useAppStore';
import { cmsDefaults } from '../../data/cmsDefaults';
import { sanitizeSectionsOrder } from '../../utils/cms';
import { createId } from '../../utils/ids';

const SECTION_LABELS = {
  hero: 'Hero',
  banner: 'Banners',
  highlights: 'Destaques',
  offers: 'Ofertas',
  contact: 'Contato',
};

function fieldInputClasses() {
  return 'mt-2 w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white/85 outline-none transition focus:border-emerald-400/60';
}

export default function AdminPublicCmsPage() {
  const { cmsPublic, updatePublicCms, cmsStatus, cmsError, offers = [] } = useAppStore();
  const [draft, setDraft] = useState(cmsPublic);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    setDraft(cmsPublic);
  }, [cmsPublic]);

  const activeOffers = useMemo(() => offers.filter((offer) => offer?.isActive !== false), [offers]);
  const form = draft || cmsPublic || cmsDefaults;

  const sectionsOrder = sanitizeSectionsOrder(form.home.sectionsOrder);

  function updateHeroField(field, value) {
    setDraft((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        hero: {
          ...prev.home.hero,
          [field]: value,
        },
      },
    }));
  }

  function updateSiteField(field, value) {
    setDraft((prev) => ({
      ...prev,
      site: {
        ...prev.site,
        [field]: value,
      },
    }));
  }

  function updateContactField(field, value) {
    setDraft((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  }

  function updateBanner(index, field, value) {
    setDraft((prev) => {
      const next = [...(prev.banners || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, banners: next };
    });
  }

  function addBanner() {
    setDraft((prev) => ({
      ...prev,
      banners: [
        ...(prev.banners || []),
        {
          id: createId('banner'),
          title: 'Novo banner',
          text: 'Texto do banner',
          imageUrl: '',
          link: '/ofertas',
          enabled: true,
        },
      ],
    }));
  }

  function removeBanner(index) {
    setDraft((prev) => {
      const next = [...(prev.banners || [])];
      next.splice(index, 1);
      return { ...prev, banners: next };
    });
  }

  function updateHighlight(index, field, value) {
    setDraft((prev) => {
      const next = [...(prev.highlights || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, highlights: next };
    });
  }

  function addHighlight() {
    setDraft((prev) => ({
      ...prev,
      highlights: [
        ...(prev.highlights || []),
        {
          id: createId('highlight'),
          title: 'Novo destaque',
          text: 'Texto do destaque',
          link: '/demo/kitchen',
        },
      ],
    }));
  }

  function removeHighlight(index) {
    setDraft((prev) => {
      const next = [...(prev.highlights || [])];
      next.splice(index, 1);
      return { ...prev, highlights: next };
    });
  }

  function toggleSectionEnabled(sectionKey) {
    setDraft((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        sectionsEnabled: (() => {
          const current = prev.home?.sectionsEnabled || {};
          return {
            ...current,
            [sectionKey]: !current[sectionKey],
          };
        })(),
      },
    }));
  }

  function moveSection(sectionKey, direction) {
    setDraft((prev) => {
      const order = sanitizeSectionsOrder(prev.home.sectionsOrder);
      const index = order.indexOf(sectionKey);
      if (index === -1) return prev;
      const next = [...order];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return {
        ...prev,
        home: {
          ...prev.home,
          sectionsOrder: next,
        },
      };
    });
  }

  function toggleFeaturedOffer(offerId) {
    setDraft((prev) => {
      const current = prev.featuredOffers || [];
      const exists = current.includes(offerId);
      const next = exists ? current.filter((id) => id !== offerId) : [...current, offerId];
      return { ...prev, featuredOffers: next };
    });
  }

  function moveFeatured(offerId, direction) {
    setDraft((prev) => {
      const current = prev.featuredOffers || [];
      const index = current.indexOf(offerId);
      if (index === -1) return prev;
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= current.length) return prev;
      const next = [...current];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return { ...prev, featuredOffers: next };
    });
  }

  async function handleSave() {
    setSaving(true);
    setFeedback({ type: '', text: '' });
    try {
      await updatePublicCms(draft);
      setFeedback({ type: 'success', text: 'Conteudo publico atualizado com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error?.message || 'Nao foi possivel salvar o conteudo.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="CMS publico"
        title="Conteudo do site sem codigo"
        text="Atualize textos, banners, destaques e ofertas da home mantendo o visual profissional."
      />

      {cmsStatus === 'error' ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-100">
          {cmsError || 'Nao foi possivel carregar o CMS publico.'}
        </div>
      ) : null}

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 text-sm uppercase tracking-[0.22em] text-emerald-300">Identidade do site</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            Nome do site
            <input
              className={fieldInputClasses()}
              value={form.site.name}
              onChange={(event) => updateSiteField('name', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            Tagline
            <input
              className={fieldInputClasses()}
              value={form.site.tagline}
              onChange={(event) => updateSiteField('tagline', event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 text-sm uppercase tracking-[0.22em] text-emerald-300">Hero</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            Badge
            <input
              className={fieldInputClasses()}
              value={form.home.hero.badge}
              onChange={(event) => updateHeroField('badge', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            Titulo principal
            <input
              className={fieldInputClasses()}
              value={form.home.hero.titlePrefix}
              onChange={(event) => updateHeroField('titlePrefix', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            Destaque do titulo
            <input
              className={fieldInputClasses()}
              value={form.home.hero.titleHighlight}
              onChange={(event) => updateHeroField('titleHighlight', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            Descricao
            <input
              className={fieldInputClasses()}
              value={form.home.hero.description}
              onChange={(event) => updateHeroField('description', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            CTA principal
            <input
              className={fieldInputClasses()}
              value={form.home.hero.ctaPrimary}
              onChange={(event) => updateHeroField('ctaPrimary', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            CTA secundario
            <input
              className={fieldInputClasses()}
              value={form.home.hero.ctaSecondary}
              onChange={(event) => updateHeroField('ctaSecondary', event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm uppercase tracking-[0.22em] text-emerald-300">
          Banners
          <button
            onClick={addBanner}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.08]"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>
        <div className="space-y-4">
          {(form.banners || []).map((banner, index) => (
            <div key={banner.id || index} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm text-white/70">
                  Titulo
                  <input
                    className={fieldInputClasses()}
                    value={banner.title}
                    onChange={(event) => updateBanner(index, 'title', event.target.value)}
                  />
                </label>
                <label className="text-sm text-white/70">
                  Link
                  <input
                    className={fieldInputClasses()}
                    value={banner.link || ''}
                    onChange={(event) => updateBanner(index, 'link', event.target.value)}
                  />
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  Texto
                  <input
                    className={fieldInputClasses()}
                    value={banner.text}
                    onChange={(event) => updateBanner(index, 'text', event.target.value)}
                  />
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  URL da imagem
                  <input
                    className={fieldInputClasses()}
                    value={banner.imageUrl || ''}
                    onChange={(event) => updateBanner(index, 'imageUrl', event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={banner.enabled !== false}
                    onChange={(event) => updateBanner(index, 'enabled', event.target.checked)}
                  />
                  Banner ativo
                </label>
                <button
                  onClick={() => removeBanner(index)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Remover
                </button>
              </div>
            </div>
          ))}
          {!form.banners?.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
              Nenhum banner cadastrado.
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm uppercase tracking-[0.22em] text-emerald-300">
          Destaques
          <button
            onClick={addHighlight}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.08]"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </div>
        <div className="space-y-4">
          {(form.highlights || []).map((highlight, index) => (
            <div key={highlight.id || index} className="rounded-2xl border border-white/10 bg-neutral-900 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm text-white/70">
                  Titulo
                  <input
                    className={fieldInputClasses()}
                    value={highlight.title}
                    onChange={(event) => updateHighlight(index, 'title', event.target.value)}
                  />
                </label>
                <label className="text-sm text-white/70">
                  Link
                  <input
                    className={fieldInputClasses()}
                    value={highlight.link || ''}
                    onChange={(event) => updateHighlight(index, 'link', event.target.value)}
                  />
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  Texto
                  <input
                    className={fieldInputClasses()}
                    value={highlight.text}
                    onChange={(event) => updateHighlight(index, 'text', event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => removeHighlight(index)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Remover
                </button>
              </div>
            </div>
          ))}
          {!form.highlights?.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
              Nenhum destaque cadastrado.
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 text-sm uppercase tracking-[0.22em] text-emerald-300">Contato</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            Email
            <input
              className={fieldInputClasses()}
              value={form.contact.email}
              onChange={(event) => updateContactField('email', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            Telefone
            <input
              className={fieldInputClasses()}
              value={form.contact.phone}
              onChange={(event) => updateContactField('phone', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            WhatsApp
            <input
              className={fieldInputClasses()}
              value={form.contact.whatsapp}
              onChange={(event) => updateContactField('whatsapp', event.target.value)}
            />
          </label>
          <label className="text-sm text-white/70">
            Endereco
            <input
              className={fieldInputClasses()}
              value={form.contact.address}
              onChange={(event) => updateContactField('address', event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 text-sm uppercase tracking-[0.22em] text-emerald-300">Ordem e visibilidade</div>
          <div className="space-y-3">
            {sectionsOrder.map((sectionKey, index) => (
              <div
                key={sectionKey}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4"
              >
                <div className="text-sm font-semibold text-white/80">{SECTION_LABELS[sectionKey]}</div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={form.home.sectionsEnabled?.[sectionKey] !== false}
                      onChange={() => toggleSectionEnabled(sectionKey)}
                    />
                    Ativa
                  </label>
                  <button
                    onClick={() => moveSection(sectionKey, 'up')}
                    disabled={index === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1 text-xs text-white/70 disabled:opacity-40"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveSection(sectionKey, 'down')}
                    disabled={index === sectionsOrder.length - 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1 text-xs text-white/70 disabled:opacity-40"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 text-sm uppercase tracking-[0.22em] text-emerald-300">Ofertas em destaque</div>
          {!activeOffers.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
              Nenhuma oferta ativa encontrada.
            </div>
          ) : (
            <div className="space-y-3">
              {activeOffers.map((offer) => {
                const selected = (form.featuredOffers || []).includes(offer.id);
                return (
                  <label
                    key={offer.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white/80"
                  >
                    <span>
                      <span className="text-emerald-200">{offer.title}</span>
                      <span className="block text-xs text-white/50">{offer.restaurantName}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleFeaturedOffer(offer.id)}
                    />
                  </label>
                );
              })}
            </div>
          )}

          {form.featuredOffers?.length ? (
            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase tracking-[0.22em] text-emerald-300">Ordem dos destaques</div>
              {form.featuredOffers.map((offerId, index) => {
                const offer = activeOffers.find((item) => item.id === offerId);
                if (!offer) return null;
                return (
                  <div
                    key={offerId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-2 text-sm text-white/70"
                  >
                    <span>{offer.title}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveFeatured(offerId, 'up')}
                        disabled={index === 0}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1 text-xs text-white/70 disabled:opacity-40"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveFeatured(offerId, 'down')}
                        disabled={index === form.featuredOffers.length - 1}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1 text-xs text-white/70 disabled:opacity-40"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {feedback.text ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border border-amber-500/20 bg-amber-500/10 text-amber-100'
              : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || cmsStatus === 'loading'}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-neutral-950 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Salvando...' : 'Salvar conteudo'}
        </button>
      </div>
    </div>
  );
}
