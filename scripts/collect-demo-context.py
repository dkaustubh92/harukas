#!/usr/bin/env python3
"""Collect read-only HRM context for fictional demo reports; never write to HRM."""
import argparse
import concurrent.futures
import hashlib
import json
import math
from pathlib import Path
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/demo-context'
CATALOG = json.loads((ROOT / '.claude/skills/halifax-data/catalog.json').read_text())['public']
URLS = {x['service']: x['url'] for x in CATALOG}
R = 6371008.8

def fetch(url, params):
    query = urllib.parse.urlencode(params)
    request = urllib.request.Request(url + '?' + query, headers={'User-Agent': 'HaruKasDemoContext/1.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        body = json.load(response)
    if 'error' in body:
        raise RuntimeError(str(body['error']))
    return body

def features(service, params):
    result, offset = [], 0
    while True:
        page = fetch(URLS[service] + '/query', {**params, 'f':'geojson', 'outSR':4326,
            'resultRecordCount':2000, 'resultOffset':offset, 'orderByFields':'OBJECTID'})
        batch = page.get('features', [])
        result.extend(batch)
        if not page.get('exceededTransferLimit') and len(batch) < 2000:
            return result
        if not batch:
            return result
        offset += len(batch)

def save(name, value):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT/name).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'))+'\n')

def collection(items):
    return {'type':'FeatureCollection','features':items}

def closest_point(lon, lat, geometry):
    """Local tangent-plane segment projection; sufficient for small demo distances."""
    scale_x = R * math.cos(math.radians(lat)) * math.pi / 180
    scale_y = R * math.pi / 180
    lines = [geometry['coordinates']] if geometry['type']=='LineString' else geometry['coordinates']
    best = None
    for line in lines:
        for a,b in zip(line,line[1:]):
            ax,ay=(a[0]-lon)*scale_x,(a[1]-lat)*scale_y
            bx,by=(b[0]-lon)*scale_x,(b[1]-lat)*scale_y
            dx,dy=bx-ax,by-ay
            den=dx*dx+dy*dy
            t=max(0,min(1,-(ax*dx+ay*dy)/den)) if den else 0
            x,y=ax+t*dx,ay+t*dy
            candidate=(math.hypot(x,y), lon+x/scale_x, lat+y/scale_y)
            if best is None or candidate[0]<best[0]:best=candidate
    return best

def primary_road(label):
    primary = label.split(' near ')[0]
    if primary == 'Lake Banook path':return 'MICMAC'
    words = primary.split()
    if words[-1] in ['Street','Road','Boulevard','Drive','Avenue']:words.pop()
    return ' '.join(words).upper().replace('ST.', 'ST')

def haversine(a,b):
    lon1,lat1,lon2,lat2=map(math.radians,[*a,*b])
    d=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 2*R*math.asin(min(1,math.sqrt(d)))

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--locations-only',action='store_true',help='Propose road-backed fixture locations before collecting trees.')
    args=parser.parse_args()
    source=ROOT/'data/demo-incidents.json'
    reports=json.loads(source.read_text())
    now=datetime.now(timezone.utc).isoformat()
    previous=OUT/'location-suggestions.json'
    previous_rows={x['id']:x for x in json.loads(previous.read_text())['reports']} if previous.exists() else {}
    names={primary_road(x['location']['label']) for x in reports if x['id'] not in previous_rows}
    names.update(x['roadName'] for x in previous_rows.values())
    quoted=','.join("'"+x.replace("'","''")+"'" for x in sorted(names))
    roads=features('StreetNetwork',{'where':f'UPPER(STR_NAME) IN ({quoted})',
        'outFields':'OBJECTID,STR_NAME,STR_TYPE,FULL_NAME,STR_STATUS,MODDATE'})
    if not roads:raise RuntimeError('No road geometry returned')
    save('roads.geojson',collection(roads))
    suggestions=[]
    for report in reports:
        loc=report['location'];road_name=previous_rows.get(report['id'],{}).get('roadName',primary_road(loc['label']))
        matches=[]
        for road in roads:
            if road['properties']['STR_NAME'].upper().replace('ST.','ST')==road_name:
                projected=closest_point(loc['longitude'],loc['latitude'],road['geometry'])
                if projected:matches.append((projected,road))
        if not matches:raise RuntimeError(f'No road match for {report["reference"]}: {road_name}')
        projected,road=min(matches,key=lambda x:x[0][0]); distance,lon,lat=projected
        suggestions.append({'id':report['id'],'reference':report['reference'],'roadName':road_name,
            'roadObjectId':road['properties']['OBJECTID'],'roadFullName':road['properties']['FULL_NAME'],
            'latitude':round(lat,6),'longitude':round(lon,6),
            'label':road['properties']['FULL_NAME'].title()+' area, HRM',
            'originalLabel':previous_rows.get(report['id'],{}).get('originalLabel',loc['label']),
            'distanceFromInputMeters':round(distance,1),
            'note':'Approximate fictional incident placement on real road geometry. Not a verified incident or tree asset.'})
    save('location-suggestions.json',{'collectedAt':now,'source':URLS['StreetNetwork'],
        'method':'Nearest segment on the intended named road, using a local tangent-plane distance in metres.',
        'reports':suggestions})
    print(f'Collected {len(roads)} named-road segments; prepared {len(suggestions)} location suggestions.')
    if args.locations_only:return
    for report, proposed in zip(reports, suggestions):
        current=report['location']
        if haversine([current['longitude'],current['latitude']],
                     [proposed['longitude'],proposed['latitude']])>2:
            raise RuntimeError('Apply road-backed location suggestions to the fixtures before collecting tree context.')
    tree_info=fetch(URLS['Public_Trees'],{'f':'json'})
    domains={x['name']:{str(v['code']):v['name'] for v in (x.get('domain') or {}).get('codedValues',[])}
             for x in tree_info['fields'] if x['name'] in ['DBH','WIRES','ASSETCODE','ASSETSTAT']}
    fields='OBJECTID,ASSETID,TREEID,ASSETCODE,ASSETSTAT,SP_SCIEN,SP_COMM,DBH,WIRES,OWNER,MAINTBY,MODDATE'
    def nearby(report):
        loc=report['location'];lon,lat=loc['longitude'],loc['latitude']
        dy=150/111195;dx=dy/math.cos(math.radians(lat))
        return features('Public_Trees',{'where':"ASSETCODE='TRE' AND ASSETSTAT='INS'",'outFields':fields,
            'geometry':f'{lon-dx},{lat-dy},{lon+dx},{lat+dy}', 'geometryType':'esriGeometryEnvelope',
            'inSR':4326,'spatialRel':'esriSpatialRelIntersects'})
    trees={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for batch in pool.map(nearby,reports):
            for feature in batch:
                p=feature['properties'];p['dbhLabel']=domains['DBH'].get(str(p.get('DBH')),'Unknown diameter band')
                p['wiresLabel']=domains['WIRES'].get(str(p.get('WIRES')),'Unknown')
                trees[p['OBJECTID']]=feature
    tree_list=[trees[key] for key in sorted(trees)]
    save('trees.geojson',collection(tree_list))
    joins=[]
    for report in reports:
        loc=report['location'];point=[loc['longitude'],loc['latitude']]
        ranked=sorted((haversine(point,t['geometry']['coordinates']),t['properties']['OBJECTID']) for t in tree_list)
        candidate=ranked[0] if ranked and ranked[0][0]<=60 else None
        joins.append({'reportId':report['id'],'reference':report['reference'],
            'candidateTreeObjectId':candidate[1] if candidate else None,
            'candidateDistanceMeters':round(candidate[0],1) if candidate else None,
            'matchStatus':'candidate_only' if candidate else 'no_candidate_within_60m',
            'source':URLS['Public_Trees'],'collectedAt':now,
            'warning':'Nearby inventory context only. Fictional incidents cannot establish actual tree damage or identity.'})
    save('report-context.json',{'reports':joins})
    save('manifest.json',{'collectedAt':now,'fixtureSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'crs':'EPSG:4326','kind':'real_geographic_context_for_fictional_incidents',
        'sources':{'trees':URLS['Public_Trees'],'roads':URLS['StreetNetwork']},
        'counts':{'reports':len(reports),'trees':len(trees),'roadSegments':len(roads),
                  'candidateMatches':sum(x['candidateTreeObjectId'] is not None for x in joins)},
        'selection':{'treeEnvelopeHalfWidthMeters':150,'candidateMaximumDistanceMeters':60,
            'treesWhere':"ASSETCODE='TRE' AND ASSETSTAT='INS'",'roadNames':sorted(names)},'domains':domains,
        'attribution':'Contains information licensed under the Halifax Regional Municipality Open Data Licence. Data © Halifax Regional Municipality.',
        'licenseUrl':'https://data-hrm.hub.arcgis.com/pages/open-data-licence',
        'limitations':['Road and tree context is a collection snapshot, not live operational data.',
            'Nearby trees are candidate context, not confirmed incident assets.',
            'No traffic, utility network, property jurisdiction, tree condition, or closure inference.',
            'DBH is a published diameter band, not an exact measurement. Unknown codes remain unknown.',
            'Approximate source coordinates do not establish safe or unsafe locations.']})
    print(f'Cached {len(trees)} trees; {sum(x["candidateTreeObjectId"] is not None for x in joins)}/{len(reports)} candidate matches within60m.')

if __name__=='__main__':main()
