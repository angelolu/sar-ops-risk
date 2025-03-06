import { Ionicons } from '@expo/vector-icons';
import { Banner, FilledButton, IconButton, RiskModal, SegmentedButtons, textStyles, ThemeContext } from 'calsar-ui';
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadingTransition } from 'react-native-reanimated';
import { SearchBox } from '../components/TextInput';
import { validateLocationString } from './MapPanel';
import { PrinterContext } from './PrinterContext';
import { RxDBContext } from './RxDBContext';
import { TextBox } from './TextInput';
import { TimerComponent } from './TimerComponent';
import { getAsyncStorageData, resetTeamTimeout } from './helperFunctions';

export const LogPanel = ({ incidentInfo, teams }) => {
    const styles = pageStyles();
    const textStyle = textStyles();
    const { colorTheme } = useContext(ThemeContext);
    const { getLogsByFileId } = useContext(RxDBContext)
    const [logs, setLogs] = useState([]);
    const [typeFilter, setTypeFilter] = useState(0);
    const [textFilter, setTextFilter] = useState("");
    const [logSlice, setLogSlice] = useState(1);
    // Export related
    const [modalShowing, setModalShowing] = useState(false);
    const [exportType, setExportType] = useState(0);
    const [exportContents, setExportContents] = useState(0);
    const [exportFileType, setExportFileType] = useState(0);
    const [exportDatePreference, setExportDatePreference] = useState(0);
    const numLogsPerPage = 10;

    useEffect(() => {
        // Load saved settings
        getAsyncStorageData("export-date-format").then((value) => { value && setExportDatePreference(value) });
        getLogsByFileId(incidentInfo.id).then(query => {
            query.$.subscribe(logs => {
                setLogs(logs);
            });
            return () => { query.$.unsubscribe() };
        });
    }, []);

    const textSearch = (text, filter) => {
        if (text && filter) {
            return (new RegExp(filter, 'i')).test(text)
        }
        return false;
    }

    const parseTeamName = (teamNameToParse) => {
        if (teamNameToParse === "!@#$") {
            return incidentInfo.commsCallsign || "COMMS"
        } else {
            const foundObject = teams.find(obj => obj.id === teamNameToParse);
            return foundObject ? foundObject.name || "Unnamed" : "Unnamed";
        }
    }

    let displayLogs = logs;
    if (typeFilter === 1) {
        displayLogs = displayLogs.filter((log) => log.type === 2)
    }
    if (textFilter && textFilter.length >= 2) {
        displayLogs = displayLogs.filter((log) => textSearch(parseTeamName(log.toTeam), textFilter) || textSearch(parseTeamName(log.toTeam), textFilter) || textSearch(log.message, textFilter))
    }

    let printToFile = async (displayLogs, incidentInfo) => {
        const maxLogsLinesPerPage = 24;
        const maxCharsPerLine = 65;
        let logsHTML = "";
        let lines = 0;
        let pages = [];

        if (exportType === 0 || exportType === 1) displayLogs = displayLogs.filter((log) => log.type === 2); // ICS309, SAR 133 only has radio logs

        displayLogs.forEach((log) => {
            if (log.message) {
                let logLines = Math.ceil(log.message.length / maxCharsPerLine);
                if ((logLines + lines) > maxLogsLinesPerPage) {
                    lines = 0;
                    pages.push(logsHTML);
                    logsHTML = "";
                }
                lines = lines + logLines;
            } else {
                // If there is no message, this counts as a single line
                lines = lines + 1;
            }
            logsHTML = logsHTML + `<tr>
            <td class="time">${exportDatePreference === 1 ? new Date(log.created).toISOString() : new Date(log.created).toLocaleString('en-US', { hour12: false })}</td>
            ${log.toTeam ? `<td class="oneline center">${parseTeamName(log.fromTeam || "Unknown")}</td>
            <td class="oneline center">${parseTeamName(log.toTeam || "Unknown")}</td>` :
                    `<td class="oneline center" colspan="2">${parseTeamName(log.fromTeam || "Unknown")}</td>`
                }
            <td class="subject">${log.message || ""}</td>
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
                                <td colspan="2"><p class="small">TASK #</p>${incidentInfo.incidentNumber || ""}</td>
                                <td colspan="2"><p class="small">FOR PERIOD</p>FROM: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.created).toISOString() : new Date(displayLogs[0]?.created).toLocaleString('en-US', { hour12: false })) ||
                    ""}</br>TO: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[displayLogs.length - 1]?.created).toISOString() : new Date(displayLogs[displayLogs.length - 1]?.created).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            </tr>
                            <tr>
                                <td colspan="2"><p class="small">FOR OP. PERIOD #</p>${incidentInfo.opPeriod || ""}</td>
                                <td colspan="5"><p class="small">TASK NAME</p>${incidentInfo.incidentName || ""}</td>

                            </tr>
                            <tr>
                                <td colspan="3"><p class="small">LOG KEEPER</p>${incidentInfo.commsName || ""}</td>
                                <td colspan="2"><p class="small">STATION CALLSIGN</p>${incidentInfo.commsCallsign || ""}</td>
                                <td colspan="2"><p class="small">STATION FREQUENCY</p>${incidentInfo.commsFrequency || ""}</td>
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
                            <td colspan="1"><p class="small">2. DATE</p>${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.created).toISOString() : new Date(displayLogs[0]?.created).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            <td colspan="1"><p class="small">3. INCIDENT NUMBER</p>${incidentInfo.incidentNumber || ""}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><p class="small">4. OPERATOR LOCATION</p></td>
                            <td colspan="2"><p class="small">5. FREQUENCY</p>${incidentInfo.commsFrequency || ""}</td>
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
                            <td><p class="small">7. RADIO OPERATOR</p>${incidentInfo.commsName || ""}</td>
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
                                <td colspan="2"><p class="small">TASK #</p>${incidentInfo.incidentNumber || ""}</td>
                                <td colspan="2"><p class="small">PERIOD</p>FROM: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.created).toISOString() : new Date(displayLogs[0]?.created).toLocaleString('en-US', { hour12: false })) ||
                    ""}</br>TO: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[displayLogs.length - 1]?.created).toISOString() : new Date(displayLogs[displayLogs.length - 1]?.created).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            </tr>
                            <tr>
                                <td colspan="1"><p class="small">OP. PERIOD #</p>${incidentInfo.opPeriod || ""}</td>
                                <td colspan="6"><p class="small">TASK NAME</p>${incidentInfo.incidentName || ""}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><p class="small">LOG KEEPER</p>${incidentInfo.commsName || ""}</td>
                                <td colspan="2"><p class="small">STATION CALLSIGN</p>${incidentInfo.commsCallsign || ""}</td>
                                <td colspan="2"><p class="small">STATION FREQ./CHANNEL</p>${incidentInfo.commsFrequency || ""}</td>
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
            csvString = csvString + `"${exportDatePreference === 1 ? new Date(log.created).toISOString() : new Date(log.created).toLocaleString('en-US', { hour12: false })}",${log.toTeam ? `${parseTeamName(log.fromTeam || "Unnamed")}` : "(Non-radio log)"},${parseTeamName(log.toTeam || "Unnamed")},"${log.message || ""}"\n`;
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
        logsToExport = logs.sort((a, b) => new Date(a.created) - new Date(b.created)); // Exports are printed in reverse order
        if (exportType === 0 || exportType === 1 || exportFileType === 0) {
            printToFile(logsToExport, incidentInfo);
        } else {
            exportCSV(logsToExport, incidentInfo.fileName);
        }
        setModalShowing(false);
    }

    const LogRowSmall = ({ log }) => {
        const { colorTheme } = useContext(ThemeContext);

        const renderRow = (time, from, to, message, bold = false) => {
            return (
                <>
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                <Text style={[textStyle.text, { fontWeight: "bold" }]}>{from ? `${from} → ${to}` : `${to}`}</Text>
                                <Text style={[textStyle.text]}>{from ? `` : `(Non-radio)`}</Text>
                            </View>
                            <Text style={[textStyle.tertiaryText]}>{time}</Text>
                        </View>
                        {message !== "" &&
                            <View style={{ marginTop: 4 }}>
                                <Text style={[textStyle.tertiaryText, { color: colorTheme.onSurface }]}>{message}</Text>
                            </View>
                        }
                    </View>
                </>
            );
        }

        switch (log?.type) {
            case 3:
                // Non-radio operator related changes
                return (<>{renderRow(new Date(log.created).toLocaleString('en-US', { hour12: false }), "", "Operator", log.message)}</>);
                break;
            case 2:
                // Radio log
                return (<>{renderRow(new Date(log.created).toLocaleString('en-US', { hour12: false }), parseTeamName(log.fromTeam), parseTeamName(log.toTeam), log.message)}</>);
                break;
            case 1:
                // Non-radio team related changes
                return (<>{renderRow(new Date(log.created).toLocaleString('en-US', { hour12: false }), "", parseTeamName(log.fromTeam), log.message)}</>);
                break;
            default:
                // Assume this is a header row?
                return (<>{renderRow("Time", "From", "To/Subject", "", true)}</>);
        }
    }

    let paginatedLogs = displayLogs.slice((logSlice - 1) * numLogsPerPage, logSlice * numLogsPerPage);

    return (
        <>
            <ScrollView contentContainerStyle={{ gap: 12, paddingTop: 20, paddingBottom: 20, paddingRight: 20, paddingLeft: 20 }} style={{ height: "100%" }}>
                <View style={{ flexDirection: "column", gap: 14 }}>
                    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                        <SearchBox placeholder="Search for..." onChangeText={(value) => setTextFilter(value.replace(/[^A-Za-z0-9]+/g, ''))} limit={20} />
                        <IconButton outline backgroundColor={colorTheme.background} ionicons_name={"share-outline"} text={"Export"} onPress={() => setModalShowing(true)} />
                    </View>
                    <SegmentedButtons items={["All", "Radio only"]} selected={typeFilter} onPress={setTypeFilter} grow small />
                </View>

                {displayLogs.length === 0 ? <View style={[styles.standaloneCard, { flex: 1, alignSelf: 'stretch', justifyContent: "center", marginVertical: 8 }]}>
                    {(textFilter !== "" || typeFilter !== 0) ?
                        <Text style={[styles.text, { fontStyle: "italic" }]}>No logs found. Try adjusting the filters.</Text> :
                        <Text style={[styles.text, { fontStyle: "italic" }]}>No logs found</Text>
                    }
                </View>
                    :
                    <Animated.FlatList
                        style={{ height: "100%" }}
                        contentContainerStyle={styles.cardContainer}
                        data={paginatedLogs}
                        renderItem={({ item }) => <View style={[styles.card, { flexDirection: "column", justifyContent: "flex-start", gap: 6, flexWrap: "nowrap" }]}>
                            <LogRowSmall
                                log={item}
                            />
                        </View>
                        }
                        keyExtractor={item => item.id}
                        itemLayoutAnimation={FadingTransition}
                    />
                }

                {displayLogs.length > 0 &&
                    <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
                        <Text style={[textStyle.text, { fontStyle: "italic" }]}>Page {logSlice} of {Math.ceil(displayLogs.length / numLogsPerPage)}</Text>
                        {logSlice !== 1 && <FilledButton small text="Previous" backgroundColor={colorTheme.background} onPress={() => setLogSlice(prev => prev - 1)} />}
                        {Math.ceil(displayLogs.length / numLogsPerPage) !== 1 && <FilledButton small text="Next" backgroundColor={colorTheme.background} onPress={() => setLogSlice(prev => prev + 1)} />}
                    </View>
                }
            </ScrollView>
            <RiskModal
                isVisible={modalShowing}
                title={"Export log"}
                onClose={() => { setModalShowing(false) }}>
                <View style={{ padding: 20, paddingTop: 0, gap: 12 }}>
                    <View style={{ gap: 8, alignItems: "flex-start" }}>
                        <Text style={[textStyle.sectionTitleText]}>Type</Text>
                        <SegmentedButtons small items={["ICS 309", "SAR 133", "Custom"]} selected={exportType} onPress={setExportType} />
                        {(exportType === 0 || exportType === 1) ? <>
                            <Text style={textStyle.secondaryText}>This type of file contains radio logs only. Non-radio logs will not appear.</Text>
                        </> :
                            <>
                                <Text style={[textStyle.sectionTitleText]}>Contents</Text>
                                {typeFilter === 0 && textFilter === "" && <Text style={textStyle.text}>To export a subset of all logs, close this dialog and apply a filter.</Text>}
                                {typeFilter !== 0 || textFilter !== "" && <SegmentedButtons small items={["Current filter", "All items"]} disabled={typeFilter === 0 && textFilter === ""} selected={(typeFilter !== 0 || textFilter) ? exportContents : 1} onPress={setExportContents} />}
                                <Text style={[textStyle.sectionTitleText]}>File Type</Text>
                                <SegmentedButtons small items={["PDF", "CSV"]} selected={exportFileType} onPress={setExportFileType} />
                            </>}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, width: "100%", justifyContent: "flex-end", paddingTop: 8 }}>
                        {Platform.OS === 'web' && (exportType === 0 || exportType === 1 || exportFileType === 0) && <Text style={textStyle.secondaryText}>A new window will open with a print dialog. Print to PDF to save the document.</Text>}
                        <FilledButton primary rightAlign text="Export" disabled={false} onPress={handleExportButton} />
                    </View>
                </View>
            </RiskModal >
        </>
    );
}

export const CommsPanel = ({ incidentInfo, teams, editTeam, activeTeams, addMarker }) => {
    const styles = pageStyles();
    const { width, height } = useWindowDimensions();
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { createTeam } = useContext(RxDBContext)

    const [logTrafficTeam, setLogTrafficTeam] = useState();
    const [expanded, setExpanded] = useState(false);

    const areTimersRunning = useMemo(() =>
        activeTeams.some(item => item.isRunning === true && item.status !== "Inactive"),
        [activeTeams]
    );

    const addAdHocTeam = () => {
        createTeam(incidentInfo.id, "Ad-hoc");
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    const setIsRuning = (teamToUpdate, state) => {
        if (teamToUpdate.isRunning !== state) {
            if (state) {
                // Start timer
                teamToUpdate.incrementalPatch({ lastStart: new Date().toISOString(), isRunning: true });
            } else {
                // Stop timer by recording the amount of time left
                const elapsedTime = teamToUpdate.lastStart ? (Date.now() - new Date(teamToUpdate.lastStart)) / 1000 : 0;
                let remainingTime = teamToUpdate.lastTimeRemaining - Math.floor(elapsedTime);
                teamToUpdate.incrementalPatch({ lastTimeRemaining: remainingTime, isRunning: false });
            }
            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
        }
    };

    const setAllIsRunning = (state) => {
        activeTeams.forEach(team => team.isRunning !== state && team.status !== "Inactive" && setIsRuning(team, state))
    };

    return (
        <ScrollView contentContainerStyle={{ gap: 12, paddingTop: 20, paddingBottom: 20, paddingRight: 20, paddingLeft: 20 }} style={{ height: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
                <Text style={styles.sectionTitle}></Text>
                <View style={{ flexDirection: "row", gap: 14 }}>
                    {false && width > 600 && <FilledButton small={height < 500} backgroundColor={colorTheme.background} disabled={teams.length === 0} icon={expanded ? "chevron-up-outline" : "chevron-down-outline"} text={expanded ? "Hide last" : "Show last"} onPress={() => setExpanded(!expanded)} />}
                    <FilledButton small={width <= 600 || height < 500} backgroundColor={activeTeams.length === 0 ? getHoverColor(colorTheme.onSurface, 0.3) : colorTheme.background} disabled={activeTeams.length === 0} icon={areTimersRunning ? "pause" : "play"} text={areTimersRunning ? "Pause all" : "Resume all"} onPress={() => setAllIsRunning(!areTimersRunning)} />
                    <FilledButton small={width <= 600 || height < 500} primary icon="add" text={width > 600 ? "Ad-hoc team" : "Ad-hoc"} onPress={addAdHocTeam} />
                </View>
            </View>
            {activeTeams.length === 0 ?
                <>
                    <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20 }}>
                        <View style={{ flexDirection: ("row"), gap: 8, flexWrap: ("wrap") }}>
                            <Banner
                                backgroundColor={colorTheme.surfaceContainer}
                                color={colorTheme.onSurface}
                                icon={<Ionicons name="id-card-outline" size={24} color={colorTheme.onSurface} />}
                                title={"Manage teams in the \"Resources\" tab"} />
                            <Banner
                                backgroundColor={colorTheme.surfaceContainer}
                                color={colorTheme.onSurface}
                                icon={<Ionicons name="people" size={24} color={colorTheme.onSurface} />}
                                title={"Tap the button above to add an ad-hoc team"} />
                            <Banner
                                backgroundColor={colorTheme.surfaceContainer}
                                color={colorTheme.onSurface}
                                icon={<Ionicons name="document-text-outline" size={24} color={colorTheme.onSurface} />}
                                title={"Tap the file name in the header to change radio operator details"} />
                        </View>
                    </View>
                </>
                :
                <>
                    <View style={[styles.timerSection]}>
                        {activeTeams.map(item => (item.status !== "Inactive") && <TimerComponent
                            incidentInfo={incidentInfo}
                            expanded={expanded}
                            team={item}
                            teams={teams}
                            key={item.id}
                            showLogTrafficModal={() => {
                                setLogTrafficTeam(item);
                                editTeam(item, { editing: true }, false);
                            }}
                        />)}
                    </View>
                </>
            }
            <LogTrafficComponent
                onClose={() => {
                    editTeam(logTrafficTeam, { editing: false }, false);
                    setLogTrafficTeam(undefined);
                }}
                team={logTrafficTeam}
                teams={activeTeams}
                incidentInfo={incidentInfo}
                updateStatus={(text) => editTeam(logTrafficTeam, { status: text }, false)}
                updateAssignment={(newAssignment) => editTeam(logTrafficTeam, { assignment: newAssignment }, false)}
                setFlag={(state) => editTeam(logTrafficTeam, { flagged: state }, false)}
                addMarker={addMarker} />
        </ScrollView>
    );
}

const LogTrafficComponent = ({ teams, team, incidentInfo, onClose, updateStatus, updateAssignment, setFlag, addMarker }) => {
    const { colorTheme } = useContext(ThemeContext);
    const {
        isPrinterConnected,
        feedLines,
        printText,
        cutPaper,
        setBold,
        setNormal,
        setCenterAlign,
        setLeftAlign } = useContext(PrinterContext);
    const { getAssignmentsByFileId, getAssignmentById, getAssignmentsByTeamId, createAssignment, createClue, createLog, createCommsQueueMessage } = useContext(RxDBContext);

    const { width } = useWindowDimensions();
    const textStyle = textStyles();

    const [messageType, setMessageType] = useState(0);
    const [messageSubType, setMessageSubType] = useState(0);
    const [fromField, setFromField] = useState(0);
    const [toField, setToField] = useState(0);
    const [toTeam, setToTeam] = useState(undefined);
    const [selectMode, setSelectMode] = useState(false);
    const [customTextBoxText, setCustomTextBoxText] = useState("");
    const [clueNameTextBoxText, setClueNameTextBoxText] = useState("");
    const [clueLocationTextBoxText, setClueLocationTextBoxText] = useState("");
    const [requestTextBoxText, setRequestTextBoxText] = useState("");
    const [assignmentTextBoxText, setAssignmentTextBoxText] = useState("");
    const [currentAssignmentName, setCurrentAssignmentName] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [assignmentQueue, setAssignmentQueue] = useState([]);
    const [selectedTaskName, setSelectedTaskName] = useState("");

    useEffect(() => {
        // Get all the assignments for this file
        getAssignmentsByFileId(incidentInfo.id).then(query => {
            query.$.subscribe(tasks => {
                // filter all tasks where tasks.completed === true
                setAssignments(tasks.filter(task => !task.completed));
            });
            return () => { query.$.unsubscribe() };
        });
    }, []);

    useEffect(() => {
        // Get all the assignments in queue for this team
        getAssignmentsByTeamId(team?.id).then(query => {
            query.$.subscribe(assignments => {
                setAssignmentQueue(assignments);
            });
            return () => { query.$.unsubscribe() };
        }
        );
    }, [team]);

    useEffect(() => {
        // watch the name of this teams current assignment, if it exists
        if (team?.assignment) {
            getAssignmentById(team.assignment).then(query => {
                query.$.subscribe(assignment => {
                    setCurrentAssignmentName(assignment?.name);
                });
                return () => { query.$.unsubscribe() };
            });
        }
    }, [team]);

    // Preset messages from team to the operator
    const presetTeamMessages = {
        "Radio": {
            "Good": {
                message: "Radio check, good"
            },
            "Fair": {
                message: "Radio check, fair"
            },
            "Unintelligible": {
                message: "Radio check, unintelligible"
            }
        },
        "Task": {
            "Available": {
                message: "Available/posted",
                status: "Available/posted",
            },
            "Searching": {
                message: `Searching ${currentAssignmentName || ""}`,
                status: "Searching",
            },
            "On scene": {
                message: "On scene",
                status: "On scene",
                flag: true
            },
            "On break": {
                message: "On break",
                status: "On break",
            },
            "Transporting": {
                message: "Transporting patient",
                status: "Transporting patient",
            },
            "Completed": {
                message: `Completed task ${currentAssignmentName || ""}`,
                status: "Waiting for task",
                flag: true
            },
        },
        "Location": {
            "At ICP": {
                message: "At ICP",
                status: "At ICP",
            },
            "Need transport": {
                message: "Waiting for transport",
                status: "Waiting for transport",
                flag: true
            },
            "En route": {
                message: "En route to task",
                status: "En route to task",
            },
            "Returning to ICP": {
                message: "Returning to ICP",
                status: "En route to ICP",
            },
        },
        "Report": {
            "Clue": {},
            //"Hazard": {},
            "Incident": {},
        },
        "Request": {}
    };

    // Preset messages from operator to team
    const presetOperatorMessages = {
        "Radio check": {
            "Good": {
                message: "Radio check, good"
            },
            "Fair": {
                message: "Radio check, fair"
            },
            "Unintelligible": {
                message: "Radio check, unintelligible"
            }
        },
        "Status check": {
            "OK": {
                message: "Requested status check, responded status OK",
            },
            "Need transport": {
                message: "Requested status check, responded waiting for transport",
                status: "Waiting for transport",
                flag: true
            },
            "On break": {
                message: "Requested status check, responded on break",
                status: "On break",
            },
            "Returning to ICP": {
                message: "Requested status check, responded returning to ICP",
                status: "Returning to ICP",
            }
        },
        "Assign": {
            "Now": {
                message: "Proceed to task ",
                status: "Assigned",
            },
            "After completed": {
                message: `After task ${team?.assignment || ""}, proceed to task `,
            },
        }
    };

    // Preset messages from team to team
    const presetInterTeamMessages = {
        "Radio check": {
            "Good": {
                message: "Radio check, good"
            },
            "Fair": {
                message: "Radio check, fair"
            },
            "Unintelligible": {
                message: "Radio check, unintelligible"
            }
        }
    };

    const handlePrintClueStub = async (description, location, team, date, assignment) => {
        //await printFooter();
        await setBold();
        await setCenterAlign();
        await printText("OPERATION MANAGEMENT TOOL");
        await printText("Clue Stub");
        await setLeftAlign();
        await setNormal();
        await feedLines(1);
        await printText(`TASK NAME: ${incidentInfo.incidentName || ""}`);
        await printText(`TASK # ${incidentInfo.incidentNumber || ""}`);
        await printText(`OP. PERIOD: ${incidentInfo.opPeriod || ""}`);
        await feedLines(1);
        await printText(`CLUE DESCRIPTION: ${description || ""}`);
        await printText(`FOUND BY: ${team || ""}`);
        await printText(`DATE & TIME FOUND: ${date || ""}`);
        await printText(`ASSIGNMENT: ${assignment || "None"}`);
        await printText(`LOCATION FOUND: ${location || "Not given"}`);
        await feedLines(2);
        await cutPaper();
        //printHeader();
    }

    const handleSetToField = (value) => {
        if (value === 1) {
            // Enter select mode
            setSelectMode(true);
            setToTeam(undefined);
        } else {
            // Exit select mode
            setSelectMode(false);
            setToTeam(undefined);
        }
        setToField(value);
    };

    const handleClose = () => {
        setMessageType(0);
        setMessageSubType(0);
        setFromField(0);
        setCustomTextBoxText("");
        setClueNameTextBoxText("");
        setClueLocationTextBoxText("");
        setAssignmentTextBoxText("");
        handleSetToField(0);
        setCurrentAssignmentName("");
        setAssignmentQueue([]);
        setSelectedTaskName("");
        setRequestTextBoxText("");
        onClose();
    }

    const getMessageTypeCategories = () => {
        return fromField === 0
            ? toField === 0
                ? presetTeamMessages
                : presetInterTeamMessages
            : presetOperatorMessages;
    }

    const currentMessages = useMemo(getMessageTypeCategories, [fromField, toField]);
    const currentMessageCategories = useMemo(() => Object.keys(currentMessages).sort(), [currentMessages]);

    let footerMessage = `A log will be added for ${team?.name || "unnamed team"} and\n- Contact timeout reset`;
    let activeSubTypeKeys = [];
    let activeSubType = "";

    if (messageType > 0 && messageType <= currentMessageCategories.length) {
        activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
        activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]
        if (activeSubType?.status)
            footerMessage = footerMessage + `\n- Status set to "${activeSubType?.status}"`;
        if (activeSubType?.flag || currentMessageCategories[messageType - 1] === "Request")
            footerMessage = footerMessage + "\n- Flagged for follow up";
        if (activeSubTypeKeys[messageSubType] === "Now")
            footerMessage = footerMessage + `, flag cleared, task set to "${assignmentTextBoxText}"`;
        if (activeSubTypeKeys[messageSubType] === "Completed")
            footerMessage = footerMessage + `\nAll other teams on this task will have their task cleared and be flagged`;
    }
    const trimmedAssignmentNames = assignments.length > 0 ? assignments.map(a => a.name).filter(a => a && a !== currentAssignmentName && a !== "" && !a.completed) : [];
    const trimmedAssignmentQueue = assignmentQueue.length > 0 ? assignmentQueue.filter(a => a && a.name !== currentAssignmentName && a !== "" && !a.completed) : [];

    const handleLogMessage = () => {
        let note = "";
        if (messageType === 0) {
            if (customTextBoxText) note = customTextBoxText;
        } else if (currentMessageCategories[messageType - 1] === "Report") {
            activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
            activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]
            switch (activeSubTypeKeys[messageSubType]) {
                case "Clue":
                    if (customTextBoxText || clueNameTextBoxText) note = `Found "${clueNameTextBoxText || "Unnamed object"}"${clueLocationTextBoxText && " at " + clueLocationTextBoxText}${customTextBoxText ? ". " + customTextBoxText : ""}.`;
                    let clueObject = {
                        name: clueNameTextBoxText,
                        foundByTeamId: team?.id,
                        location: clueLocationTextBoxText,
                        assignmentId: team?.assignment || "",
                        notes: customTextBoxText,
                        state: "New"
                    };
                    createClue(incidentInfo.id, clueObject).then(doc => {
                        if (doc?.id && validateLocationString(doc?.location)) {
                            addMarker({
                                type: "Clues",
                                id: doc.id
                            })
                        }
                    });
                    break;
                case "Hazard":
                    if (customTextBoxText) note = `Reported hazard: "${customTextBoxText}"${clueLocationTextBoxText && " at " + clueLocationTextBoxText}.`;
                    break;
                case "Incident":
                    if (customTextBoxText) {
                        note = `Reported incident: "${customTextBoxText}"${clueLocationTextBoxText && " at " + clueLocationTextBoxText}.`;
                        // Add incident to file
                        createAssignment(incidentInfo.id, { type: "inc", notes: `${customTextBoxText} Reported by ${team?.name || "unnamed team"} at ${new Date().toLocaleString()}`, location: clueLocationTextBoxText }).then(doc => {
                            if (doc?.id && validateLocationString(doc?.location)) {
                                addMarker({
                                    type: "Incidents",
                                    id: doc.id
                                })
                            }
                        });
                    }
                    break;
            }
            if (activeSubType.status) updateStatus(activeSubType.status);
        } else if (currentMessageCategories[messageType - 1] === "Assign") {
            if (assignmentTextBoxText || selectedTaskName) {
                activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
                activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]
                if (activeSubTypeKeys[messageSubType] === "Now") {
                    // Get the assignment in assignments that matches the name in assignmentTextBoxText
                    let assignment = assignments.find(a => a.name === (assignmentTextBoxText || selectedTaskName));
                    if (assignment) {
                        note = activeSubType.message + (assignmentTextBoxText || selectedTaskName);
                        // Assign team to task
                        team.incrementalPatch({
                            assignment: assignment.id,
                            flagged: false,
                            status: activeSubType.status ? activeSubType.status : team.status
                        });
                    }
                }
            }
        } else if (currentMessageCategories[messageType - 1] === "Request") {
            if (requestTextBoxText) {
                note = "Requesting " + requestTextBoxText;
                setFlag(true);
                createCommsQueueMessage(incidentInfo.id, {
                    type: 'Resource',
                    toOpsTeam: "ops",
                    fromId: team?.id,
                    message: requestTextBoxText
                })
            }
        } else if (messageType > 0 && messageType <= currentMessageCategories.length) {
            if (currentMessageCategories[messageType - 1] === "Task" && activeSubTypeKeys[messageSubType] === "Completed") {
                // Mark task as completed
                getAssignmentById(team.assignment).then(query => {
                    query.exec().then(assignment => {
                        if (assignment) {
                            assignment.incrementalPatch({
                                completed: true,
                                completedBy: team.id,
                                completedAt: new Date().toISOString()
                            });
                        }
                    });
                });

                // Remove and flag all teams that were assigned to this task
                teams.filter(t => t.assignment === team.assignment).forEach(t => {
                    t.incrementalPatch({
                        assignment: "",
                        flagged: true,
                        status: "Waiting for task"
                    });
                });
            }
            activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
            activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]

            note = activeSubType.message;
            if (activeSubType.status) updateStatus(activeSubType.status);
            if (activeSubType.flag) setFlag(true);
        }
        if (note) {
            createLog(incidentInfo.id, {
                created: new Date().toISOString(),
                type: 2, // 2 for radio logs
                fromTeam: fromField === 0 ? team?.id || "" : "!@#$", // !@#$ will be converted to the operator call sign
                toTeam: toField === 0 ? (fromField === 0 ? "!@#$" : team?.id || "") : toTeam.id,
                message: note
            });
            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
            resetTeamTimeout(team);
            // if this is an inter-team message, also reset the recipient team's timeout
            if (toField === 1) resetTeamTimeout(toTeam);
            handleClose();
        }
    }

    const toItems = [fromField === 0 ? incidentInfo.commsCallsign || "You" : team?.name ? team?.name : "This team"];
    if (fromField === 0) toItems.push(toTeam?.name || "Other"); // Only allow recipient selection if the sender is the current team
    return (<RiskModal
        overrideWidth={700}
        isVisible={team ? true : false}
        ignoreBackdropPress={selectMode}
        title={"Log radio traffic"}
        onClose={handleClose}>
        <View style={{ padding: 20, paddingTop: 0, gap: 12 }}>
            <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: (width > 600 ? 20 : 12) }}>
                <View style={{ flexDirection: "column", gap: 10, flexGrow: (width > 600 ? 1 : 0), flexBasis: (width > 600 ? 0 : "auto") }}>
                    <Text style={[textStyle.sectionTitleText]}>From</Text>
                    <SegmentedButtons small={width <= 600} grow items={[team?.name ? team?.name : "This team", incidentInfo.commsCallsign || "You"]} selected={fromField} onPress={(value) => {
                        setFromField(value);
                        setMessageType(0);
                        setMessageSubType(0);
                        setToField(0);
                        setToTeam(undefined);
                        setSelectMode(false);
                    }} />
                </View>
                <View style={{ flexDirection: "column", gap: 10, flexGrow: (width > 600 ? 1 : 0), flexBasis: (width > 600 ? 0 : "auto") }}>
                    <Text style={[textStyle.sectionTitleText]}>To</Text>
                    <SegmentedButtons small={width <= 600} grow items={toItems} noCheck={toField === 1 && !toTeam} selected={toField} onPress={(value) => {
                        handleSetToField(value);
                        setMessageType(0);
                        setMessageSubType(0);
                    }} />
                </View>
            </View>
            {(selectMode) ?
                <>
                    <View
                        style={{
                            borderBottomColor: colorTheme.outlineVariant,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
                        <Text style={textStyle.text}>Select the recipient of this message:</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: "wrap-reverse" }}>
                        {teams.map(t => {
                            if (t.name && t.id != team?.id && t.removed !== true) {
                                return <FilledButton small key={t?.id} text={t.name} onPress={() => {
                                    setToTeam(t);
                                    setSelectMode(false);
                                }} />
                            }
                        })}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
                        <Text style={textStyle.secondaryText}>Unnamed teams are not shown</Text>
                    </View>
                </> :
                <>
                    <Text style={[textStyle.sectionTitleText, { alignSelf: "flex-start" }]}>Message type</Text>
                    <SegmentedButtons grow small={width <= 600} items={["Custom", ...currentMessageCategories]} selected={messageType} onPress={(item) => {
                        setMessageType(item);
                        setMessageSubType(0);
                    }} />
                    {currentMessageCategories[messageType - 1] === "Assign" &&
                        <>
                            <Text style={[textStyle.sectionTitleText]}>Task</Text>
                            {trimmedAssignmentQueue.length > 0 && <>
                                <View style={{ flexDirection: 'row', alignSelf: "center", gap: 12, flexWrap: "wrap" }}>
                                    {trimmedAssignmentQueue.map(t => {
                                        return <FilledButton
                                            small
                                            key={t?.id}
                                            text={t.name}
                                            selected={selectedTaskName === t.name}
                                            onPress={() => {
                                                setAssignmentTextBoxText("");
                                                setSelectedTaskName(t.name);
                                            }} />
                                    })}
                                    <FilledButton
                                        small
                                        text={"Other"}
                                        selected={selectedTaskName === "Other"}
                                        onPress={() => setSelectedTaskName("Other")} />
                                </View>
                            </>}
                            {(selectedTaskName === "Other" || trimmedAssignmentQueue.length === 0) &&
                                <TextBox
                                    textStyle={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 8,
                                        backgroundColor: colorTheme.surfaceContainerHigh,
                                        width: "100%"
                                    }}
                                    placeholder="Enter task name"
                                    autofill={trimmedAssignmentNames}
                                    onChangeText={setAssignmentTextBoxText}
                                    initialValue={assignmentTextBoxText}
                                    onConfirm={() => { handleLogMessage() }}
                                    maxHeight={team.assignment ? 100 : 60} // Limit the height of the text box if the subtype keys segmentedbuttons are not shown
                                    limit={50} />
                            }
                        </>}
                    {messageType === 0 &&
                        <TextBox textStyle={{
                            paddingVertical: 8,
                            paddingHorizontal: 8,
                            backgroundColor: colorTheme.surfaceContainerHigh,
                            width: "100%"
                        }}
                            placeholder="Custom message"
                            onChangeText={setCustomTextBoxText}
                            initialValue={customTextBoxText}
                            onConfirm={() => { handleLogMessage() }} limit={1000} autoFocus={width > 600} />}
                    {messageType > 0 &&
                        messageType <= currentMessageCategories.length &&
                        activeSubTypeKeys.length > 0 &&
                        (currentMessageCategories[messageType - 1] !== "Assign" || (currentMessageCategories[messageType - 1] === "Assign" && team.assignment)) &&
                        <SegmentedButtons small grow
                            items={activeSubTypeKeys}
                            selected={messageSubType}
                            onPress={setMessageSubType} />}
                    {currentMessageCategories[messageType - 1] === "Report" && <>
                        <Text style={[textStyle.sectionTitleText]}>Details</Text>
                        {activeSubTypeKeys[messageSubType] === "Clue" &&
                            <TextBox textStyle={{
                                paddingVertical: 8,
                                paddingHorizontal: 8,
                                backgroundColor: colorTheme.surfaceContainerHigh,
                                width: "100%"
                            }} placeholder="Item" onChangeText={setClueNameTextBoxText} initialValue={clueNameTextBoxText} onConfirm={() => { handleLogMessage() }} limit={1000} />}
                        <TextBox textStyle={{
                            paddingVertical: 8,
                            paddingHorizontal: 8,
                            backgroundColor: colorTheme.surfaceContainerHigh,
                            width: "100%"
                        }} placeholder="Description" onChangeText={setCustomTextBoxText} initialValue={customTextBoxText} onConfirm={() => { handleLogMessage() }} limit={1000} />
                        <TextBox textStyle={{
                            paddingVertical: 8,
                            paddingHorizontal: 8,
                            backgroundColor: colorTheme.surfaceContainerHigh,
                            width: "100%"
                        }} placeholder="Location (optional)"
                            autoFocus={false}
                            onChangeText={setClueLocationTextBoxText}
                            initialValue={clueLocationTextBoxText}
                            onConfirm={() => { handleLogMessage() }}
                            limit={500} />
                    </>}
                    {currentMessageCategories[messageType - 1] === "Request" && <>
                        <TextBox textStyle={{
                            paddingVertical: 8,
                            paddingHorizontal: 8,
                            backgroundColor: colorTheme.surfaceContainerHigh,
                            width: "100%"
                        }} placeholder="Requested resources"
                            autoFocus={false}
                            onChangeText={setRequestTextBoxText}
                            initialValue={requestTextBoxText}
                            onConfirm={() => { handleLogMessage() }}
                            limit={500} />
                    </>}
                    {currentMessageCategories[messageType - 1] === "Task" && activeSubTypeKeys[messageSubType] === "Completed" &&
                        <View style={{ flexDirection: "row" }}>
                            <TaskQueueText team={team} />
                        </View>
                    }
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: "flex-end", paddingTop: 8 }}>
                        <Text style={textStyle.secondaryText}>{footerMessage}</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {isPrinterConnected && activeSubTypeKeys[messageSubType] === "Clue" && <FilledButton disabled={customTextBoxText === ""} text={"Print stub"} onPress={() => { handlePrintClueStub(customTextBoxText, clueLocationTextBoxText, team?.name || "Unnamed team", new Date(), team.assignment) }} />}
                            <FilledButton primary text={"Save log"} onPress={() => { handleLogMessage() }} />
                        </View>
                    </View>
                </>}
        </View>
    </RiskModal>);
}

const TaskQueueText = ({ team }) => {
    const { getAssignmentById, getAssignmentsByTeamId } = useContext(RxDBContext);

    const [assignmentName, setAssignmentName] = useState("");
    const [allAssignments, setAllAssignments] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const textStyle = textStyles();

    useEffect(() => {
        let subscription, subscription2;
        if (team.id) {
            getAssignmentsByTeamId(team.id).then(query => {
                subscription2 = query.$.subscribe(result => {
                    setAllAssignments(result);
                    setLoaded(true);
                });
            });
        }

        if (team.assignment) {
            getAssignmentById(team.assignment).then(query => {
                subscription = query.$.subscribe(result => {
                    setAssignmentName(result?.name || "Unknown");
                    setLoaded(true);
                });
            });
        }

        return () => {
            if (subscription)
                subscription.unsubscribe();
            if (subscription2)
                subscription2.unsubscribe();
        };
    }, [team.id, team.assignment, getAssignmentById, getAssignmentsByTeamId]);

    let assignmentText = "";

    const queuedAssignments = allAssignments.filter(assignment => assignment.name !== assignmentName && !assignment.completed && assignment.id !== team.assignment);
    if (queuedAssignments.length > 0) {
        assignmentText = "Other tasks in queue: ";
        assignmentText += queuedAssignments.map(assignment => {
            return `${assignment.name || "Unnamed task"}`;
        }).join(", ");
        assignmentText += ". Consider assigning one of these tasks to this team next.";
    } else {
        assignmentText = "No other tasks in this team's task queue";
    }

    return <Text style={textStyle.text}>
        {loaded ?
            assignmentText || "-"
            :
            "Loading..."
        }
    </Text>
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        sectionTitle: {
            color: colorTheme.onBackground,
            fontSize: 20,
        },
        timerSection: {
            gap: 4,
            flexDirection: "column",
            borderRadius: 26,
            overflow: 'hidden'
        },
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
        card: {
            borderRadius: 4,
            overflow: 'hidden',
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: 'space-between',
            backgroundColor: colorTheme.surfaceContainer
        },
        cardContainer: {
            gap: 2,
            borderRadius: 12,
            overflow: 'hidden'
        },
        text: {
            fontSize: width > 600 ? 14 : 12,
            color: colorTheme.onSurface
        },
        smallText: {
            fontSize: width > 600 ? 12 : 10,
            color: colorTheme.onSurface
        },
        sectionBodyTextSmall: {
            fontSize: width > 600 ? 20 : 16,
            color: colorTheme.onSurface
        }
    });
}