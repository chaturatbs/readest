import { describe, expect, it } from 'vitest';
import { getFeed } from 'foliate-js/opds.js';
import type { OPDSFeed } from '@/types/opds';
import { attachNavigationImages, parseOPDSXML } from '@/app/opds/utils/opdsUtils';

// Shape of a Kavita library page: each series links to a sub-catalog and
// carries cover/thumbnail links, but has no acquisition link.
const kavitaLibrary = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Fiction</title>
  <entry>
    <title>Piranesi</title>
    <id>1</id>
    <content type="text">Format: Epub Summary: A house of infinite halls</content>
    <link rel="subsection" type="application/atom+xml;profile=opds-catalog;kind=navigation" href="/api/opds/key/series/1"/>
    <link rel="http://opds-spec.org/image" type="image/jpeg" href="/api/image/series-cover?seriesId=1"/>
    <link rel="http://opds-spec.org/image/thumbnail" type="image/jpeg" href="/api/image/series-cover?seriesId=1&amp;thumb=1"/>
  </entry>
  <entry>
    <title>On Deck</title>
    <id>2</id>
    <link rel="subsection" type="application/atom+xml;profile=opds-catalog;kind=navigation" href="/api/opds/key/on-deck"/>
  </entry>
</feed>`;

describe('attachNavigationImages', () => {
  it('keeps the cover of a navigation entry that links to a sub-catalog', () => {
    const doc = parseOPDSXML(kavitaLibrary);
    const feed = attachNavigationImages(doc, getFeed(doc) as OPDSFeed);

    expect(feed.publications).toBeUndefined();
    const [series, onDeck] = feed.navigation!;
    expect(series!.title).toBe('Piranesi');
    expect(series!.href).toBe('/api/opds/key/series/1');
    expect(series!.images?.map((img) => img.href)).toEqual([
      '/api/image/series-cover?seriesId=1',
      '/api/image/series-cover?seriesId=1&thumb=1',
    ]);
    expect(onDeck!.images).toBeUndefined();
  });
});
