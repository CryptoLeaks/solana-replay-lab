# Verification: version 2

Report recorded November 8, 2026, before repository publication. Deployment/submission status below describes that report time.

## Official replay
Node 22.23.4, official CLI process driver; all 38 kit manifest files verified. Code commit tested: dd450589e3f8e034fb85d56749cd5d6f916c1769. Production main.ts and strategy.ts are byte-identical to that candidate; later changes add documentation and tests only.

- Net PnL: +0.421744109 paper SOL (+4.21744109%) from 10 SOL.
- 90% per-coin bootstrap interval: +0.021622792 to +0.866987640 SOL. This measures uncertainty on this day, not future expected returns.
- 104 fills, 52 qualifying round trips on 52 coins, win rate 53.846%; max drawdown 1.3944510%.
- Five rejected and five failed orders. Curve fees 0.200513993 SOL; transaction fees 0.011445 SOL.
- Doubled-fee counterfactual remains +0.206958229 SOL. Removing the three best coins leaves approximately +0.07 SOL.
- Both official executions reproduce byte-for-byte. Action SHA-256: 0d9c5daaedb57db83fb37c0ec6d79e76dc17e8bb4be2c0d319546d2a66bcf6e7.
- Meets dev trading guardrails and beats all five house strategies on this day. House net SOL: hold-cash 0; equal-weight -0.019283154; sniper -0.500459286; reversion -3.705049793; momentum -9.469713484. Reversion was run on Node24; the other trading comparisons on Node22. None of this establishes a final contest win.

## Robustness and selection
Four predeclared hypotheses were compared on first12h only. The selected candidate then earned +0.296843704 SOL on the independently restarted second12h, versus +0.167464204 on first12h. Different mint cohorts, boundary flattening, no carried positions. The public day had already been seen, so these are retrospective diagnostics, NOT an untouched holdout. Two later graduation hypotheses were rejected on train alone.

Ten official block-surrogate windows: FIVE LOSSES; official reported median -0.11 SOL, p10 -0.55, p90 +0.09. The dev result exceeds all ten surrogates. This is a material overfitting/generalization warning, despite improvement over version1 (eight losses, median -0.36 SOL).

Twenty fixed independent transaction-failure keys on the same market day: all positive, range +0.337632267 to +0.493588811, median +0.434971037 SOL. This is execution sensitivity, not new market data. No separately dated historical dataset was obtainable; unseen final data remains untested.

## Engineering and remaining gates
19/19 final tests pass, including recent-peak expiry/cap, two-buy confirmation, pending cash and fees, stop/profit/time exits, failed-sell retries, deterministic actions and bounded post-halt history. Independent code review completed. Basic secret-pattern scan found no credentials or private chat material; not a comprehensive security audit.

No Docker sandbox validation or remote CI run. Source license/entrypoint/strategy checks pass, but required genuine AI session transcripts are unavailable. GitHub has not been created or modified, and no contest submission or account connection occurred. Source-bundle hosting does not waive transcripts. Original exports must be reviewed and authorized separately; do not fabricate or reconstruct them.

Earlier experiment reports are retained as negative evidence, not current performance. Version1 lost -0.337092252 SOL. Positive backtesting does not promise future profit, a prize, or real-trading suitability.

## November 9 recheck

Current official kit has updated harness/scorer versions but unchanged dev data and seed. Replayed frozen code commit 7cf485c1a875ebb1304b0cadf39068d57935411b twice with Node22.23.4. Same +0.421744109 SOL, 52 qualifying coins, 1.394451% drawdown and identical action hash. The current kit ran without the earlier missing-package workaround. 19/19 unit tests also pass again. Deadline reverified as November10 01:30 UTC; final market window November10–11 03:30 UTC.

Publication is still incomplete: laptop browser and terminal automation fail before execution. No GitHub repository or contest entry was created. Genuine transcripts remain missing.
