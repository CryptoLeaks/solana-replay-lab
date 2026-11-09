# Solana Replay Lab

Dependency-free TypeScript research bot for the make.fun Solana paper-replay contest. **No live trading, wallet, API key or exchange connection.**

## Version 2

Recent-peak recovery replaces version 1's lifetime-peak dip rule. All 19 unit/regression tests pass on Node 22.23.4. The working research simulator reproduces the official version-1 full-day result exactly; version 2 is tested by the official harness as well. Read reports/VERIFICATION.md for the current authoritative results and limitations.

Positive historical results do not guarantee future profit or a competition win. Stress tests include losing scenarios. Authentic original AI coding-session transcripts are still missing, so this is not submission-ready. Repository publication alone does not submit a contest entry. No entry has been submitted. The CI workflow is configured; its remote status must be checked separately.

## Test

Use Node 22.23.4, without installing dependencies:

```sh
node --test tests/*.test.ts
```

## Official replay

Download https://make.fun/c/memecoin-backtest-48h-01/kit and extract outside the repository. From the kit directory:

```sh
node cli/makefun.mjs grade-local --kit . --bot /absolute/path/to/solana-replay-lab --driver process --stress 10 --stress-jobs 3
```

IMPORTANT: In a Git repository, the CLI grades HEAD, not uncommitted files. Commit the intended changes first; use --worktree only for an explicitly uncommitted experiment. The recorded candidate code commit and hashes are in the reports.

The November 9 official kit runs directly without the package.json workaround required by the earlier November 8 kit. Both versions verify all 38 manifest-listed files; no hashed harness, SDK or dataset files were modified. The November 9 replay reconfirmed the same trading result and action hash.

Process-driver runs are not Docker sandbox validation. The official Docker path and remote CI remain untested. Without genuine transcripts, preflight correctly fails regardless of trading profit.

## Files and reproducibility

main.ts is the entrypoint; strategy.ts is the decision logic; vendor contains the unchanged official SDK. tests contains unit/regression checks. STRATEGY.md describes the rules. reports contains actual outcomes, including negative version-1 trials and version-2 robustness tests. The separate solana-replay-research/temporal folder in the downloadable package contains the independent research evaluator, frozen strategy snapshots, candidate-selection results and its source license. The evaluator is not the authoritative contest harness.

## Contest and publication

Official brief: https://make.fun/bounty/memecoin-backtest-48h-01

Deadline: November 10, 2026, 01:30 UTC. $500 is the total USDC pool; first place is $100. Final unseen data starts two hours after the deadline. Eligibility requires at least 20 distinct coins with round trips of at least 0.01 SOL, at most 50% drawdown, and net PnL above all five house baselines. The final window, not dev scores, decides prizes.

The contest requires a public repository created after opening (November 7, 06:00 UTC), the intended commit pushed, and verified ownership. Genuine original session exports need separate privacy review and approval. The rules accept original ChatGPT/Claude exports and supported coding-client session files; reconstructed summaries are not accepted. A source bundle does not waive transcripts. No private conversations or credentials are included here.
