const USER_NAME = "은퇴 복리 계산기";
const TAX_RATE = 0.154;
const PENSION_LIMIT = 6000000;
const IRP_EXTRA = 3000000;
const TOTAL_TAX_BENEFIT_LIMIT = PENSION_LIMIT + IRP_EXTRA;

const fmt = (v) => {
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "조";
  if (v >= 1e8) return (v / 1e8).toFixed(1) + "억";
  if (v >= 1e4) return (v / 1e4).toFixed(0) + "만";
  return Math.round(v).toLocaleString();
};
const fmtFull = (v) => {
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "조원";
  if (v >= 1e8) return (v / 1e8).toFixed(1) + "억원";
  if (v >= 1e4) return (v / 1e4).toFixed(0) + "만원";
  return Math.round(v).toLocaleString() + "원";
};

const afterTaxRate = (annualRate) => {
  const r = annualRate / 100;
  return (r - r * TAX_RATE) * 100;
};

function Slider({ label, min, max, step, value, onChange, display }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
      <span style={{ fontSize: 12.5, color: "#888", minWidth: 126 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "#222" }} />
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "#222", minWidth: 86, textAlign: "right" }}>
        {display(value)}
      </span>
    </div>
  );
}

function Tag({ children, color = "#555" }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, padding: "2px 8px",
      border: `1px solid ${color}22`, borderRadius: 20,
      color, background: `${color}0d`, marginRight: 4
    }}>{children}</span>
  );
}

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? "#111" : "#fafafa",
      borderRadius: 10, padding: "12px 10px", textAlign: "center",
      border: highlight ? "none" : "1px solid #efefef"
    }}>
      <div style={{ fontSize: 11, color: highlight ? "#aaa" : "#999", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15.5, fontWeight: 500, color: highlight ? "#fff" : "#111", lineHeight: 1.25 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "#888" : "#bbb", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MiniChart({ datasets, labels, height = 240 }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    chartRef.current = new window.Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => " " + c.dataset.label + ": " + fmtFull(c.parsed.y) } }
        },
        scales: {
          x: { ticks: { maxTicksLimit: 8, color: "#bbb", font: { size: 11 } }, grid: { color: "#f0f0f0" } },
          y: { ticks: { color: "#bbb", font: { size: 11 }, callback: v => fmt(v) }, grid: { color: "#f0f0f0" } }
        }
      }
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [datasets, labels]);
  return React.createElement("div", { style: { position: "relative", width: "100%", height } },
    React.createElement("canvas", { ref: canvasRef }));
}

function PensionBanner({ monthlyPmt }) {
  const annual = monthlyPmt * 12;
  const pensionPct = Math.min(annual / PENSION_LIMIT * 100, 100);
  const irpPct = Math.min(Math.max((annual - PENSION_LIMIT) / IRP_EXTRA * 100, 0), 100);
  const inLimit = annual <= PENSION_LIMIT;
  const overTotal = annual > TOTAL_TAX_BENEFIT_LIMIT;
  return (
    <div style={{ background: "#fafafa", border: "1px solid #efefef", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#333", marginBottom: 8 }}>연금저축 · IRP 절세 한도</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
            <span>연금저축</span><span style={{ color: inLimit ? "#2a8a4a" : "#888" }}>{fmtFull(Math.min(annual, PENSION_LIMIT))} / {fmtFull(PENSION_LIMIT)}</span>
          </div>
          <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pensionPct + "%", background: "#2a8a4a", borderRadius: 3, transition: "width .3s" }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
            <span>IRP 추가</span>
            <span style={{ color: !inLimit && !overTotal ? "#1565C0" : "#888" }}>
              {fmtFull(Math.min(Math.max(annual - PENSION_LIMIT, 0), IRP_EXTRA))} / {fmtFull(IRP_EXTRA)}
            </span>
          </div>
          <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: irpPct + "%", background: "#1565C0", borderRadius: 3, transition: "width .3s" }} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: overTotal ? "#c0392b" : "#aaa" }}>
        {overTotal
          ? `⚠ 연 납입액(${fmtFull(annual)})이 세액공제 한도(${fmtFull(TOTAL_TAX_BENEFIT_LIMIT)})를 초과합니다.`
          : `연간 납입 ${fmtFull(annual)} — 세액공제 한도 내 최적 활용 중`}
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = React.useState("goal");
  const [useTax, setUseTax] = React.useState(false);
  const [curAge, setCurAge] = React.useState(30);
  const [retAge, setRetAge] = React.useState(60);
  const [initAmt, setInitAmt] = React.useState(10000000);
  const [rate, setRate] = React.useState(7);
  const [inflation, setInflation] = React.useState(2.5);
  const [target, setTarget] = React.useState(1000000000);
  const [realGoal, setRealGoal] = React.useState(500000000);
  const [fixedMonthly, setFixedMonthly] = React.useState(500000);

  const effectiveRate = useTax ? afterTaxRate(rate) : rate;
  const yrs = Math.max(retAge - curAge, 1);
  const mRate = effectiveRate / 100 / 12;
  const n = yrs * 12;
  const inflFactor = Math.pow(1 + inflation / 100, yrs);
  const fvInit = initAmt * Math.pow(1 + mRate, n);

  const calcMonthly = (tgt) => {
    const rem = tgt - fvInit;
    if (rem <= 0) return 0;
    return mRate === 0 ? rem / n : rem * mRate / (Math.pow(1 + mRate, n) - 1);
  };

  const monthlyA = calcMonthly(target);
  const nominalTarget = realGoal * inflFactor;
  const monthlyB = calcMonthly(nominalTarget);
  const fvMonthlyC = mRate === 0 ? fixedMonthly * n : fixedMonthly * (Math.pow(1 + mRate, n) - 1) / mRate;
  const finalC = fvInit + fvMonthlyC;
  const realFinalC = finalC / inflFactor;

  const buildSeries = React.useCallback((monthlyPmt) => {
    const labels = [], total = [], prin = [], real = [];
    for (let y = 0; y <= yrs; y++) {
      const m = y * 12;
      const fvI = initAmt * Math.pow(1 + mRate, m);
      const fvM = monthlyPmt <= 0 ? 0 : (mRate === 0 ? monthlyPmt * m : monthlyPmt * (Math.pow(1 + mRate, m) - 1) / mRate);
      const tot = Math.round(fvI + fvM);
      labels.push((curAge + y) + "세");
      total.push(tot);
      prin.push(Math.round(initAmt + monthlyPmt * m));
      real.push(Math.round(tot / Math.pow(1 + inflation / 100, y)));
    }
    return { labels, total, prin, real };
  }, [curAge, yrs, initAmt, mRate, inflation]);

  const CARD = { background: "#fff", border: "1px solid #efefef", borderRadius: 12, padding: "1rem 1.25rem" };
  const DIVIDER = { borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 12 };
  const DOT = (c, dashed) => React.createElement("span", {
    style: {
      display: "inline-block", width: 9, height: 9, borderRadius: 2,
      background: dashed ? "transparent" : c,
      border: dashed ? `1.5px dashed ${c}` : "none",
      marginRight: 4, verticalAlign: "middle"
    }
  });

  const commonSliders = React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" } },
    React.createElement("div", null,
      React.createElement(Slider, { label: "현재 나이", min: 20, max: 60, step: 1, value: curAge, onChange: setCurAge, display: v => v + "세" }),
      React.createElement(Slider, { label: "은퇴 나이", min: 40, max: 75, step: 1, value: retAge, onChange: setRetAge, display: v => v + "세" }),
      React.createElement(Slider, { label: "현재 보유 자산", min: 0, max: 500000000, step: 1000000, value: initAmt, onChange: setInitAmt, display: fmtFull }),
    ),
    React.createElement("div", null,
      React.createElement(Slider, { label: "연 수익률 (세전)", min: 1, max: 20, step: 0.5, value: rate, onChange: setRate, display: v => (+v).toFixed(1) + "%" }),
      React.createElement(Slider, { label: "연 인플레이션", min: 0, max: 8, step: 0.5, value: inflation, onChange: setInflation, display: v => (+v).toFixed(1) + "%" }),
    )
  );

  const taxToggle = React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0 4px" } },
    React.createElement("button", {
      onClick: () => setUseTax(t => !t),
      style: { width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", background: useTax ? "#222" : "#ddd", position: "relative", transition: "background .2s" }
    }, React.createElement("span", {
      style: { position: "absolute", top: 2, left: useTax ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }
    })),
    React.createElement("span", { style: { fontSize: 12.5, color: useTax ? "#111" : "#aaa" } },
      "이자소득세 15.4% 반영 ",
      useTax && React.createElement(Tag, { color: "#c0392b" }, "세후 수익률 " + afterTaxRate(rate).toFixed(2) + "%")
    )
  );

  const tabBtn = (id, label) => React.createElement("button", {
    onClick: () => setTab(id),
    style: {
      padding: "7px 15px", fontSize: 12.5, fontWeight: tab === id ? 500 : 400,
      color: tab === id ? "#111" : "#aaa",
      background: tab === id ? "#fff" : "transparent",
      border: "1px solid " + (tab === id ? "#ddd" : "transparent"),
      borderRadius: 8, cursor: "pointer"
    }
  }, label);

  const renderGoal = () => {
    const { labels, total, prin } = buildSeries(monthlyA);
    const totalPrin = initAmt + monthlyA * n;
    const gain = target - totalPrin;
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement("div", { style: CARD },
        React.createElement("p", { style: { fontSize: 12, color: "#aaa", marginBottom: 12 } }, "입력값 조정"),
        commonSliders,
        React.createElement("div", { style: DIVIDER },
          React.createElement(Slider, { label: "은퇴 목표 금액", min: 100000000, max: 5000000000, step: 50000000, value: target, onChange: setTarget, display: fmtFull })
        ),
        taxToggle
      ),
      React.createElement("div", { style: { background: "#111", borderRadius: 12, padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 4 } }, "목표 달성을 위한 월 납입액"),
          React.createElement("div", { style: { fontSize: 28, fontWeight: 600, color: "#fff" } }, monthlyA <= 0 ? "이미 목표 달성! 🎉" : fmtFull(Math.ceil(monthlyA / 1000) * 1000)),
          useTax && React.createElement("div", { style: { fontSize: 11, color: "#666", marginTop: 4 } }, "세후 수익률 " + afterTaxRate(rate).toFixed(2) + "% 적용")
        ),
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontSize: 11, color: "#666" } }, "목표 실질 가치 (현재 기준)"),
          React.createElement("div", { style: { fontSize: 17, fontWeight: 500, color: "#ccc" } }, fmtFull(target / inflFactor)),
          React.createElement("div", { style: { fontSize: 11, color: "#555", marginTop: 2 } }, "인플레 " + inflation + "% × " + yrs + "년 반영")
        )
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 } },
        React.createElement(MetricCard, { label: "투자 기간", value: yrs + "년" }),
        React.createElement(MetricCard, { label: "총 납입 원금", value: fmt(totalPrin), sub: "원" }),
        React.createElement(MetricCard, { label: "총 투자 수익", value: fmt(Math.max(gain, 0)), sub: "원" }),
        React.createElement(MetricCard, { label: "수익 배율", value: (target / Math.max(totalPrin, 1)).toFixed(2) + "배", highlight: true })
      ),
      React.createElement(PensionBanner, { monthlyPmt: Math.max(monthlyA, 0) }),
      React.createElement("div", { style: CARD },
        React.createElement("div", { style: { display: "flex", gap: 14, fontSize: 11.5, color: "#bbb", marginBottom: 10, flexWrap: "wrap" } },
          React.createElement("span", null, DOT("#111"), "총 자산"),
          React.createElement("span", null, DOT("#bbb"), "납입 원금"),
          React.createElement("span", null, DOT("#ccc", true), "목표")
        ),
        React.createElement(MiniChart, { labels, datasets: [
          { label: "총 자산", data: total, borderColor: "#111", backgroundColor: "#11111108", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
          { label: "납입 원금", data: prin, borderColor: "#bbb", backgroundColor: "#bbb08", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
          { label: "목표", data: Array(yrs + 1).fill(target), borderColor: "#ddd", borderDash: [6, 4], fill: false, pointRadius: 0, borderWidth: 1.5 },
        ]})
      )
    );
  };

  const renderReal = () => {
    const { labels, total, prin } = buildSeries(monthlyB);
    const totalPrin = initAmt + monthlyB * n;
    const gain = nominalTarget - totalPrin;
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement("div", { style: CARD },
        React.createElement("p", { style: { fontSize: 12, color: "#aaa", marginBottom: 12 } }, "입력값 조정"),
        commonSliders,
        React.createElement("div", { style: DIVIDER },
          React.createElement(Slider, { label: "실질 목표 (현재 가치)", min: 50000000, max: 3000000000, step: 50000000, value: realGoal, onChange: setRealGoal, display: fmtFull })
        ),
        taxToggle
      ),
      React.createElement("div", { style: { ...CARD, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, color: "#bbb", marginBottom: 2 } }, "실질 목표 (지금 기준)"),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 500, color: "#111" } }, fmtFull(realGoal))
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } },
          React.createElement("span", { style: { fontSize: 18, color: "#ddd" } }, "→"),
          React.createElement("span", { style: { fontSize: 10, color: "#aaa", background: "#f7f7f7", borderRadius: 6, padding: "2px 8px" } }, "×" + inflFactor.toFixed(3) + " (" + inflation + "%/년, " + yrs + "년)")
        ),
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, color: "#aaa", marginBottom: 2 } }, yrs + "년 후 필요 명목 금액"),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 600, color: "#111" } }, fmtFull(nominalTarget))
        )
      ),
      React.createElement("div", { style: { background: "#111", borderRadius: 12, padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 4 } }, "목표 달성 월 납입액 (명목 기준)"),
          React.createElement("div", { style: { fontSize: 28, fontWeight: 600, color: "#fff" } }, monthlyB <= 0 ? "이미 목표 달성! 🎉" : fmtFull(Math.ceil(monthlyB / 1000) * 1000))
        ),
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontSize: 11, color: "#666" } }, "명목 목표"),
          React.createElement("div", { style: { fontSize: 17, fontWeight: 500, color: "#ccc" } }, fmtFull(nominalTarget))
        )
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 } },
        React.createElement(MetricCard, { label: "실질 목표", value: fmt(realGoal), sub: "현재 가치" }),
        React.createElement(MetricCard, { label: "명목 목표", value: fmt(nominalTarget), sub: yrs + "년 후", highlight: true }),
        React.createElement(MetricCard, { label: "총 납입 원금", value: fmt(totalPrin), sub: "원" }),
        React.createElement(MetricCard, { label: "총 투자 수익", value: fmt(Math.max(gain, 0)), sub: "원" })
      ),
      React.createElement(PensionBanner, { monthlyPmt: Math.max(monthlyB, 0) }),
      React.createElement("div", { style: CARD },
        React.createElement("div", { style: { display: "flex", gap: 14, fontSize: 11.5, color: "#bbb", marginBottom: 10 } },
          React.createElement("span", null, DOT("#111"), "총 자산"),
          React.createElement("span", null, DOT("#bbb"), "납입 원금"),
          React.createElement("span", null, DOT("#ddd", true), "명목 목표")
        ),
        React.createElement(MiniChart, { labels, datasets: [
          { label: "총 자산 (명목)", data: total, borderColor: "#111", backgroundColor: "#11111108", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
          { label: "납입 원금", data: prin, borderColor: "#bbb", backgroundColor: "#bbb08", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
          { label: "명목 목표", data: Array(yrs + 1).fill(nominalTarget), borderColor: "#ddd", borderDash: [6, 4], fill: false, pointRadius: 0, borderWidth: 1.5 },
        ]})
      )
    );
  };

  const renderMonthly = () => {
    const { labels, total, prin, real } = buildSeries(fixedMonthly);
    const totalPrin = initAmt + fixedMonthly * n;
    const gain = finalC - totalPrin;
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
      React.createElement("div", { style: CARD },
        React.createElement("p", { style: { fontSize: 12, color: "#aaa", marginBottom: 12 } }, "입력값 조정"),
        commonSliders,
        React.createElement("div", { style: DIVIDER },
          React.createElement(Slider, { label: "월 납입액", min: 100000, max: 5000000, step: 50000, value: fixedMonthly, onChange: setFixedMonthly, display: fmtFull })
        ),
        taxToggle
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        React.createElement("div", { style: { background: "#111", borderRadius: 12, padding: "1rem 1.25rem" } },
          React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 4 } }, "최종 명목 자산"),
          React.createElement("div", { style: { fontSize: 24, fontWeight: 600, color: "#fff" } }, fmtFull(finalC)),
          React.createElement("div", { style: { fontSize: 11, color: "#555", marginTop: 4 } }, yrs + "년 후 실제 수령액")
        ),
        React.createElement("div", { style: CARD },
          React.createElement("div", { style: { fontSize: 11, color: "#aaa", marginBottom: 4 } }, "실질 구매력 (현재 가치)"),
          React.createElement("div", { style: { fontSize: 24, fontWeight: 600, color: "#111" } }, fmtFull(realFinalC)),
          React.createElement("div", { style: { fontSize: 11, color: "#bbb", marginTop: 4 } }, "인플레이션 " + inflation + "% × " + yrs + "년 반영")
        )
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 } },
        React.createElement(MetricCard, { label: "월 납입액", value: fmt(fixedMonthly), sub: "원" }),
        React.createElement(MetricCard, { label: "총 납입 원금", value: fmt(totalPrin), sub: "원" }),
        React.createElement(MetricCard, { label: "총 투자 수익", value: fmt(Math.max(gain, 0)), sub: "원" }),
        React.createElement(MetricCard, { label: "수익 배율", value: (finalC / Math.max(totalPrin, 1)).toFixed(2) + "배", highlight: true })
      ),
      React.createElement(PensionBanner, { monthlyPmt: fixedMonthly }),
      React.createElement("div", { style: CARD },
        React.createElement("div", { style: { display: "flex", gap: 14, fontSize: 11.5, color: "#bbb", marginBottom: 10 } },
          React.createElement("span", null, DOT("#111"), "총 자산"),
          React.createElement("span", null, DOT("#888", true), "실질 가치"),
          React.createElement("span", null, DOT("#bbb"), "납입 원금")
        ),
        React.createElement(MiniChart, { labels, datasets: [
          { label: "총 자산 (명목)", data: total, borderColor: "#111", backgroundColor: "#11111108", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
          { label: "실질 가치", data: real, borderColor: "#888", fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5, borderDash: [4, 3] },
          { label: "납입 원금", data: prin, borderColor: "#bbb", backgroundColor: "#bbb08", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
        ]})
      )
    );
  };

  return React.createElement("div", { style: { padding: "1.25rem 0.25rem", display: "flex", flexDirection: "column", gap: 16, fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", background: "#fff", color: "#111" } },
    React.createElement("div", { style: { borderBottom: "1px solid #f0f0f0", paddingBottom: 14 } },
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 6 } },
        React.createElement("div", null,
          React.createElement("span", { style: { fontSize: 11, color: "#bbb", letterSpacing: 1, textTransform: "uppercase", marginRight: 8 } }, "Retirement Planner"),
          React.createElement("span", { style: { fontSize: 18, fontWeight: 600, color: "#111" } }, USER_NAME)
        ),
        React.createElement("span", { style: { fontSize: 12, color: "#bbb" } }, "투자 기간 " + yrs + "년 (" + n + "개월)")
      ),
      React.createElement("p", { style: { fontSize: 12, color: "#aaa", marginTop: 6, lineHeight: 1.6 } }, "복리 수익률, 인플레이션, 세금을 반영한 은퇴 자산 시뮬레이터입니다.")
    ),
    React.createElement("div", { style: { display: "flex", gap: 4, background: "#f7f7f7", padding: 4, borderRadius: 10, flexWrap: "wrap" } },
      tabBtn("goal", "🎯 목표 → 월 납입액"),
      tabBtn("real", "💰 실질목표 → 명목 환산"),
      tabBtn("monthly", "📈 월 납입 → 최종 자산")
    ),
    tab === "goal" ? renderGoal() : tab === "real" ? renderReal() : renderMonthly(),
    React.createElement("div", { style: { fontSize: 11, color: "#ccc", borderTop: "1px solid #f0f0f0", paddingTop: 10 } },
      "※ 본 계산기는 단순 시뮬레이션이며 실제 투자 수익을 보장하지 않습니다."
    )
  );
}
