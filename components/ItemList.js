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
                    backgroundColor={item.hasOwnProperty("containerColor") ? item.containerColor : undefined}
                    color={item.hasOwnProperty("color") ? item.color : undefined}
                    description={item.hasOwnProperty("description") ? item.description : undefined}
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