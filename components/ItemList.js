import { FlatList, Platform, View } from 'react-native';
import ListItem from './ListItem';

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
                />
            )}
        />
    );
}

const ItemSeparatorComponent = () => {
    return (
        <View style={{ height: 1, backgroundColor: '#c5c6d0' }} />
    );
};