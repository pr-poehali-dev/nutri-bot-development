import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

type Gender = 'male' | 'female';
type Goal = 'lose' | 'keep' | 'gain';
type Activity = 1.2 | 1.375 | 1.55 | 1.725;

const ACTIVITIES: { value: Activity; label: string; hint: string }[] = [
  { value: 1.2, label: 'Минимальная', hint: 'Сидячий образ жизни' },
  { value: 1.375, label: 'Лёгкая', hint: '1–3 тренировки в неделю' },
  { value: 1.55, label: 'Средняя', hint: '3–5 тренировок в неделю' },
  { value: 1.725, label: 'Высокая', hint: '6–7 тренировок в неделю' },
];

const GOALS: { value: Goal; label: string; icon: string; factor: number }[] = [
  { value: 'lose', label: 'Снизить вес', icon: 'TrendingDown', factor: 0.8 },
  { value: 'keep', label: 'Поддержать', icon: 'Minus', factor: 1 },
  { value: 'gain', label: 'Набрать массу', icon: 'TrendingUp', factor: 1.15 },
];

const Profile = () => {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(75);
  const [activity, setActivity] = useState<Activity>(1.375);
  const [goal, setGoal] = useState<Goal>('keep');

  // Mifflin-St Jeor
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const goalFactor = GOALS.find((g) => g.value === goal)!.factor;
  const calories = Math.round((bmr * activity * goalFactor) / 10) * 10;
  const protein = Math.round((calories * 0.3) / 4);
  const fat = Math.round((calories * 0.3) / 9);
  const carbs = Math.round((calories * 0.4) / 4);

  const Field = ({
    label,
    value,
    setValue,
    unit,
    min,
    max,
  }: {
    label: string;
    value: number;
    setValue: (n: number) => void;
    unit: string;
    min: number;
    max: number;
  }) => (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-extrabold tracking-tight">
          {value}
          <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon name="Leaf" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">NutriAI</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </Link>
        </div>
      </header>

      <section className="container py-12 md:py-16">
        <div className="mb-10 max-w-xl animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Icon name="UserCog" size={14} className="text-primary" />
            Профиль
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Рассчитай свою норму КБЖУ
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Укажи параметры — расчёт обновляется мгновенно по формуле Миффлина-Сан Жеора.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* FORM */}
          <div className="space-y-6">
            <div>
              <div className="mb-3 text-sm font-semibold text-muted-foreground">Пол</div>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['male', 'Мужской', 'User'],
                    ['female', 'Женский', 'User'],
                  ] as [Gender, string, string][]
                ).map(([g, label, icon]) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-semibold transition-all ${
                      gender === g
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <Icon name={icon} size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Возраст" value={age} setValue={setAge} unit="лет" min={14} max={90} />
              <Field label="Рост" value={height} setValue={setHeight} unit="см" min={130} max={220} />
              <Field label="Вес" value={weight} setValue={setWeight} unit="кг" min={35} max={180} />
            </div>

            <div>
              <div className="mb-3 text-sm font-semibold text-muted-foreground">Активность</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {ACTIVITIES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setActivity(a.value)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      activity === a.value
                        ? 'border-primary bg-secondary'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-sm text-muted-foreground">{a.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-semibold text-muted-foreground">Цель</div>
              <div className="grid grid-cols-3 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-sm font-semibold transition-all ${
                      goal === g.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <Icon name={g.icon} size={20} />
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RESULT */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm animate-scale-in">
              <div className="text-sm font-semibold text-muted-foreground">Твоя дневная норма</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-primary">{calories}</span>
                <span className="text-lg font-medium text-muted-foreground">ккал</span>
              </div>

              <div className="mt-7 space-y-4">
                {[
                  ['Белки', protein, 'г', 'hsl(84 55% 45%)', 30],
                  ['Жиры', fat, 'г', 'hsl(38 85% 55%)', 30],
                  ['Углеводы', carbs, 'г', 'hsl(200 70% 50%)', 40],
                ].map(([label, val, unit, color, pct]) => (
                  <div key={label as string}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="font-bold">
                        {val} {unit} · {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color as string }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                <div className="flex items-start gap-2">
                  <Icon name="Sparkles" size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    AI подберёт меню под эту норму. Базовый обмен:{' '}
                    <b>{Math.round(bmr)} ккал</b>.
                  </span>
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:opacity-90">
                <Icon name="Check" size={18} />
                Сохранить норму
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
