import React, { useMemo, useState } from 'react';
import {
  Activity, Bell, Check, CheckCircle2, ChevronDown, Clock3, Grid2X2,
  HelpCircle, LayoutDashboard, List, LockKeyhole, Map, MapPin, Plus,
  Search, ShieldCheck, Smartphone, Hand, Zap, AlertTriangle, X, PackageSearch,
  Camera, Trash2, RefreshCw, UploadCloud, Calendar
} from 'lucide-react';

const initialItems = [
  {
    id: 'LNF-204',
    title: 'Black Casio FX-991EX Scientific Calculator',
    category: 'Electronics',
    zone: 'Main Canteen / Food Court',
    location: 'Main Canteen Quad 2',
    age: '3 hrs ago',
    description: 'Lost during afternoon calculus lecture. Has clear protective slide cover with slight scuff on corner.',
    owner: 'Kamesh S.',
    status: 'High AI Match (94%)',
    tone: 'blue',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJMhKzMBnY70PvwVXOnp0IRt6siQjnzjCUJO2Ew5bMx7yVAdcKm5QsMJo0gMZhizP9xTFUZIT-LDp1xlp4ukk01QB2inRLxgmY7NY9nAcLdFxwrsEWxoDwXG9SY4KatrvdGg3LZ4UCmXU0Gvj-5YfVGMeDZ-62GXWJ6tEQPLwOjUfZfpJsYnQ79mS490eDr1XibrYXw2_Qt8K9_URessUwF4IWmcJMLbLJud66YIYW4QRmUxC0DwoA',
    meta: 'Auto-ping active',
    found: true,
  },
  {
    id: 'LNF-211',
    title: 'Blue Hydro Flask 32oz (Octocat Sticker)',
    category: 'Accessories',
    zone: 'Central Library',
    location: 'Central Library 2nd Fl',
    age: 'Yesterday',
    description: 'Cobalt blue with a wide flex cap. Distinct GitHub Octocat and React sticker on front.',
    owner: 'Ananya R. (ECE)',
    status: 'Open Search',
    tone: 'slate',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMLDFmDJ_pEgknJSLl_nX1TW7ctugA08YLnyth0KyNq-QnqjyW5RZY2qkz40PHUaVc82v5z2HONxqaxkticlCKEr7h0UBhJQ7jkPAr9IYv1f-tYURwGVmk-l-7cl_FrleiW6cXu5yGE2JxI95b_X4NvtCFUSeaTa0j_HKzzydg21xlm2bWCZkUPBQMZdHF3yFFN-BlsEh2LV1wvyrMd9mMmiY7uFOyDGcUR0a3QqcqosEOuAXG_-z',
    meta: 'Reward: Free Cafe Voucher',
    found: false,
  },
  {
    id: 'LNF-218',
    title: 'Brown Leather RFID Wallet with Student ID',
    category: 'Wallets & Cards',
    zone: 'Sports Complex',
    location: 'Sports Complex Gym',
    age: '2 days ago',
    description: 'Contains campus smartcard, driving license, and hostel mess pass card. Highly urgent.',
    owner: 'Vikram M.',
    status: 'Sensitive / IDs',
    tone: 'rose',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR8wiotPeLc5bm7jLTFhUx0EvywmccNYJADk9Dtt7H82Z_UvLJttkDfnvSisBVHMvKeIIHyXxOlbn1OeRvXFkrc3qTKe-jkPS7eOC9AcRdYoHlNSZ7tfNBGHEqIRze5QwggG51DB-gZKjL6H6fpO2_Rw8fn87lqhl2FNpOp-sgygwH-kAJnZpIyNVCOUM6yJ9-etUVAW_xOG8pOqm9SeUDwmZZn9VyFOJ_T3OkR9xaXnTO7tHFJ40q',
    meta: 'Priority Handover',
    found: false,
  },
  {
    id: 'LNF-225',
    title: 'AirPods Pro (2nd Gen) in Matte Navy Case',
    category: 'Electronics',
    zone: 'Academic Block B',
    location: 'Academic Block B - 302',
    age: 'Oct 22',
    description: 'Left behind in seminar row 4. Engraved with a small lightning bolt on bottom lid.',
    owner: 'Rahul K.',
    status: 'Verified Serial',
    tone: 'purple',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxlZUuXLyQ6NL4vgeTmiZ6HOzM5z3qKOHxpyhhRdZRd52ayl2A9cl9a0cIwmvzycFlJ-tlXShMr_rDf58BEm7woD-eLQG9OiikUzdkEczXDwWo1-yCysxyK2_dqT3VSjTOWlNWQ1H6TjZIym4uZjW6fECIPrHB93UqfyBRiVDLVvhG5hBAx-pnDThuKQ_-ESG8BqpVOfuTv_jn7xaqwdnYGsWIhasKJGYJBmdJwTJbezAhFQYwDomy',
    meta: 'FindMy Tracked',
    found: true,
  },
];

const cx = (...classes) => classes.filter(Boolean).join(' ');

function Metric({ icon: Icon, color, value, badge, label }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <div className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', color)}>
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</span>
          <span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
            {badge}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function ItemCard({ item, onFound, onMatch, listView }) {
  const tone = {
    blue: 'bg-blue-600',
    slate: 'bg-slate-700',
    rose: 'bg-rose-600',
    purple: 'bg-purple-600',
  }[item.tone] || 'bg-blue-600';

  return (
    <article
      className={cx(
        'flex overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300',
        listView ? 'flex-col sm:flex-row' : 'flex-col justify-between'
      )}
    >
      <div className={cx('relative overflow-hidden bg-slate-100', listView ? 'h-48 sm:w-56 shrink-0' : 'h-48 w-full')}>
        <img alt={item.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" src={item.image} />
        <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
          <span className="rounded bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            #{item.id}
          </span>
          <span className={cx('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm', tone)}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {item.status}
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
            <span className="flex min-w-0 items-center gap-1 truncate font-semibold text-slate-600">
              <MapPin size={14} className="shrink-0 text-slate-400" />
              <span className="truncate">{item.location}</span>
            </span>
            <span className="shrink-0 text-slate-400">{item.age}</span>
          </div>
          <h3 className="mb-1 line-clamp-1 text-sm font-bold text-slate-900">{item.title}</h3>
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            {item.category}
          </span>
        </div>
        <div className="p-4 pt-0">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onFound(item)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 shadow-sm"
            >
              <Check size={14} />
              {item.found ? 'Found This!' : 'I Found This!'}
            </button>
            {item.found ? (
              <button
                onClick={() => onMatch(item)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
              >
                <Zap size={14} />
                AI Match
              </button>
            ) : (
              <button
                onClick={() => onFound(item)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <PackageSearch size={14} />
                Details
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px]">
            <span className="truncate font-medium text-slate-600">
              Owner: <strong className="text-slate-800">{item.owner}</strong>
            </span>
            <span className="shrink-0 font-semibold text-blue-600">{item.meta}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function LostAndFoundBoard({ openReportModal = false, onReportModalClosed, onOpenMatchSuggestions }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [zone, setZone] = useState('All Campus Zones');
  const [period, setPeriod] = useState('Last 7 Days');
  const [sort, setSort] = useState('Recently Reported');
  const [tab, setTab] = useState('lost');
  const [listView, setListView] = useState(false);
  const [modal, setModal] = useState(openReportModal ? { type: 'report' } : null);
  const [notice, setNotice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Electronics',
    zone: 'Central Library',
    exactLocation: '',
    brandModel: '',
    description: '',
    type: 'Lost',
    date: new Date().toISOString().split('T')[0],
  });

  React.useEffect(() => {
    if (openReportModal) {
      setModal({ type: 'report' });
    }
  }, [openReportModal]);

  const closeModal = () => {
    setModal(null);
    setImageFile(null);
    setImagePreview(null);
    if (onReportModalClosed) onReportModalClosed();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const setSampleImage = (url, name) => {
    setImagePreview(url);
    setImageFile({ name: name || 'sample_item.jpg', size: '1.2 MB' });
  };

  const filtered = useMemo(() => {
    let result = items.filter((i) => {
      const matchesSearch = `${i.title} ${i.id} ${i.location} ${i.description}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCat = category === 'All Categories' || i.category === category;
      const matchesZone = zone === 'All Campus Zones' || i.zone === zone;
      const matchesTab = tab === 'lost' ? !i.found : i.found;
      return matchesSearch && matchesCat && matchesZone && matchesTab;
    });

    if (sort === 'Highest Match %') {
      result = [...result].sort(
        (a, b) =>
          parseInt(b.status.match(/\d+/)?.[0] || 0, 10) -
          parseInt(a.status.match(/\d+/)?.[0] || 0, 10)
      );
    }
    if (sort === 'Priority Sensitive') {
      result = [...result].sort((a, b) => Number(b.tone === 'rose') - Number(a.tone === 'rose'));
    }
    return result;
  }, [items, search, category, zone, sort, tab]);

  function actionFound(item) {
    setModal({ type: 'found', item });
  }

  function actionMatch(item) {
    if (onOpenMatchSuggestions) {
      onOpenMatchSuggestions(item);
    } else {
      setNotice(`AI match review opened for ${item.id}. Matching confidence score: 94% with Quad Security intake scan.`);
      setTimeout(() => setNotice(''), 5000);
    }
  }

  function submitReport(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const defaultImages = {
      Electronics:
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
      Accessories:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMLDFmDJ_pEgknJSLl_nX1TW7ctugA08YLnyth0KyNq-QnqjyW5RZY2qkz40PHUaVc82v5z2HONxqaxkticlCKEr7h0UBhJQ7jkPAr9IYv1f-tYURwGVmk-l-7cl_FrleiW6cXu5yGE2JxI95b_X4NvtCFUSeaTa0j_HKzzydg21xlm2bWCZkUPBQMZdHF3yFFN-BlsEh2LV1wvyrMd9mMmiY7uFOyDGcUR0a3QqcqosEOuAXG_-z',
      'Wallets & Cards':
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBR8wiotPeLc5bm7jLTFhUx0EvywmccNYJADk9Dtt7H82Z_UvLJttkDfnvSisBVHMvKeIIHyXxOlbn1OeRvXFkrc3qTKe-jkPS7eOC9AcRdYoHlNSZ7tfNBGHEqIRze5QwggG51DB-gZKjL6H6fpO2_Rw8fn87lqhl2FNpOp-sgygwH-kAJnZpIyNVCOUM6yJ9-etUVAW_xOG8pOqm9SeUDwmZZn9VyFOJ_T3OkR9xaXnTO7tHFJ40q',
      'Study Materials':
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80',
    };

    const finalImage = imagePreview || defaultImages[form.category] || defaultImages.Electronics;

    const formattedAge = form.date
      ? new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Just now';

    const newItem = {
      ...form,
      id: `LNF-${230 + items.length}`,
      location: form.exactLocation ? `${form.zone} • ${form.exactLocation}` : form.zone,
      age: formattedAge,
      owner: 'Kamesh S.',
      status: form.type === 'Found' ? 'Intake Logged' : 'Open Search',
      tone: form.type === 'Found' ? 'blue' : 'slate',
      image: finalImage,
      meta: imagePreview ? 'Visual Signature Attached' : 'New report',
      found: form.type === 'Found',
      description: form.description || 'No additional description provided.',
    };

    setItems([newItem, ...items]);
    closeModal();
    setForm({ title: '', category: 'Electronics', zone: 'Central Library', exactLocation: '', brandModel: '', description: '', type: 'Lost' });
    setImageFile(null);
    setImagePreview(null);
    if (form.type === 'Found' && onOpenMatchSuggestions) {
      onOpenMatchSuggestions(newItem);
    } else {
      setNotice(`Success! Report for "${newItem.title}" has been broadcast to the campus custody board.`);
      setTimeout(() => setNotice(''), 4500);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Title */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              • Campus Community Registry • Privacy-Safe Custody
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck size={14} />
              Zero-Trust Handover Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Public Campus Lost & Found Board
          </h2>
          <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-sm">
            Community asset registry for Info Institute of Technology. Contact details remain redacted for privacy; item claims and physical releases are verified through certified campus security desks before collection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenMatchSuggestions && (
            <button
              type="button"
              onClick={onOpenMatchSuggestions}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-100 sm:text-sm"
            >
              <Zap size={15} className="text-blue-600" />
              AI Match Suggestions (4)
            </button>
          )}
          <button
            onClick={() => setModal({ type: 'report' })}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 sm:text-sm"
          >
            <Plus size={16} />
            Report Lost or Found Item
          </button>
        </div>
      </div>

      {/* Metrics Counters */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Search} color="bg-blue-50 text-blue-600" value="42" badge="+6 today" label="Active Campus Inquiries" />
        <Metric icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" value="18" badge="84% by peers" label="Recovered This Week" />
        <Metric icon={ShieldCheck} color="bg-indigo-50 text-indigo-600" value="98.2%" badge="Zero Fraud" label="Custody Verification Accuracy" />
        <Metric icon={Smartphone} color="bg-amber-50 text-amber-600" value="3 Hubs" badge="● Ready" label="Central Intake Desks Online" />
      </section>

      {/* Search & Filter Toolbar */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col items-center gap-3 lg:flex-row">
          <div className="relative w-full flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by keyword, item tag, location..."
            />
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:flex-nowrap lg:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-3 pr-7 text-xs font-semibold text-slate-700 sm:flex-none"
            >
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Study Materials</option>
              <option>Wallets & Cards</option>
              <option>Accessories</option>
            </select>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-3 pr-7 text-xs font-semibold text-slate-700 sm:flex-none"
            >
              <option>All Campus Zones</option>
              <option>Main Canteen / Food Court</option>
              <option>Central Library</option>
              <option>Sports Complex</option>
              <option>Academic Block B</option>
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-3 pr-7 text-xs font-semibold text-slate-700 sm:flex-none"
            >
              <option>Last 7 Days</option>
              <option>Today</option>
              <option>Last 30 Days</option>
              <option>Current Semester</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-3 pr-7 text-xs font-semibold text-slate-700 sm:flex-none"
            >
              <option>Recently Reported</option>
              <option>Highest Match %</option>
              <option>Priority Sensitive</option>
            </select>
            <div className="hidden shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1 sm:flex">
              <button
                onClick={() => setListView(false)}
                title="Grid View"
                className={cx('rounded-lg p-1.5', !listView ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700')}
              >
                <Grid2X2 size={16} />
              </button>
              <button
                onClick={() => setListView(true)}
                title="List View"
                className={cx('rounded-lg p-1.5', listView ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-700')}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 sm:flex-row sm:items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setTab('lost')}
            className={cx(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm transition-colors',
              tab === 'lost' ? 'border-blue-600 font-bold text-blue-600' : 'border-transparent font-medium text-slate-500 hover:text-slate-800'
            )}
          >
            <Search size={16} />
            Lost Items (Help Find These)
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
              {items.filter((i) => !i.found).length}
            </span>
          </button>
          <button
            onClick={() => setTab('found')}
            className={cx(
              'flex items-center gap-2 border-b-2 px-1 py-3 text-sm transition-colors',
              tab === 'found' ? 'border-blue-600 font-bold text-blue-600' : 'border-transparent font-medium text-slate-500 hover:text-slate-800'
            )}
          >
            <PackageSearch size={16} />
            Found Items (At Security / Custodian)
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {items.filter((i) => i.found).length}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 pb-2 text-xs text-slate-500 sm:pb-0">
          <LockKeyhole size={14} className="text-slate-400" />
          All finder logs stored on encrypted campus custody nodes
        </div>
      </div>

      {/* Status Alert Banner */}
      {notice && (
        <div role="status" className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm animate-fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-blue-600 hover:text-blue-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Item Cards Grid / List */}
      <section className={cx('grid gap-6', listView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
        {filtered.length ? (
          filtered.map((item) => (
            <ItemCard key={item.id} item={item} listView={listView} onFound={actionFound} onMatch={actionMatch} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <PackageSearch className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="font-semibold text-slate-700">No matching items found</p>
            <p className="mt-1 text-sm text-slate-500">Try changing the search keyword, campus zone, or switch between Lost & Found tabs.</p>
          </div>
        )}
      </section>

      {/* Modals */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {modal.type === 'report' ? 'Report a Lost or Found Item' : 'Confirm Item Discovery'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {modal.type === 'report'
                    ? 'Share item details with the Info Institute of Technology campus custody registry and AI matching system.'
                    : 'Let the campus custody desk know you may have located this item.'}
                </p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {modal.type === 'report' ? (
              <form onSubmit={submitReport} className="space-y-5">
                {/* 1. Report Type Pill Toggle */}
                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    1. REPORT TYPE
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'Lost' })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        form.type === 'Lost'
                          ? 'border-2 border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Search size={16} />
                      Lost Item (I lost something)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, type: 'Found' })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        form.type === 'Found'
                          ? 'border-2 border-emerald-600 bg-emerald-50/60 text-emerald-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <PackageSearch size={16} />
                      Found Item (I discovered property)
                    </button>
                  </div>
                </div>

                {/* 2. Item Identification */}
                <div className="space-y-3">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    2. ITEM IDENTIFICATION *
                  </span>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Item Title *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Black Casio FX-991EX Scientific Calculator"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                      >
                        <option>Electronics</option>
                        <option>Study Materials</option>
                        <option>Wallets & Cards</option>
                        <option>Accessories</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Brand / Model / Color</label>
                      <input
                        value={form.brandModel || ''}
                        onChange={(e) => setForm({ ...form, brandModel: e.target.value })}
                        placeholder="e.g. Casio, Matte Black, Navy"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Incident Location & Timing */}
                <div className="space-y-3">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    3. INCIDENT LOCATION & TIMING *
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                        <Calendar size={13} className="text-blue-600" />
                        {form.type === 'Lost' ? 'Date Lost *' : 'Date Found *'}
                      </label>
                      <input
                        type="date"
                        required
                        value={form.date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Campus Zone</label>
                      <select
                        value={form.zone}
                        onChange={(e) => setForm({ ...form, zone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                      >
                        <option>Central Library</option>
                        <option>Main Canteen / Food Court</option>
                        <option>Sports Complex</option>
                        <option>Academic Block B</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Exact Room / Landmark</label>
                      <input
                        value={form.exactLocation || ''}
                        onChange={(e) => setForm({ ...form, exactLocation: e.target.value })}
                        placeholder="e.g. 2nd Floor Reading Room Desk 14"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Description & Visual Details */}
                <div className="space-y-2">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    4. IDENTIFYING MARKS & DETAILS
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows="3"
                    placeholder="Describe specific scratches, stickers, engravings, serial number, or unique case markings"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400">Quick Tags:</span>
                    {['+ Scratched Corner', '+ In Protective Case', '+ GitHub Octocat Sticker', '+ Student ID Inside'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const clean = tag.replace(/^\+\s*/, '');
                          setForm((prev) => ({
                            ...prev,
                            description: prev.description ? `${prev.description}. ${clean}` : clean,
                          }));
                        }}
                        className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Attach Photo or Visual Reference */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      5. ATTACH PHOTO OR VISUAL REFERENCE
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600">Enables AI Visual Matching</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30"
                    >
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform shadow-sm">
                        <Camera size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload photo or <span className="text-blue-600 underline">drag & drop item photo</span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        PNG, JPG, or WEBP up to 5MB. Visual signatures help campus security match intake records faster.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-3 shadow-sm animate-fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-indigo-300 bg-white shadow-inner">
                          <img src={imagePreview} alt="Attached Preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {imageFile?.name || 'item_photo.jpg'}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>
                              {imageFile?.size
                                ? typeof imageFile.size === 'number'
                                  ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB`
                                  : imageFile.size
                                : 'Visual file attached'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Ready for AI match
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          title="Replace Photo"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-xl border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50 shadow-sm transition-colors"
                        >
                          <RefreshCw size={15} />
                        </button>
                        <button
                          type="button"
                          title="Remove Photo"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 shadow-sm transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Privacy Notice */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2.5">
                  <LockKeyhole size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Zero-Trust Handover Protection:</strong> Your personal contact number remains concealed. Physical handovers and verification are coordinated with certified campus custody staff.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm">
                    {form.type === 'Found' ? 'Confirm Discovery & Match with AI' : 'Broadcast Report to Board'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-900">{modal.item?.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Reference: {modal.item?.id} · Zone: {modal.item?.location}
                  </p>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-slate-600">
                  Your interest will be recorded in this session. For security, verified ownership checks and physical custody handover will be processed at the nearest campus custodial intake desk.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const item = modal.item;
                      closeModal();
                      if (onOpenMatchSuggestions) {
                        onOpenMatchSuggestions(item);
                      } else {
                        setNotice(
                          `Discovery interest for ${item?.id} recorded! Please deposit the item at Quad Security Desk #02.`
                        );
                        setTimeout(() => setNotice(''), 5500);
                      }
                    }}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm"
                  >
                    Confirm Discovery
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
