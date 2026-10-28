# Membrane & Gas Separation Support Workbench

A bilingual, offline application-support prototype for reviewing mixed-gas membrane tests: test context, calibrated GC compositions, permeance, separation factors, evidence and next steps. The example scenario is **synthetic** and is not experimental data or a performance claim.

**[Open the workbench](https://andypeng09.github.io/PEMFC-Electrocatalyst-Activity-Analyzer/membrane-gas-support/)** · [中文说明](#中文说明)

## What it does

- Records run identifiers, gas pair, feed / retentate / permeate absolute pressures and compositions, effective area, temperature, water partial pressures, flow and measurement checks.
- Supports **dry or humid measurements**, with or without a sweep gas. A sweep-gas outlet flow includes sweep, and the user must confirm that sweep gas contains neither target component. Gas sampled for GC must represent the membrane outlet; drying or sampling must not remove other components.
- Calculates apparent component permeances in GPU and SI, their ratio, and the composition separation factor. For dry outlet flow, `Qout,dry = Qout`; for wet outlet flow, `Qout,dry = Qout,wet × (1 − water mole fraction at the flow meter)`. GC compositions must be calibrated dry-basis mole fractions, not raw peak areas.
- With **no sweep**, optionally calculates stage cut and A recovery from dry standard feed and permeate flows. Those quantities are intentionally unavailable with sweep gas because simple outlet/feed ratios would include sweep and could ignore back-diffusion.
- Compares two valid records only when the specified gas, test, pressure, water, flow and geometry fields match. Retentate composition is a measured response and need not match. This is a screening aid; matching fields do not establish protocol or module equivalence.
- Documents observations, unconfirmed hypotheses, verification, next actions, and exports a report or project backup. No data are sent to a server by the app.

## Use

1. Open `index.html` in a modern browser, or use the workbench link above. The example opens with two **synthetic humid sweep-gas runs**.
2. Choose **New run** or import a CSV matching [`examples/synthetic-cases.csv`](examples/synthetic-cases.csv). Duplicate IDs are rejected. Only standard-volume flows at **0 °C and 1 atm** are accepted; `sccm` means cm³(STP)/min under that explicit standard. The feed and sweep inputs are dry standard flows. The outlet flow may be dry or wet according to the selected basis.
3. Enter absolute pressures in bar, effective area in cm², temperature in °C, calibrated compositions in dry mole/volume percent, and water partial pressures in kPa for humid conditions. Select inlet-only or arithmetic mean of feed and retentate partial pressures; the latter requires both retentate pressure and dry composition.
4. The optional RH helper estimates local water pressure from a measured relative humidity and temperature, using NIST Antoine fits in the range 0–69.85 °C. It does not fill any side automatically: use the measurement from the relevant location. For wet outlet flow, provide the water mole percentage **at the flow meter**, which can differ from the water partial pressure at the membrane. Water partial pressures should be measured or independently determined from the actual gas condition, not guessed from the dry gas composition. Flow and GC samples must be representative of the same outlet stream.
5. Mark GC calibration, steady state, leak/integrity check and, for sweep tests, target-free sweep as confirmed only when supported by records. Unknown or failed checks pause calculations. Choose a reference run, review comparability, add evidence and print/save the report. `Save project` creates a JSON backup.

CSV uses the exact header in the example. `mode`: `no_sweep`, `sweep`, `unknown`; `basis`: `dry`, `humid`, `unknown`; `driving_model`: `feed_only`, `feed_retentate`, `unknown`; `flow_basis`: `dry`, `wet`, `unknown`. Check fields use `confirmed`, `unknown`, or `failed`. Unused numerical fields may be blank. A/B compositions are individual calibrated mole fractions; their sums may be below 100% if other gases, including sweep, are present. Zero target composition is held for review because detection-limit information is not available.

## Calculation and boundaries

For gas `i`, use dry-basis mole fraction `z_i` and local absolute total and water pressures:

```text
p_i,side = (P_side − p_H2O,side) × z_i,dry
Δp_i = p_i,feed − p_i,permeate
     OR (p_i,feed + p_i,retentate) / 2 − p_i,permeate
n_i = Q_out,dry × y_i,dry
permeance_i = n_i / (A × Δp_i)
permeance ratio A/B = permeance_A / permeance_B
separation factor A/B = (y_A / y_B) / (x_A / x_B)
```

`n_i` is converted from standard cm³/min to mol/s using 22,414 cm³/mol, `A` to m², and `Δp_i` to Pa. The conversion defined here is **1 GPU = 3.346398 × 10⁻¹⁰ mol m⁻² s⁻¹ Pa⁻¹**, using 0 °C / 1 atm and 1 cmHg = 101325/76 Pa. A different standard-volume convention changes the SI conversion; do not combine flow data from different standards without conversion.

The mean feed/retentate driving force is an **apparent arithmetic approximation**, not an integral module model; the inlet-only option is a further approximation. Pressure/composition gradients, concentration polarization, nonideal fugacity, incomplete steady state, instrument uncertainty, geometry and gas losses are not modeled. Humidity requires explicit water partial pressures; the app does not infer humidity from a temperature or assume saturation. Permeance (GPU) is not material permeability (Barrer), and mixed-gas permeance ratio is not the composition separation factor or pure-gas ideal selectivity. The tool does not determine root cause or approve a product.

Relevant methods: [NIST water vapor-pressure parameters](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Type=ANTOINE) support the optional RH helper. [Zhang et al., Nature Communications (2026)](https://www.nature.com/articles/s41467-026-69938-4) reports partial-pressure normalized flux and distinguishes permeance ratio from mixture separation factor; [NETL carbon capture handbook](https://netl.doe.gov/sites/default/files/netl-file/Carbon-Dioxide-Capture-Handbook-2015.pdf) distinguishes permeance, permeability and process-level factors. The implemented assumptions are spelled out above so they can be checked against each test protocol.

## Verification

```bash
node tests/test_core.cjs
node tests/test_ui.cjs
```

Core tests cover independent hand-calculated humid-sweep values, wet-to-dry outlet conversion, inlet and feed/retentate models, dry no-sweep stage cut, non-positive partial pressure, missing moisture, gas balances, CSV and comparator gating. UI-flow tests use a lightweight mocked DOM; browser rendering and interactive controls should also be checked after changes.

## 中文说明

这是面向膜与混合气分离应用的离线中英文工具。可录入干气或湿气、有吹扫或无吹扫测试的压力、流量、GC 组成和测量状态；在输入条件完整时计算表观组分气体渗透通量系数（GPU）、透过率比和组成分离因子。湿气需填写膜处水蒸气分压；吹扫气须确认不含目标组分。出口总流量和 GC 组成需对应同一气流。

计算使用进料侧入口分压或进料／截留侧平均分压，属于表观近似。GPU 不是 Barrer；组分透过率比、组成分离因子和单组分理想选择性也不能混为一谈。有吹扫气时不计算透过量占比和回收率。内置案例全部为模拟数据；工具不自动判定故障原因。
