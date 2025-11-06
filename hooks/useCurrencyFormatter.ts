import * as React from 'react';
import { useAppContext } from '../context/AppContext';

export const useCurrencyFormatter = () => {
    const { isValueMaskingEnabled } = useAppContext();

    const formatCurrency = React.useCallback((value: number | undefined | null) => {
        if (isValueMaskingEnabled) {
            return '€ ••••,••';
        }

        if (typeof value !== 'number') {
            return (0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
        }

        return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    }, [isValueMaskingEnabled]);

    return formatCurrency;
};
