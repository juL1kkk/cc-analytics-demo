import { useMemo, useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Period = "today" | "yesterday" | "7d" | "30d" | "custom";
type Channel = "all" | "voice" | "chat" | "email" | "sms" | "push";
type Queue = "all" | "general" | "vip" | "antifraud";
type Tab = "overview" | "operators" | "queues" | "channels" | "topics";

type Theme = { name: string; count: number; avgHandleSec: number; fcrPct: number };
type CallRow = {
  id: string;
  startedAt: string;
  channel: Exclude<Channel, "all">;
  queue: Exclude<Queue, "all">;
  operator: string;
  topic: string;
  durationSec: number;
  status: "Завершён" | "Пропущен" | "Ожидание" | "В разговоре";
};

function formatSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function periodLabel(p: Period) {
  switch (p) {
    case "today":
      return "Сегодня";
    case "yesterday":
      return "Вчера";
    case "7d":
      return "Последние 7 дней";
    case "30d":
      return "Последние 30 дней";
    default:
      return "Произвольный";
  }
}

const COLORS = ["#111827", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"]; // business-neutral

export default function App() {
  const [period, setPeriod] = useState<Period>("today");
  const [dept, setDept] = useState<string>("Все отделы");
  const [channel, setChannel] = useState<Channel>("all");
  const [queue, setQueue] = useState<Queue>("all");
  const [query, setQuery] = useState<string>("");
  const [tab, setTab] = useState<Tab>("overview");

  const kpis = useMemo(
    () => [
      { title: "Входящие", value: "1 520", note: "за период", delta: +6 },
      { title: "Пропущенные", value: "125", note: "требуют реакции", delta: -2 },
      { title: "Средняя длительность", value: "04:18", note: "AHT", delta: +1 },
      { title: "Нагрузка операторов", value: "32 / 44", note: "на линии / всего", delta: +3 },
      { title: "FCR", value: "78%", note: "решено с 1-го контакта", delta: +4 },
    ],
    []
  );

  const timeSeries = useMemo(
    () => [
      { t: "09:00", incoming: 86, missed: 7 },
      { t: "10:00", incoming: 120, missed: 9 },
      { t: "11:00", incoming: 132, missed: 11 },
      { t: "12:00", incoming: 148, missed: 14 },
      { t: "13:00", incoming: 160, missed: 16 },
      { t: "14:00", incoming: 150, missed: 12 },
      { t: "15:00", incoming: 142, missed: 10 },
    ],
    []
  );

  const operatorLoad = useMemo(
    () => [
      { name: "На линии", value: 32 },
      { name: "Ожидают", value: 4 },
      { name: "Не доступен", value: 8 },
    ],
    []
  );

  const channelSplit = useMemo(
    () => [
      { name: "Звонки", value: 74 },
      { name: "Чат", value: 14 },
      { name: "Email", value: 6 },
      { name: "SMS", value: 4 },
      { name: "Push", value: 2 },
    ],
    []
  );

  const themes: Theme[] = useMemo(
    () => [
      { name: "Авторизация ЛК", count: 286, avgHandleSec: 310, fcrPct: 71 },
      { name: "Статус обращения", count: 214, avgHandleSec: 260, fcrPct: 82 },
      { name: "Сброс пароля", count: 198, avgHandleSec: 240, fcrPct: 77 },
      { name: "Консультация по продуктам", count: 164, avgHandleSec: 295, fcrPct: 80 },
      { name: "Ошибки в приложении", count: 121, avgHandleSec: 360, fcrPct: 62 },
    ],
    []
  );

  const calls: CallRow[] = useMemo(
    () => [
      { id: "C-10492", startedAt: "15:42", channel: "voice", queue: "general", operator: "Иван Петров", topic: "Авторизация ЛК", durationSec: 312, status: "Завершён" },
      { id: "C-10491", startedAt: "15:38", channel: "chat", queue: "general", operator: "Анна Соколова", topic: "Сброс пароля", durationSec: 420, status: "Завершён" },
      { id: "C-10490", startedAt: "15:30", channel: "voice", queue: "vip", operator: "Анна Соколова", topic: "Статус обращения", durationSec: 0, status: "Пропущен" },
      { id: "C-10489", startedAt: "15:30", channel: "email", queue: "general", operator: "Алексей Козлов", topic: "Консультация по продуктам", durationSec: 0, status: "Ожидание" },
      { id: "C-10488", startedAt: "15:27", channel: "voice", queue: "antifraud", operator: "Алексей Козлов", topic: "Подозрительная активность", durationSec: 198, status: "В разговоре" },
    ],
    []
  );

  const filteredCalls = useMemo(() => {
    const q = query.trim().toLowerCase();
    return calls.filter((r) => {
      if (channel !== "all" && r.channel !== channel) return false;
      if (queue !== "all" && r.queue !== queue) return false;
      if (!q) return true;
      return r.id.toLowerCase().includes(q) || r.operator.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
    });
  }, [calls, channel, queue, query]);

  return (
    <div className="page">
      {/* Top */}
      <header className="top">
        <div className="top__row">
          <div className="brand">
            <div className="brand__logo">CC</div>
            <div>
              <div className="brand__title">Расширенная аналитика контакт-центра</div>
              <div className="brand__sub">Нагрузка операторов · Очереди · Каналы · Длительность · Тематики (без Excel)</div>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn--ghost" type="button">Обновить</button>
            <button className="btn btn--ghost" type="button">Экспорт</button>
            <button className="btn" type="button">Настроить</button>
          </div>
        </div>

        <div className="filters">
          <div className="field">
            <label>Период</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="today">Сегодня</option>
              <option value="yesterday">Вчера</option>
              <option value="7d">Последние 7 дней</option>
              <option value="30d">Последние 30 дней</option>
              <option value="custom">Произвольный</option>
            </select>
          </div>

          <div className="field">
            <label>Отдел</label>
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="Все отделы">Все отделы</option>
              <option value="Контакт-центр">Контакт-центр</option>
              <option value="Контроль качества">Контроль качества</option>
              <option value="Антифрод">Антифрод</option>
            </select>
          </div>

          <div className="field">
            <label>Канал</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
              <option value="all">Все каналы</option>
              <option value="voice">Звонки</option>
              <option value="chat">Чат</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>

          <div className="field">
            <label>Очередь</label>
            <select value={queue} onChange={(e) => setQueue(e.target.value as Queue)}>
              <option value="all">Все очереди</option>
              <option value="general">Общая</option>
              <option value="vip">VIP</option>
              <option value="antifraud">Антифрод</option>
            </select>
          </div>

          <div className="field field--search">
            <label>Поиск</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="оператор / тема / ID" />
          </div>

          <div className="chips">
            <span className="chip">Период: {periodLabel(period)}</span>
            <span className="chip">Отдел: {dept}</span>
            <span className="chip">Канал: {channel === "all" ? "Все" : channel}</span>
            <span className="chip">Очередь: {queue === "all" ? "Все" : queue}</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="wrap">
        {/* KPI */}
        <section className="kpis">
          {kpis.map((k) => (
            <div className="card" key={k.title}>
              <div className="card__top">
                <div>
                  <div className="muted">{k.title}</div>
                  <div className="kpi">{k.value}</div>
                  <div className="muted small">{k.note}</div>
                </div>
                <span className={`pill ${k.delta >= 0 ? "pill--good" : "pill--warn"}`}>
                  {(k.delta > 0 ? "+" : "") + k.delta + "%"}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <section className="panel">
          <div className="tabs">
            <button className={`tab ${tab === "overview" ? "tab--active" : ""}`} onClick={() => setTab("overview")}>Обзор</button>
            <button className={`tab ${tab === "operators" ? "tab--active" : ""}`} onClick={() => setTab("operators")}>Операторы</button>
            <button className={`tab ${tab === "queues" ? "tab--active" : ""}`} onClick={() => setTab("queues")}>Очереди</button>
            <button className={`tab ${tab === "channels" ? "tab--active" : ""}`} onClick={() => setTab("channels")}>Каналы</button>
            <button className={`tab ${tab === "topics" ? "tab--active" : ""}`} onClick={() => setTab("topics")}>Тематики</button>

            <div className="tabs__right">
              <button className="btn btn--ghost" type="button">Конструктор отчётов</button>
              <button className="btn" type="button">Алерты</button>
            </div>
          </div>

          <div className="grid">
            {/* Left */}
            <div className="col col--8">
              {tab === "overview" && (
                <div className="stack">
                  <div className="card">
                    <div className="card__title">Динамика обращений и пропусков</div>
                    <div className="chart">
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="t" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="incoming" name="Входящие" stroke="#111827" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="missed" name="Пропущенные" stroke="#9ca3af" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="row2">
                    <div className="card">
                      <div className="card__title">Нагрузка операторов</div>
                      <div className="chart">
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={operatorLoad} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" name="Сотрудники" fill="#111827" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="hint">Отчёт: загрузка, статусы, динамика.</div>
                    </div>

                    <div className="card">
                      <div className="card__title">Распределение по каналам</div>
                      <div className="chart">
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Tooltip />
                            <Legend />
                            <Pie data={channelSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                              {channelSplit.map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "topics" && (
                <div className="card">
                  <div className="card__title">Тематики обращений: топ, AHT, FCR</div>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart
                        data={themes.map((t) => ({ name: t.name, count: t.count, avgMin: Math.round(t.avgHandleSec / 60) }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={80} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Обращения" fill="#111827" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="avgMin" name="Средняя длительность (мин)" fill="#9ca3af" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {(tab === "operators" || tab === "queues" || tab === "channels") && (
                <div className="card">
                  <div className="card__title">
                    {tab === "operators"
                      ? "Операторы: KPI и качество"
                      : tab === "queues"
                      ? "Очереди: SLA и онлайн-показатели"
                      : "Каналы: скорость ответа и конверсия"}
                  </div>
                  <div className="muted">
                    Демонстрационная вкладка. Здесь обычно отображаются KPI/срезы/драйверы качества в зависимости от выбранной области.
                  </div>
                </div>
              )}
            </div>

            {/* Right */}
            <aside className="col col--4">
              <div className="card">
                <div className="card__title">Срез по тематикам</div>
                <div className="list">
                  {themes.map((t) => (
                    <div className="list__item" key={t.name}>
                      <div className="list__row">
                        <div className="list__name">{t.name}</div>
                        <span className="chip">{t.count}</span>
                      </div>
                      <div className="muted small">AHT: {formatSec(t.avgHandleSec)} · FCR: {t.fcrPct}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card__title">Последние коммуникации</div>
                <div className="list">
                  {filteredCalls.map((r) => (
                    <div className="list__item" key={r.id}>
                      <div className="list__row">
                        <div className="list__name">{r.id}</div>
                        <span className={`pill ${r.status === "Пропущен" ? "pill--warn" : r.status === "В разговоре" ? "pill--info" : ""}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="muted small">
                        {r.startedAt} · {r.channel.toUpperCase()} · {r.queue.toUpperCase()}
                      </div>
                      <div className="sep" />
                      <div className="list__row">
                        <div className="list__topic">{r.topic}</div>
                        <div className="muted small">{r.durationSec ? formatSec(r.durationSec) : "—"}</div>
                      </div>
                      <div className="muted small">Оператор: {r.operator}</div>
                    </div>
                  ))}
                  {!filteredCalls.length && <div className="muted">Ничего не найдено по заданным фильтрам.</div>}
                </div>
              </div>
            </aside>
          </div>

          <div className="footer">
            <div>
              <div className="footer__title">Действия</div>
              <div className="muted small">Конструктор отчётов, алерты и экспорт — как замена Excel-отчётности.</div>
            </div>
            <div className="footer__btns">
              <button className="btn btn--ghost" type="button">Конструктор отчётов</button>
              <button className="btn btn--ghost" type="button">Экспорт (API)</button>
              <button className="btn" type="button">Сохранить фильтры</button>
            </div>
          </div>
        </section>

        <div className="note">Данные демонстрационные. Цель демо — показать возможный вид встроенной аналитики контакт-центра.</div>
      </main>
    </div>
  );
}