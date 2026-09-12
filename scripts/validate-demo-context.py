#!/usr/bin/env python3
"""Validate the cached HRM geometry and its joins to the current demo fixtures."""
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'public/demo-context'


def read(name):
    return json.loads((CACHE / name).read_text())


def distance(point, other):
    lon1, lat1, lon2, lat2 = map(math.radians, [*point, *other])
    half_chord = (math.sin((lat2-lat1)/2)**2
                  + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2)
    return 12742017.6 * math.asin(min(1, math.sqrt(half_chord)))


def main():
    fixture_bytes = (ROOT / 'data/demo-incidents.json').read_bytes()
    reports = json.loads(fixture_bytes)
    manifest = read('manifest.json')
    assert hashlib.sha256(fixture_bytes).hexdigest() == manifest['fixtureSha256'], 'Stale context: fixture changed'
    trees = read('trees.geojson')['features']
    roads = read('roads.geojson')['features']
    joins = read('report-context.json')['reports']
    assert len(reports) == len(joins) == manifest['counts']['reports'] == 25
    assert len(trees) == manifest['counts']['trees']
    assert len(roads) == manifest['counts']['roadSegments']
    for features in [trees, roads]:
        assert len({f['properties']['OBJECTID'] for f in features}) == len(features)
        for f in features:
            geometry = f['geometry']
            if geometry['type'] == 'Point':
                points = [geometry['coordinates']]
            elif geometry['type'] == 'LineString':
                points = geometry['coordinates']
            else:
                assert geometry['type'] == 'MultiLineString'
                points = [p for line in geometry['coordinates'] for p in line]
            assert points
            for point in points:
                assert all(math.isfinite(x) for x in point[:2])
                assert -180 <= point[0] <= 180 and -90 <= point[1] <= 90
    for tree in trees:
        p = tree['properties']
        assert p['ASSETCODE'] == 'TRE' and p['ASSETSTAT'] == 'INS'
        assert p['dbhLabel'] == manifest['domains']['DBH'].get(str(p['DBH']), 'Unknown diameter band')
    by_report = {r['id']: r for r in reports}
    assert {j['reportId'] for j in joins} == set(by_report)
    for join in joins:
        location = by_report[join['reportId']]['location']
        point = [location['longitude'], location['latitude']]
        nearest = min((distance(point, t['geometry']['coordinates']), t['properties']['OBJECTID']) for t in trees)
        if nearest[0] <= 60:
            assert join['candidateTreeObjectId'] == nearest[1]
            assert abs(join['candidateDistanceMeters']-nearest[0]) <= 0.051
            assert join['matchStatus'] == 'candidate_only'
        else:
            assert join['candidateTreeObjectId'] is None and join['candidateDistanceMeters'] is None
            assert join['matchStatus'] == 'no_candidate_within_60m'
    matched = sum(j['candidateTreeObjectId'] is not None for j in joins)
    assert matched == manifest['counts']['candidateMatches']
    print(f'PASS: {len(reports)} reports, {len(trees)} trees, {len(roads)} road segments, {matched} candidate joins.')
    print('Checked fixture hash, unique IDs, WGS84 geometry, inventory domains, and every nearest-tree result.')


if __name__ == '__main__':
    main()
