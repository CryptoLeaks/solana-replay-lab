import type { BotState, Batch, OrderInput } from './vendor/makefun-bot.ts';
const SOL = 1_000_000_000n;
type Flow = { slot: number; buy: boolean; amount: bigint; user: string; reserve: bigint };
export const DEFAULT_PARAMS = { minReserve: 25n*SOL, maxReserve:65n*SOL, peakLow:70n, peakHigh:90n, stop:90n, takeProfit:110n, maxHold:300, minBuyers:3, confirmBuys:2, recentPeak:true, stake:150_000_000n };
export type Params = typeof DEFAULT_PARAMS;
type History = { flow: Flow[]; peak: bigint; entered: boolean; opened: number; highValue: bigint };
/** Causal, bounded-exposure paper strategy. No external data or randomness. */
export class Strategy {
  params: Params;
  constructor(params: Partial<Params> = {}) { this.params = { ...DEFAULT_PARAMS, ...params }; }
  history = new Map<string, History>();
  peakEquity = 10n * SOL;
  halted = false;
  onBatch(state: BotState, batch: Batch): OrderInput[] {
    const touched = new Set<string>();
    for (const e of batch.events) {
      let h = this.history.get(e.mint);
      if (!h) { h = { flow: [], peak: 0n, entered: false, opened: state.slot, highValue: 0n }; this.history.set(e.mint, h); }
      if (e.event === 'TradeEvent') {
        h.flow.push({ slot: state.slot, buy: e.is_buy, amount: BigInt(e.quote_amount), user: e.user, reserve: BigInt(e.real_quote_reserves) });
        h.flow = h.flow.filter(f => f.slot >= state.slot - 80).slice(-256);
        const q = BigInt(e.real_quote_reserves);
        if (q > h.peak) h.peak = q;
        touched.add(e.mint);
      }
    }
    const pending = new Set([...state.pending.values()].map(p => p.order.mint));
    const values = new Map<string, bigint>();
    let equity = state.cash;
    for (const [mint, p] of state.positions) {
      const c = state.curves.get(mint)!;
      const gross = c.virtual_quote_reserves * p.token_amount / (c.virtual_token_reserves + p.token_amount);
      const value = (gross < c.real_quote_reserves ? gross : c.real_quote_reserves) * 9875n / 10000n;
      values.set(mint, value); equity += value;
    }
    if (equity > this.peakEquity) this.peakEquity = equity;
    // Conservative latch, not a guarantee: gaps can still cross the drawdown limit.
    if (equity * 100n < this.peakEquity * 80n) this.halted = true;
    const orders: OrderInput[] = [];
    let free = state.freeCashLamports();
    const tx = state.txFeeLamports();
    for (const [mint, p] of state.positions) {
      const h = this.history.get(mint)!;
      const value = values.get(mint)!;
      if (value > h.highValue) h.highValue = value;
      const age = state.slot - h.opened;
      if (!pending.has(mint) && !state.curves.get(mint)!.complete &&
          (this.halted || value * 100n < p.cost_lamports * this.params.stop ||
           (h.highValue > p.cost_lamports * 115n / 100n && value * 100n < h.highValue * 86n) || age > this.params.maxHold || (this.params.takeProfit > 0n && value * 100n >= p.cost_lamports * this.params.takeProfit))) {
        if (orders.length < state.hello.caps.max_orders_per_batch && free >= tx) {
          orders.push({ side: 'sell', mint, token_amount: p.token_amount, max_slippage_bps: 3000 }); free -= tx;
        }
      }
    }
    if (this.halted) return orders;
    let slots = state.hello.caps.max_open_positions - state.committedPositionCount();
    for (const mint of touched) {
      const h = this.history.get(mint)!;
      h.flow = h.flow.filter(f => f.slot >= state.slot - 80).slice(-256);
      const c = state.curves.get(mint)!;
      if (h.entered || c.complete || pending.has(mint) || state.positions.has(mint) || slots <= 0) continue;
      const buys = h.flow.filter(f => f.buy);
      const users = new Set(buys.map(f => f.user));
      const bought = buys.reduce((a, f) => a + f.amount, 0n);
      const sold = h.flow.filter(f => !f.buy).reduce((a, f) => a + f.amount, 0n);
      const peak = this.params.recentPeak ? h.flow.reduce((a,f)=>f.reserve>a?f.reserve:a,0n) : h.peak;
      if (this.params.confirmBuys && (h.flow.length < this.params.confirmBuys || h.flow.slice(-this.params.confirmBuys).some(f=>!f.buy))) continue;
      // Buy a substantial pullback on an established curve with recent buyer participation.
      if (c.real_quote_reserves < this.params.minReserve || c.real_quote_reserves > this.params.maxReserve || users.size < this.params.minBuyers ||
          bought < 2n * SOL || bought < sold / 3n || c.real_quote_reserves * 100n > peak * this.params.peakHigh || c.real_quote_reserves * 100n < peak * this.params.peakLow) continue;
      let amount = state.maxBuyLamports(mint);
      if (amount > this.params.stake) amount = this.params.stake;
      if (amount < 12_000_000n || free < amount + tx || orders.length >= state.hello.caps.max_orders_per_batch) continue;
      orders.push({ side: 'buy', mint, quote_lamports: amount, max_slippage_bps: 800 });
      h.entered = true; h.opened = state.slot; free -= amount + tx; slots--;
    }
    return orders;
  }
}

export function createStrategy(params: Partial<Params> = {}) { return new Strategy(params); }
