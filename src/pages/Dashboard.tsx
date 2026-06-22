import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/hooks/useAuth';

const GOALS_MAP: Record<string, string> = {
  lose: 'Снизить вес',
  keep: 'Поддержать вес',
  gain: 'Набрать массу',
};

const ACTIVITY_MAP: Record<number, string> = {
  1.2: 'Минимальная',
  1.375: 'Лёгкая',
  1.55: 'Средняя',
  1.725: 'Высокая',
};

type MacroResult = {
  dish: string;
  weight: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  comment: string;
};

const Ring = ({ value, goal, color }: { value: number; goal: number; color: string }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / goal, 1);
  const offset = circ * (1 - pct);
  return (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MacroResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Демо-анализ фото (имитация AI)
  const analyzePhoto = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        dish: 'Куриная грудка с гречкой и овощами',
        weight: '~380 г',
        calories: 490,
        protein: 42,
        fat: 12,
        carbs: 48,
        comment: 'Отличный сбалансированный обед! Высокое содержание белка поможет сохранить мышечную массу.',
      });
    }, 2200);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    analyzePhoto(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const remaining = profile
    ? {
        cal: Math.max(0, profile.calories_goal - (result?.calories ?? 0)),
        prot: Math.max(0, profile.protein_goal - (result?.protein ?? 0)),
        fat: Math.max(0, profile.fat_goal - (result?.fat ?? 0)),
        carbs: Math.max(0, profile.carbs_goal - (result?.carbs ?? 0)),
      }
    : null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon name="Leaf" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">NutriAI</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                {user.photo_url ? (
                  <img src={user.photo_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                    {user.first_name[0]}
                  </div>
                )}
                <span className="text-sm font-medium">{user.first_name}</span>
              </div>
            )}
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Icon name="Settings" size={15} />
              Изменить профиль
            </Link>
          </div>
        </div>
      </header>

      <div className="container py-10 md:py-14">
        {loading ? (
          <div className="flex items-center justify-center py-28 text-muted-foreground">
            <Icon name="Loader" size={28} className="animate-spin mr-3" />
            Загружаем данные…
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* WELCOME */}
              {user && (
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                    Привет, {user.first_name}! 👋
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Вот твой персональный кабинет нутрициолога. Сфотографируй еду — AI посчитает КБЖУ.
                  </p>
                </div>
              )}

              {/* NORMS CARD */}
              {profile ? (
                <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Твоя норма КБЖУ</h2>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      {GOALS_MAP[profile.goal]}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Ккал', value: profile.calories_goal, color: 'hsl(var(--primary))' },
                      { label: 'Белки', value: profile.protein_goal, color: 'hsl(84 55% 45%)' },
                      { label: 'Жиры', value: profile.fat_goal, color: 'hsl(38 85% 55%)' },
                      { label: 'Углеводы', value: profile.carbs_goal, color: 'hsl(200 70% 50%)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex flex-col items-center gap-2">
                        <div className="relative h-20 w-20">
                          <Ring value={value} goal={value} color={color} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-extrabold">{value}</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-muted px-3 py-2.5 text-center">
                      <div className="font-bold">{profile.age} лет</div>
                      <div className="text-xs text-muted-foreground">Возраст</div>
                    </div>
                    <div className="rounded-xl bg-muted px-3 py-2.5 text-center">
                      <div className="font-bold">{profile.height_cm} см</div>
                      <div className="text-xs text-muted-foreground">Рост</div>
                    </div>
                    <div className="rounded-xl bg-muted px-3 py-2.5 text-center">
                      <div className="font-bold">{profile.weight_kg} кг</div>
                      <div className="text-xs text-muted-foreground">Вес</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm">
                    <Icon name="Activity" size={15} className="text-primary" />
                    <span className="text-secondary-foreground">Активность: <b>{ACTIVITY_MAP[profile.activity_factor] ?? '—'}</b></span>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
                  <Icon name="UserCog" size={36} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="font-semibold">Профиль ещё не заполнен</p>
                  <p className="mt-1 text-sm text-muted-foreground">Укажи параметры, чтобы рассчитать норму КБЖУ</p>
                  <Link
                    to="/profile"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Icon name="ArrowRight" size={16} />
                    Заполнить профиль
                  </Link>
                </div>
              )}

              {/* AI TIPS */}
              {profile && (
                <div className="rounded-3xl bg-primary p-7 text-primary-foreground">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Sparkles" size={18} />
                    <span className="font-bold">Совет нутрициолога</span>
                  </div>
                  <p className="text-primary-foreground/85 leading-relaxed">
                    {profile.goal === 'lose'
                      ? 'Для снижения веса старайся распределять калории равномерно: завтрак — 25%, обед — 35%, ужин — 25%, перекусы — 15%. Не пропускай белковые блюда.'
                      : profile.goal === 'gain'
                      ? 'Для набора массы ешь каждые 3–4 часа. Послетренировочный приём пищи критичен — белок + углеводы в течение 30 минут после нагрузки.'
                      : 'Для поддержания веса важна стабильность. Старайся придерживаться одного режима питания и не пропускать основные приёмы пищи.'}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — PHOTO ANALYZER */}
            <div className="space-y-5">
              <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon name="Camera" size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">Анализ блюда по фото</h2>
                    <p className="text-xs text-muted-foreground">AI определит КБЖУ за секунды</p>
                  </div>
                </div>

                {/* DROP ZONE */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Фото блюда" className="h-52 w-full object-cover" />
                      {analyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                          <Icon name="Loader" size={32} className="animate-spin text-primary" />
                          <span className="text-sm font-semibold">Анализирую блюдо…</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                        <Icon name="ImagePlus" size={26} />
                      </div>
                      <div>
                        <div className="font-semibold">Загрузи фото еды</div>
                        <div className="text-sm text-muted-foreground">или перетащи сюда</div>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onInputChange}
                  />
                </div>

                {previewUrl && !analyzing && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Icon name="RefreshCw" size={15} />
                    Загрузить другое фото
                  </button>
                )}
              </div>

              {/* RESULT */}
              {result && !analyzing && (
                <div className="animate-fade-in rounded-3xl border border-border bg-card p-7 shadow-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Результат</div>
                  <div className="text-lg font-bold">{result.dish}</div>
                  <div className="mb-5 text-sm text-muted-foreground">{result.weight}</div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    {[
                      { label: 'Ккал', value: result.calories, color: 'bg-primary/10 text-primary' },
                      { label: 'Белки', value: `${result.protein}г`, color: 'bg-accent text-accent-foreground' },
                      { label: 'Жиры', value: `${result.fat}г`, color: 'bg-orange-50 text-orange-600' },
                      { label: 'Углеводы', value: `${result.carbs}г`, color: 'bg-blue-50 text-blue-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`rounded-2xl px-2 py-3 ${color}`}>
                        <div className="text-xl font-extrabold">{value}</div>
                        <div className="text-[11px] font-medium opacity-70">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Sparkles" size={15} className="mt-0.5 shrink-0 text-primary" />
                      <span>{result.comment}</span>
                    </div>
                  </div>

                  {remaining && profile && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">До нормы на сегодня:</div>
                      {[
                        { l: 'Калории', v: remaining.cal, max: profile.calories_goal, u: 'ккал' },
                        { l: 'Белки', v: remaining.prot, max: profile.protein_goal, u: 'г' },
                      ].map(({ l, v, max, u }) => (
                        <div key={l} className="flex items-center gap-3 text-sm">
                          <span className="w-16 text-muted-foreground">{l}</span>
                          <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-700"
                              style={{ width: `${Math.round(((max - v) / max) * 100)}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-semibold">ещё {v} {u}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90">
                    <Icon name="Plus" size={16} />
                    Добавить в дневник
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
