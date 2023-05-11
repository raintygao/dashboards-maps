/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Map as Maplibre } from 'maplibre-gl';
import { parse } from 'wellknown';
import { ClusterLayerSpecification } from './mapLayerType';
import { convertGeoPointToGeoJSON, isGeoJSON } from '../utils/geo_formater';
import { addCircleLayer, hasLayer, updateCircleLayer } from './map/layer_operations';

interface MaplibreRef {
  current: Maplibre | null;
}
// https://opensearch.org/docs/1.3/opensearch/supported-field-types/geo-shape
const openSearchGeoJSONMap = new Map<string, string>([
  ['point', 'Point'],
  ['linestring', 'LineString'],
  ['polygon', 'Polygon'],
  ['multipoint', 'MultiPoint'],
  ['multilinestring', 'MultiLineString'],
  ['multipolygon', 'MultiPolygon'],
  ['geometrycollection', 'GeometryCollection'],
]);

const getFieldValue = (data: any, name: string) => {
  if (!name) {
    return undefined;
  }
  const keys = name.split('.');
  return keys.reduce((pre, cur) => {
    return pre?.[cur];
  }, data);
};

const getGeoFieldType = (layerConfig: ClusterLayerSpecification) => {
  return layerConfig?.source?.geoFieldType;
};

const getGeoFieldName = (layerConfig: ClusterLayerSpecification) => {
  return layerConfig?.source?.geoFieldName;
};

const buildGeometry = (fieldType: string, location: any) => {
  if (isGeoJSON(location)) {
    return {
      type: openSearchGeoJSONMap.get(location.type?.toLowerCase()),
      coordinates: location.coordinates,
    };
  }

  if (typeof location === 'string') {
    // Check if location is WKT format
    const geometry = parse(location);
    if (geometry) {
      return geometry;
    }
  }
  // Geopoint supports other format like object, string, array,
  if (fieldType === 'geo_point') {
    // convert other supported formats to GeoJSON
    return convertGeoPointToGeoJSON(location);
  }
  // We don't support any other format
  return undefined;
};

const buildProperties = (document: any, fields: string[]) => {
  const property: { [name: string]: any } = {};
  if (!fields) {
    return property;
  }
  fields.forEach((field) => {
    const fieldValue: string | undefined = getFieldValue(document._source, field);
    if (fieldValue !== undefined) {
      property[field] = fieldValue;
    }
  });
  return property;
};

const getLayerSource = (data: any, layerConfig: ClusterLayerSpecification) => {
  const geoFieldName = getGeoFieldName(layerConfig);
  const geoFieldType = getGeoFieldType(layerConfig);
  const featureList: any = [];
  data.forEach((item: any) => {
    const geoFieldValue = getFieldValue(item._source, geoFieldName);
    const geometry = buildGeometry(geoFieldType, geoFieldValue);
    const fields: string[] = [];
    if (geometry) {
      const feature = {
        geometry,
        properties: buildProperties(item, fields),
      };
      featureList.push(feature);
    }
  });
  return {
    type: 'FeatureCollection',
    features: featureList,
  };
};

const addNewLayer = (
  layerConfig: ClusterLayerSpecification,
  maplibreRef: MaplibreRef,
  data: any,
  beforeLayerId: string | undefined
) => {
  const maplibreInstance = maplibreRef.current;
  if (!maplibreInstance) {
    return;
  }
  const source = getLayerSource(data, layerConfig);
  maplibreInstance.addSource(layerConfig.id, {
    type: 'geojson',
    data: source,
  });
  addCircleLayer(maplibreInstance, {
    fillColor: layerConfig.style?.fillColor,
    maxZoom: layerConfig.zoomRange[1],
    minZoom: layerConfig.zoomRange[0],
    opacity: layerConfig.opacity,
    outlineColor: layerConfig.style?.borderColor,
    radius: layerConfig.style?.markerSize,
    sourceId: layerConfig.id,
    visibility: layerConfig.visibility,
    width: layerConfig.style?.borderThickness,
  });
};

const updateLayer = (
  layerConfig: ClusterLayerSpecification,
  maplibreRef: MaplibreRef,
  data: any
) => {
  const maplibreInstance = maplibreRef.current;
  if (maplibreInstance) {
    const dataSource = maplibreInstance?.getSource(layerConfig.id);
    if (dataSource) {
      // @ts-ignore
      dataSource.setData(getLayerSource(data, layerConfig));
    }
    updateCircleLayer(maplibreInstance, {
      fillColor: layerConfig.style.fillColor,
      maxZoom: layerConfig.zoomRange[1],
      minZoom: layerConfig.zoomRange[0],
      opacity: layerConfig.opacity,
      outlineColor: layerConfig.style.borderColor,
      radius: layerConfig.style?.markerSize,
      sourceId: layerConfig.id,
      visibility: layerConfig.visibility,
      width: layerConfig.style.borderThickness,
    });
  }
};

// The function to render point, line and shape layer for document layer
const renderMarkerLayer = (
  maplibreRef: MaplibreRef,
  layerConfig: ClusterLayerSpecification,
  data: any,
  beforeLayerId: string | undefined
) => {
  if (hasLayer(maplibreRef.current!, layerConfig.id)) {
    updateLayer(layerConfig, maplibreRef, data);
  } else {
    addNewLayer(layerConfig, maplibreRef, data, beforeLayerId);
  }
};

export const ClusterLayerFunctions = {
  render: (
    maplibreRef: MaplibreRef,
    layerConfig: ClusterLayerSpecification,
    data: any,
    beforeLayerId: string | undefined
  ) => {
    renderMarkerLayer(maplibreRef, layerConfig, data, beforeLayerId);
  },
};
