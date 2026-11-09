import test from 'node:test';
import assert from 'node:assert/strict';
import { Strategy } from '../strategy.ts';
import { BotState } from '../vendor/makefun-bot.ts';
const mint = '11111111111111111111111111111111';
const hello: any = { capital: {lamports:'10000000000'}, caps:{max_open_positions:5,max_order_bps_of_real_reserve:100,max_orders_per_batch:16}, fees:{base_fee_lamports:'5000',priority_fee_lamports:'100000'} };
function fixture() {
 const s = new BotState(hello); s.slot=100; s.seq=0;
 s.curves.set(mint,{mint,created_slot:0,virtual_token_reserves:1_000_000_000n,virtual_quote_reserves:50_000_000_000n,real_token_reserves:800_000_000n,real_quote_reserves:30_000_000_000n,reserves_slot:100,trades:10,complete:false});
 const events:any[] = Array.from({length:5},(_,i)=>({event:'TradeEvent',mint,is_buy:true,quote_amount:'1000000000',real_quote_reserves:i===0?'40000000000':'30000000000',user:'user'+i}));
 const b:any={events,slot:100,seq:0,fills:[],marks:[],account:s.account}; return {s,b};
}
test('qualifying diversified flow buys with bounded amount',()=>{ const {s,b}=fixture(); const orders=new Strategy().onBatch(s,b); assert.equal(orders.length,1); assert.equal(orders[0].side,'buy'); assert.equal(orders[0].quote_lamports,150_000_000n); });
test('same inputs produce same decisions',()=>{ const a=fixture(),b=fixture(); assert.deepEqual(new Strategy().onBatch(a.s,a.b),new Strategy().onBatch(b.s,b.b)); });
test('one trader cannot satisfy participation filter',()=>{const {s,b}=fixture(); b.events.forEach(e=>e.user='same'); assert.deepEqual(new Strategy().onBatch(s,b),[]);});
test('no repeated entry in a mint',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); assert.deepEqual(x.onBatch(s,b),[]);});
test('cash reserve and pending positions respected',()=>{const {s,b}=fixture(); s.cash=0n; assert.deepEqual(new Strategy().onBatch(s,b),[]); s.cash=10_000_000_000n; s.hello.caps.max_open_positions=0; assert.deepEqual(new Strategy().onBatch(s,b),[]); s.hello.caps.max_open_positions=5;});
test('completed curves never bought',()=>{const {s,b}=fixture(); s.curves.get(mint)!.complete=true; assert.deepEqual(new Strategy().onBatch(s,b),[]);});
test('drawdown latch prevents new risk permanently',()=>{const {s,b}=fixture(),x=new Strategy(); s.cash=7_000_000_000n; assert.deepEqual(x.onBatch(s,b),[]); assert.equal(x.halted,true); s.cash=10_000_000_000n; assert.deepEqual(x.onBatch(s,b),[]);});
test('stops sell actual available tokens',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); s.positions.set(mint,{token_amount:1_000n,cost_lamports:150_000_000n}); const o=x.onBatch(s,b); assert.equal(o[0].side,'sell'); assert.equal(o[0].token_amount,1_000n);});
test('pending sell is not duplicated',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); s.positions.set(mint,{token_amount:1_000n,cost_lamports:150_000_000n}); s.pending.set('x',{order:{side:'sell',client_id:'x',mint,token_amount:'1000',max_slippage_bps:3000},seq:0,decided_slot:100}); assert.deepEqual(x.onBatch(s,b),[]);});

test('halted strategy keeps history bounded',()=>{const {s,b}=fixture(),x=new Strategy(); s.cash=7_000_000_000n; for(let i=0;i<100;i++) x.onBatch(s,b); assert.equal(x.halted,true); assert.ok(x.history.get(mint)!.flow.length<=256);});
test('pending purchase reserves both notional and transaction fee',()=>{const {s,b}=fixture(); s.cash=150_200_000n; s.pending.set('pending',{order:{side:'buy',client_id:'pending',mint:'22222222222222222222222222222222',quote_lamports:'100000',max_slippage_bps:800},seq:0,decided_slot:99}); assert.equal(s.freeCashLamports(),149_995_000n); const x=new Strategy(); x.peakEquity=s.cash; assert.deepEqual(x.onBatch(s,b),[]); assert.equal(x.halted,false);});
test('pending purchase of same mint is not duplicated',()=>{const {s,b}=fixture(); s.pending.set('pending',{order:{side:'buy',client_id:'pending',mint,quote_lamports:'150000000',max_slippage_bps:800},seq:0,decided_slot:99}); assert.deepEqual(new Strategy().onBatch(s,b),[]);});
test('recovery requires final two trades to be buys',()=>{const {s,b}=fixture(); b.events[b.events.length-1].is_buy=false; assert.deepEqual(new Strategy().onBatch(s,b),[]);});
test('expired peak cannot trigger a stale pullback',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,{...b,events:[b.events[0]]}); s.slot=181; b.events.forEach(e=>e.real_quote_reserves='30000000000'); assert.deepEqual(x.onBatch(s,b),[]);});
test('ten percent liquidation profit closes the position',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); s.positions.set(mint,{token_amount:3_500_000n,cost_lamports:150_000_000n}); const orders=x.onBatch(s,b); assert.equal(orders[0].side,'sell'); assert.equal(orders[0].token_amount,3_500_000n);});
test('hold horizon closes an otherwise neutral position',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); s.slot=401; s.positions.set(mint,{token_amount:3_000_000n,cost_lamports:150_000_000n}); const orders=x.onBatch(s,{...b,events:[]}); assert.equal(orders[0].side,'sell');});
test('peak beyond the retained 256 trades is forgotten',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,{...b,events:[b.events[0]]}); const events=Array.from({length:256},(_,i)=>({...b.events[1],user:'buyer'+i,real_quote_reserves:'30000000000'})); assert.deepEqual(x.onBatch(s,{...b,events}),[]); assert.equal(x.history.get(mint)!.flow.length,256);});
test('hold age exactly 300 stays open; age 301 closes',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); s.positions.set(mint,{token_amount:3_000_000n,cost_lamports:150_000_000n}); s.slot=400; assert.deepEqual(x.onBatch(s,{...b,events:[]}),[]); s.slot=401; assert.equal(x.onBatch(s,{...b,events:[]})[0].side,'sell');});
test('failed sell can retry when pending outcome is cleared',()=>{const {s,b}=fixture(),x=new Strategy(); x.onBatch(s,b); s.positions.set(mint,{token_amount:1_000n,cost_lamports:150_000_000n}); s.pending.set('sell',{order:{side:'sell',client_id:'sell',mint,token_amount:'1000',max_slippage_bps:3000},seq:0,decided_slot:100}); assert.deepEqual(x.onBatch(s,b),[]); s.pending.delete('sell'); assert.equal(x.onBatch(s,b)[0].side,'sell');});
