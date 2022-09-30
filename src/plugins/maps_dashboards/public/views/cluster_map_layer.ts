/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClusterMapLayer, ClusterMapLayerProps } from "../model/cluster_map_layer";

/**
 * This function will be used to render cluster map on UI. All the relvant props
 * are passed in that are needed by the visualization to be rendered. 
 * sourceAlreadyAdded is a boolean field that will indicate if the layer that is
 * being added currently is based out of the same source (true) as before or a 
 * new source (false).
 */
// TODO: change method props to interface for a cleaner code
export function renderClusterMap(map, layerName, description, sourceName, sourceProps,
    layerType, filter, paint, sourceAlreadyAdded) {
    const clusterMap = new ClusterMapLayer(layerName, description, sourceProps, layerType,
        filter, paint);
    if (!sourceAlreadyAdded) {
        map.addSource(sourceName, clusterMap.sourceLayerToJson);
    }
    map.addLayer(clusterMap.visLayerToJson);
}