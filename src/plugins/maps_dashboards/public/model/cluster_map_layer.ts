/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LAYER_SOURCE_TYPE, LAYER_TYPE } from "../../common";
import { Layer, SourceType } from "./layer";

const sourceProperties = SourceType.geojson;

/**
 * name: user given name for the layer
 * type: for cluster map layer, it is geospatial (get it from LAYER_SOURCE_TYPE enum)
 * description: layer description entered by the user
 * layerType: Fetch it from LAYER_TYPE enum based on what user selected
 * filter: An expression specifying conditions on source features. Only features
 * that match the filter are displayed.
 * paint: paint properties of the layer
 */
export interface ClusterMapLayerProps {
    name: string;
    type: string;
    description: string; 
    layerType: string;
    filter: string[];
    paint: object;
}

function validateSourceProps(sourceProps): boolean {
    for (const [property, value] of sourceProps) {
        if (!(property in sourceProperties)) {
            return false;
        }
    }
    return true;
}

export class ClusterMapLayer extends Layer {
    private sourceProps: [];
    private layerType: string;
    private filter: string[];
    private paint: object; 

    constructor(name: string, description: string, sourceProps: [],
        layerType: string, filter: string[], paint: object) {
        super(name, LAYER_SOURCE_TYPE.CLUSTER, description);
        if (!validateSourceProps(sourceProps)) {
            console.log("property not a part of cluster type");
            return; 
        }
        this.sourceProps = sourceProps;
        this.layerType = 'circle';
        this.filter = filter;
        this.paint = paint;
    }

    sourceLayerToJson() {
        return {
            type: LAYER_SOURCE_TYPE.CLUSTER,
            ...this.sourceProps        
        }
    }

    visLayerToJson() {
        return {
            id: this.id,
            type: this.layerType,
            filter: this.filter,
            paint: this.paint
        }
    }

}
