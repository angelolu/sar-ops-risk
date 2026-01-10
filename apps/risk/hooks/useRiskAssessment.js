import { useContext } from 'react';
import { ThemeContext } from 'calsar-ui';

export function useRiskAssessment(config) {
    const { colorTheme } = useContext(ThemeContext);

    const calculate = (entries) => {
        if (!config || !config.calculator) return 0;
        return config.calculator(entries);
    };

    const getResult = (score) => {
        if (!config || !config.evaluator) return {};

        const result = config.evaluator(score);

        // Resolve color token to actual theme color
        let color = result.colorToken ? colorTheme[result.colorToken] : undefined;
        // Fallback for direct hex or undefined
        if (!color && result.colorToken) {
            // Try to see if it's a valid key in colorTheme even if I missed it, or just pass it through if it looks like a color
            // But for now, assume tokens match ThemeContext keys.
            color = colorTheme[result.colorToken] || colorTheme.surfaceContainer;
        }

        return {
            ...result,
            color
        };
    };

    const getItemResult = (score) => {
        if (!config || !config.itemEvaluator) return {};

        const result = config.itemEvaluator(score);

        const containerColor = result.containerColorToken ? (colorTheme[result.containerColorToken] || result.containerColorToken) : undefined;
        const contentColor = result.contentColorToken ? (colorTheme[result.contentColorToken] || result.contentColorToken) : undefined;

        return {
            ...result,
            containerColor,
            contentColor
        }
    };

    return {
        calculate,
        getResult,
        getItemResult
    };
}
