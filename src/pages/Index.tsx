import Icon from '@/components/ui/icon';

const FOOD_IMG =
  'https://cdn.poehali.dev/projects/8e8c6e14-0632-45d0-a6fa-e08bd1bc1f06/files/d8f7ad14-b21d-493c-bb6c-078f1d5f701a.jpg';

const Ring = ({
  value,
  goal,
  label,
  color,
  unit,
}: {
  value: number;
  goal: number;
  label: string;
  color: string;
  unit: string;
}) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / goal, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tracking-tight">{value}</span>
          <span className="text-xs text-muted-foreground">/ {goal} {unit}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon name="Leaf" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight">NutriAI</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">Как работает</a>
            <a href="#diary" className="transition-colors hover:text-foreground">Дневник</a>
            <a href="#ai" className="transition-colors hover:text-foreground">AI-советы</a>
          </nav>
          <a
            href="#"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Icon name="Send" size={16} />
            Открыть бота
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="container relative overflow-hidden py-20 md:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Персональный AI-нутрициолог в Telegram
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Считай КБЖУ
              <br />
              по <span className="text-primary">фотографии</span> еды
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Сфотографируй блюдо — бот распознает состав, посчитает калории и
              подскажет, как скорректировать рацион под твою цель.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 hover-scale"
              >
                <Icon name="Send" size={18} />
                Начать бесплатно
              </a>
              <a
                href="#how"
                className="flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold transition-colors hover:bg-muted"
              >
                Как это работает
              </a>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm">
              {[
                ['12 000+', 'пользователей'],
                ['98%', 'точность фото'],
                ['4.9', 'рейтинг'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-extrabold tracking-tight">{n}</div>
                  <div className="text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PHONE MOCK */}
          <div className="relative mx-auto animate-scale-in">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-accent/40 blur-3xl" />
            <div className="w-[320px] rounded-[2.5rem] border-8 border-foreground/90 bg-card p-4 shadow-2xl">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon name="Bot" size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">NutriAI</div>
                  <div className="text-xs text-primary">печатает…</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl">
                  <img src={FOOD_IMG} alt="Блюдо" className="h-40 w-full object-cover" />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                  <div className="mb-1.5 font-semibold">🍽 Боул с курицей и киноа</div>
                  <div className="text-muted-foreground">Распознано блюдо · порция ~420 г</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ['540', 'ккал'],
                    ['38', 'Б'],
                    ['18', 'Ж'],
                    ['52', 'У'],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-xl bg-secondary py-2">
                      <div className="text-base font-bold text-secondary-foreground">{v}</div>
                      <div className="text-[10px] text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl rounded-tl-md bg-accent px-4 py-3 text-sm text-accent-foreground">
                  ✅ Отличный выбор! Добавил в дневник. До цели осталось 760 ккал.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-y border-border bg-card/50 py-20">
        <div className="container">
          <div className="mb-14 max-w-xl">
            <h2 className="text-4xl font-extrabold tracking-tight">Три шага к контролю питания</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Никаких таблиц и взвешиваний — всё считает AI.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: 'UserCog', title: 'Профиль и цель', text: 'Укажи параметры — бот рассчитает индивидуальную норму КБЖУ.' },
              { icon: 'Camera', title: 'Фото еды', text: 'Сфотографируй блюдо — AI определит состав и калорийность.' },
              { icon: 'Sparkles', title: 'AI-советы', text: 'Получай рекомендации нутрициолога и держи рацион под контролем.' },
            ].map((s, i) => (
              <div
                key={s.title}
                className="group rounded-3xl border border-border bg-background p-7 transition-all hover:shadow-lg hover-scale"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name={s.icon} size={24} />
                </div>
                <div className="mb-1 text-sm font-semibold text-muted-foreground">0{i + 1}</div>
                <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
                <p className="text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIARY DASHBOARD */}
      <section id="diary" className="container py-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">Дневник питания на сегодня</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Все приёмы пищи, кольца прогресса и баланс БЖУ — в одном понятном экране.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: 'Coffee', meal: 'Завтрак', dish: 'Овсянка с ягодами', kcal: 320 },
                { icon: 'Salad', meal: 'Обед', dish: 'Боул с курицей и киноа', kcal: 540 },
                { icon: 'Apple', meal: 'Перекус', dish: 'Греческий йогурт', kcal: 140 },
              ].map((m) => (
                <div
                  key={m.meal}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon name={m.icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">{m.meal}</div>
                    <div className="font-semibold">{m.dish}</div>
                  </div>
                  <div className="font-bold">{m.kcal} ккал</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-lg font-bold">Норма КБЖУ</h3>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                В пределах нормы
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
              <Ring value={1000} goal={1900} label="Калории" unit="ккал" color="hsl(var(--primary))" />
              <Ring value={76} goal={120} label="Белки" unit="г" color="hsl(84 55% 45%)" />
              <Ring value={36} goal={60} label="Жиры" unit="г" color="hsl(38 85% 55%)" />
              <Ring value={104} goal={210} label="Углеводы" unit="г" color="hsl(200 70% 50%)" />
            </div>
          </div>
        </div>
      </section>

      {/* AI + REMINDERS */}
      <section id="ai" className="container pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-9 text-primary-foreground">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Icon name="Sparkles" size={24} />
            </div>
            <h3 className="text-2xl font-bold">AI-рекомендации нутрициолога</h3>
            <p className="mt-3 text-primary-foreground/80">
              Бот анализирует твой рацион и подсказывает, чего не хватает.
            </p>
            <div className="mt-6 rounded-2xl bg-primary-foreground/10 p-5 text-sm leading-relaxed">
              «Сегодня мало белка — добавь к ужину творог или рыбу. До нормы осталось 44 г 💪»
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Icon name="BellRing" size={24} />
            </div>
            <h3 className="text-2xl font-bold">Напоминания и контроль целей</h3>
            <p className="mt-3 text-muted-foreground">
              Бот напомнит о приёме пищи и предупредит при отклонении от нормы КБЖУ.
            </p>
            <div className="mt-6 space-y-3">
              {[
                ['Clock', 'Напоминание об обеде', '13:00'],
                ['TrendingUp', 'Превышение по углеводам', 'Уведомление'],
              ].map(([icon, t, tag]) => (
                <div key={t} className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
                  <Icon name={icon} size={18} className="text-primary" />
                  <span className="flex-1 text-sm font-medium">{t}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-6 rounded-3xl border border-border bg-secondary p-12 text-center">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
            Начни вести дневник КБЖУ прямо в Telegram
          </h2>
          <p className="max-w-md text-muted-foreground">
            Бесплатно, без установки приложений — просто открой бота и сфотографируй еду.
          </p>
          <a
            href="#"
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 hover-scale"
          >
            <Icon name="Send" size={18} />
            Открыть бота в Telegram
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Icon name="Leaf" size={16} className="text-primary" />
            <span className="font-semibold text-foreground">NutriAI</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">Политика</a>
            <a href="#" className="transition-colors hover:text-foreground">Поддержка</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
