import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/hooks/useAuth';

const ANALYZE_URL = 'https://functions.poehali.dev/819d1a1b-ef4f-4a65-8521-92592539d5d6';

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

type Ingredient = { name: string; weight: string; calories: number };

type MacroResult = {
  dish: string;
  weight: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients?: Ingredient[];
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

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Dashboard = () => {
  const { user, profile, loading, token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [result, setResult] = useState<MacroResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  const analyzePhoto = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setAnalyzeError(null);
    setShowIngredients(false);
    setAnalyzing(true);

    try {
      const b64 = await fileToBase64(file);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['X-Session-Token'] = token;

      const res = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image: b64 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 503) {
          setAnalyzeError('AI-ключ ещё не добавлен. Добавь OPENAI_API_KEY в настройках проекта.');
        } else {
          setAnalyzeError(err.error || 'Ошибка анализа. Попробуй другое фото.');
        }
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setAnalyzeError('Не удалось связаться с сервером. Проверь интернет и попробуй снова.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAnalyzeError('Пожалуйста, загрузи изображение (JPEG, PNG, WEBP).');
      return;
    }
    analyzePhoto(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const remaining = (profile && result)
    ? {
        cal: Math.max(0, profile.calories_goal - result.calories),
        prot: Math.max(0, profile.protein_goal - result.protein),
        fat: Math.max(0, profile.fat_goal - result.fat),
        carbs: Math.max(0, profile.carbs_goal - result.carbs),
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
              {user && (
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                    Привет, {user.first_name}! 👋
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Сфотографируй еду — AI посчитает калории, белки, жиры и углеводы.
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

              {/* AI TIP */}
              {profile && (
                <div className="rounded-3xl bg-primary p-7 text-primary-foreground">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon name="Sparkles" size={18} />
                    <span className="font-bold">Совет нутрициолога</span>
                  </div>
                  <p className="leading-relaxed text-primary-foreground/85">
                    {profile.goal === 'lose'
                      ? 'Для снижения веса распределяй калории: завтрак 25%, обед 35%, ужин 25%, перекусы 15%. Не пропускай белок.'
                      : profile.goal === 'gain'
                      ? 'Для набора массы ешь каждые 3–4 часа. После тренировки — белок + углеводы в течение 30 минут.'
                      : 'Для стабильного веса придерживайся одного режима питания и не пропускай основные приёмы пищи.'}
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
                    <p className="text-xs text-muted-foreground">GPT-4 Vision видит все ингредиенты</p>
                  </div>
                </div>

                {/* DROP ZONE */}
                <div
                  onClick={() => !analyzing && fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : analyzing
                      ? 'border-primary/40 cursor-default'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Фото блюда" className="h-56 w-full object-cover" />
                      {analyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm">
                          <div className="relative">
                            <Icon name="Loader" size={36} className="animate-spin text-primary" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">AI анализирует блюдо…</div>
                            <div className="text-xs text-muted-foreground mt-1">Определяем ингредиенты и КБЖУ</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                        <Icon name="ImagePlus" size={28} />
                      </div>
                      <div>
                        <div className="font-semibold">Загрузи фото еды</div>
                        <div className="text-sm text-muted-foreground">или перетащи сюда · JPEG, PNG, WEBP</div>
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

                {/* ERROR */}
                {analyzeError && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <Icon name="AlertCircle" size={16} className="mt-0.5 shrink-0" />
                    {analyzeError}
                  </div>
                )}
              </div>

              {/* RESULT */}
              {result && !analyzing && (
                <div className="animate-fade-in space-y-4 rounded-3xl border border-border bg-card p-7 shadow-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Результат анализа</div>
                    <div className="mt-1 text-xl font-bold">{result.dish}</div>
                    <div className="text-sm text-muted-foreground">{result.weight}</div>
                  </div>

                  {/* MACROS */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Ккал', value: result.calories, cls: 'bg-primary/10 text-primary' },
                      { label: 'Белки', value: `${result.protein}г`, cls: 'bg-accent text-accent-foreground' },
                      { label: 'Жиры', value: `${result.fat}г`, cls: 'bg-orange-50 text-orange-600' },
                      { label: 'Углеводы', value: `${result.carbs}г`, cls: 'bg-sky-50 text-sky-600' },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className={`rounded-2xl px-2 py-3 ${cls}`}>
                        <div className="text-xl font-extrabold">{value}</div>
                        <div className="text-[11px] font-medium opacity-70">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* INGREDIENTS */}
                  {result.ingredients && result.ingredients.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowIngredients(!showIngredients)}
                        className="flex w-full items-center justify-between rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="List" size={15} />
                          Состав по ингредиентам
                        </span>
                        <Icon name={showIngredients ? 'ChevronUp' : 'ChevronDown'} size={16} />
                      </button>
                      {showIngredients && (
                        <div className="mt-2 space-y-1.5 animate-fade-in">
                          {result.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm">
                              <span className="font-medium">{ing.name}</span>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <span>{ing.weight}</span>
                                <span className="font-semibold text-foreground">{ing.calories} ккал</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI COMMENT */}
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Sparkles" size={15} className="mt-0.5 shrink-0 text-primary" />
                      <span>{result.comment}</span>
                    </div>
                  </div>

                  {/* REMAINING */}
                  {remaining && profile && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">До нормы на сегодня:</div>
                      {[
                        { l: 'Калории', consumed: result.calories, max: profile.calories_goal, u: 'ккал', left: remaining.cal },
                        { l: 'Белки', consumed: result.protein, max: profile.protein_goal, u: 'г', left: remaining.prot },
                        { l: 'Жиры', consumed: result.fat, max: profile.fat_goal, u: 'г', left: remaining.fat },
                        { l: 'Углеводы', consumed: result.carbs, max: profile.carbs_goal, u: 'г', left: remaining.carbs },
                      ].map(({ l, consumed, max, u, left }) => {
                        const pct = Math.min(100, Math.round((consumed / max) * 100));
                        const over = consumed > max;
                        return (
                          <div key={l} className="flex items-center gap-3 text-sm">
                            <span className="w-20 shrink-0 text-muted-foreground">{l}</span>
                            <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-destructive' : 'bg-primary'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`w-20 shrink-0 text-right text-xs font-semibold ${over ? 'text-destructive' : ''}`}>
                              {over ? `+${consumed - max} ${u}` : `ещё ${left} ${u}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90">
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
