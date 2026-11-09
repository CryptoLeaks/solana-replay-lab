# Recent-peak dip recovery

Paper replay only. This is a research strategy, not an assurance of future profitability or a competition win.

## Entry
Track the latest 256 trades whose slots are no more than 80 slots old, for each coin. The recent peak is the largest real SOL reserve in those retained trades, not the lifetime high. Consider only curves holding 25–65 SOL, with present real reserves at 70–90% of that recent peak. Require three distinct recent buyers, at least 2 SOL of recent buying, buying at least one third of selling, and the last two retained trades both buys. Each mint gets at most one buy attempt, including failed/rejected attempts. No mint addresses, future data, wall clock, network or random source is used.

## Size and exits
Spend at most 0.15 SOL, further limited by the harness's 1% real-reserve cap. Reject proposed sizes below 0.012 SOL. Reserve cash for pending buys and all transaction fees. Respect five open positions and the per-batch order cap. Buy slippage tolerance is 8%.

Sell all held tokens when estimated net liquidation value falls strictly below 90% of cost, reaches at least 110% of cost, or holding age exceeds 300 slots from the buy decision. The pre-existing trailing rule also remains: after a high above 115% of cost, sell on a retreat exceeding 14%. Sell slippage tolerance is 30%. An unresolved sale is never duplicated; failed/rejected sales may retry once their outcome arrives. The harness closes completed curves and remaining final-window positions.

A 20% peak-to-trough portfolio drawdown latches off new entries and attempts to liquidate. This is not a guaranteed limit: gaps, latency and failed or rejected orders can worsen losses. Local liquidation estimates use a 1.25% fee fallback; official scoring uses actual curve and transaction fees.

## Selection and evidence limits
Four predeclared hypotheses were evaluated on the first 12 hours; this variant had the highest training profit and was then checked on the separate second 12 hours, independently initialized and without overlapping mint cohorts. Both slices were positive. However, the full day was previously used in research, so this is retrospective chronological validation, not an untouched holdout. Two later near-graduation hypotheses were rejected based on training results alone. Execution-seed checks vary failures, not market conditions. Official block-surrogate tests include losses. No independent historical dataset or unseen final data has been validated. See the reports for all outcomes, including failures.
