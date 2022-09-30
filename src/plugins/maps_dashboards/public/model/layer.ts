/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {v4 as uuidv4} from 'uuid';

/**
 * Sources state which data the map should display. Layers refer to a
 * source and give it a visual representation. This makes it possible
 * to style the same source in different ways.
 * Refer: https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/
 * 
 * The properties under each of the source types can be fetched from
 * the UI based on the user selection. 
 * TODO: While adding the corresponding views for source type properties,
 * annotate each of them with required/optional field type.
 */
export const SourceType = {
    vector: ["attribution", "bounds", "maxzoom", "minzoom", "promoteId",
    "scheme", "tiles", "url", "volatile"],
    raster: ["attribution", "bounds", "maxzoom", "minzoom", "scheme",
    "tileSize", "tiles", "url", "volatile"],
    geojson: ["attribution", "buffer", "cluster", "clusterMaxZoom", "clusterMinPoints",
    "clusterProperties", "clusterRadius", "data", "filter", "generateId", "lineMetrics",
    "maxzoom", "promoteId", "tolerance"]
}

export class Layer {
    public name: string;
    public description: string;
    protected id: string;
    protected type: string;
    private createdTime: Date;

    constructor(name: string, type: string, description: string) {
        this.createdTime = new Date();
        this.name = name;
        this.id = uuidv4();
        this.type = type;
        this.description = description;
    }
}