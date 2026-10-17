#!/usr/bin/env python3
"""
apply_swaps.py — put the RevisionFlow illustrations into the pages that should show them.

What it does
    Replays the 81 swaps described in src/components/illustrations/SWAP_CATALOGUE.md onto your
    checkout of the repo: real badge art instead of lucide/emoji icons, empty states, subject
    tiles, the 404 / error screens, pop-up scenes. Every swap was applied to a copy of the repo,
    built with `npm run build` and linted; this script replays exactly that result.
    (A swap is one idea in the catalogue; some need two or three find-and-replace edits — the
    markup, an import, an unused icon removed. The 81 swaps are 88 edits, and the report counts edits.)

Why it is safe to run on files that have moved on since then
    • A swap is a "find this exact text, replace it with that text" step. If the text is not found
      exactly once (somebody has edited that spot), the swap is NOT applied and the script says so —
      do that one by hand from SWAP_CATALOGUE.md.
    • A swap that is already in place is recognised and skipped, so re-running is harmless.
    • By default nothing is written: you get a report. Add --write to apply.
    • A file is only written when every swap in it applies (or is already in place), because the swaps in
      one file belong together (one removes an old icon map, another stops using it). --partial writes the
      ones that did match anyway — only use it if you will do the rest by hand straight away.

Usage (run from anywhere; commit or stash your work first so the result is easy to review)
    python3 tools/illustration-swaps/apply_swaps.py --repo .                     # report only
    python3 tools/illustration-swaps/apply_swaps.py --repo . --list              # files, owners, swap ids
    python3 tools/illustration-swaps/apply_swaps.py --repo . --write             # apply everything
    python3 tools/illustration-swaps/apply_swaps.py --repo . --write --files pages/Dashboard.jsx,pages/Profile.jsx
    python3 tools/illustration-swaps/apply_swaps.py --repo . --write --owner "Study"
    python3 tools/illustration-swaps/apply_swaps.py --repo . --write --skip pages/Landing.jsx,pages/Pro.jsx

Then: npm run build, and look at the pages in light and dark mode (checklist in INTEGRATION_GUIDE.md §8).

Files are other workstreams' files. Use --files / --owner to apply only the ones you own, and hand the
rest to their owners (INTEGRATION_GUIDE.md §9 has the routing table). Only the Python standard library is used.
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def load(path):
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)


def read(path):
    with open(path, newline='', encoding='utf-8') as fh:
        return fh.read()


def write(path, text):
    with open(path, 'w', newline='', encoding='utf-8') as fh:
        fh.write(text)


def csv(s):
    return [x.strip() for x in s.split(',') if x.strip()] if s else []


def main():
    ap = argparse.ArgumentParser(description='Apply the illustration swaps to a RevisionFlow checkout.')
    ap.add_argument('--repo', required=True, help='repo root (the folder that contains src/)')
    ap.add_argument('--swaps', default=os.path.join(HERE, 'swaps.json'), help='swaps.json (default: next to this script)')
    ap.add_argument('--write', action='store_true', help='write the changes (default: report only)')
    ap.add_argument('--partial', action='store_true',
                    help='in a file where some swaps no longer match, still write the ones that do. The file is then half-converted '
                         '(e.g. an old icon map deleted while one use of it is still there) until you finish the rest by hand — avoid unless you will')
    ap.add_argument('--list', action='store_true', help='list files, owners and swap ids, then exit')
    ap.add_argument('--files', help='comma-separated, relative to src/ (e.g. pages/Dashboard.jsx). Default: all')
    ap.add_argument('--owner', help='only files whose owner contains this text (e.g. "Study", "Analytics", "Onboarding")')
    ap.add_argument('--skip', help='comma-separated files to leave out')
    args = ap.parse_args()

    data = load(args.swaps)['files']
    names = list(data)
    if args.files:
        want = set(csv(args.files))
        unknown = want - set(names)
        if unknown:
            sys.exit('Unknown file(s): ' + ', '.join(sorted(unknown)) + '\nKnown: ' + ', '.join(names))
        names = [n for n in names if n in want]
    if args.owner:
        names = [n for n in names if args.owner.lower() in data[n]['owner'].lower()]
    if args.skip:
        names = [n for n in names if n not in set(csv(args.skip))]

    if args.list:
        for n in names:
            d = data[n]
            print(f"{n:40s} {len(d['hunks']):2d} edit(s)  owner: {d['owner'] or '—':44s} {', '.join(d['swaps'])}")
        return 0

    src = os.path.join(args.repo, 'src')
    if not os.path.isdir(src):
        sys.exit(f'No src/ folder in {args.repo!r}. Pass the repo root with --repo.')
    lib = os.path.join(src, 'components', 'illustrations')
    missing = [f for f in ('index.js', 'lazy.jsx', 'SubjectTile.jsx', 'BadgeArt.jsx', 'EmptyState.jsx', 'Illustration.jsx')
               if not os.path.isfile(os.path.join(lib, f))]
    if missing:
        sys.exit('The illustration library is not in this checkout (missing in src/components/illustrations: '
                 + ', '.join(missing) + '). Copy it in first; these swaps import from it.')

    mode = 'WRITE' if args.write else 'REPORT ONLY (add --write to apply)'
    print(f'Illustration swaps — {mode}\n')
    totals = dict(applied=0, already=0, failed=0, files_written=0)
    failures = []

    for n in names:
        path = os.path.join(src, n)
        if not os.path.isfile(path):
            print(f'  MISSING   {n}  (not in this checkout)')
            totals['failed'] += len(data[n]['hunks'])
            failures.append((n, 'file not found', []))
            continue
        text = read(path)
        crlf = '\r\n' in text
        cur = text.replace('\r\n', '\n') if crlf else text
        ok = already = 0
        bad = []
        for i, h in enumerate(data[n]['hunks'], 1):
            find, repl = h['find'], h['replace']
            c = cur.count(find)
            if c == 1:
                cur = cur.replace(find, repl)
                ok += 1
            elif c == 0 and repl in cur:
                already += 1
            else:
                bad.append((i, h, 'no exact match (the file has changed here)' if c == 0 else f'matches {c} places'))
        new_text = cur.replace('\n', '\r\n') if crlf else cur
        total = len(data[n]['hunks'])
        if bad:
            status = 'PARTIAL ' if ok else 'SKIPPED '
        elif ok:
            status = 'APPLIED '
        else:
            status = 'ALREADY '
        detail = f'{ok} applied' + (f', {already} already in place' if already else '') + (f', {len(bad)} NOT applied' if bad else '')
        will_write = args.write and ok and (not bad or args.partial)
        if will_write:
            write(path, new_text)
            totals['files_written'] += 1
        print(f'  {status} {n:40s} {detail}' + ('' if not args.write or will_write or not ok else '   (file left untouched; use --partial or do the rest by hand)'))
        totals['applied'] += ok
        totals['already'] += already
        totals['failed'] += len(bad)
        for i, h, why in bad:
            failures.append((n, why, h['swaps']))
            first = next((ln for ln in h['find'].split('\n') if ln.strip()), '').strip()[:100]
            print(f"             ✗ edit {i}/{total} [{', '.join(h['swaps']) or 'imports / clean-up'}] {why}\n               looking for: {first}")

    print(f"\n{totals['applied']} edit(s) {'applied' if args.write else 'would apply'}, {totals['already']} already in place, "
          f"{totals['failed']} could not be applied.")
    if args.write:
        print(f"{totals['files_written']} file(s) written.")
    if failures:
        print('\nFor every ✗ above, open src/components/illustrations/SWAP_CATALOGUE.md, find the swap id(s) and apply that one by hand —\n'
              'the catalogue shows the exact before/after code for each.')
    if not args.write and totals['applied']:
        print('\nNothing was changed. Re-run with --write to apply.')
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
