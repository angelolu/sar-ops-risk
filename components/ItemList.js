import { FlatList, Platform, View } from 'react-native';
import ListItem from './ListItem';
import { useContext } from 'react';

import { ThemeContext } from '../components/ThemeContext';

export default function ItemList({ items, onSelect }) {
    return (
        <FlatList
            vertical
            showsVerticalScrollIndicator={true}
            data={items}
            contentContainerStyle={Platform.OS === 'web' && { maxWidth: 800, alignSelf: 'center' }}
            ItemSeparatorComponent={ItemSeparatorComponent}
            renderItem={({ item, index }) => (
                <ListItem
                    onPress={() => {
                        onSelect(index);
                    }}
                    title={item.title}
                    subtitle={item.subtitle}
                    score={item.score}
                    backgroundColor={item?.containerColor}
                    color={item?.color}
                    description={item?.description}
                />
            )}
        />
    );
}

const ItemSeparatorComponent = () => {
    const { colorTheme } = useContext(ThemeContext);
    return (
        <View style={{ height: 1, backgroundColor: colorTheme.outlineVariant }} />
    );
};