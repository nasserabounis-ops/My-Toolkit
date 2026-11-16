# Advisor Toolkit

Installable offline app for drilling, completion and workover technical advisors.
Eng: Nasser Aboyounes

- 31 sheets: well control and kill sheet, volume calculator, space-out, TCP correlation, hook load and drag,
  casing and tubing design, fishing, tubular libraries, WCE audit, equipment register, job tickets,
  visit checklist, visit report and rig comparison.
- Same equations as `workbook/Advisor_Toolkit.xlsx` (all 2,889 formulas checked against Excel).
- Works offline. Entries are saved on each device only. Back up and restore from the app menu.
- Audit and visit sheets keep separate data per rig.

## Use
Open the site address over https, then install: iPhone Safari Share > Add to Home Screen,
Android Chrome menu > Install app, laptop Chrome or Edge install icon in the address bar.

## Update
Edit the workbook, run `tools/extract.py` to rebuild `model.js`, check with `tools/verify.js`,
commit, and bump the cache name `V` in `sw.js` so installed copies refresh.

The calculators are screening aids. The approved program and company procedures take priority.
