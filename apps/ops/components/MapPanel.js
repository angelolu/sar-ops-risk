import mapboxgl from 'mapbox-gl';
import proj4 from 'proj4';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconButton, textStyles, ThemeContext } from 'calsar-ui';
import 'mapbox-gl/dist/mapbox-gl.css';

let markerBounds = new mapboxgl.LngLatBounds();

const MapPanel = ({ markers, resizeRequest, resizeDone, removeMarker }) => {
    const mapContainerRef = useRef();
    const mapRef = useRef();

    const { colorTheme, colorScheme } = useContext(ThemeContext);

    const { width } = useWindowDimensions();
    const styles = getStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);

    const [mapMarkers, setMapMarkers] = useState([]);
    const [mapItems, setMapItems] = useState([]);

    useEffect(() => {
        if (resizeRequest && mapRef.current) {
            mapRef.current.resize();
            if (markerBounds && !markerBounds.isEmpty()) {
                mapRef.current.fitBounds(markerBounds, {
                    padding: 25,
                    pitch: mapRef.current.getPitch(),
                    bearing: mapRef.current.getBearing()
                });
            }
            resizeDone();
        }
    }, [resizeRequest, mapRef.current]);

    useEffect(() => {
        const apiKey = process.env.EXPO_PUBLIC_MAPBOX_API;
        mapboxgl.accessToken = apiKey;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            zoom: 7,
            maxZoom: 17,
            center: [-122.4376, 37.7577],
            //style: 'mapbox://styles/mapbox/outdoors-v12'
            style: colorScheme === 'light' ? `mapbox://styles/calsar-angelolu/cm7r41ta300gy01smfom8euhj` : 'mapbox://styles/calsar-angelolu/cm77ego3i00ex01sq3xo4etav'
        });

        const nav = new mapboxgl.NavigationControl({
            showZoom: false,
            visualizePitch: true
        });
        mapRef.current.addControl(nav, 'bottom-right');

        const scale = new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'imperial'
        });
        mapRef.current.addControl(scale, 'bottom-left');

        return () => {
            mapRef.current.remove();
        }

    }, []);

    useEffect(() => {
        // Markers are arrays of objects with the properties location, name, description, color
        // Keep mapMarkers, an array of mapboxgl Markers in sync with the markers prop
        if (markers) {
            if (markers.length === 0) {
                setMapMarkers([]);
                setMapItems([]);
            } else {
                let currentMapMarkers = [...mapMarkers];
                let currentMapItems = [...mapItems];

                let currentIds = currentMapItems.map(item => item.id);
                let newIds = markers.map(item => item.id);
                let toRemove = currentIds.filter(id => !newIds.includes(id));
                let toAdd = markers.filter(item => !currentIds.includes(item.id));
                let toUpdate = markers.filter(item => currentIds.includes(item.id));
                toRemove.forEach(id => {
                    let index = currentMapItems.findIndex(item => item.id === id);
                    currentMapMarkers[index].remove();
                    currentMapMarkers.splice(index, 1);
                    currentMapItems.splice(index, 1);
                });
                toAdd.forEach(item => {
                    const locationObj = validateLocationString(item.location, false);
                    if (locationObj) {
                        const locArray = locationObj.locArray;
                        let secondaryLocationText = "";
                        if (locationObj.type === "UTM") {
                            secondaryLocationText = `${locArray[1].toFixed(5)} ${locArray[0].toFixed(5)}`;
                        } else {
                            let { zoneNumber, zoneLetter } = calculateUTMZone(locArray[0], locArray[1]);
                            const wgs84 = 'EPSG:4326';
                            const utm = 'EPSG:326' + zoneNumber;
                            const [longitude, latitude] = proj4(wgs84, utm, [locArray[0], locArray[1]]);

                            secondaryLocationText = `${zoneNumber}${zoneLetter} ${Math.round(longitude)}E ${Math.round(latitude)}N`;
                        }

                        let newMarker = new mapboxgl.Marker({ color: item.color || 'grey' })
                            .setLngLat(locArray)
                            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${item.name || "Unnamed"}</h3><p>${item.location}</br>${secondaryLocationText}<p><p>${item.description || "No description"}</p>`))
                            .addTo(mapRef.current);
                        currentMapMarkers.push(newMarker);
                        currentMapItems.push(item);
                    }
                });
                toUpdate.forEach(item => {
                    let index = currentMapItems.findIndex(marker => marker.id === item.id);
                    const locationObj = validateLocationString(item.location, false);
                    if (locationObj) {
                        const locArray = locationObj.locArray;
                        let secondaryLocationText = "";
                        if (locationObj.type === "UTM") {
                            secondaryLocationText = `${locArray[1].toFixed(5)} ${locArray[0].toFixed(5)}`;
                        } else {
                            let { zoneNumber, zoneLetter } = calculateUTMZone(locArray[0], locArray[1]);
                            const wgs84 = 'EPSG:4326';
                            const utm = 'EPSG:326' + zoneNumber;
                            const [longitude, latitude] = proj4(wgs84, utm, [locArray[0], locArray[1]]);

                            secondaryLocationText = `${zoneNumber}${zoneLetter} ${Math.round(longitude)}E ${Math.round(latitude)}N`;
                        }

                        currentMapItems[index] = item;
                        currentMapMarkers[index].setLngLat(locArray);
                        currentMapMarkers[index].setPopup(new mapboxgl.Popup().setHTML(`<h3>${item.name || "Unnamed"}</h3><p>${item.location}</br>${secondaryLocationText}<p><p>${item.description || "No description"}</p>`));
                    }
                });
                setMapMarkers(currentMapMarkers);
                setMapItems(currentMapItems);

                if (currentMapMarkers.length > 0) {
                    // Update markerBounds
                    markerBounds = new mapboxgl.LngLatBounds();
                    currentMapMarkers.forEach(marker => {
                        markerBounds.extend(marker.getLngLat());
                    });
                    if (markerBounds && !markerBounds.isEmpty()) {
                        mapRef.current.fitBounds(markerBounds, {
                            padding: 25,
                            pitch: mapRef.current.getPitch(),
                            bearing: mapRef.current.getBearing()
                        });
                    }
                }
            }
        }
    }, [markers]);

    // Make a shallow copy of mapItems and sort it
    let sortedMapItems = [...mapItems];
    // sort markers by type alphabetically and within type by name alphabetically
    sortedMapItems.sort((a, b) => { return a.type.localeCompare(b.type) || (a.name ? a.name.localeCompare(b.name) : a.id.localeCompare(b.id)) });
    let markerList = [];
    let tempList = [];
    let currentMarkerType = "";
    let currentMarkerColor = "";

    sortedMapItems.forEach(marker => {
        if (marker.type !== currentMarkerType) {
            if (tempList.length > 0) {
                markerList.push(
                    <Text key={Date.now() + currentMarkerType} style={[textStyle.sectionTitleText]}>{currentMarkerType || "No type"}</Text>
                );
                markerList.push(tempList);
                tempList = [];
            }
            currentMarkerType = marker.type;
            currentMarkerColor = marker.color;
        }
        tempList.push(<View key={marker.id} style={styles.markerRow}>
            <Pressable
                style={styles.markerInfo}
                onPress={() => {
                    // Find the index of the marker in mapItems
                    const index = mapItems.findIndex(item => item.id === marker.id);
                    // Open the popup
                    mapMarkers[index].togglePopup();
                }}>
                <View style={[styles.circle, { backgroundColor: currentMarkerColor || colorTheme.primary }]} />
                <Text style={[textStyle.text, { flexShrink: 0 }]} numberOfLines={1}>{marker.name || "Unnamed"}</Text>
                <>{marker.description && <Text style={[textStyle.secondaryText]} numberOfLines={1}>{marker.description}</Text>}</>
            </Pressable>
            <IconButton small ionicons_name={"eye-off"} onPress={() => { removeMarker(marker.id) }} />
        </View>);
    });
    if (tempList.length > 0) {
        markerList.push(
            <Text key={Date.now() + currentMarkerType} style={[textStyle.sectionTitleText]}>{currentMarkerType || "No type"}</Text>
        );
        markerList.push(tempList);
    }
    return (
        <View style={styles.container}>
            <View
                style={{ flex: sortedMapItems.length > 4 ? 2 : 3, width: '100%' }}
                ref={mapContainerRef}
                className="map-container"
            />
            <ScrollView
                style={[styles.background]}
                contentContainerStyle={[styles.mainScroll]}>
                <Text style={[textStyle.rowTitleText, { paddingBottom: 8 }]}>Map items</Text>
                {markerList}
                <Text style={[textStyle.tertiaryText, { paddingTop: 10 }]}>Tip: hold Ctrl and drag to adjust map pitch</Text>
            </ScrollView>
        </View>
    );
};

export const validateLocationString = (locationString, log = false) => {
    if (log) console.log("Validating location string", locationString);
    if (!locationString) {
        if (log) console.log("Invalid location string: empty");
        return null;
    }
    let utmObject = parseNATOUTM(locationString);
    if (utmObject !== null) {
        const wgs84 = 'EPSG:4326';
        const utm = 'EPSG:326' + utmObject.zoneNumber;
        // Convert to [longitude, latitude]
        const [longitude, latitude] = proj4(utm, wgs84, [utmObject.easting, utmObject.northing]);
        if (longitude && latitude) {
            return {
                type: "UTM",
                locArray: [longitude, latitude]
            };
        } else {
            return null;
        }
    } else {
        // take in location string, return array of [longitude, latitude] if it is valid, otherwise return null
        // Remove commas from the string and split by space
        const locationArray = locationString.replace(/,/g, '').split(" ");
        if (locationArray.length !== 2) {
            if (log) console.log("Invalid location string: not two values");
            return null;
        }
        const latitude = parseFloat(locationArray[0]);
        const longitude = parseFloat(locationArray[1]);
        if (isNaN(longitude) || isNaN(latitude)) {
            if (log) console.log("Invalid location string: not a number");
            return null;
        }
        // longitude must be between -180 and 180, latitude must be between -90 and 90
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
            if (log) console.log("Invalid location string: out of range initial");
            // Maybe the user flipped it? If it's in the right range, return it flipped
            if (latitude < -180 || latitude > 180 || longitude < -90 || longitude > 90) {
                if (log) console.log("Invalid location string: out of range flipped");
                return null;
            }
        }
        return {
            type: "longlat",
            locArray: [longitude, latitude]
        };
    }


}

const validLatBands = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

function calculateUTMZone(longitude, latitude) {
    const zoneNumber = Math.floor((longitude + 180) / 6) + 1;

    let zoneLetter = '';
    const latitudeBand = Math.floor((latitude + 80) / 8);

    if (latitudeBand >= 0 && latitudeBand < 20) {
        zoneLetter = validLatBands[latitudeBand];
    } else if (latitude >= 72) {
        zoneLetter = 'X';
    } else if (latitude <= -72) {
        zoneLetter = 'C';
    } else {
        // Handle cases outside the standard latitude bands (e.g., polar regions)
        console.error("Latitude is out of range for UTM");
        return null; // Or throw an error
    }

    return { zoneNumber, zoneLetter };
}

function parseNATOUTM(UTMString) {
    // NATO UTM string is in the format "ZoneNumber ZoneLetter Easting Northing" (ex. 10S 0593913E 4191590N)
    // But ZoneNumber and ZoneLetter may be combined
    // ZoneLetter may be omitted in the classical UTM definition (in which case it is assumed to be northern hemisphere)
    // Return an object with the properties zoneNumber, zoneLetter, easting, northing
    const parts = UTMString.split(" ");
    if (parts.length < 3) {
        // Invalid UTM string: not enough parts
        return null;
    }
    let zoneNumber = null;
    let zoneLetter = null;
    let easting = null;
    let northing = null;
    // Check if the last character of the first part is a letter
    // If it is, then the zone number and letter are combined
    if (isNaN(parts[0][parts[0].length - 1])) {
        // ZoneNumber and ZoneLetter are combined
        const zone = parts[0];
        if (zone.length < 3) {
            // Invalid UTM string: zone number too short
            return null;
        }
        zoneNumber = parseInt(zone.substring(0, zone.length - 1));
        zoneLetter = zone[zone.length - 1];
    } else {
        if (parts.length === 3) {
            // Assume the zone letter is omitted
        } else {
            zoneLetter = parts[1];
        }
        zoneNumber = parseInt(parts[0]);
    }
    if (zoneNumber < 1 || zoneNumber > 60) {
        return null;
    }
    if (zoneLetter && (zoneLetter.charCodeAt(0) < 'C'.charCodeAt(0) || zoneLetter.charCodeAt(0) > 'X'.charCodeAt(0))) {
        // Invalid UTM string: zone letter out of range
        return null;
    }
    easting = parseInt(parts[parts.length - 2].substring(0, parts[parts.length - 2].length - 1));
    northing = parseInt(parts[parts.length - 1].substring(0, parts[parts.length - 1].length - 1));

    // Check that both easting and northing are numbers
    if (isNaN(easting) || isNaN(northing)) {
        // Invalid UTM string: easting or northing is not a number
        return null;
    }

    // Northings can't be negative
    if (northing < 0) {
        // Invalid UTM string: northing is negative
        return null;
    }

    return { zoneNumber, zoneLetter, easting, northing };

    // TODO: default hemisphere is northern, add support for southern hemisphere
}


const getStyles = (colorTheme) => {

    return StyleSheet.create({
        container: {
            height: '100%',
            width: '100%',
            flexDirection: 'column'
        },
        background: {
            flex: 1,
            width: '100%',
            backgroundColor: colorTheme.background
        },
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 16,
            paddingLeft: 20,
            gap: 0,
        },
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        markerRow: {
            flexDirection: "row",
            gap: 8,
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        markerInfo: {
            flexDirection: "row",
            gap: 12,
            alignItems: 'center',
            flex: 1
        }
    });
}

export default MapPanel;