import { ThemeContext } from 'calsar-ui';
import { useContext } from 'react';

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

        // Check if the returned string is a key in colorTheme (a token), otherwise treat as raw color
        const backgroundColor = colorTheme[result.backgroundColor] || result.backgroundColor;
        const color = colorTheme[result.color] || result.color;

        return {
            ...result,
            backgroundColor,
            color
        }
    };

    return {
        calculate,
        getResult,
        getItemResult
    };
}
