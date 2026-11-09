import { runBot } from './vendor/makefun-bot.ts';
import { Strategy } from './strategy.ts';
const strategy = new Strategy();
await runBot({ onBatch: (state, batch) => strategy.onBatch(state, batch) });
