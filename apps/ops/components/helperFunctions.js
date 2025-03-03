import AsyncStorage from "@react-native-async-storage/async-storage";

const COMMS_TIMEOUT_DEFAULT = 3600;

export const getTimeoutDefault = async () => {
    let savedDefault = await getAsyncStorageData("timeout-seconds");
    return savedDefault || COMMS_TIMEOUT_DEFAULT;
}

/*if (fieldToAdd.type === "2" && fieldToAdd.time && fieldToAdd.fromTeam && fieldToAdd.toTeam && fieldToAdd.message) {
    await printText(`${format24HourTime(new Date(fieldToAdd.created))}, ${parseTeamName(fieldToAdd.fromTeam)} TO ${parseTeamName(fieldToAdd.toTeam)}`);
    await printText(`  ${fieldToAdd.message}`);
}*/
// TODO: have printer watch the log collection to trigger prints instead of the above

export const resetTeamTimeout = async (teamToEdit) => {
    if (teamToEdit) {
        if (teamToEdit.isRunning === true) {
            teamToEdit.incrementalPatch({ lastStart: new Date().toISOString(), lastTimeRemaining: await getTimeoutDefault(), isRunning: true });
        } else {
            teamToEdit.incrementalPatch({ lastStart: undefined, lastTimeRemaining: await getTimeoutDefault(), isRunning: false });
        }
    } else {
        console.error("No team to edit");
    }
}

export const setTeamTimeoutRunning = async (teamToEdit, isRunning) => {
    if (teamToEdit.isRunning !== isRunning) {
        if (isRunning) {
            // Start timer
            teamToEdit.incrementalPatch({ lastStart: new Date().toISOString(), isRunning: true });
        } else {
            // Stop timer by recording the amount of time left
            teamToEdit.incrementalPatch({ lastTimeRemaining: calculateRemainingTime(teamToEdit.lastStart, teamToEdit.lastTimeRemaining), isRunning: false });
        }
    }
}

export const getAsyncStorageData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value
    }
};

export const saveAsyncStorageData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        // saving error
    }
};

// Date formatting
const timeFormatFull = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

const timeFormat = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

const todayTimeFormat = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

export const getSimpleDateString = (dateString) => {
    let reportedDate = new Date(dateString);
    // If the date is today, only show the time
    if (reportedDate.toDateString() === new Date().toDateString()) {
        dateString = todayTimeFormat.format(reportedDate);
    } else if (reportedDate.getFullYear() === new Date().getFullYear()) {
        dateString = timeFormat.format(reportedDate);
    } else {
        dateString = timeFormatFull.format(reportedDate);
    }
    return dateString;
}

export const getElapsedTimeString = (dateString) => {
    if (dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;

        const seconds = Math.floor(diffInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) {
            return "just now";
        } else if (minutes < 60) {
            return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
        } else if (hours < 24) {
            const remainingMinutes = minutes % 60;
            return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"} ago`;
        } else {
            return ">10 hrs ago";
        }
    } else {
        return "an unknown time ago";
    }
}

export function format24HourTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export const calculateRemainingTime = (lastStart, lastTimeRemaining) => {
    const elapsedTime = lastStart ? (Date.now() - new Date(lastStart)) / 1000 : 0;
    return lastTimeRemaining - Math.floor(elapsedTime);
}