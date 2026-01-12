import React from 'react';
import { Text } from 'react-native';

export const SPE_CONFIG = {
    id: 'SPE',
    scoringType: 'product',

    calculator: (entries) => {
        return entries.reduce((acc, entry) => acc * entry.score, 1);
    },

    evaluator: (score) => {
        if (score >= 0 && score <= 19) {
            return {
                colorToken: 'garGreenDark',
                label: `${score} - Slight risk`,
                action: 'Risk possibly acceptable. Review risk with your team.'
            };
        } else if (score <= 39) {
            return {
                colorToken: 'garAmberDark',
                label: `${score} - Possible risk`,
                action: 'Attention needed. Review risk with your team.'
            };
        } else if (score <= 59) {
            return {
                colorToken: 'garAmberDark',
                label: `${score} - Substantial risk`,
                action: 'Correction required. Review this with your team.'
            };
        } else if (score <= 79) {
            return {
                colorToken: 'garRedDark',
                label: `${score} - High risk`,
                action: 'Correct risk immediately'
            };
        } else {
            return {
                colorToken: 'garRedDark',
                label: `${score} - Very High risk`,
                action: (styles) => <>Discontinue, <Text style={styles?.boldText}>stop immediately</Text></>
            };
        }
    },

    itemEvaluator: (score) => {
        if (!score) return {};
        // Item colors based on score
        if (score === 1) return { containerColorToken: 'garGreenLight', contentColorToken: 'garGreenDarkContrast' }; // #b9f0b8, #002107
        if (score === 2) return { containerColorToken: 'garAmberLight', contentColorToken: 'garAmberDarkContrast' }; // #ffdeae, #281900
        if (score === 3) return { containerColorToken: 'garAmberLight', contentColorToken: 'garAmberDarkContrast' }; // #ffdeae, #281900
        if (score === 4) return { containerColorToken: 'garRedLight', contentColorToken: 'garRedDarkContrast' };     // #ffdad6, #410002
        if (score === 5) return { containerColorToken: 'garRedContainer', contentColorToken: 'garRedContainerContrast' }; // #ffb4ab, #690005
        return { containerColorToken: 'surfaceVariant', contentColorToken: 'onSurfaceVariant' };
    }
};

export const ORMA_CONFIG = {
    id: 'ORMA',
    scoringType: 'sum',

    calculator: (entries) => {
        return entries.reduce((acc, entry) => acc + entry.score, 0);
    },

    evaluator: (score) => {
        let colorToken = 'surfaceContainer';
        let label = '-';

        if (score >= 8 && score <= 35) {
            colorToken = 'garGreenDark';
            label = 'Low Risk';
        } else if (score >= 36 && score <= 60) {
            colorToken = 'garAmberDark';
            label = 'Caution';
        } else if (score >= 61 && score <= 80) {
            colorToken = 'garRedDark';
            label = 'High Risk';
        }

        return {
            colorToken,
            label: `${score}${label !== '-' ? ' - ' + label : ''}`,
            action: 'Review this score with your team'
        };
    },

    itemEvaluator: (score) => {
        if (!score) return {};
        // Item colors based on score ranges
        if (score >= 1 && score <= 4) {
            return { containerColorToken: 'garGreenDark', contentColorToken: 'white' };
        } else if (score >= 5 && score <= 7) {
            return { containerColorToken: 'garAmberDark', contentColorToken: 'black' };
        } else if (score >= 8 && score <= 10) {
            return { containerColorToken: 'garRedDark', contentColorToken: 'white' };
        } else {
            return { containerColorToken: 'surfaceVariant', contentColorToken: 'onSurfaceVariant' };
        }
    }
};

export const PEACE_USCG_ASHORE_CONFIG = {
    id: 'PEACE_USCG_ASHORE',
    scoringType: 'average',

    calculator: (entries) => {
        if (entries.length === 0) return 0;
        const total = entries.reduce((acc, entry) => acc + entry.score, 0);
        return total / entries.length;
    },

    evaluator: (score) => {
        let colorToken = 'surfaceContainer';
        let label = 'Incomplete';

        // 1 = Low, 2 = Medium, 3 = High
        if (score > 0 && score < 1.5) {
            colorToken = 'garGreenDark';
            label = 'Low Risk';
        } else if (score >= 1.5 && score < 2.5) {
            colorToken = 'garAmberDark';
            label = 'Medium Risk';
        } else if (score >= 2.5) {
            colorToken = 'garRedDark';
            label = 'High Risk';
        }

        return {
            colorToken,
            label,
            action: 'Review risk vs gain, mitigations, and controls to make a go/no go decision'
        };
    },

    itemEvaluator: (score) => {
        if (!score) return {};
        if (score === 1) return { containerColorToken: 'garGreenLight', contentColorToken: 'garGreenDarkContrast' };
        if (score === 2) return { containerColorToken: 'garAmberLight', contentColorToken: 'garAmberDarkContrast' };
        if (score === 3) return { containerColorToken: 'garRedLight', contentColorToken: 'garRedDarkContrast' };
        return { containerColorToken: 'surfaceVariant', contentColorToken: 'onSurfaceVariant' };
    },

    settings: {
        inputModes: [
            { id: 'text', label: 'Start, Stop' }, // Example labels, actual content handled in Component
            { id: 'emoji', label: '😀 😐 ☹️' }
        ]
    }
};

export const PEACE_NASAR_CONFIG = {
    id: 'PEACE_NASAR',
    scoringType: 'average',

    calculator: PEACE_USCG_ASHORE_CONFIG.calculator,

    evaluator: PEACE_USCG_ASHORE_CONFIG.evaluator,

    itemEvaluator: PEACE_USCG_ASHORE_CONFIG.itemEvaluator,

    settings: {
        inputModes: [
            { id: 'text', label: 'Start, Stop' },
            { id: 'emoji', label: '👍 ✊ 👎' }
        ]
    }
};
