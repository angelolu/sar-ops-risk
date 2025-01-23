import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilledButton, RiskModal, SegmentedButtons, ThemeContext } from 'calsar-ui';
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import React, { useContext, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SearchBox } from '../components/TextInput';

export const LogTab = ({ logs, incidentInfo, userInfo }) => {
    const styles = pageStyles();
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const [typeFilter, setTypeFilter] = useState(0);
    const [textFilter, setTextFilter] = useState("");
    const [logSlice, setLogSlice] = useState(1);
    // Export related
    const [modalShowing, setModalShowing] = useState(false);
    const [exportType, setExportType] = useState(0);
    const [exportContents, setExportContents] = useState(0);
    const [exportFileType, setExportFileType] = useState(0);
    const [exportDatePreference, setExportDatePreference] = useState(0);
    const numLogsPerPage = 15;

    useEffect(() => {
        // Load saved settings
        getData("export-date-format").then((value) => { value && setExportDatePreference(value) });
    }, []);

    const textSearch = (text, filter) => {
        if (text && filter) {
            return (new RegExp(filter, 'i')).test(text)
        }
        return false;
    }

    let displayLogs = logs;
    if (typeFilter === 1) {
        displayLogs = displayLogs.filter((log) => log.type === "2")
    }
    if (textFilter && textFilter.length >= 2) {
        displayLogs = displayLogs.filter((log) => textSearch(log.to, textFilter) || textSearch(log.from, textFilter) || textSearch(log.team, textFilter) || textSearch(log.note, textFilter))
    }
    displayLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    let printToFile = async (displayLogs, incidentInfo, userInfo) => {
        const maxLogsLinesPerPage = 24;
        const maxCharsPerLine = 65;
        let logsHTML = "";
        let lines = 0;
        let pages = [];

        if (exportType === 0 || exportType === 1) displayLogs = displayLogs.filter((log) => log.type === "2"); // ICS309, SAR 133 only has radio logs

        displayLogs.forEach((log) => {
            if (log.note) {
                let logLines = Math.ceil(log.note.length / maxCharsPerLine);
                if ((logLines + lines) > maxLogsLinesPerPage) {
                    lines = 0;
                    pages.push(logsHTML);
                    logsHTML = "";
                }
                lines = lines + logLines;
            } else {
                // If there is no note, this counts as a single line
                lines = lines + 1;
            }
            logsHTML = logsHTML + `<tr>
            <td class="time">${exportDatePreference === 1 ? new Date(log.time).toISOString() : new Date(log.time).toLocaleString('en-US', { hour12: false })}</td>
            ${log.from !== undefined ? `<td class="oneline center">${parseTeamName(log.from || "Unknown")}</td>
            <td class="oneline center">${parseTeamName(log.team || log.to || "Unknown")}</td>` :
                    `<td class="oneline center" colspan="2">${parseTeamName(log.team || log.to || "Unknown")}</td>`
                }
            <td class="subject">${log.note || ""}</td>
        </tr>`})
        pages.push(logsHTML);

        let pageContents = "";
        pages.forEach((tableContents, index) => {
            if (exportType === 0) {
                // ICS 309 style
                pageContents = pageContents + `
                        <table>
                            <tr>
                                <th colspan="3">COMMUNICATIONS LOG</th>
                                <td colspan="2"><p class="small">TASK #</p>${incidentInfo.number || ""}</td>
                                <td colspan="2"><p class="small">FOR PERIOD</p>FROM: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.time).toISOString() : new Date(displayLogs[0]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</br>TO: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[displayLogs.length - 1]?.time).toISOString() : new Date(displayLogs[displayLogs.length - 1]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            </tr>
                            <tr>
                                <td colspan="2"><p class="small">FOR OP. PERIOD #</p>${incidentInfo.opPeriod || ""}</td>
                                <td colspan="5"><p class="small">TASK NAME</p>${incidentInfo.incidentName || ""}</td>

                            </tr>
                            <tr>
                                <td colspan="3"><p class="small">LOG KEEPER</p>${userInfo.name || ""}</td>
                                <td colspan="2"><p class="small">STATION CALLSIGN</p>${userInfo.callsign || ""}</td>
                                <td colspan="2"><p class="small">STATION FREQUENCY</p>${userInfo.frequency || ""}</td>
                            </tr>
                        </table>
                        <table id="tableId">
                            <tr>
                                <td></td>
                                <th colspan="2"><p class="small">STATION I.D.</p></td>
                                <td></td>
                            </tr>
                            <tr>
                                <th><p class="small">TIME</p></th>
                                <th><p class="small">THIS IS</p></th>
                                <th><p class="small">STN CALLED</p></th>
                                <th><p class="small">SUBJECT</p></th>
                            </tr>
                            ${tableContents}
                        </table>
                        <table>
                            <tr>
                                <td class="center">Page ${index + 1} of ${pages.length}</td>
                                <td class="center"><b>ICS 309</b></td>
                            </tr>
                        </table>
                        <p class="smallFooter">CALSAR 12/2024</p>
                        ${(index + 1 === pages.length) ? "" : `<div class="pagebreak"></div>`}
                        `;
            } else if (exportType === 1) {
                // BASARC SAR 133 style
                pageContents = pageContents + `
                    <table>
                        <tr>
                            <th colspan="1" class="center">RADIO LOG</th>
                            <td colspan="1"><p class="small">1. INCIDENT NAME</p>${incidentInfo.incidentName || ""}</td>
                            <td colspan="1"><p class="small">2. DATE</p>${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.time).toISOString() : new Date(displayLogs[0]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            <td colspan="1"><p class="small">3. INCIDENT NUMBER</p>${incidentInfo.number || ""}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><p class="small">4. OPERATOR LOCATION</p></td>
                            <td colspan="2"><p class="small">5. FREQUENCY</p>${userInfo.frequency || ""}</td>
                        </tr>
                    </table>
                    <table id="tableId">
                        <tr>
                            <td></td>
                            <th colspan="2"><p class="small">TEAM</p></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th><p class="small">TIME</p></th>
                            <th><p class="small">FROM</p></th>
                            <th><p class="small">TO</p></th>
                            <th><p class="small">MESSAGE</p></th>
                        </tr>
                        ${tableContents}
                    </table>
                    <table>
                        <tr>
                            <td class="center"><b>SAR 133</b><p class="small">BASARC 3/98</p></td>
                            <td><p class="small">6. LOG PREPARED BY</p></td>
                            <td><p class="small">7. RADIO OPERATOR</p>${userInfo.name || ""}</td>
                        </tr>
                    </table>
                    ${(index + 1 === pages.length) ? "" : `<div class="pagebreak"></div>`}
                        `;
            } else {
                // Standard export style
                pageContents = pageContents + `
                        <table>
                            <tr>
                                <td colspan="3" class="center"><p class="small">OPERATION MANAGEMENT TOOL</p><b>${((exportType === 2 && (typeFilter !== 0 || textFilter !== "") && exportContents !== 1) ? "PARTIAL " : "FULL ")}LOG</b></td>
                                <td colspan="2"><p class="small">TASK #</p>${incidentInfo.number || ""}</td>
                                <td colspan="2"><p class="small">PERIOD</p>FROM: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.time).toISOString() : new Date(displayLogs[0]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</br>TO: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[displayLogs.length - 1]?.time).toISOString() : new Date(displayLogs[displayLogs.length - 1]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            </tr>
                            <tr>
                                <td colspan="1"><p class="small">OP. PERIOD #</p>${incidentInfo.opPeriod || ""}</td>
                                <td colspan="6"><p class="small">TASK NAME</p>${incidentInfo.incidentName || ""}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><p class="small">LOG KEEPER</p>${userInfo.name || ""}</td>
                                <td colspan="2"><p class="small">STATION CALLSIGN</p>${userInfo.callsign || ""}</td>
                                <td colspan="2"><p class="small">STATION FREQ./CHANNEL</p>${userInfo.frequency || ""}</td>
                            </tr>
                        </table>
                        <table id="tableId">
                            <tr>
                                <td></td>
                                <th colspan="2">TEAM</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th>TIME</th>
                                <th>FROM</th>
                                <th>TO</th>
                                <th>MESSAGE</th>
                            </tr>
                            ${tableContents}
                        </table>
                        <table>
                            <tr>
                                <td>Page ${index + 1} of ${pages.length}</td>
                            </tr>
                        </table>
                        ${(index + 1 === pages.length) ? "" : `<div class="pagebreak"></div>`}
                        `;
            }
        })

        const exportWindowHTML = `
            <html>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <head>
                <title>Export ${exportType === 0 ? "ICS309" : exportType === 1 ? "SAR 133" : "Log"}${incidentInfo.incidentName ? " - " + incidentInfo.incidentName : ""}</title>
                <style>
                    table {
                        border: 1px solid black;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    body {
                        font-family: Arial, sans-serif;
                    }
                    th,
                    td {
                        border: 1px solid black;
                        padding: 5px;
                        vertical-align: top;
                    }
                    p {
                        margin: 0px;
                    }
                    @media print {
                        .pagebreak { page-break-before: always; } /* page-break-after works, as well */
                    }
                    .oneline {
                        white-space: nowrap;
                    }
                    .time {
                        width: 165px;
                    }
                    .center {
                        text-align: center;
                        vertical-align: middle;
                    }
                    .subject {
                        width: 425px;
                    }
                    .small {
                        font-size: 0.3cm;
                    }
                    .smallFooter {
                        font-size: 0.3cm;
                        margin: 4px;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                ${pageContents}
            </body>
        `;

        if (Platform.OS === 'web') {
            const winUrl = URL.createObjectURL(
                new Blob([exportWindowHTML], { type: "text/html" })
            );

            const win = window.open(
                winUrl,
                "win",
                `width=800,height=400,screenX=200,screenY=200`
            );

            win.print(); // this is blocking
        } else {
            // On iOS/android prints the given html. On web prints the HTML from the current page.
            const { uri } = await printToFileAsync({ exportWindowHTML });
            console.log('File has been saved to:', uri);
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        }
    };

    const exportCSV = async (logs, filename) => {
        let csvString = "Time,From,To,Message\n";
        logs.forEach((log) => {
            csvString = csvString + `"${exportDatePreference === 1 ? new Date(log.time).toISOString() : new Date(log.time).toLocaleString('en-US', { hour12: false })}",${log.from !== undefined ? `${parseTeamName(log.from || "Unknown")}` : "(Non-radio log)"},${parseTeamName(log.team || log.to || "Unknown")},"${log.note || ""}"\n`;
        });
        if (Platform.OS === 'web') {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = (filename || "export") + '_logs.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } else {
            try {
                // Create a temporary URI
                const { uri } = await FileSystem.writeAsStringAsync(
                    FileSystem.documentDirectory + (filename || "export") + '_logs.csv',
                    csvString,
                    { encoding: FileSystem.EncodingType.UTF8 }
                );

                // Open the saved file (if supported by the device)
                await shareAsync(uri, { mimeType: 'text/csv' });

            } catch (error) {
                console.error('Error saving CSV:', error);
                // Handle the error (e.g., show an error message to the user)
            }
        }
    }

    const handleExportButton = () => {
        let logsToExport = displayLogs;
        logsToExport = logs.sort((a, b) => new Date(a.time) - new Date(b.time)); // Exports are printed in reverse order
        if (exportType === 0 || exportType === 1 || exportFileType === 0) {
            printToFile(logsToExport, incidentInfo, userInfo);
        } else {
            exportCSV(logsToExport, incidentInfo.name);
        }
        setModalShowing(false);
    }

    const parseTeamName = (teamNameToParse) => {
        if (teamNameToParse === "!@#$") {
            return userInfo.callsign || "OPERATOR"
        } else if (teamNameToParse) {
            return teamNameToParse;
        } else {
            return "Unnamed"
        }
    }

    const LogRow = ({ log, bold = false }) => {
        const renderRow = (time, from, to, message, bold = false) => {
            return (
                <>
                    <View style={{ alignSelf: 'stretch', flexDirection: 'row' }}>
                        <View style={{ flex: 1, alignSelf: 'stretch' }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{time}</Text>
                        </View>
                        <View style={{ flex: 1, alignSelf: 'stretch', alignItems: "center" }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{from}</Text>
                        </View>
                        <View style={{ flex: 1, alignSelf: 'stretch', alignItems: "center" }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{to}</Text>
                        </View>
                        <View style={{ flex: 4, alignSelf: 'stretch' }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{message}</Text>
                        </View>
                    </View>
                    <View
                        style={{
                            borderBottomColor: colorTheme.outlineVariant,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                </>
            );
        }

        switch (log?.type) {
            case "3":
                // Non-radio operator related changes
                return (<>{renderRow(new Date(log.time).toLocaleString('en-US', { hour12: false }), "(non-radio)", "Operator", log.note)}</>);
                break;
            case "2":
                // Radio log
                return (<>{renderRow(new Date(log.time).toLocaleString('en-US', { hour12: false }), parseTeamName(log.from), parseTeamName(log.to), log.note)}</>);
                break;
            case "1":
                // Non-radio team related changes
                return (<>{renderRow(new Date(log.time).toLocaleString('en-US', { hour12: false }), "(non-radio)", parseTeamName(log.team), log.note)}</>);
                break;
            default:
                // Assume this is a header row?
                return (<>{renderRow("Time", "From", "To/Subject", "Message", true)}</>);
        }
    }

    return (
        <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14, alignItems: width > 600 ? "center" : "flex-start" }}>
                <View style={{ flexDirection: width > 600 ? "row" : "column", gap: 12, alignItems: "flex-start" }}>
                    <SearchBox placeholder="Search for..." onChangeText={setTextFilter} small={width <= 600} limit={20} />
                    <SegmentedButtons items={["All", "Radio only"]} selected={typeFilter} small={width <= 600} onPress={setTypeFilter} />
                </View>
                <FilledButton primary small={width <= 600} icon="share-outline" text="Export" onPress={() => setModalShowing(true)} />
            </View>

            <View style={[styles.standaloneCard, { flexDirection: "column", justifyContent: "flex-start", gap: 6, flexWrap: "nowrap" }]}>
                <LogRow />
                {displayLogs.length === 0 && <View style={{ flex: 1, alignSelf: 'stretch', alignItems: "center", marginVertical: 8 }}>
                    {(textFilter !== "" || typeFilter !== 0) ?
                        <Text style={[styles.text, { fontStyle: "italic" }]}>No logs found. Try adjusting the filters.</Text> :
                        <Text style={[styles.text, { fontStyle: "italic" }]}>No logs found</Text>
                    }
                </View>}
                {displayLogs.slice((logSlice - 1) * numLogsPerPage, logSlice * numLogsPerPage).map(log => (
                    <LogRow
                        log={log}
                        key={log.time + Math.random()}
                    />
                ))}


            </View>

            {displayLogs.length > 0 &&
                <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
                    <Text style={[styles.text, { fontStyle: "italic" }]}>Page {logSlice} of {Math.ceil(displayLogs.length / numLogsPerPage)}</Text>
                    <FilledButton small text="Previous" disabled={logSlice === 1} onPress={() => setLogSlice(prev => prev - 1)} />
                    <FilledButton small text="Next" disabled={logSlice === Math.ceil(displayLogs.length / numLogsPerPage)} onPress={() => setLogSlice(prev => prev + 1)} />
                </View>
            }
            <RiskModal
                isVisible={modalShowing}
                title={"Export log"}
                onClose={() => { setModalShowing(false) }}>
                <View style={{
                    padding: 20, paddingTop: 0, gap: 8, alignItems: "flex-start"
                }}>
                    <Text style={styles.text}>Type</Text>
                    <SegmentedButtons small items={["ICS 309", "SAR 133", "Custom"]} selected={exportType} onPress={setExportType} />
                    {(exportType === 0 || exportType === 1) ? <>
                        <Text style={styles.text}>This type of file contains radio logs only. Non-radio logs will not appear.</Text>
                        {Platform.OS === 'web' && <Text style={[styles.text, { fontStyle: "italic" }]}>A new window will open with a print dialog. Print to PDF to save the document.</Text>}
                    </> :
                        <>
                            <Text style={styles.text}>Contents</Text>
                            <SegmentedButtons small items={["Current filter", "All items"]} disabled={typeFilter === 0 && textFilter === ""} selected={(typeFilter !== 0 || textFilter) ? exportContents : 1} onPress={setExportContents} />
                            {typeFilter === 0 && textFilter === "" && <Text style={styles.text}>To export a subset of all logs, close this dialog and apply a filter.</Text>}
                            <Text style={styles.text}>File Type</Text>
                            <SegmentedButtons small items={["PDF", "CSV"]} selected={exportFileType} onPress={setExportFileType} />
                            {Platform.OS === 'web' && exportFileType === 0 && <Text style={[styles.text, { fontStyle: "italic" }]}>A new window will open with a print dialog. Print to PDF to save the document.</Text>}
                        </>}
                    <FilledButton primary rightAlign text="Export" disabled={false} onPress={handleExportButton} />
                </View>
            </RiskModal>
        </View>
    );
}

const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value
    }
};

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        standaloneCard: {
            borderRadius: 26,
            overflow: 'hidden',
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: 'space-between',
            backgroundColor: colorTheme.surfaceContainer
        },
        text: {
            fontSize: width > 600 ? 14 : 12,
            color: colorTheme.onSurface
        },
    });
}