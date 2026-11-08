'use strict';
// Holds music.html's player, Toki's own sound driver on the kit's 6502 as sid.js hands it to
// createDriver, against the driver run on the kit's simulator directly, each started as SPACE
// starts the sound (sid_silence_all $6EB0 first): the three tune sets (sid_player_init $66A9 with
// X = 0, 6, 12) for 6,000 frames and the ten sound effects (sound_init $660D, then $6633 with
// X = 0, 4 ... 36) until the player says the effect has ended (at most 1,500 frames), every SID write compared
// in order, each frame. The SID answers at $D400-$D7FF, the same 32 registers every 32 bytes, so
// both sides fold an address to its register (kit/c64/machine.js does the same).
const path = require('path');
const { game } = require(path.resolve(__dirname, '../../../kit/scripts/port_check.js'));
const kit = require(path.resolve(__dirname, '../../../kit/cpu/cpu6502.js')), { CPU } = kit;
const g = game(__dirname);
const { createDriver, TOKI_TUNES } = g.run('music.html', 'createDriver', 'createDriver', 'TOKI_TUNES');
const ram = g.listing('parts/resident/listing.json').ram;
let bad = 0;
TOKI_TUNES.forEach((name, n) => {
  const frames = n < 3 ? 6000 : 1500;
  const d = createDriver({ ram }, kit);
  const m = ram.slice();
  let w = [];
  const cpu = new CPU(m, { port: 0x35, io: {
    read: a => { throw new Error('read ' + a.toString(16)); },
    write: (a, v) => { if (a >= 0xD400 && a < 0xD800) { if ((a & 31) < 25) w.push(a & 31, v); } else throw new Error('write ' + a.toString(16)); },
  } });
  d.init(n);
  w = [];
  cpu.call(0x6EB0, {});
  if (n < 3) cpu.call(0x66A9, { x: 6 * n }); else { cpu.call(0x660D, {}); cpu.call(0x6633, { x: 4 * (n - 3) }); }
  const seen = w.join(',');
  if (d.writes.join(',') !== seen) { console.log(`${name}: start differs`); bad++; return; }
  let sounding = 0;
  for (let f = 0; f < frames; f++) {
    if (!d.playing()) break;
    w = []; d.play(); cpu.call(0x6787, {});
    const a = d.writes.join(','), b = w.join(',');
    if (a !== b) { console.log(`${name}: frame ${f} differs\n port ${a}\n game ${b}`); bad++; return; }
    if (d.playing()) sounding = f + 1;
  }
  if (n >= 3 && sounding >= frames) { console.log(`${name}: still sounding after ${frames} frames`); bad++; return; }
  console.log(`${name}: ${sounding} frames agree` + (n < 3 ? '' : ', until the effect ends'));
});
process.exit(bad ? 1 : 0);
