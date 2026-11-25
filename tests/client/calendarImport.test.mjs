// tests/client/calendarImport.test.mjs
// The Calendar's CSV import: what start time a row gets. src/utils/calendar.js is bundled with esbuild (it imports
// extensionless modules that plain Node ESM cannot load) and then run for real, under several time zones.
//
// Why time zones matter: new Date('2026-06-01') is UTC midnight. Before the fix, a date with no time was imported at
// 00:00 (winter) or 01:00 (summer) UK time, on the previous day anywhere west of Greenwich, a separate time column was
// ignored, and 01/06/2026 became 6 January. Nothing here talks to Firebase or the network.
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const entry = fileURLToPath(new URL('../../src/utils/calendar.js', import.meta.url))
const bundle = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' })
const { parseCSV, parseCSVStart } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))

const ZONES = ['Europe/London', 'America/Los_Angeles', 'Asia/Tokyo', 'Pacific/Auckland']

function inZone(tz, fn) {
  const before = process.env.TZ
  process.env.TZ = tz
  try { return fn() } finally { if (before === undefined) delete process.env.TZ; else process.env.TZ = before }
}

// What a Date reads as on the wall clock in the current zone.
const wall = (d) => (d instanceof Date ? [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()] : d)

describe('the time-zone switch used below really works', () => {
  test('the old parse shifted a bare date a day west of Greenwich, so these tests would have caught it', () => {
    assert.equal(inZone('America/Los_Angeles', () => new Date('2026-06-01').getDate()), 31)
    assert.equal(inZone('Europe/London', () => new Date('2026-06-01').getHours()), 1)
    assert.equal(inZone('Europe/London', () => new Date('2026-12-01').getHours()), 0)
  })
})

for (const tz of ZONES) {
  describe(`start times in ${tz}`, () => {
    const start = (row) => inZone(tz, () => wall(parseCSVStart(row)))

    test('a date with no time is that local day at 09:00, summer or winter', () => {
      assert.deepEqual(start({ date: '2026-06-01' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ date: '2026-12-01' }), [2026, 12, 1, 9, 0])
      assert.deepEqual(start({ date: '2026-3-5' }), [2026, 3, 5, 9, 0])
    })

    test('a separate time column is used, whatever it is called', () => {
      assert.deepEqual(start({ date: '2026-06-01', start: '14:30' }), [2026, 6, 1, 14, 30])
      assert.deepEqual(start({ date: '2026-06-01', 'start time': '8:05' }), [2026, 6, 1, 8, 5])
      assert.deepEqual(start({ date: '2026-06-01', time: '16:00:00' }), [2026, 6, 1, 16, 0])
      assert.deepEqual(start({ date: '2026-06-01', start: '14:30', time: '09:00' }), [2026, 6, 1, 14, 30], 'start wins over time')
    })

    test('a time column that is not a real time falls back to the 09:00 default', () => {
      assert.deepEqual(start({ date: '2026-06-01', start: 'soon' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ date: '2026-06-01', start: '25:00' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ date: '2026-06-01', start: '10:75' }), [2026, 6, 1, 9, 0])
    })

    test('UK day-first dates are read day first, not as January 6', () => {
      assert.deepEqual(start({ date: '01/06/2026' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ date: '1/6/2026' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ date: '01.06.2026' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ date: '25/12/2026' }), [2026, 12, 25, 9, 0])
    })

    test('a day-first date with a time in the same cell uses that time', () => {
      assert.deepEqual(start({ date: '01/06/2026 09:30' }), [2026, 6, 1, 9, 30])
      assert.deepEqual(start({ date: '01/06/2026 9:30:00' }), [2026, 6, 1, 9, 30])
      assert.deepEqual(start({ date: '01/06/2026 18:45', start: '07:00' }), [2026, 6, 1, 18, 45], 'the cell\'s own time wins')
    })

    test('a date that is not on the calendar is unreadable, never rolled into the next month', () => {
      for (const bad of ['31/02/2026', '29/02/2026', '2026-02-30', '2026-04-31', '13/13/2026', '00/01/2026', '2026-13-01', '2026-00-10', '32/01/2026']) {
        assert.equal(start({ date: bad }), null, bad)
      }
      assert.deepEqual(start({ date: '29/02/2028' }), [2028, 2, 29, 9, 0], 'a real leap day is fine')
    })

    test('a time written in the date cell that is not a real time makes the row unreadable', () => {
      assert.equal(start({ date: '01/06/2026 25:00' }), null)
      assert.equal(start({ date: '01/06/2026 10:99' }), null)
    })

    test('a full date-time keeps meaning exactly what it says', () => {
      assert.equal(inZone(tz, () => parseCSVStart({ date: '2026-06-01T08:30:00Z' }).getTime()), Date.UTC(2026, 5, 1, 8, 30), 'with Z: that instant')
      assert.equal(inZone(tz, () => parseCSVStart({ date: '2026-06-01T08:30:00+01:00' }).getTime()), Date.UTC(2026, 5, 1, 7, 30), 'with an offset: that instant')
      assert.deepEqual(start({ date: '2026-06-01T09:30' }), [2026, 6, 1, 9, 30], 'with no zone: local')
    })

    test('with no date column, the start column is used', () => {
      assert.deepEqual(start({ start: '2026-06-01T10:00' }), [2026, 6, 1, 10, 0])
      assert.deepEqual(start({ start: '2026-06-01' }), [2026, 6, 1, 9, 0])
      assert.deepEqual(start({ dtstart: '02/06/2026' }), [2026, 6, 2, 9, 0])
    })

    test('empty, blank and unreadable values give null', () => {
      for (const row of [{}, { date: '' }, { date: '   ' }, { date: 'tomorrow' }, { date: 'soon', start: '10:00' }, { start: '09:30' }, { date: null }, { date: undefined }]) {
        assert.equal(start(row), null, JSON.stringify(row))
      }
    })
  })
}

describe('whole files', () => {
  const rows = (csv, tz = 'Europe/London') => inZone(tz, () => parseCSV(csv).map((r) => ({ title: r.title, start: wall(r.start) })))

  test('dates and times in the file come through, and rows with no title or subject are dropped', () => {
    const csv = ['title,date,start', 'Maths – Algebra,2026-06-01,14:30', 'Biology,01/06/2026,', ',,', 'Chemistry,2026-06-02,'].join('\n')
    assert.deepEqual(rows(csv), [
      { title: 'Maths – Algebra', start: [2026, 6, 1, 14, 30] },
      { title: 'Biology', start: [2026, 6, 1, 9, 0] },
      { title: 'Chemistry', start: [2026, 6, 2, 9, 0] },
    ])
  })

  test('Windows line endings, a byte-order mark and quoted commas do not change the result', () => {
    const csv = '﻿Title,Date,Start\r\n"Maths, paper 1",2026-06-01,09:15\r\nHistory,03/06/2026,\r\n'
    assert.deepEqual(rows(csv), [
      { title: 'Maths, paper 1', start: [2026, 6, 1, 9, 15] },
      { title: 'History', start: [2026, 6, 3, 9, 0] },
    ])
  })

  test('the same file gives the same wall-clock times in every time zone', () => {
    const csv = ['title,date', 'Maths,2026-06-01', 'Biology,31/12/2026'].join('\n')
    const expected = [{ title: 'Maths', start: [2026, 6, 1, 9, 0] }, { title: 'Biology', start: [2026, 12, 31, 9, 0] }]
    for (const tz of ZONES) assert.deepEqual(rows(csv, tz), expected, tz)
  })

  test('a row with an unreadable date is kept with no start, so the review step can show it', () => {
    const out = inZone('Europe/London', () => parseCSV('title,date\nMaths,31/02/2026\nBiology,2026-06-01'))
    assert.equal(out.length, 2)
    // A boolean, not the value: Node's test reporter cannot print an Invalid Date, and would crash instead of reporting.
    assert.ok(out[0].start === null, 'the start is null, not an Invalid Date')
    assert.ok(out[1].start instanceof Date && !Number.isNaN(out[1].start.getTime()))
  })
})
