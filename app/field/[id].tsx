import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { njiveImages } from '../../assets/njive';

export default function FieldDetailScreen() {
  const router = useRouter();
  const { category, id, name, slika } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateString = `${dd}.${mm}.${yyyy}`;

  const cards = [
    { id: 1, title: 'Operacije', icon: 'list-outline', color: 'bg-blue-600' },
    { id: 2, title: 'Prihodi', icon: 'trending-up-outline', color: 'bg-green-600' },
    { id: 3, title: 'Rashodi', icon: 'trending-down-outline', color: 'bg-red-600' },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-gray-900"
      edges={['top', 'left', 'right']}
    >
      {/* Top bar */}
      <View className={`bg-green-800 border-b border-white ${isLandscape ? 'px-6 py-2.5' : 'px-4 py-2.5'}`}>
        <View className="flex-row items-center justify-between self-center w-full max-w-screen-lg">
          {/* Leva strana - Back button i Ime */}
          <View className="flex-row items-center flex-1">
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className={`items-center justify-center rounded-full mr-3.5 bg-white ${isLandscape ? 'w-[42px] h-[32px]' : 'w-12 h-12'}`}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            {/* Ime njive */}
            <View className="flex-1">
              <Text className={`font-semibold text-white ${isLandscape ? 'text-2xl' : 'text-lg'}`}>
                {category} | {name}
              </Text>
            </View>
          </View>

          {/* Desna strana - Dugmad i Datum */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => console.log("Settings")}
              className={`items-center justify-center rounded-full ${isLandscape ? 'w-[35px] h-[35px]' : 'w-8 h-8'} bg-white mr-4`}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="black" />
            </TouchableOpacity>
            {/* Datum */}
            <View className="bg-gray-50 px-4 py-2.5 border border-gray-200">
              <Text className={`font-medium text-gray-700 ${isLandscape ? 'text-[15px]' : 'text-sm'}`}>
                {dateString}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1 bg-gray-800"
        contentContainerClassName={isLandscape ? 'p-6 pt-8' : 'p-4 pt-6'}
      >
        <View className={`self-center w-full max-w-screen-lg ${isLandscape ? 'flex-row gap-6' : 'flex-col gap-4'}`}>
          {/* Leva strana - Slika */}
          <View className={`${isLandscape ? 'flex-1' : 'w-full h-64'}`}>
            <View className="rounded-2xl overflow-hidden shadow-lg shadow-black/50 bg-green-800 border border-black h-full">
              <Image
                source={njiveImages[slika as string]}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>

          {/* Desna strana - Tri kartice */}
          <View className={`${isLandscape ? 'flex-1' : 'w-full'} gap-4`}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => console.log(`Clicked: ${card.title}`)}
                className={`${card.color} rounded-2xl overflow-hidden shadow-lg shadow-black/50 border border-black ${isLandscape ? 'h-[calc(33.333%-11px)]' : 'h-32'}`}
              >
                <View className="flex-1 items-center justify-center p-6">
                  <Ionicons name={card.icon as any} size={isLandscape ? 48 : 40} color="white" />
                  <Text className={`text-white font-bold mt-3 ${isLandscape ? 'text-2xl' : 'text-xl'}`}>
                    {card.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prazan prostor na dnu */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}