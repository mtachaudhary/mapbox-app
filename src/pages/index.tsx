import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Map, {
  Marker, 
  Source, 
  Layer, 
  NavigationControl, 
  Popup, 
  GeolocateControl, 
  FullscreenControl, 
  ScaleControl
} from 'react-map-gl';
import Head from 'next/head'

// import {updatePercentiles} from '@/utils/utils';
import {updatePercentiles} from '@/utils/utils';
import {
  dataLayer, 
  clusterLayer, 
  clusterCountLayer, 
  unclusteredPointLayer,
  countiesLayer,
  highlightLayer
} from '@/utils/layers';

import styles from '@/styles/Home.module.css'
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Home() {

  const [year, setYear] = useState(2015);
  const [allData, setAllData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [lng, setLng] = useState(-100);
  const [lat, setLat] = useState(40);
  const [zoom, setZoom] = useState(3.5);

  const [mapType, setMapType] = useState('geojson');
  const [interactiveLayerIds, setInteractiveLayerId] = useState(null);

  useEffect(() => {
    /* global fetch */
    fetch(
      'https://raw.githubusercontent.com/uber/react-map-gl/master/examples/.data/us-income.geojson'
    )
      .then(resp => resp.json())
      .then(json => setAllData(json))
      .catch(err => console.error('Could not load data', err)); // eslint-disable-line
  }, []);

  // Handle map onHover
  const onHover = useCallback(event => {
    if ( mapType === 'geojson') {
      const {
        features,
        point: {x, y}
      } = event;
      const hoveredFeature = features && features[0];

      // prettier-ignore
      setHoverInfo(hoveredFeature && {feature: hoveredFeature, x, y});
    } else if ( mapType === 'highlight') {
      const county = event.features && event.features[0];
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        countyName: county && county.properties.COUNTY
      });
    }
  }, [mapType]);

  // Collect data for GeoJSON
  const data = useMemo(() => {
    return allData && updatePercentiles(allData, f => f.properties.income[year]);
  }, [allData, year]);

  // Handle select dropdown
  const handleMapType = (event) => {
    setMapType(event.target.value);
  }

  // Set layer interactive ids
  useEffect(() => {
    if ( mapType === 'geojson' ) {
      setInteractiveLayerId(['data']);
    } else if ( mapType === 'clusters' ) {
      setInteractiveLayerId([clusterLayer.id]);
    } else if ( mapType === 'highlight' ) {
      setInteractiveLayerId(['counties']);
    }
  }, [mapType]);

  // Highlight By Filter
  const selectedCounty = (hoverInfo && hoverInfo.countyName) || '';
  const filter = useMemo(() => ['in', 'COUNTY', selectedCounty], [selectedCounty]);

  return (
    <>
      <Head>
        <title>Mapbox App</title>
      </Head>
      <main>
        <div>
          <select className={styles.mapTypeSelect} value={mapType} onChange={handleMapType}>
            <option value='geojson'>GeoJSON</option>
            <option value='clusters'>Clusters</option>
            <option value='highlight'>Highlight By Filter</option>
          </select>
        </div>

        <Map
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: zoom
          }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          interactiveLayerIds={interactiveLayerIds}
          onMouseMove={onHover}
          style={{height: 768}}
        >
          <Marker longitude={lng} latitude={lat} color="red" />
          {mapType === 'geojson' &&
            <Source id='geojson-data' type='geojson' data={data}>
              <Layer {...dataLayer} />
            </Source>
          }

          {mapType === 'clusters' &&
            <Source 
              id='earthquakes'
              type='geojson' 
              data='https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={50}
            >
              <>
                <Layer {...clusterLayer} />
                <Layer {...clusterCountLayer} />
                <Layer {...unclusteredPointLayer} />
              </>
            </Source>
          }

          {mapType === 'highlight' &&
            <Source type="vector" url="mapbox://mapbox.82pkq93d">
              <Layer beforeId="waterway-label" {...countiesLayer} />
              <Layer beforeId="waterway-label" {...highlightLayer} filter={filter} />
            </Source>
          }
          {selectedCounty && (
            <Popup
              longitude={hoverInfo.longitude}
              latitude={hoverInfo.latitude}
              offset={[0, -10]}
              closeButton={false}
              className="county-info"
            >
              {selectedCounty}
            </Popup>
          )}
          <GeolocateControl />
          <FullscreenControl />
          <NavigationControl />
          <ScaleControl />
        </Map>

      </main>
    </>
  )
}
